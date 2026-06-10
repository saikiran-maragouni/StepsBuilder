import { useState } from 'react';
import { X, Zap, Check, Crown, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

const FREE_FEATURES = [
  'Up to 3 active goals',
  'AI roadmap generation',
  'Daily journal',
  'Basic task tracking',
];

const PRO_FEATURES = [
  'Unlimited goals',
  'AI roadmap generation',
  'AI task generation (daily)',
  'AI journal insights',
  'Smart nudges & momentum tracking',
  'Priority support',
];

// Load Razorpay checkout script dynamically
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function UpgradeModal({ onClose }) {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) {
        toast.error('Could not load payment gateway. Check your internet connection.');
        setLoading(false);
        return;
      }

      // Create order on backend
      const { data } = await api.post('/payments/create-order');

      if (!data.success) {
        toast.error(data.message || 'Failed to create order.');
        setLoading(false);
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'StepsBuilder',
        description: 'Pro Plan — Unlimited Goals + AI Features',
        order_id: data.order.id,
        prefill: {
          name: data.user.name,
          email: data.user.email,
        },
        theme: {
          color: '#3b82f6',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              // Update local user state to Pro
              updateUser(verifyRes.data.user);
              toast.success("You're now on Pro! 🎉");
              onClose();
            } else {
              toast.error('Payment verification failed. Contact support.');
            }
          } catch {
            toast.error('Payment verification failed. Contact support.');
          } finally {
            setLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong. Try again.');
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ zIndex: 200 }}
    >
      <div className="modal" style={{ maxWidth: 560, width: '100%', padding: 0, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{
          background: 'var(--gradient)',
          padding: '32px 28px 28px',
          position: 'relative',
          textAlign: 'center',
        }}>
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
          >
            <X size={16} />
          </button>

          <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', backdropFilter: 'blur(10px)' }}>
            <Crown size={26} color="white" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'white', fontFamily: 'Outfit', marginBottom: 8 }}>
            Upgrade to Pro
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
            Unlock unlimited goals and every AI feature
          </p>

          {/* Price badge */}
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4, marginTop: 16, background: 'rgba(255,255,255,0.15)', borderRadius: 40, padding: '8px 20px', backdropFilter: 'blur(10px)' }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: 'white', fontFamily: 'Outfit' }}>₹499</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>one-time</span>
          </div>
        </div>

        {/* Plans comparison */}
        <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* Free */}
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px 16px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              Free Plan
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {FREE_FEATURES.map((f) => (
                <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Check size={13} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro */}
          <div style={{ background: 'var(--gradient-soft)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 'var(--radius-lg)', padding: '18px 16px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -10, right: 12, background: 'var(--gradient)', borderRadius: 20, padding: '3px 10px', fontSize: 10, fontWeight: 700, color: 'white', letterSpacing: '0.05em' }}>
              PRO ✦
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              Pro Plan
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {PRO_FEATURES.map((f) => (
                <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Check size={13} color="var(--blue)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.4, fontWeight: 500 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '0 28px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 16, fontWeight: 700 }}
          >
            {loading ? (
              <><Loader size={18} className="spin" /> Processing...</>
            ) : (
              <><Zap size={18} /> Pay ₹499 &amp; Upgrade Now</>
            )}
          </button>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
            Secure payment via Razorpay · One-time payment · No recurring charges
          </p>
        </div>
      </div>
    </div>
  );
}
