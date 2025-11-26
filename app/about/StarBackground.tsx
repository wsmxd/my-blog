'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function StarBackground() {
  const [stars, setStars] = useState<{ id: number; top: number; left: number; size: number; duration: number }[]>([]);

  useEffect(() => {
    const starCount = 150;
    const newStars = Array.from({ length: starCount }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
    }));
   
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#09090b]">
      {/* 1. 背景底色 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-slate-900 via-[#09090b] to-black"></div>

      {/* 2. 星云光晕 */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />

      {/* 3. 星星层 */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* 4. 流星效果 - 修正版 */}
      <div className="absolute -top-20 right-20 w-[3px] h-[120px] bg-linear-to-b from-transparent via-white to-transparent animate-shooting-star shadow-[0_0_20px_2px_rgba(255,255,255,0.5)]"></div>
      
      {/* 可选：加第二颗流星，延迟不同，位置不同 */}
      <div className="absolute top-[20%] -right-20 w-0.5 h-[100px] bg-linear-to-b from-transparent via-blue-200 to-transparent animate-shooting-star shadow-[0_0_20px_2px_rgba(100,100,255,0.5)]" style={{ animationDelay: '4s', animationDuration: '4s' }}></div>
    </div>
  );
}