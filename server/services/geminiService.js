/**
 * geminiService.js
 *
 * All 5 Gemini API calls live here.
 * This file is the single source of truth for AI interaction.
 *
 * Rules (from the spec):
 * 1. Always return pure JSON — no markdown, no backticks, no explanation
 * 2. Always define the exact JSON structure in the prompt
 * 3. Always include explicit constraints (max tasks, max progress %, tone)
 *
 * Redis caching: roadmap responses are cached so repeated views
 * do NOT make a new Gemini API call.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Lazy-initialize the Gemini client (only once, at first use)
let genAI = null;

const getClient = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables.');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

/**
 * Safely parses JSON from a Gemini response string.
 * Strips markdown code fences if Gemini wraps the output despite instructions.
 */
const parseGeminiJSON = (text) => {
  // Strip ```json ... ``` or ``` ... ``` fences if present
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  return JSON.parse(cleaned);
};

// Model preference order — fall through to lighter models if primary is rate-limited
// Note: gemini-1.5-flash is deprecated on this API key. 2.0-flash is the current free-tier equivalent.
const MODEL_FALLBACK_CHAIN = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-flash-latest'];

/**
 * Core helper — sends a prompt to Gemini and returns parsed JSON.
 * Retries up to 3 times with exponential backoff on 429 rate limit errors.
 * Falls back to lighter models in the chain if primary is exhausted.
 */
