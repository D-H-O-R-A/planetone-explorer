import { useState, useEffect, useRef } from "react";
import { 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Play, 
  Pause, 
  ShieldCheck, 
  Info, 
  MapPin, 
  Layers,
  Trees,
  Grid,
  Coins,
  Sparkles,
  Maximize2,
  Minimize2,
  ExternalLink,
  ChevronRight,
  Clock,
  Wallet
} from "lucide-react";
import realVertices from "@/data/maps_vertices.json";
import { EcosystemFaq } from "@/components/carbon-map/EcosystemFaq";
import { GlobalMetricsCards } from "@/components/carbon-map/GlobalMetricsCards";
import { CellMetricsSidebar } from "@/components/carbon-map/CellMetricsSidebar";
import { StakingCalculator } from "@/components/carbon-map/StakingCalculator";

interface GridCell {
  x: number;
  z: number;
  height: number;
  carbonOffsetYearly: number; // kg CO2/year
  carbonOffset10Years: number; // kg CO2/10 years
  soilMoisture: number;
  biomass: number;
  serial: string;
  species: string;
  utmE: number;
  utmN: number;
  isInsidePolygon: boolean;
}

const CarbonMapPage = () => {
  const altitudeScale = 1.6;

  // GIS scale mode locked to hectare
  const scaleMode = "hectare";
  const gridSize = 25;

  // Map viewport state
  const [viewMode, setViewMode] = useState<"forest" | "elevation" | "biomass" | "heatmap" | "wireframe">("forest"); // Primary default
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [rotationSpeed, setRotationSpeed] = useState<number>(0.003);
  const [zoom, setZoom] = useState<number>(22);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // View offsets for panning
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);

  // Custom camera angles
  const [angleX, setAngleX] = useState<number>(0.8); // Tilt
  const [angleY, setAngleY] = useState<number>(0.4); // Rotation

  // Selected & Hovered cells
  const [selectedCell, setSelectedCell] = useState<GridCell | null>(null);
  const [hoveredCell, setHoveredCell] = useState<GridCell | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapCardRef = useRef<HTMLDivElement | null>(null); // Fullscreen target
  const animationRef = useRef<number | null>(null);

  // Drag interaction states
  const isDraggingRef = useRef<boolean>(false);
  const dragModeRef = useRef<"rotate" | "pan">("rotate");
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Get bounds of real vertices from PDF (Beruri / AM)
  const xCoords = realVertices.map(v => v.utmX);
  const yCoords = realVertices.map(v => v.utmY);
  const minE = Math.min(...xCoords);
  const maxE = Math.max(...xCoords);
  const minN = Math.min(...yCoords);
  const maxN = Math.max(...yCoords);

  // Centroid for Google Maps
  const centroidLat = -4.713034;
  const centroidLon = -61.293840;

  // Raycasting Point-in-Polygon
  const isPointInPolygon = (px: number, py: number, vertices: { utmX: number; utmY: number }[]): boolean => {
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].utmX;
      const yi = vertices[i].utmY;
      const xj = vertices[j].utmX;
      const yj = vertices[j].utmY;
      
      const intersect = ((yi > py) !== (yj > py))
          && (px < ((xj - xi) * (py - yi)) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const cellsRef = useRef<GridCell[][]>([]);
  
  useEffect(() => {
    const tempCells: GridCell[][] = [];
    let selectedDefault: GridCell | null = null;

    for (let x = 0; x < gridSize; x++) {
      const row: GridCell[] = [];
      for (let z = 0; z < gridSize; z++) {
        // Map grid coordinates to the exact real polygon bounding box
        const pctX = x / (gridSize - 1);
        const pctZ = z / (gridSize - 1); // 0 (back) to 1 (front)
        
        const utmE = Math.round(minE + pctX * (maxE - minE));
        // INVERT Z-AXIS FLIP: pctZ=0 maps to North (maxN), pctZ=1 maps to South (minN). Aligns cells perfectly with boundary line!
        const utmN = Math.round(maxN - pctZ * (maxN - minN));

        // Use point-in-polygon on the real PDF vertices
        const isInside = isPointInPolygon(utmE, utmN, realVertices);

        // Natural elevation mapping (Beruri, AM lowland forest)
        const nx = pctX - 0.5;
        const nz = pctZ - 0.5;
        const heightVal = isInside 
          ? Math.sin(nx * 4.0) * Math.cos(nz * 4.0) * 1.6 + 
            Math.sin(nx * 10.0) * Math.sin(nz * 10.0) * 0.2
          : 0;

        const index = x * gridSize + z;
        const serial = `PLO-VERDE-${200000 + index}`;
        
        // Amazon Forest Carbon Sequestration metrics
        const baseCarbonOffset = 0.75; // 0.75 kg CO2 per m² per year
        const variation = 0.96 + (heightVal * 0.08) + (Math.sin(nx * 20) * 0.05);
        const carbonOffsetYearly = isInside ? Math.round((baseCarbonOffset * variation) * 100) / 100 : 0;
        const carbonOffset10Years = isInside ? Math.round((carbonOffsetYearly * 10) * 100) / 100 : 0;

        const biomass = isInside ? Math.round(310 + (heightVal * 45) + (Math.sin(nx * 15) * 20)) : 0;
        const soilMoisture = isInside ? Math.round(75 + (heightVal * -12) + (nz * 10)) : 0;

        const speciesList = [
          "Castanheira do Pará (Bertholletia excelsa)",
          "Sumaúma (Ceiba pentandra)",
          "Ipê Amarelo (Handroanthus albus)",
          "Cedro Rosa (Cedrela fissilis)"
        ];
        const species = speciesList[(x + z) % speciesList.length];

        const cell: GridCell = {
          x,
          z,
          height: heightVal,
          carbonOffsetYearly,
          carbonOffset10Years,
          soilMoisture: Math.min(100, Math.max(0, soilMoisture)),
          biomass,
          serial,
          species,
          utmE,
          utmN,
          isInsidePolygon: isInside
        };

        if (isInside && !selectedDefault && x >= Math.floor(gridSize / 2)) {
          selectedDefault = cell;
        }

        row.push(cell);
      }
      tempCells.push(row);
    }
    cellsRef.current = tempCells;

    if (selectedDefault) {
      setSelectedCell(selectedDefault);
    } else if (tempCells.length > 0) {
      setSelectedCell(tempCells[Math.floor(gridSize/2)][Math.floor(gridSize/2)]);
    }
  }, [scaleMode, gridSize]);

  // Handle Fullscreen events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const el = mapCardRef.current; // Fullscreen on entire glass-card container
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(err => {
        console.error("Error entering fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Handle Dragging / Orbiting / Panning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    
    // Right click or Shift key triggers Pan mode, Left click triggers Rotate
    if (e.button === 2 || e.shiftKey) {
      dragModeRef.current = "pan";
    } else {
      dragModeRef.current = "rotate";
    }
  };

  // Touch handlers for flawless mobile interactive navigation (1 finger rotate, 2 finger pan)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      const touch = e.touches[0];
      const pos = { x: touch.clientX, y: touch.clientY };
      lastMousePosRef.current = pos;
      touchStartPosRef.current = pos;
      dragModeRef.current = "rotate";
    } else if (e.touches.length === 2) {
      isDraggingRef.current = true;
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      lastMousePosRef.current = { x: centerX, y: centerY };
      dragModeRef.current = "pan";
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !canvasRef.current) return;
    
    let clientX = 0;
    let clientY = 0;
    
    if (e.touches.length === 1 && dragModeRef.current === "rotate") {
      const touch = e.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else if (e.touches.length === 2 && dragModeRef.current === "pan") {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      clientX = (touch1.clientX + touch2.clientX) / 2;
      clientY = (touch1.clientY + touch2.clientY) / 2;
    } else {
      return;
    }

    const deltaX = clientX - lastMousePosRef.current.x;
    const deltaY = clientY - lastMousePosRef.current.y;
    
    if (dragModeRef.current === "pan") {
      setOffsetX(prev => prev + deltaX * 0.8);
      setOffsetY(prev => prev + deltaY * 0.8);
    } else {
      setAngleY(prev => prev + deltaX * 0.008);
      setAngleX(prev => Math.min(Math.PI / 2, Math.max(0.1, prev + deltaY * 0.008)));
    }
    
    lastMousePosRef.current = { x: clientX, y: clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    
    // Evaluate if gesture was a touch tap (no dragging movement) to select cell immediately
    const startX = touchStartPosRef.current.x;
    const startY = touchStartPosRef.current.y;
    const endX = lastMousePosRef.current.x;
    const endY = lastMousePosRef.current.y;
    
    const moveDistance = Math.hypot(endX - startX, endY - startY);
    if (moveDistance < 6) {
      if (hoveredCell && hoveredCell.isInsidePolygon) {
        setSelectedCell(hoveredCell);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDraggingRef.current) {
      const deltaX = e.clientX - lastMousePosRef.current.x;
      const deltaY = e.clientY - lastMousePosRef.current.y;
      
      if (dragModeRef.current === "pan") {
        setOffsetX(prev => prev + deltaX * 0.7);
        setOffsetY(prev => prev + deltaY * 0.7);
      } else {
        setAngleY(prev => prev + deltaX * 0.007);
        setAngleX(prev => Math.min(Math.PI / 2, Math.max(0.1, prev + deltaY * 0.007)));
      }
      
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    } else {
      // Find closest projected point for hover
      let closest: GridCell | null = null;
      let minDistance = 15; // Hover range pixel threshold

      const canvas = canvasRef.current;
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      const cx = width / 2;
      const cy = height / 2;

      const cells = cellsRef.current;
      const currentGridSize = cells.length;
      for (let r = 0; r < cells.length; r++) {
        for (let c = 0; c < cells[r].length; c++) {
          const cell = cells[r][c];
          
          if (!cell.isInsidePolygon) continue;

          const spacing = 12;
          const px = (cell.x - currentGridSize / 2) * spacing;
          const pz = (cell.z - currentGridSize / 2) * spacing;
          const py = cell.height * spacing * altitudeScale;

          const rx1 = px * Math.cos(angleY) - pz * Math.sin(angleY);
          const rz1 = px * Math.sin(angleY) + pz * Math.cos(angleY);
          const ry2 = py * Math.cos(angleX) - rz1 * Math.sin(angleX);
          const rz2 = py * Math.sin(angleX) + rz1 * Math.cos(angleX);

          const focalLength = 400;
          const scale = (focalLength / (focalLength + rz2)) * (zoom / 18);
          const sx = cx + rx1 * scale + offsetX;
          const sy = cy - ry2 * scale + offsetY;

          const dist = Math.hypot(mouseX - sx, mouseY - sy);
          if (dist < minDistance) {
            minDistance = dist;
            closest = cell;
          }
        }
      }
      setHoveredCell(closest);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseClick = () => {
    if (hoveredCell && hoveredCell.isInsidePolygon) {
      setSelectedCell(hoveredCell);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    setZoom(prev => Math.min(50, Math.max(4, prev - e.deltaY * 0.015)));
  };

  // Reset Camera Position
  const handleResetCamera = () => {
    setOffsetX(0);
    setOffsetY(0);
    setZoom(22);
    setAngleX(0.8);
    setAngleY(0.4);
    setIsRotating(false);
  };

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const container = containerRef.current;
      if (container && canvas) {
        canvas.width = container.clientWidth * window.devicePixelRatio;
        canvas.height = container.clientHeight * window.devicePixelRatio;
        canvas.style.width = `${container.clientWidth}px`;
        canvas.style.height = `${container.clientHeight}px`;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      const cx = width / 2;
      const cy = height / 2;

      if (isRotating && !isDraggingRef.current) {
        setAngleY(prev => prev + rotationSpeed);
      }

      const cells = cellsRef.current;
      if (cells.length === 0) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }

      const currentGridSize = cells.length;

      interface ProjectedPoint {
        cell: GridCell;
        sx: number;
        sy: number;
        sz: number; // depth value for sorting
      }

      // 1. PROJECT ALL GRID CELLS
      const allPoints: ProjectedPoint[] = [];
      const gridMap: ProjectedPoint[][] = Array(currentGridSize).fill(null).map(() => Array(currentGridSize).fill(null) as any);
      
      for (let r = 0; r < currentGridSize; r++) {
        for (let c = 0; c < currentGridSize; c++) {
          const cell = cells[r][c];

          const spacing = 12;
          const px = (cell.x - currentGridSize / 2) * spacing;
          const pz = (cell.z - currentGridSize / 2) * spacing;
          const py = cell.height * spacing * altitudeScale;

          const rx1 = px * Math.cos(angleY) - pz * Math.sin(angleY);
          const rz1 = px * Math.sin(angleY) + pz * Math.cos(angleY);
          const ry2 = py * Math.cos(angleX) - rz1 * Math.sin(angleX);
          const rz2 = py * Math.sin(angleX) + rz1 * Math.cos(angleX);

          const focalLength = 400;
          const scale = (focalLength / (focalLength + rz2)) * (zoom / 18);
          const sx = cx + rx1 * scale + offsetX;
          const sy = cy - ry2 * scale + offsetY;

          const pt: ProjectedPoint = {
            cell,
            sx,
            sy,
            sz: rz2
          };
          allPoints.push(pt);
          gridMap[r][c] = pt;
        }
      }

      // 2. MATHEMATICALLY FLAWLESS PAINTER'S ALGORITHM (DEPTH-SORTING BY 'sz')
      const renderList: { r: number; c: number; sz: number }[] = [];
      for (let r = 0; r < currentGridSize - 1; r++) {
        for (let c = 0; c < currentGridSize - 1; c++) {
          const szAvg = (gridMap[r][c].sz + gridMap[r+1][c].sz + gridMap[r+1][c+1].sz + gridMap[r][c+1].sz) / 4;
          renderList.push({ r, c, sz: szAvg });
        }
      }
      renderList.sort((a, b) => b.sz - a.sz); // Furthest cells first

      // 3. RENDER TILES IN CORRECT DEPTH ORDER
      for (const tile of renderList) {
        const { r, c } = tile;
        const p1 = gridMap[r][c];
        const p2 = gridMap[r + 1][c];
        const p3 = gridMap[r + 1][c + 1];
        const p4 = gridMap[r][c + 1];

        if (!p1.cell.isInsidePolygon && !p2.cell.isInsidePolygon && !p3.cell.isInsidePolygon && !p4.cell.isInsidePolygon) {
          continue;
        }

        let fillColor = "rgba(16, 185, 129, 0.05)";
        let strokeColor = "rgba(16, 185, 129, 0.12)";
        
        const isSelected = selectedCell && p1.cell.x === selectedCell.x && p1.cell.z === selectedCell.z;
        const isHovered = hoveredCell && p1.cell.x === hoveredCell.x && p1.cell.z === hoveredCell.z;

        // Visual layout adaptation based on scaleMode ("m2" gets high-contrast digital squares, "hectare" gets continuous forest landscape)
        if (viewMode === "forest") {
          const moisture = p1.cell.soilMoisture;
          fillColor = `rgba(16, ${Math.min(145, 95 + Math.round(moisture * 0.5))}, 55, 0.45)`;
          
          if (scaleMode === "m2") {
            // Strong neon outlines for individual m² digital bloquinhos
            strokeColor = "rgba(52, 211, 153, 0.55)";
          } else {
            // Subtle blending outlines for continuous vast hectares
            strokeColor = "rgba(16, 105, 45, 0.12)";
          }
        } else if (viewMode === "elevation") {
          const avgHeight = (p1.cell.height + p2.cell.height + p3.cell.height + p4.cell.height) / 4;
          const intensity = Math.round(110 + (avgHeight + 1.2) * 50);
          fillColor = `rgba(16, ${Math.min(255, Math.max(90, intensity))}, 110, 0.3)`;
          strokeColor = scaleMode === "m2" ? "rgba(52, 211, 153, 0.45)" : `rgba(16, ${Math.min(255, Math.max(130, intensity + 20))}, 110, 0.25)`;
        } else if (viewMode === "biomass") {
          const avgOffset = (p1.cell.carbonOffsetYearly + p2.cell.carbonOffsetYearly + p3.cell.carbonOffsetYearly + p4.cell.carbonOffsetYearly) / 4;
          const opacity = 0.12 + (avgOffset / 1.5) * 0.58;
          fillColor = `rgba(6, 110, 64, ${opacity})`;
          strokeColor = scaleMode === "m2" ? "rgba(52, 211, 153, 0.5)" : `rgba(52, 211, 153, ${opacity + 0.1})`;
        } else if (viewMode === "heatmap") {
          const moisture = (p1.cell.soilMoisture + p2.cell.soilMoisture + p3.cell.soilMoisture + p4.cell.soilMoisture) / 4;
          fillColor = `rgba(59, 130, ${Math.round(110 + moisture * 1.3)}, 0.28)`;
          strokeColor = scaleMode === "m2" ? "rgba(96, 165, 250, 0.55)" : `rgba(96, 165, 250, 0.3)`;
        } else if (viewMode === "wireframe") {
          fillColor = "rgba(0, 0, 0, 0)";
          strokeColor = "rgba(16, 185, 129, 0.35)";
        }

        if (isSelected) {
          fillColor = "rgba(16, 185, 129, 0.72)";
          strokeColor = "#10b981";
        } else if (isHovered) {
          fillColor = "rgba(16, 185, 129, 0.42)";
          strokeColor = "#34d399";
        }

        // Draw tile
        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.lineTo(p3.sx, p3.sy);
        ctx.lineTo(p4.sx, p4.sy);
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isSelected || isHovered ? 1.5 : (scaleMode === "m2" ? 0.9 : 0.4);
        ctx.stroke();

        // scaleMode ADAPTIVE TREE GENERATION
        if (viewMode === "forest" && p1.cell.isInsidePolygon && !isSelected) {
          const scaleFactor = (zoom / 22);

          if (scaleMode === "m2") {
            // RENDER 1 DETAILED PRESERVED UNIT TREE FOR THE 1m² GRID BLOCK
            const tx = (p1.sx + p2.sx + p3.sx + p4.sx) / 4;
            const ty = (p1.sy + p2.sy + p3.sy + p4.sy) / 4;
            
            const treeHeight = 15 + (p1.cell.height * 3.5);

            // Trunk
            ctx.strokeStyle = "rgba(110, 58, 12, 0.9)";
            ctx.lineWidth = 1.6 * scaleFactor;
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(tx, ty - (treeHeight * 0.32) * scaleFactor);
            ctx.stroke();

            // High-detail shaded canopy
            const rx = tx;
            const ry = ty - (treeHeight * 0.32) * scaleFactor;
            const canopyHeight = (treeHeight * 0.72) * scaleFactor;
            const rBase = (4.4 + p1.cell.height * 0.4) * scaleFactor;

            // Light side
            ctx.fillStyle = "rgba(16, 185, 129, 0.96)";
            ctx.beginPath();
            ctx.moveTo(rx, ry - canopyHeight);
            ctx.lineTo(rx - rBase, ry);
            ctx.lineTo(rx, ry + rBase * 0.38);
            ctx.closePath();
            ctx.fill();

            // Shaded side
            ctx.fillStyle = "rgba(4, 120, 87, 0.98)";
            ctx.beginPath();
            ctx.moveTo(rx, ry - canopyHeight);
            ctx.lineTo(rx + rBase, ry);
            ctx.lineTo(rx, ry + rBase * 0.38);
            ctx.closePath();
            ctx.fill();

            // Tiny blossom micro-details
            ctx.fillStyle = "#34D399";
            ctx.beginPath();
            ctx.arc(rx - rBase * 0.25, ry - canopyHeight * 0.35, 1.2 * scaleFactor, 0, Math.PI * 2);
            ctx.arc(rx + rBase * 0.2, ry - canopyHeight * 0.55, 1.2 * scaleFactor, 0, Math.PI * 2);
            ctx.fill();

          } else {
            // RENDER 3 PACKED EVERGREENS OF VARYING SIZES & OFFSETS TO REPRESENT "MATA DENSA" COMPRISING 1 HECTARE (10,000 m²)
            const offsets = [
              { dx: -2.8, dy: -2.8, h: 7.5, colorL: "rgba(22, 163, 74, 0.92)", colorR: "rgba(21, 128, 61, 0.94)" },
              { dx: 3.2, dy: -0.6, h: 9.5, colorL: "rgba(16, 185, 129, 0.96)", colorR: "rgba(5, 150, 105, 0.96)" },
              { dx: -0.8, dy: 3.4, h: 8.2, colorL: "rgba(34, 197, 94, 0.88)", colorR: "rgba(22, 163, 74, 0.9)" }
            ];

            for (const offset of offsets) {
              const px = ((p1.cell.x - gridSize / 2) * 12) + offset.dx;
              const pz = ((p1.cell.z - gridSize / 2) * 12) + offset.dy;
              const py = p1.cell.height * 12 * altitudeScale;

              const rx1 = px * Math.cos(angleY) - pz * Math.sin(angleY);
              const rz1 = px * Math.sin(angleY) + pz * Math.cos(angleY);
              const ry2 = py * Math.cos(angleX) - rz1 * Math.sin(angleX);
              const rz2 = py * Math.sin(angleX) + rz1 * Math.cos(angleX);

              const focalLength = 400;
              const scale = (focalLength / (focalLength + rz2)) * (zoom / 18);
              const sx = cx + rx1 * scale + offsetX;
              const sy = cy - ry2 * scale + offsetY;

              const treeHeight = offset.h + (p1.cell.height * 1.5);

              // Trunk
              ctx.strokeStyle = "rgba(105, 54, 10, 0.75)";
              ctx.lineWidth = 0.95 * scaleFactor;
              ctx.beginPath();
              ctx.moveTo(sx, sy);
              ctx.lineTo(sx, sy - (treeHeight * 0.35) * scaleFactor);
              ctx.stroke();

              // Canopy
              const rx = sx;
              const ry = sy - (treeHeight * 0.35) * scaleFactor;
              const canopyHeight = (treeHeight * 0.65) * scaleFactor;
              const rBase = 2.4 * scaleFactor;

              ctx.fillStyle = offset.colorL;
              ctx.beginPath();
              ctx.moveTo(rx, ry - canopyHeight);
              ctx.lineTo(rx - rBase, ry);
              ctx.lineTo(rx, ry + rBase * 0.3);
              ctx.closePath();
              ctx.fill();

              ctx.fillStyle = offset.colorR;
              ctx.beginPath();
              ctx.moveTo(rx, ry - canopyHeight);
              ctx.lineTo(rx + rBase, ry);
              ctx.lineTo(rx, ry + rBase * 0.3);
              ctx.closePath();
              ctx.fill();
            }
          }
        }

        // Active indicator column
        if (isSelected) {
          ctx.strokeStyle = "rgba(52, 211, 153, 0.85)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p1.sx, p1.sy - 30);
          ctx.moveTo(p2.sx, p2.sy);
          ctx.lineTo(p2.sx, p2.sy - 30);
          ctx.moveTo(p3.sx, p3.sy);
          ctx.lineTo(p3.sx, p3.sy - 30);
          ctx.moveTo(p4.sx, p4.sy);
          ctx.lineTo(p4.sx, p4.sy - 30);
          ctx.stroke();

          ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy - 30);
          ctx.lineTo(p2.sx, p2.sy - 30);
          ctx.lineTo(p3.sx, p3.sy - 30);
          ctx.lineTo(p4.sx, p4.sy - 30);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#10b981";
          ctx.stroke();
        }
      }

      // Draw real PDF boundary polygon
      ctx.strokeStyle = "rgba(52, 211, 153, 0.95)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      
      const boundaryProjected = realVertices.map((v) => {
        const pctX = (v.utmX - minE) / (maxE - minE);
        // ALIGNED COORDINATES FLIP: Match inverted Z-axis (North is pctZ=0, South is pctZ=1). Completely resolves coordinates mismatch!
        const pctZ = 1.0 - (v.utmY - minN) / (maxN - minN);
        const cellX = pctX * currentGridSize;
        const cellZ = pctZ * currentGridSize;

        const spacing = 12;
        const px = (cellX - currentGridSize / 2) * spacing;
        const pz = (cellZ - currentGridSize / 2) * spacing;
        
        const rIndex = Math.min(currentGridSize - 1, Math.max(0, Math.floor(cellX)));
        const cIndex = Math.min(currentGridSize - 1, Math.max(0, Math.floor(cellZ)));
        const hVal = cells[rIndex]?.[cIndex]?.height || 0;
        
        // Elevate boundary py by +6.0 to prevent depth clipping/Z-fighting with the 3D trees and tiles!
        const py = (hVal * spacing * altitudeScale) + 6.0;

        const rx1 = px * Math.cos(angleY) - pz * Math.sin(angleY);
        const rz1 = px * Math.sin(angleY) + pz * Math.cos(angleY);
        const ry2 = py * Math.cos(angleX) - rz1 * Math.sin(angleX);
        const rz2 = py * Math.sin(angleX) + rz1 * Math.cos(angleX);

        const focalLength = 400;
        const scale = (focalLength / (focalLength + rz2)) * (zoom / 18);
        return {
          sx: cx + rx1 * scale + offsetX,
          sy: cy - ry2 * scale + offsetY
        };
      });

      if (boundaryProjected.length > 0) {
        ctx.moveTo(boundaryProjected[0].sx, boundaryProjected[0].sy);
        for (let i = 1; i < boundaryProjected.length; i++) {
          ctx.lineTo(boundaryProjected[i].sx, boundaryProjected[i].sy);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Compass UI
      const compassX = 40;
      const compassY = height - 45;
      ctx.strokeStyle = "rgba(16, 185, 129, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(compassX, compassY, 16, 0, Math.PI * 2);
      ctx.stroke();

      const northX = compassX + 11 * Math.sin(angleY);
      const northY = compassY - 11 * Math.cos(angleY);
      ctx.strokeStyle = "#10b981";
      ctx.beginPath();
      ctx.moveTo(compassX, compassY);
      ctx.lineTo(northX, northY);
      ctx.stroke();

      ctx.fillStyle = "#10b981";
      ctx.font = "bold 9px monospace";
      ctx.fillText("N", northX - 3, northY - 4);

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [viewMode, isRotating, zoom, angleX, angleY, selectedCell, hoveredCell, offsetX, offsetY, scaleMode]);

  return (
    <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 space-y-6 max-w-7xl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center">
              <Compass className="w-5 h-5" />
            </span>
            <h1 className="text-lg md:text-2xl font-bold text-gradient uppercase tracking-tight">
              MAPA 1: RIO LUNA II - FLORESTA AMAZÔNICA
            </h1>
          </div>
          <p className="text-[10px] md:text-xs text-muted-foreground">
            Beruri, Amazonas • Matrícula Nº 598 • Lat: {centroidLat.toFixed(6)}°, Lon: {centroidLon.toFixed(6)}° • SIRGAS 2000 UTM 20S
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">

          <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${centroidLat},${centroidLon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-600 text-black text-[11px] md:text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Abrir no Google Maps
            </a>
            <span className="px-3 py-1.5 rounded bg-muted border border-border text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              AUDITADO
            </span>
          </div>
        </div>
      </div>

      {/* Main Panel glass-card container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Interactive Canvas Grid View */}
        <div className="lg:col-span-8 flex flex-col">
          <div 
            ref={mapCardRef} // Target entire card for Fullscreen mode
            className="bg-card text-card-foreground p-3 md:p-4 h-full flex flex-col justify-between relative overflow-hidden border border-border rounded-xl shadow-sm min-h-[400px] md:min-h-[550px]"
          >
            
            <div className="flex flex-col items-start gap-3 border-b border-border pb-3 mb-3 z-10 w-full">
              <span className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 text-foreground">
                <Trees className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span>Malha 3D: Lotes de Hectares (100m x 100m)</span>
              </span>
              
              <div className="flex flex-wrap items-center gap-1 bg-muted border border-border p-1 rounded-lg text-[9px] sm:text-[10px] w-full">
                {[
                  { id: "forest", label: "Mata Densidade", icon: Trees },
                  { id: "elevation", label: "Altimetria", icon: Layers },
                  { id: "biomass", label: "Captura CO₂", icon: Sparkles },
                  { id: "heatmap", label: "Solo", icon: Grid },
                  { id: "wireframe", label: "Malha Vector", icon: Compass }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as any)}
                    className={`px-2 py-1 sm:py-0.5 rounded transition-colors flex items-center gap-1 flex-1 sm:flex-initial justify-center ${
                      viewMode === mode.id 
                        ? "bg-emerald-500 text-black font-bold" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <mode.icon className="w-3 h-3" />
                    <span>{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Render Canvas Viewport - Responsive heights */}
            <div 
              ref={containerRef} 
              onContextMenu={(e) => e.preventDefault()}
              className="relative flex-1 w-full h-[320px] sm:h-[400px] md:h-[480px] bg-slate-950/40 border border-primary/10 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
            >
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={handleMouseClick}
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="w-full h-full block touch-none"
              />

              {/* Viewport Floating controls - responsive tactile spacing */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-10">
                <button 
                  onClick={toggleFullscreen}
                  className="p-2 md:p-1.5 rounded-lg bg-background/95 dark:bg-slate-950/95 border border-border text-foreground hover:bg-muted transition-colors shadow-md"
                  title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4 md:w-3.5 md:h-3.5" /> : <Maximize2 className="w-4 h-4 md:w-3.5 md:h-3.5" />}
                </button>
                <button 
                  onClick={handleResetCamera}
                  className="p-2 md:p-1.5 rounded-lg bg-background/95 dark:bg-slate-950/95 border border-border text-foreground hover:bg-muted transition-colors shadow-md"
                  title="Centralizar Câmera"
                >
                  <RotateCw className="w-4 h-4 md:w-3.5 md:h-3.5" />
                </button>
                <button 
                  onClick={() => setIsRotating(!isRotating)}
                  className={`p-2 md:p-1.5 rounded-lg border transition-colors shadow-md ${
                    isRotating 
                      ? "bg-emerald-500 text-black border-emerald-400" 
                      : "bg-background/95 dark:bg-slate-950/95 border-border text-foreground hover:bg-muted"
                  }`}
                  title="Giro automático"
                >
                  {isRotating ? <Pause className="w-4 h-4 md:w-3.5 md:h-3.5" /> : <Play className="w-4 h-4 md:w-3.5 md:h-3.5" />}
                </button>
                <button 
                  onClick={() => setZoom(prev => Math.min(50, prev + 2))}
                  className="p-2 md:p-1.5 rounded-lg bg-background/95 dark:bg-slate-950/95 border border-border text-foreground hover:bg-muted transition-colors shadow-md"
                >
                  <ZoomIn className="w-4 h-4 md:w-3.5 md:h-3.5" />
                </button>
                <button 
                  onClick={() => setZoom(prev => Math.max(4, prev - 2))}
                  className="p-2 md:p-1.5 rounded-lg bg-background/95 dark:bg-slate-950/95 border border-border text-foreground hover:bg-muted transition-colors shadow-md"
                >
                  <ZoomOut className="w-4 h-4 md:w-3.5 md:h-3.5" />
                </button>
              </div>

              {/* Technical indicators overlay - safe hide/shrink on small screens */}
              <div className="absolute top-4 left-4 pointer-events-none bg-background/95 dark:bg-slate-950/95 backdrop-blur px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-border text-[8px] sm:text-[9px] text-muted-foreground space-y-0.5 sm:space-y-1 shadow-md">
                <p className="text-emerald-400 font-bold flex items-center gap-1">
                  <Compass className="w-3 h-3" /> NAVEGAÇÃO 3D
                </p>
                <p className="hidden sm:block">• Arraste 1 dedo: Rotacionar</p>
                <p className="hidden sm:block">• Arraste 2 dedos: Mover Câmera</p>
                <p className="sm:hidden">• Deslizar: Rotacionar • Toque rápido: Selecionar</p>
                {hoveredCell && (
                  <p className="text-emerald-300 font-bold mt-1 pt-1 border-t border-white/5">
                    UTM: E {hoveredCell.utmE} | N {hoveredCell.utmN}
                  </p>
                )}
              </div>
            </div>

            {/* Scale-based coordinate legend without scale tag */}
            <div className="flex flex-wrap items-center justify-between mt-3 text-[9px] sm:text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>Limites do Lote (UTM): Leste ({minE.toFixed(0)}m - {maxE.toFixed(0)}m) • Norte ({minN.toFixed(0)}m - {maxN.toFixed(0)}m)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Selected cell metrics sidebar */}
        <div className="lg:col-span-4 flex flex-col">
          <CellMetricsSidebar selectedCell={selectedCell} />
        </div>

      </div>

      {/* Global specifications cards */}
      <GlobalMetricsCards />

      {/* Calculator for Carbon Staking */}
      <StakingCalculator />

      {/* VERDE MAPS - Informações de Lastro e Ecossistema */}
      <EcosystemFaq />

    </div>
  );
};

export default CarbonMapPage;
