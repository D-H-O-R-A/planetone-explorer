import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface ParticleProps {
  intensity?: 'low' | 'medium' | 'high';
  variant?: 'dots' | 'grid' | 'wave' | 'combined';
  color?: string;
  responsive?: boolean;
}

export const AnimatedBackground: React.FC<ParticleProps> = ({
  intensity = 'medium',
  variant = 'combined',
  color = 'rgba(255, 0, 54, 0.7)',
  responsive = true,
}) => {

  // Determine number of particles based on intensity
  const getParticleCount = () => {
    switch (intensity) {
      case 'low': return 40;
      case 'high': return 120;
      default: return 80; // medium
    }
  };

  const particleCount = getParticleCount();

  // Generate particles
  const particles = Array.from({ length: particleCount }).map((_, i) => {
    const size = Math.random() * 2 + 0.5;
    const initialX = Math.random() * 100;
    const initialY = Math.random() * 100;
    const duration = Math.random() * 30 + 15;
    const delay = Math.random() * 5;

    return { id: i, size, initialX, initialY, duration, delay };
  });

  // Handle forest parallax
  const forestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant !== 'grid' && variant !== 'combined') return;

    const forest = forestRef.current;
    if (!forest) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth) * 6;
      const y = (clientY / window.innerHeight) * 6;

      forest.style.transform = `translate(${-x}px, ${-y}px)`;
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [variant]);

  // Wave animation
  const waveVariants = {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">

      {/* DOT PARTICLES */}
      {(variant === 'dots' || variant === 'combined') && (
        <>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                width: `${responsive ? particle.size : particle.size * 2}px`,
                height: `${responsive ? particle.size : particle.size * 2}px`,
                left: `${particle.initialX}%`,
                top: `${particle.initialY}%`,
                backgroundColor: color,
                filter: 'blur(1px)'
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut"
              }}
            />
          ))}
        </>
      )}

      {/* CYBER BLOCKCHAIN NETWORK GRID */}
      {(variant === 'grid' || variant === 'combined') && (
        <div
          ref={forestRef}
          className="absolute inset-0 transition-transform duration-300 ease-out pointer-events-none"
        >
          {Array.from({ length: 50 }).map((_, i) => {
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const size = Math.random() * 40 + 30;
            const opacity = Math.random() * 0.25 + 0.1;

            return (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  opacity,
                }}
                animate={{
                  y: [0, -6, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {/* DECENTRALIZED TECH NODE SVG */}
                <svg
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="32" cy="32" r="6" fill="var(--explorer-secondary, #10B981)" opacity="0.8" />
                  <circle cx="32" cy="32" r="14" stroke="var(--explorer-secondary, #10B981)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                  <circle cx="32" cy="32" r="22" stroke="var(--explorer-primary, #3B82F6)" strokeWidth="0.75" opacity="0.15" />
                  <line x1="32" y1="4" x2="32" y2="60" stroke="var(--explorer-primary, #3B82F6)" strokeWidth="0.5" opacity="0.2" />
                  <line x1="4" y1="32" x2="60" y2="32" stroke="var(--explorer-primary, #3B82F6)" strokeWidth="0.5" opacity="0.2" />
                </svg>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* WAVES */}
      {(variant === 'wave' || variant === 'combined') && (
        <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-10">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute bottom-0 w-full"
              style={{
                height: `${(i + 1) * 25}%`,
                background: `linear-gradient(to top, ${color.replace('0.7', String((3 - i) * 0.03))}, transparent)`,
                transformOrigin: 'bottom',
              }}
              variants={waveVariants}
              animate="animate"
              transition={{ delay: i * 0.5 }}
            />
          ))}
        </div>
      )}

      {/* Ambient light */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-white opacity-5" />
    </div>
  );
};
