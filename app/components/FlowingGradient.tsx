'use client';

const FlowingGradient = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* 主背景层 - 暗色主题 */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-in-out"
        style={{
          background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
        }}
      />
      
      {/* 动态光斑效果 */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-0 -left-4 w-72 h-72 bg-purple-900 rounded-full mix-blend-screen filter blur-xl opacity-30 animate-blob"
        />
        <div 
          className="absolute top-0 -right-4 w-72 h-72 bg-blue-900 rounded-full mix-blend-screen filter blur-xl opacity-30 animate-blob animation-delay-2000"
        />
        <div 
          className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-900 rounded-full mix-blend-screen filter blur-xl opacity-30 animate-blob animation-delay-4000"
        />
      </div>
      
      {/* 网格覆盖层 - 增加质感 */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
};

export default FlowingGradient;