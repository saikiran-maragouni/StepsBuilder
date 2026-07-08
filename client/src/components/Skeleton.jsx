import './Skeleton.css';

// Single shimmer block
export function SkeletonBlock({ width = '100%', height = 16, radius = 8, style = {} }) {
  return (
    <div
      className="skeleton-block"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

// Dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Hero card */}
      <div className="skeleton-card" style={{ padding: '28px 32px' }}>
        <SkeletonBlock width={120} height={12} radius={6} style={{ marginBottom: 14 }} />
        <SkeletonBlock width={260} height={28} radius={8} style={{ marginBottom: 16 }} />
        <SkeletonBlock width="100%" height={6} radius={99} style={{ marginBottom: 20 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, background: 'rgba(0,0,0,0.15)', borderRadius: 12, overflow: 'hidden' }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
              <SkeletonBlock width={36} height={20} radius={6} />
              <SkeletonBlock width={60} height={10} radius={4} />
            </div>
          ))}
        </div>
      </div>

      {/* Two column */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 24 }}>
        {/* Tasks col */}
        <div>
          <SkeletonBlock width={140} height={16} radius={6} style={{ marginBottom: 16 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3,4].map(i => (
              <div key={i} className="skeleton-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <SkeletonBlock width={20} height={20} radius={4} />
                <SkeletonBlock width={`${60 + i * 8}%`} height={13} radius={5} />
                <SkeletonBlock width={32} height={11} radius={4} style={{ marginLeft: 'auto', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Goals col */}
        <div>
          <SkeletonBlock width={120} height={16} radius={6} style={{ marginBottom: 16 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => (
              <div key={i} className="skeleton-card" style={{ padding: '14px 18px', borderLeft: '3px solid rgba(255,255,255,0.08)', borderRadius: '0 14px 14px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <SkeletonBlock width={`${50 + i * 10}%`} height={14} radius={5} />
                  <SkeletonBlock width={32} height={12} radius={4} />
                </div>
                <SkeletonBlock width="100%" height={4} radius={99} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Goals page skeleton
export function GoalsPageSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Search + filter bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
        <SkeletonBlock height={42} radius={10} style={{ flex: 1 }} />
        <SkeletonBlock width={240} height={42} radius={10} />
      </div>
      {/* Goal cards */}
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton-card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <SkeletonBlock width={`${40 + i * 10}%`} height={18} radius={6} style={{ marginBottom: 10 }} />
              <SkeletonBlock width={100} height={11} radius={4} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <SkeletonBlock width={32} height={32} radius={8} />
              <SkeletonBlock width={32} height={32} radius={8} />
            </div>
          </div>
          <SkeletonBlock width="100%" height={5} radius={99} style={{ marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 16 }}>
            <SkeletonBlock width={80} height={11} radius={4} />
            <SkeletonBlock width={80} height={11} radius={4} />
          </div>
        </div>
      ))}
    </div>
  );
}
