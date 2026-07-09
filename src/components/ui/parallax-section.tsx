
import React, { useRef, useState, useEffect, ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down";
  intensity?: number; // 0-100
  threshold?: number; // 0-1
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  className,
  direction = "up",
  intensity = 30,
  threshold = 0.2,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [elementTop, setElementTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);

  const { scrollY } = useScroll();

  // Calculate normalized intensity value (negative for up, positive for down)
  const normalizedIntensity = direction === "up" ? -intensity : intensity;

  // Update element position when DOM updates
  useEffect(() => {
    if (!ref.current) return;

    const setValues = () => {
      const element = ref.current;
      if (!element) return;

      setElementTop(element.offsetTop);
      setClientHeight(window.innerHeight);
    };

    setValues();
    window.addEventListener("resize", setValues);
    
    return () => {
      window.removeEventListener("resize", setValues);
    };
  }, [ref, scrollY]);

  // Calculate y transform based on scroll position
  const transformValue = useTransform(
    scrollY,
    [elementTop - clientHeight, elementTop + clientHeight],
    [normalizedIntensity, -normalizedIntensity]
  );

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
    >
      <motion.div
        style={{ y: transformValue }}
        transition={{ type: "spring", stiffness: 50, damping: 30 }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default ParallaxSection;
