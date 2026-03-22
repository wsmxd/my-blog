'use client';

const FlowingGradient = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* 主背景层 */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-in-out"
        style={{
          background: 'linear-gradient(135deg, var(--hero-gradient-start) 0%, var(--hero-gradient-mid) 50%, var(--hero-gradient-end) 100%)'
        }}
      />
      
      {/* 动态光斑效果 */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-0 -left-4 w-72 h-72 rounded-full mix-blend-plus-lighter filter blur-xl opacity-70 animate-blob"
          style={{ background: 'var(--hero-glow-a)' }}
        />
        <div 
          className="absolute top-0 -right-4 w-72 h-72 rounded-full mix-blend-plus-lighter filter blur-xl opacity-70 animate-blob animation-delay-2000"
          style={{ background: 'var(--hero-glow-b)' }}
        />
        <div 
          className="absolute -bottom-8 left-20 w-72 h-72 rounded-full mix-blend-plus-lighter filter blur-xl opacity-70 animate-blob animation-delay-4000"
          style={{ background: 'var(--hero-glow-b)' }}
        />
      </div>
      
      {/* 网格覆盖层 - 增加质感 */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(var(--hero-grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--hero-grid) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
};

export default FlowingGradient;