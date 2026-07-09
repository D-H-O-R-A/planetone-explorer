
import { useState, useRef, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ThreeDCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: number;
  borderColor?: string;
  shadow?: boolean;
}

export const ThreeDCard = ({
  children,
  className,
  glowColor = "0, 255, 38", // Default red
  intensity = 0.5,
  borderColor = "rgba(0, 255, 38, 0.2)",
  shadow = true,
}: ThreeDCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Calculate rotation based on mouse position relative to card center
    const rotateYValue = ((mouseX - centerX) / (rect.width / 2)) * 5;
    const rotateXValue = ((centerY - mouseY) / (rect.height / 2)) * 5;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "relative rounded-xl overflow-hidden border transition-colors duration-500",
        { "shadow-lg": shadow },
        className
      )}
      style={{
        perspective: "1000px",
        borderColor: isHovering ? `rgba(${glowColor}, 0.5)` : borderColor,
        boxShadow: isHovering && shadow
          ? `0 0 25px rgba(${glowColor}, ${intensity * 0.2})`
          : shadow ? `0 10px 30px rgba(0, 0, 0, 0.3)` : "none",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setRotateX(0);
        setRotateY(0);
        setIsHovering(false);
      }}
      animate={{
        rotateX: rotateX,
        rotateY: rotateY,
        transition: { type: "spring", stiffness: 100, damping: 20 },
      }}
    >
      {/* Inner content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Glow effect */}
      {isHovering && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${rotateY > 0 ? "30%" : "70%"} ${rotateX > 0 ? "70%" : "30%"}, rgba(${glowColor}, ${intensity * 0.15}), transparent 70%)`,
          }}
        />
      )}
    </motion.div>
  );
};
