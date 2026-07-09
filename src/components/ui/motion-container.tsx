
import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type MotionContainerProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
  triggerOnce?: boolean;
  staggerChildren?: boolean;
  staggerDelay?: number;
};

export const MotionContainer: React.FC<MotionContainerProps> = ({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 0.6,
  triggerOnce = true,
  staggerChildren = false,
  staggerDelay = 0.1,
}) => {
  const getDirectionalVariants = () => {
    const distance = 30;
    const directions = {
      up: { y: distance },
      down: { y: -distance },
      left: { x: distance },
      right: { x: -distance },
    };
    
    return {
      hidden: {
        opacity: 0,
        ...directions[direction],
      },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          duration,
          ease: [0.22, 1, 0.36, 1],
          delay,
          staggerChildren: staggerChildren ? staggerDelay : 0,
        },
      },
    };
  };

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: triggerOnce, margin: "-5%" }}
      variants={getDirectionalVariants()}
    >
      {children}
    </motion.div>
  );
};

export const MotionChild = ({ 
  children, 
  className, 
  delay = 0,
  isVisible = true 
}: { 
  children: ReactNode; 
  className?: string; 
  delay?: number;
  isVisible?: boolean;
}) => {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: isVisible ? 1 : 0, 
          y: 0,
          transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
            delay
          }
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export const MotionText = ({ 
  children, 
  className,
  highlightClassName = "text-primary",
  delay = 0
}: { 
  children: string; 
  className?: string;
  highlightClassName?: string;
  delay?: number;
}) => {
  return (
    <div className={cn("overflow-hidden", className)}>
      <motion.p
        initial={{ y: 100 }}
        whileInView={{ y: 0 }}
        viewport={{ once: true }}
        transition={{ 
          duration: 1, 
          ease: [0.22, 1, 0.36, 1],
          delay
        }}
        className="block"
      >
        {children.split(' ').map((word, i) => (
          <span key={i}>
            {word.startsWith('[') && word.endsWith(']') ? (
              <span className={highlightClassName}>
                {word.substring(1, word.length - 1)}
              </span>
            ) : (
              word
            )}
            {i !== children.split(' ').length - 1 && ' '}
          </span>
        ))}
      </motion.p>
    </div>
  );
};

export const ParallaxContainer: React.FC<{
  children: ReactNode;
  className?: string;
  offset?: number;
  direction?: "up" | "down" | "left" | "right";
}> = ({ children, className, offset = 50, direction = "up" }) => {
  const getTransform = () => {
    switch (direction) {
      case "up": return { y: `-${offset}px` };
      case "down": return { y: `${offset}px` };
      case "left": return { x: `-${offset}px` };
      case "right": return { x: `${offset}px` };
    }
  };

  return (
    <motion.div
      className={cn("relative overflow-hidden", className)}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        style={getTransform()}
        transition={{
          duration: 1.5,
          ease: "easeOut",
          repeat: 0,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export const RevealText: React.FC<{ 
  text: string; 
  className?: string;
  highlightWords?: string[];
  highlightClassName?: string;
}> = ({ text, className, highlightWords = [], highlightClassName = "text-primary" }) => {
  const words = text.split(' ');

  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="flex flex-wrap gap-x-2">
        {words.map((word, i) => (
          <div key={i} className="overflow-hidden inline-block">
            <motion.span 
              className={cn(
                highlightWords.includes(word) ? highlightClassName : ""
              )}
              custom={i}
              variants={{
                hidden: { y: 50, opacity: 0 },
                visible: (i) => ({
                  y: 0,
                  opacity: 1,
                  transition: {
                    delay: i * 0.05,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1]
                  }
                })
              }}
            >
              {word}
            </motion.span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
