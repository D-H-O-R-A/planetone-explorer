
import React from "react";
import { Button, ButtonProps } from "./button";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const illuminatedButtonVariants = cva(
  "relative overflow-hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "bg-black border border-primary/40 hover:border-primary text-primary hover:text-primary-foreground hover:bg-primary/20",
        destructive:
          "bg-black border border-destructive/40 hover:border-destructive text-destructive hover:text-destructive-foreground hover:bg-destructive/20",
        outline:
          "bg-black border border-input hover:bg-accent/5 hover:text-accent-foreground",
        secondary:
          "bg-black border border-secondary/40 hover:border-secondary text-secondary hover:text-secondary-foreground hover:bg-secondary/20",
        ghost: "hover:bg-accent/5 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      glow: {
        none: "",
        subtle: "",
        strong: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: "subtle",
    },
  }
);

export interface IlluminatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof illuminatedButtonVariants> {
  asChild?: boolean;
}

const IlluminatedButton = React.forwardRef<HTMLButtonElement, IlluminatedButtonProps>(
  ({ className, variant, size, glow = "subtle", children, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);

    // Determine glow color based on variant
    let glowColor = "31, 151, 83"; // primary red by default
    if (variant === "destructive") glowColor = "220, 38, 38";
    if (variant === "secondary") glowColor = "31, 151, 83";

    // Determine glow intensity based on glow prop
    let glowIntensity = 0.2;
    if (glow === "strong") glowIntensity = 0.4;
    if (glow === "none") glowIntensity = 0;

    return (
      <Button
        className={cn(
          illuminatedButtonVariants({ variant, size }),
          "group",
          isHovered && 
            glow !== "none" && 
            `shadow-[0_0_15px_rgba(${glowColor},${glowIntensity})]`,
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        ref={ref}
        {...props}
      >
        {/* Glow effect */}
        {glow !== "none" && (
          <motion.span
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            style={{
              background: `radial-gradient(circle, rgba(${glowColor},${glowIntensity}), transparent 70%)`,
            }}
          />
        )}
        
        {/* Animated shine effect on hover */}
        <motion.span
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0, left: "-100%" }}
          animate={{
            opacity: isHovered ? 0.4 : 0,
            left: isHovered ? "100%" : "-100%",
          }}
          transition={{ duration: 0.8 }}
          style={{
            background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)`,
            width: "40%",
          }}
        />
        
        {/* Content remains on top */}
        <span className="relative z-10">{children}</span>
      </Button>
    );
  }
);

IlluminatedButton.displayName = "IlluminatedButton";

export { IlluminatedButton };