const callGemini = async (prompt, retries = 3, modelIndex = 0) => {
  const client = getClient();
  const modelName = MODEL_FALLBACK_CHAIN[modelIndex] || MODEL_FALLBACK_CHAIN[MODEL_FALLBACK_CHAIN.length - 1];
  const model = client.getGenerativeModel({ model: modelName });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return parseGeminiJSON(text);
    } catch (err) {
      const isRateLimit = err.message && (err.message.includes('429') || err.message.includes('quota'));
      const isLastAttempt = attempt === retries;

      if (isRateLimit && !isLastAttempt) {
        // Exponential backoff: 2s, 4s, 8s
        const waitMs = Math.pow(2, attempt) * 1000;
        console.warn(`⏳ Gemini rate limit (${modelName}) — retrying in ${waitMs / 1000}s (attempt ${attempt}/${retries})`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }

      if (isRateLimit && modelIndex < MODEL_FALLBACK_CHAIN.length - 1) {
        // Try next lighter model in the fallback chain
        console.warn(`⏳ Gemini quota exhausted for ${modelName} — trying ${MODEL_FALLBACK_CHAIN[modelIndex + 1]}`);
        return callGemini(prompt, retries, modelIndex + 1);
      }

      // Non-rate-limit error or exhausted all retries/models — propagate
      throw err;
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CALL 1 — ROADMAP GENERATION
// Triggered when a user creates a new goal.
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {Object} goalData
 * @param {string} goalData.title
 * @param {string} goalData.description
 * @param {string} goalData.category  - career | fitness | business | learning | personal
 * @param {string} goalData.timeframe - e.g. "3 months"
 * @param {string} goalData.userContext - background, experience level
 * @param {number} goalData.hoursPerDay
 */
const generateRoadmap = async (goalData) => {
  const { title, description, category, timeframe, userContext, hoursPerDay } = goalData;

  const prompt = `
You are a friendly goal planning coach helping a real person achieve something they care about.
Return ONLY valid JSON — no markdown, no backticks, no explanation, no extra text.

Goal Title: ${title}
Goal Description: ${description || 'Not provided'}
Category: ${category}
Timeframe: ${timeframe || 'Not specified'}
User Context / Background: ${userContext || 'Not provided'}
Hours Available Per Day: ${hoursPerDay || 1}

Choose a visual type based on these rules:
- flowchart → for learning or skill-building goals
- timeline → for deadline-driven goals
- kanban → for project-style goals

Return this exact JSON structure:
{
  "visualType": "flowchart" | "timeline" | "kanban",
  "reason": "One sentence explaining why you picked this visual type",
  "phases": [
    {
      "title": "Phase title",
      "steps": [
        {
          "title": "Step title (short, action-first, e.g. 'Watch the intro videos')",
          "description": "2-3 sentences. Write like you are explaining to a friend — simple words, no jargon. Say exactly what the person should do and why it matters at this stage.",
          "estimatedDays": 7
        }
      ]
    }
  ]
}

Language rules (STRICTLY follow these for ALL text fields):
- Write like a helpful friend, not a corporate document
- Use simple everyday words — avoid jargon, buzzwords, or technical terms unless absolutely necessary
- If you must use a technical term, explain it in plain words right after
- Keep phase titles short and clear (e.g. "Get Started", "Build the Basics", "Go Deeper")
- Keep step titles action-first and human (e.g. "Set up your workspace", "Do your first practice session")
- Step descriptions should feel encouraging and clear — someone reading it should immediately know what to do

Content constraints (STRICTLY enforce these):
- Maximum 5 phases
- Maximum 6 steps per phase
- Total estimated days across ALL steps must fit within the timeframe
- Steps must be concrete and doable, not vague or abstract
- Adjust depth based on hours per day available
`.trim();

  return callGemini(prompt);
};

// ─────────────────────────────────────────────────────────────────────────────
// CALL 2 — DAILY TASK GENERATION
// Triggered when the user requests today's tasks.
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {Object} data
 * @param {Array}  data.activeGoals     - [{goalId, title, currentStep, momentumScore}]
 * @param {number} data.hoursAvailable
 * @param {string} data.dayOfWeek
 * @param {Array}  data.yesterdayTasks  - [{title, status}]
 */
const generateDailyTasks = async (data) => {
  const { activeGoals, hoursAvailable, dayOfWeek, yesterdayTasks } = data;

  const prompt = `
You are a helpful friend helping someone plan what to work on today.
Return ONLY valid JSON — no markdown, no backticks, no explanation, no extra text.

Today is: ${dayOfWeek}
Hours available today: ${hoursAvailable || 2}

Active goals and current roadmap positions:
${JSON.stringify(activeGoals, null, 2)}

Yesterday's completed tasks:
${JSON.stringify(yesterdayTasks || [], null, 2)}

Return a JSON array of tasks for today:
[
  {
    "title": "Task title",
    "goalId": "goal ObjectId string",
    "stepId": "step ObjectId string",
    "priority": "high" | "medium" | "low",
    "estimatedMinutes": 60
  }
]

Language rules for task titles:
- Write task titles like a to-do list a real person would write for themselves
- Be specific and direct — e.g. "Read Chapter 3", "Do a 20-min run", "Write the intro section"
- No buzzwords, no formal language — keep it simple and clear

Content constraints (STRICTLY enforce these):
- Return between 3 and 5 tasks maximum
- Total estimatedMinutes must not exceed ${Math.round((hoursAvailable || 2) * 60)}
- Prioritize goals with lower momentum scores (they need more attention)
- A short achievable list is better than a long overwhelming one
- Each task must be something a person can finish in one sitting
`.trim();

  return callGemini(prompt);
};

// ─────────────────────────────────────────────────────────────────────────────
// CALL 3 — JOURNAL INTERPRETATION
// Triggered when user submits a journal entry.
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {Object} data
 * @param {string} data.rawText     - user's free-form journal entry
 * @param {Array}  data.activeGoals - [{goalId, title, currentStep}]
 */
const interpretJournal = async (data) => {
  const { rawText, activeGoals } = data;

  const prompt = `
You are a helpful assistant reading someone's daily journal to understand what they worked on.
Return ONLY valid JSON — no markdown, no backticks, no explanation, no extra text.

User's journal entry:
"${rawText}"

User's active goals and current roadmap steps:
${JSON.stringify(activeGoals, null, 2)}

Return this exact JSON structure:
{
  "goalMappings": [
    {
      "goalId": "goal ObjectId string",
      "stepId": "step ObjectId string or null",
      "progressPercent": 5,
      "activitiesMapped": ["short plain description of what they did, e.g. 'watched tutorial videos', 'went for a 30-min run'"]
    }
  ],
  "untrackedActivities": ["short plain description of things they did not related to any goal"],
  "productivityLevel": "low" | "medium" | "high"
}

Language rules:
- activitiesMapped entries should be short and plain — describe what the person actually did in simple words
- untrackedActivities same — plain, short descriptions, no jargon

Content constraints (STRICTLY enforce these):
- Be conservative with progressPercent — one day of work rarely moves a step more than 10-15%
- When in doubt, go lower — overestimating progress is discouraging long-term
- Only include goalMappings for goals the person actually worked on
- productivityLevel: low = barely anything done, medium = good focused session, high = really got a lot done
`.trim();

  return callGemini(prompt);
};

// ─────────────────────────────────────────────────────────────────────────────
// CALL 4 — ADAPTATION / NUDGE GENERATION
// Triggered on login or midnight cron — the heartbeat of the product.
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {Object} data
 * @param {string} data.goalTitle
 * @param {string} data.currentStep
 * @param {number} data.daysOnStep       - how many days since this step started
 * @param {number} data.estimatedDays    - how long this step was estimated to take
 * @param {string} data.journalSummary   - summary of this week's entries
 * @param {number} data.momentumScore
 * @param {string} data.momentumTrend    - 'improving' | 'declining' | 'stable'
 * @param {number} data.daysSinceNudge   - days since last nudge was sent
 */
const generateNudge = async (data) => {
  const {
    goalTitle,
    currentStep,
    daysOnStep,
    estimatedDays,
    journalSummary,
    momentumScore,
    momentumTrend,
    daysSinceNudge,
  } = data;

  const prompt = `
You are a supportive friend checking in on someone who is working toward a personal goal.
Return ONLY valid JSON — no markdown, no backticks, no explanation, no extra text.

Goal: ${goalTitle}
Current step: ${currentStep}
Days spent on this step: ${daysOnStep}
Estimated days for this step: ${estimatedDays}
This week's journal summary: ${journalSummary || 'No journal entries this week'}
Momentum score (0-100): ${momentumScore}
Momentum trend: ${momentumTrend}
Days since last nudge: ${daysSinceNudge}

Return this exact JSON structure:
{
  "shouldNudge": true | false,
  "type": "warning" | "suggestion" | "encouragement",
  "message": "Your message here",
  "suggestBreakdown": true | false,
  "newSteps": ["smaller step 1", "smaller step 2"]
}

Language rules for message and newSteps:
- Write like you are texting a friend — warm, casual, and real
- Use simple everyday words only — no corporate language, no buzzwords
- Never say things like "leverage", "optimize", "synergize", "actionable", "utilize"
- Be genuine and specific — mention the actual goal or step by name
- newSteps should be small, specific, doable things — not abstract advice
- Good example: "Hey, you've been on this step for a while — want to try breaking it into smaller pieces?"
- Bad example: "Consider optimizing your workflow to achieve greater productivity outcomes."

Content constraints (STRICTLY enforce these):
- Do NOT nudge if daysSinceNudge is less than 3
- Maximum 2 sentences in message
- suggestBreakdown = true only if user has been stuck on this step more than 2x the estimated days
- Only include newSteps if suggestBreakdown is true (max 4 small steps)
- If no nudge is needed, set shouldNudge to false and leave message empty
`.trim();

  return callGemini(prompt);
};

// ─────────────────────────────────────────────────────────────────────────────
// CALL 5 — WEEKLY INSIGHTS
// Triggered when user views the insights screen.
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {Object} data
 * @param {Array}  data.completedTasksPerGoal - [{goalId, goalTitle, taskCount}]
 * @param {Array}  data.journalEntries        - [{date, productivityLevel}]
 * @param {Array}  data.momentumChanges       - [{goalId, goalTitle, startScore, endScore}]
 * @param {Array}  data.inactiveGoals         - [{goalId, goalTitle}]
 */
const generateWeeklyInsights = async (data) => {
  const { completedTasksPerGoal, journalEntries, momentumChanges, inactiveGoals } = data;

  const prompt = `
You are a caring friend giving someone an honest, encouraging look at how their week went.
Return ONLY valid JSON — no markdown, no backticks, no explanation, no extra text.

Completed tasks by goal this week:
${JSON.stringify(completedTasksPerGoal, null, 2)}

Journal entries this week:
${JSON.stringify(journalEntries, null, 2)}

Momentum score changes (start vs end of week):
${JSON.stringify(momentumChanges, null, 2)}

Goals with zero activity this week:
${JSON.stringify(inactiveGoals, null, 2)}

Return this exact JSON structure:
{
  "summary": "3-4 sentence recap of how the week went",
  "perGoal": [
    {
      "goalId": "goal ObjectId string",
      "status": "on-track" | "needs-attention" | "great-progress"
    }
  ],
  "nextWeekSuggestion": "1-2 sentences on what to focus on next week"
}

Language rules (STRICTLY follow for ALL text fields):
- Write like a real person talking to a friend — warm, honest, and easy to read
- Use short sentences and simple words — avoid any jargon or formal language
- Never use words like "leverage", "optimize", "synergize", "metrics", "actionable", "bandwidth"
- Be specific — mention actual goal names when relevant
- summary should feel like a genuine reflection, not a performance report
- nextWeekSuggestion should be a real, practical thing they can do — not vague advice
- Good summary example: "This was a solid week! You made good progress on your fitness goal and showed up consistently. Your AI learning goal didn't get much attention though — that's worth a look next week."
- Bad summary example: "The user demonstrated moderate engagement metrics across goal verticals with notable momentum optimization in the fitness category."

Content constraints:
- summary must be 3-4 sentences only
- Mark a goal as "great-progress" only if there was real movement this week
- Mark a goal as "needs-attention" if there was little or no work on it
- nextWeekSuggestion must be specific and concrete, not generic
`.trim();

  const result = await callGemini(prompt);
  // Re-map fields to match what insightsController and the frontend expect
  return {
    narrative: result.summary || result.narrative || '',
    topRecommendation: result.nextWeekSuggestion || result.topRecommendation || '',
    perGoal: result.perGoal || [],
  };
};

module.exports = {
  generateRoadmap,
  generateDailyTasks,
  interpretJournal,
  generateNudge,
  generateWeeklyInsights,
};
