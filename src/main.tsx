import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Create root element
const rootElement = document.getElementById("root");

// Detect active theme (defaulting strictly to light mode if not yet set)
const savedTheme = localStorage.getItem("planetone-ui-theme") || "light";
const isDark = savedTheme === "dark";

// Create preloader container
const preloader = document.createElement('div');
preloader.id = 'planetone-preloader';
preloader.style.position = 'fixed';
preloader.style.inset = '0';
preloader.style.display = 'flex';
preloader.style.flexDirection = 'column';
preloader.style.alignItems = 'center';
preloader.style.justifyContent = 'center';
preloader.style.zIndex = '99999';
preloader.style.transition = 'opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), visibility 0.8s cubic-bezier(0.25, 1, 0.5, 1)';

// Dynamic theme styling for the preloader background
preloader.style.background = isDark 
  ? 'radial-gradient(circle at center, #0F172A 0%, #030712 100%)' // Deep cyber slate dark
  : 'radial-gradient(circle at center, #FFFFFF 0%, #F1F5F9 100%)'; // Elegant pure porcelain light

const preloaderContent = document.createElement('div');
preloaderContent.style.display = 'flex';
preloaderContent.style.flexDirection = 'column';
preloaderContent.style.alignItems = 'center';
preloaderContent.style.justifyContent = 'center';

// Colors based on theme
const textColor = isDark ? '#F8FAFC' : '#0F172A';
const subtitleColor = isDark ? '#64748B' : '#475569';
const borderOuter = isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.15)';
const borderMiddle = isDark ? 'rgba(2, 132, 199, 0.15)' : 'rgba(2, 132, 199, 0.2)';
const trackBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.05)';

preloaderContent.innerHTML = `
  <div class="preloader-wrapper" style="display: flex; flex-direction: column; align-items: center; justify-content: center; transform: scale(0.95); opacity: 0; animation: preloader-entrance 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;">
    
    <!-- HIGH-TECH 3D ORBIT CONCENTRIC LOADER -->
    <div class="logo-container" style="width: 110px; height: 110px; position: relative; display: flex; items-center; justify-content: center;">
      <!-- Outer Rotating Segment Ring -->
      <div class="ring outer-ring" style="position: absolute; inset: 0; border: 2px dashed ${borderOuter}; border-radius: 50%; animation: spin-clockwise 10s linear infinite;"></div>
      
      <!-- Middle Pulse Ring -->
      <div class="ring middle-ring" style="position: absolute; inset: 15px; border: 2px solid ${borderMiddle}; border-top-color: #10B981; border-bottom-color: #0284C7; border-radius: 50%; animation: spin-counter 3s cubic-bezier(0.53, 0.21, 0.43, 0.89) infinite;"></div>
      
      <!-- Glowing Active Core Planet -->
      <div class="planet-core" style="position: absolute; inset: 36px; background: linear-gradient(135deg, #10B981 0%, #0284C7 100%); border-radius: 50%; box-shadow: ${isDark ? '0 0 25px rgba(16, 185, 129, 0.5)' : '0 0 15px rgba(16, 185, 129, 0.35)'}; display: flex; align-items: center; justify-content: center;">
        <!-- Glowing orbit particle -->
        <div class="orbiting-dot" style="position: absolute; width: 6px; height: 6px; background: #FFFFFF; border-radius: 50%; top: -3px; box-shadow: 0 0 10px #FFFFFF;"></div>
      </div>
    </div>

    <!-- TYPOGRAPHY WITH DUAL TONE GRADIENT -->
    <div class="brand-text-wrapper" style="text-align: center; margin-top: 35px; z-index: 10;">
      <h1 class="brand-title" style="margin: 0; font-family: 'Orbitron', 'Syncopate', sans-serif; font-size: 19px; font-weight: 800; letter-spacing: 6px; color: ${textColor}; text-transform: uppercase;">
        Planet <span style="background: linear-gradient(90deg, #10B981, #0284C7); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">One</span>
      </h1>
      <p class="brand-subtitle" style="margin: 8px 0 0 0; font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 4px; color: ${subtitleColor}; text-transform: uppercase;">
        Global eRWA Blockchain Infrastructure
      </p>
    </div>

    <!-- SCIENTIFIC PROGRESS LOAD BAR -->
    <div class="progress-container" style="margin-top: 25px; width: 220px; height: 3px; background: ${trackBg}; border-radius: 10px; overflow: hidden; position: relative;">
      <div class="progress-bar-fill" style="position: absolute; top: 0; left: 0; height: 100%; width: 45%; background: linear-gradient(90deg, #10B981, #0284C7); border-radius: 10px; animation: progress-fill-step 2.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;"></div>
    </div>
  </div>

  <style>
    @keyframes preloader-entrance {
      to { transform: scale(1); opacity: 1; }
    }
    @keyframes spin-clockwise {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes spin-counter {
      0% { transform: rotate(360deg); }
      100% { transform: rotate(0deg); }
    }
    @keyframes progress-fill-step {
      0% { width: 0%; }
      30% { width: 35%; }
      65% { width: 70%; }
      85% { width: 92%; }
      100% { width: 100%; }
    }
  </style>
`;

preloader.appendChild(preloaderContent);
document.body.appendChild(preloader);

// Set body background to match preloader state immediately
document.body.style.background = isDark ? '#030712' : '#F8FAFC';

// Load fonts and app with visual polish
const fontsToLoad = [
  'https://fonts.googleapis.com/css2?family=Syncopate:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap'
];

// Promise to load all fonts
Promise.all(
  fontsToLoad.map(url => {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.href = url;
      link.rel = 'stylesheet';
      link.onload = () => resolve(url);
      link.onerror = () => reject(new Error(`Failed to load font: ${url}`));
      document.head.appendChild(link);
    });
  })
)
.then(() => {
  // Render the React application with a controlled, fluid transition
  setTimeout(() => {
    if (rootElement) {
      const appWrapper = document.createElement('div');
      appWrapper.className = 'app-wrapper';
      appWrapper.style.minHeight = '100vh';
      appWrapper.style.perspective = '1000px';
      rootElement.appendChild(appWrapper);
      
      createRoot(appWrapper).render(
        <App />
      );
      
      // Fade out the preloader
      preloader.style.opacity = '0';
      preloader.style.visibility = 'hidden';
      
      // Add subtle entrance animations to the body
      document.body.style.animation = 'fadeIn 1.2s cubic-bezier(0.25, 1, 0.5, 1)';
      
      // Remove preloader from DOM once faded
      setTimeout(() => {
        preloader.remove();
      }, 800);
    }
  }, 2200); // Fluid timing for the high-end loading bar animation
})
.catch(error => {
  console.warn('Font loading issues, starting App immediately:', error);
  if (rootElement) {
    createRoot(rootElement).render(
      <App />
    );
    preloader.remove();
  }
});
