const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getRoadmap, regenerateRoadmap, updateStep } = require('../controllers/roadmapController');

// mergeParams: true is REQUIRED — this router is mounted at /api/goals/:goalId/roadmap
const router = express.Router({ mergeParams: true });

router.use(protect);

router.get('/', getRoadmap);
router.patch('/regenerate', regenerateRoadmap);
router.patch('/steps/:stepId', updateStep);

module.exports = router;
