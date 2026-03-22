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
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* 亮色：蓝天白云 */}
      <div className="about-sky-layer absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-b from-sky-300 via-sky-100 to-cyan-50" />
        <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.8),transparent_28%),radial-gradient(circle_at_78%_22%,rgba(255,255,255,0.7),transparent_26%),radial-gradient(circle_at_55%_35%,rgba(255,255,255,0.45),transparent_30%)]" />

        <div className="absolute -top-6 -left-20 h-28 w-72 rounded-full bg-white/70 blur-sm animate-cloud-drift-slow" />
        <div className="absolute top-10 left-[28%] h-24 w-64 rounded-full bg-white/65 blur-sm animate-cloud-drift-medium" />
        <div className="absolute top-24 right-[14%] h-20 w-56 rounded-full bg-white/60 blur-sm animate-cloud-drift-fast" />
        <div className="absolute bottom-20 left-[10%] h-24 w-72 rounded-full bg-white/50 blur-md animate-cloud-drift-medium" />

        <div className="absolute inset-x-0 bottom-0 h-64 bg-linear-to-t from-cyan-100/75 via-cyan-50/35 to-transparent" />
      </div>

      {/* 暗色：保留星空 + 流星 */}
      <div className="about-night-layer absolute inset-0 bg-[#09090b]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-slate-900 via-[#09090b] to-black" />

        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />

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
              ease: 'easeInOut',
            }}
          />
        ))}

        <div className="absolute -top-20 right-20 w-[3px] h-[120px] bg-linear-to-b from-transparent via-white to-transparent animate-shooting-star shadow-[0_0_20px_2px_rgba(255,255,255,0.5)]" />
        <div className="absolute top-[20%] -right-20 w-0.5 h-[100px] bg-linear-to-b from-transparent via-blue-200 to-transparent animate-shooting-star shadow-[0_0_20px_2px_rgba(100,100,255,0.5)]" style={{ animationDelay: '4s', animationDuration: '4s' }} />
      </div>
    </div>
  );
}