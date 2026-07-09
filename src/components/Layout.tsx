
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { TooltipProvider } from "@/components/ui/tooltip";
import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { AnimatedBackground } from "./AnimatedBackground";
import FloatingActionButton from "./FloatingActionButton";

const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  return (
    <motion.div 
      className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50 z-50 origin-left"
      style={{ scaleX }}
    />
  );
};

const CinematicMask: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const maskHeight = useTransform(scrollYProgress, [0, 0.1], ["0.5rem", "0rem"]);

  return (
    <>
      <motion.div 
        className="fixed top-0 left-0 right-0 z-50 bg-black pointer-events-none" 
        style={{ height: maskHeight }}
      />
      <motion.div 
        className="fixed bottom-0 left-0 right-0 z-50 bg-black pointer-events-none" 
        style={{ height: maskHeight }}
      />
    </>
  );
};

const MouseTrailer: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      cursor.style.transform = `translate(${clientX}px, ${clientY}px) translate(-50%, -50%)`;
      
      // Check if over interactive element
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('a, button, input, select, textarea, [role="button"]');
      
      if (isInteractive) {
        cursor.classList.add('scale-150', 'opacity-30');
      } else {
        cursor.classList.remove('scale-150', 'opacity-30');
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <div 
      ref={cursorRef}
      className="fixed w-5 h-5 rounded-full border-2 border-primary/50 z-[100] pointer-events-none hidden md:block mix-blend-difference transition-transform duration-100"
      style={{ transform: 'translate(-50%, -50%)' }}
    />
  );
};

// Grid background with interactive movement
const InteractiveGridBackground: React.FC = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const moveX = (clientX - window.innerWidth / 2) / 50;
      const moveY = (clientY - window.innerHeight / 2) / 50;
      
      grid.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <div 
      ref={gridRef} 
      className="fixed inset-0 z-0 pointer-events-none transition-transform duration-1000 ease-out"
    >
      <div className="cyber-grid absolute inset-0 opacity-10"></div>
      
      {/* Horizontal lines */}
      <div className="absolute left-0 right-0 h-px bg-primary/5 top-1/4"></div>
      <div className="absolute left-0 right-0 h-px bg-primary/5 top-2/4"></div>
      <div className="absolute left-0 right-0 h-px bg-primary/5 top-3/4"></div>
      
      {/* Vertical lines */}
      <div className="absolute top-0 bottom-0 w-px bg-primary/5 left-1/4"></div>
      <div className="absolute top-0 bottom-0 w-px bg-primary/5 left-2/4"></div>
      <div className="absolute top-0 bottom-0 w-px bg-primary/5 left-3/4"></div>
      
      {/* Intersection points */}
      <div className="absolute top-[25%] left-[25%] w-2 h-2 rounded-full border border-primary/20 opacity-50"></div>
      <div className="absolute top-[25%] left-[50%] w-2 h-2 rounded-full border border-primary/20 opacity-50"></div>
      <div className="absolute top-[25%] left-[75%] w-2 h-2 rounded-full border border-primary/20 opacity-50"></div>
      <div className="absolute top-[50%] left-[25%] w-2 h-2 rounded-full border border-primary/20 opacity-50"></div>
      <div className="absolute top-[50%] left-[50%] w-2 h-2 rounded-full border border-primary/20 opacity-50"></div>
      <div className="absolute top-[50%] left-[75%] w-2 h-2 rounded-full border border-primary/20 opacity-50"></div>
      <div className="absolute top-[75%] left-[25%] w-2 h-2 rounded-full border border-primary/20 opacity-50"></div>
      <div className="absolute top-[75%] left-[50%] w-2 h-2 rounded-full border border-primary/20 opacity-50"></div>
      <div className="absolute top-[75%] left-[75%] w-2 h-2 rounded-full border border-primary/20 opacity-50"></div>
    </div>
  );
};

const Layout = () => {
  // Add intersection observers for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.15, rootMargin: "-50px" });
    
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .stagger-children');
    animatedElements.forEach(el => observer.observe(el));
    
    return () => {
      animatedElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen bg-background text-foreground relative overflow-hidden">
        {/* Scroll Progress Indicator */}
        <ScrollProgress />
        
        {/* Cinematic top and bottom letterbox effect */}
        <CinematicMask />
        
        {/* Mouse trailer effect */}
        <MouseTrailer />
        
        {/* Interactive backgrounds */}
        <AnimatedBackground 
          intensity="low"
          variant="combined"
          color="rgba(0, 255, 4, 0.5)"
        />
        
        <InteractiveGridBackground />
        
        {/* Background decorative elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="bg-noise absolute inset-0"></div>
          
          {/* Atmospheric glow spots */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[100px]"></div>
          <div className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full bg-primary/3 blur-[80px]"></div>
          
          {/* Data flow patterns */}
          <div className="absolute inset-y-0 left-[10%] w-[1px] data-flow"></div>
          <div className="absolute inset-y-0 right-[10%] w-[1px] data-flow"></div>
        </div>
        
        <Header />
        
        <main className="flex-grow z-10 relative">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="py-4 sm:py-6 md:py-8 lg:py-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-20 md:pb-10"
          >
            <Outlet />
          </motion.div>
        </main>
        
        <Footer />

        {/* Mobile floating action button */}
        <FloatingActionButton />
      </div>
    </TooltipProvider>
  );
};

export default Layout;
