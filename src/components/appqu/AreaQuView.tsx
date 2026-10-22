import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  MapPin,
  Navigation,
  ExternalLink,
  Store,
  Bike,
  Shield,
  Layers,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Filter,
  CheckCircle,
  Clock,
  Sparkles,
  Phone,
  AlertCircle,
  Info,
  DollarSign,
  ChevronRight,
  Radio,
  X,
  MessageSquare,
} from 'lucide-react';
import { AreaPoint, TransportasiCourier, UserProfile, BusinessMode } from '../../types';
import { AppQuStorageService } from '../../services/storageAppQu';

interface AreaQuViewProps {
  currentUser: UserProfile;
  areaPoints?: AreaPoint[];
  couriers?: TransportasiCourier[];
  onOpenUsaha?: () => void;
  onOpenChat?: (threadId?: string) => void;
  showNotification: (msg: string) => void;
}

export const AreaQuView: React.FC<AreaQuViewProps> = ({
  currentUser,
  areaPoints: initialAreaPoints,
  couriers: initialCouriers,
  onOpenUsaha,
  onOpenChat,
  showNotification,
}) => {
  // Radius Filter States (500m – 100km)
  const RADIUS_OPTIONS = [
    { label: '500m', meters: 500 },
    { label: '1 km', meters: 1000 },
    { label: '3 km', meters: 3000 },
    { label: '5 km', meters: 5000 },
    { label: '10 km', meters: 10000 },
    { label: '25 km', meters: 25000 },
    { label: '50 km', meters: 50000 },
    { label: '100 km', meters: 100000 },
  ];

  const [selectedRadiusMeters, setSelectedRadiusMeters] = useState<number>(3000);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Points & Couriers State
  const [points, setPoints] = useState<AreaPoint[]>(() =>
    initialAreaPoints && initialAreaPoints.length > 0
      ? initialAreaPoints
      : AppQuStorageService.getAreaPoints()
  );

  const [couriers, setCouriers] = useState<TransportasiCourier[]>(() =>
    initialCouriers && initialCouriers.length > 0
      ? initialCouriers
      : AppQuStorageService.getCouriers()
  );

  // Selected Point for Silent Navigation
  const [selectedPoint, setSelectedPoint] = useState<AreaPoint | null>(null);
  const [selectedCourier, setSelectedCourier] = useState<TransportasiCourier | null>(null);

  // Sewa Lapak Digital Modal
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [isNeutralityModalOpen, setIsNeutralityModalOpen] = useState(false);

  // HTML5 2D Canvas State for Ultra Lightweight Map (< 3MB RAM)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(1);
  const [mapPan, setMapPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [heartbeatCounter, setHeartbeatCounter] = useState(5);

  // Simulate Lightweight Courier Heartbeat (Lat/Lng text packet every 5s)
  useEffect(() => {
    const timer = setInterval(() => {
      setHeartbeatCounter((prev) => {
        if (prev <= 1) {
          // Heartbeat tick: slightly move active couriers
          setCouriers((currentCouriers) =>
            currentCouriers.map((c) => {
              if (c.status === 'mengantar') {
                const deltaLat = (Math.random() - 0.45) * 0.0003;
                const deltaLng = (Math.random() - 0.45) * 0.0003;
                return {
                  ...c,
                  lat: c.lat + deltaLat,
                  lng: c.lng + deltaLng,
                  lastHeartbeatSeconds: 1,
                  batteryPercent: Math.max(10, c.batteryPercent - 0.1),
                };
              }
              return { ...c, lastHeartbeatSeconds: 1 };
            })
          );
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Filter Points according to radius and category
  const filteredPoints = points.filter((p) => {
    const matchesRadius = p.distanceMeters <= selectedRadiusMeters;
    if (!matchesRadius) return false;
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'lapak')
      return (
        p.category === 'kuliner' ||
        p.category === 'sembako' ||
        p.category === 'jasa' ||
        p.category === 'bengkel' ||
        p.category === 'klinik'
      );
    if (selectedCategory === 'transportasi') return p.category === 'transportasi';
    if (selectedCategory === 'fasum') return p.category === 'fasum';
    if (selectedCategory === 'titik_netral') return p.category === 'titik_netral';
    return p.category === selectedCategory;
  });

  // ----------------------------------------------------
  // CANVAS RENDERING (Leaflet Canvas 2D Vector Style)
  // ----------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2 + mapPan.x;
    const centerY = height / 2 + mapPan.y;

    // Background Canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f5f5f4'; // Stone-100 base
    ctx.fillRect(0, 0, width, height);

    // Coordinate conversion helper: center is RT 04 Sukamaju (-7.7956, 110.3695)
    const baseLat = -7.7956;
    const baseLng = 110.3695;
    const scale = 24000 * mapZoom * (1500 / Math.max(500, selectedRadiusMeters * 0.7));

    const toScreen = (lat: number, lng: number) => {
      const x = centerX + (lng - baseLng) * scale;
      const y = centerY - (lat - baseLat) * scale;
      return { x, y };
    };

    // Draw Minimalist Vector Grid Roads
    ctx.strokeStyle = '#e7e5e4'; // stone-200
    ctx.lineWidth = 1;
    const gridSize = 30 * mapZoom;
    for (let x = (centerX % gridSize); x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = (centerY % gridSize); y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Main Vector Streets (Jalan Protokol & Jalan Lingkungan RT 04)
    ctx.lineWidth = 6 * mapZoom;
    ctx.strokeStyle = '#d6d3d1'; // stone-300
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Main Street East-West
    ctx.beginPath();
    ctx.moveTo(centerX - 350 * mapZoom, centerY + 30 * mapZoom);
    ctx.lineTo(centerX + 350 * mapZoom, centerY + 30 * mapZoom);
    ctx.stroke();

    // Secondary Street North-South
    ctx.beginPath();
    ctx.moveTo(centerX - 20 * mapZoom, centerY - 280 * mapZoom);
    ctx.lineTo(centerX - 20 * mapZoom, centerY + 280 * mapZoom);
    ctx.stroke();

    // Alleyway Gang RT 04 (Gang Mawar, Gang Melati)
    ctx.lineWidth = 3.5 * mapZoom;
    ctx.strokeStyle = '#e5e7eb';
    ctx.beginPath();
    ctx.moveTo(centerX - 140 * mapZoom, centerY - 140 * mapZoom);
    ctx.lineTo(centerX + 180 * mapZoom, centerY - 140 * mapZoom);
    ctx.lineTo(centerX + 180 * mapZoom, centerY + 160 * mapZoom);
    ctx.stroke();

    // Draw Geofencing Boundary of RT 04 Sukamaju (Green dashed vector polygon)
    ctx.strokeStyle = '#059669'; // emerald-600
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.06)';
    ctx.beginPath();
    const rtPolygon = [
      { lat: -7.7946, lng: 110.3678 },
      { lat: -7.7944, lng: 110.3712 },
      { lat: -7.7972, lng: 110.3715 },
      { lat: -7.7970, lng: 110.3676 },
    ];
    rtPolygon.forEach((pt, idx) => {
      const scr = toScreen(pt.lat, pt.lng);
      if (idx === 0) ctx.moveTo(scr.x, scr.y);
      else ctx.lineTo(scr.x, scr.y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // Label Geofence RT 04
    const rtLabelPos = toScreen(-7.7945, 110.3695);
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillStyle = '#065f46';
    ctx.textAlign = 'center';
    ctx.fillText('Geofence RT 04 Sukamaju (Radius Warga & SOS)', rtLabelPos.x, rtLabelPos.y - 8);

    // Draw Selected Radius Circle Ring (e.g., 500m, 1km, 3km)
    const radiusPixels = (selectedRadiusMeters / 1000) * (scale / 111);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radiusPixels, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(5, 150, 105, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Radius Label Ring
    ctx.font = '9px system-ui, sans-serif';
    ctx.fillStyle = '#047857';
    ctx.fillText(
      `Radius Filter: ${selectedRadiusMeters >= 1000 ? `${selectedRadiusMeters / 1000} km` : `${selectedRadiusMeters} m`}`,
      centerX,
      centerY - radiusPixels + 12
    );

    // Center Reference Point (Posisi HP Pengguna / Pusat RT 04)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#059669'; // Emerald
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Pulse wave for user location
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Area Points (Markers)
    filteredPoints.forEach((pt) => {
      const scr = toScreen(pt.lat, pt.lng);
      const isSelected = selectedPoint?.id === pt.id;

      // Draw direct line if selected (Silent Navigation Distance Line)
      if (isSelected) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(scr.x, scr.y);
        ctx.strokeStyle = '#0284c7'; // Sky-600
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Direct Distance Label along line
        const midX = (centerX + scr.x) / 2;
        const midY = (centerY + scr.y) / 2;
        ctx.fillStyle = '#0369a1';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillText(`${pt.distanceMeters} m`, midX, midY - 6);
      }

      // Priority Digital Stall Glow Aura (Rp 30.000/bln trial)
      if (pt.isDigitalStallRented) {
        ctx.beginPath();
        ctx.arc(scr.x, scr.y, 16, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.25)'; // Amber glow
        ctx.fill();
      }

      // Marker Circle
      ctx.beginPath();
      ctx.arc(scr.x, scr.y, isSelected ? 12 : 9, 0, Math.PI * 2);

      if (pt.isPoliticalOrNeutralOnly) {
        ctx.fillStyle = '#64748b'; // Slate gray for Neutral Static Points
      } else if (pt.category === 'fasum') {
        ctx.fillStyle = '#0284c7'; // Sky blue for Fasum
      } else if (pt.isDigitalStallRented) {
        ctx.fillStyle = '#d97706'; // Golden amber for Priority Stall
      } else if (pt.businessMode === 'mode_a_pos') {
        ctx.fillStyle = '#059669'; // Emerald for Mode A POS Warung
      } else {
        ctx.fillStyle = '#7c3aed'; // Violet for Mode B Catalog
      }
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Marker Icon / Text
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.fillStyle = '#1c1917';
      ctx.textAlign = 'center';
      const label = pt.name.length > 14 ? `${pt.name.slice(0, 12)}...` : pt.name;
      ctx.fillText(label, scr.x, scr.y + 18);
    });

    // Render TransportasiQu Couriers Layer (🛵 moving on canvas)
    couriers.forEach((courier) => {
      const scr = toScreen(courier.lat, courier.lng);
      const isSelected = selectedCourier?.id === courier.id;

      // Pulse circle for courier heartbeat
      ctx.beginPath();
      ctx.arc(scr.x, scr.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(14, 165, 233, 0.2)';
      ctx.fill();

      // Courier Pin (Scooter representation)
      ctx.beginPath();
      ctx.arc(scr.x, scr.y, isSelected ? 11 : 8.5, 0, Math.PI * 2);
      ctx.fillStyle = '#0284c7'; // Sky-600
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Scooter Emoji
      ctx.font = '11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🛵', scr.x, scr.y - 10);

      // Courier Name & Plate
      ctx.font = 'bold 9px system-ui, sans-serif';
      ctx.fillStyle = '#0369a1';
      ctx.fillText(courier.driverName, scr.x, scr.y + 17);
    });
  }, [points, couriers, mapZoom, mapPan, selectedRadiusMeters, selectedCategory, selectedPoint, selectedCourier]);

  // Canvas Mouse / Touch Dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - mapPan.x, y: e.clientY - mapPan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setMapPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Canvas Click to select marker
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2 + mapPan.x;
    const centerY = height / 2 + mapPan.y;
    const baseLat = -7.7956;
    const baseLng = 110.3695;
    const scale = 24000 * mapZoom * (1500 / Math.max(500, selectedRadiusMeters * 0.7));

    // Check click on couriers first
    for (const courier of couriers) {
      const scrX = centerX + (courier.lng - baseLng) * scale;
      const scrY = centerY - (courier.lat - baseLat) * scale;
      const dist = Math.hypot(clickX - scrX, clickY - scrY);
      if (dist < 20) {
        setSelectedCourier(courier);
        setSelectedPoint(null);
        return;
      }
    }

    // Check click on points
    for (const pt of filteredPoints) {
      const scrX = centerX + (pt.lng - baseLng) * scale;
      const scrY = centerY - (pt.lat - baseLat) * scale;
      const dist = Math.hypot(clickX - scrX, clickY - scrY);
      if (dist < 20) {
        setSelectedPoint(pt);
        setSelectedCourier(null);
        return;
      }
    }

    // Click on empty space
    setSelectedPoint(null);
    setSelectedCourier(null);
  };

  // Launch Silent Navigation to external Google Maps / Waze
  const handleLaunchGoogleMaps = (lat: number, lng: number, name: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`;
    window.open(url, '_blank');
    showNotification(`Membuka rute ke ${name} di Google Maps (Navigasi Hening)`);
  };

  const handleLaunchWaze = (lat: number, lng: number, name: string) => {
    const url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    window.open(url, '_blank');
    showNotification(`Membuka rute ke ${name} di Waze`);
  };

  return (
    <div className="flex-1 flex flex-col bg-stone-100 overflow-hidden relative">
      {/* ========================================================= */}
      {/* 1. TOP CONTROL BAR: AREAQU & RADIUS FILTER (500m - 100km) */}
      {/* ========================================================= */}
      <div className="bg-white border-b border-stone-200 px-3 py-2.5 shadow-2xs shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold shadow-2xs">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-black text-stone-900 tracking-tight">AreaQu</h2>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                  Canvas 2D • &lt; 3MB
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Peta Vektor Hyperlocal & Sewa Lapak Digital
              </p>
            </div>
          </div>

          {/* Quick Actions (Sewa Lapak & Netralitas) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsRentalModalOpen(true)}
              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-stone-950" />
              <span>Sewa Lapak</span>
            </button>
            <button
              type="button"
              onClick={() => setIsNeutralityModalOpen(true)}
              className="px-2 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              title="Kebijakan Netralitas Ormas & Parpol"
            >
              <Shield className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden xs:inline">Netral</span>
            </button>
          </div>
        </div>

        {/* Dynamic Radius Filter (500m – 100km) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
          <span className="text-[11px] font-bold text-stone-500 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Radius:</span>
          </span>
          {RADIUS_OPTIONS.map((opt) => (
            <button
              key={opt.meters}
              type="button"
              onClick={() => {
                setSelectedRadiusMeters(opt.meters);
                showNotification(`Radius filter diubah ke: ${opt.label}`);
              }}
              className={`px-2.5 py-1 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                selectedRadiusMeters === opt.meters
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200/80'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'all', label: 'Semua Titik' },
            { id: 'lapak', label: 'Lapak & Warung' },
            { id: 'transportasi', label: 'Kurir 🛵' },
            { id: 'fasum', label: 'Fasum & Ronda' },
            { id: 'titik_netral', label: 'Titik Netral Parpol' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-0.5 rounded-lg font-semibold transition shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAP CANVAS WORKSPACE (LIGHTWEIGHT 2D VECTOR)           */}
      {/* ========================================================= */}
      <div className="flex-1 relative overflow-hidden bg-stone-200">
        <canvas
          ref={canvasRef}
          width={window.innerWidth > 480 ? 460 : window.innerWidth}
          height={400}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleCanvasClick}
          className="w-full h-full cursor-grab active:cursor-grabbing block touch-none"
        />

        {/* Top-Right Map Controls (+, -, Center) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          <button
            type="button"
            onClick={() => setMapZoom((z) => Math.min(2.5, z + 0.25))}
            className="w-9 h-9 rounded-xl bg-white/95 hover:bg-white text-stone-800 shadow-md flex items-center justify-center border border-stone-200 font-bold cursor-pointer"
            title="Perbesar Peta"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setMapZoom((z) => Math.max(0.6, z - 0.25))}
            className="w-9 h-9 rounded-xl bg-white/95 hover:bg-white text-stone-800 shadow-md flex items-center justify-center border border-stone-200 font-bold cursor-pointer"
            title="Perkecil Peta"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setMapPan({ x: 0, y: 0 });
              setMapZoom(1);
              setSelectedPoint(null);
              setSelectedCourier(null);
            }}
            className="w-9 h-9 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center font-bold cursor-pointer"
            title="Pusatkan ke RT 04 Sukamaju"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>

        {/* Live Courier Heartbeat Indicator Bar (Supabase Realtime 5-10s text coords) */}
        <div className="absolute top-3 left-3 bg-stone-900/90 text-stone-100 backdrop-blur-xs px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-2 border border-stone-700 shadow-md z-10">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
          <span>TransportasiQu Realtime ({heartbeatCounter}s)</span>
          <span className="text-sky-300 font-mono font-normal">
            {couriers.length} Kurir Aktif
          </span>
        </div>

        {/* Legend Box at Bottom-Left of Map */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs p-2 rounded-xl border border-stone-200/80 shadow-md text-[10px] space-y-1 z-10">
          <div className="flex items-center gap-1.5 font-bold text-stone-800">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200"></span>
            <span>Lapak Sewa Prioritas (Trial)</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-600">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>Mode A POS Warung</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-600">
            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
            <span>Mode B Katalog Murni</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-600">
            <span className="w-2 h-2 rounded-full bg-sky-600"></span>
            <span>🛵 Kurir Bergerak</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. SILENT NAVIGATION DRAWER (POP-UP JIKA TITIK DIPILIH)   */}
      {/* ========================================================= */}
      {selectedPoint && (
        <div className="bg-white border-t border-stone-200 p-3.5 shadow-2xl animate-in slide-in-from-bottom duration-200 shrink-0 z-20 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-2xs ${
                  selectedPoint.isDigitalStallRented
                    ? 'bg-amber-500'
                    : selectedPoint.category === 'fasum'
                    ? 'bg-blue-600'
                    : selectedPoint.isPoliticalOrNeutralOnly
                    ? 'bg-stone-500'
                    : 'bg-emerald-700'
                }`}
              >
                {selectedPoint.category === 'kuliner'
                  ? '🍲'
                  : selectedPoint.category === 'sembako'
                  ? '🛒'
                  : selectedPoint.category === 'bengkel'
                  ? '🔧'
                  : selectedPoint.category === 'klinik'
                  ? '💊'
                  : selectedPoint.category === 'fasum'
                  ? '🏛️'
                  : '📍'}
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-extrabold text-base text-stone-900 leading-tight">
                    {selectedPoint.name}
                  </h3>
                  {selectedPoint.isDigitalStallRented && (
                    <span className="text-[10px] bg-amber-500 text-stone-950 font-black px-2 py-0.5 rounded-full">
                      Prioritas Sewa (Trial)
                    </span>
                  )}
                  {selectedPoint.businessMode && (
                    <span className="text-[10px] bg-stone-100 text-stone-700 font-bold px-2 py-0.5 rounded">
                      {selectedPoint.businessMode === 'mode_a_pos' ? 'Mode A: POS' : 'Mode B: Katalog'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  {selectedPoint.blockNumber} • Owner: {selectedPoint.ownerName || 'RT 04'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedPoint(null)}
              className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-stone-600 bg-stone-50 p-2 rounded-xl border border-stone-200">
            {selectedPoint.description}
          </p>

          {/* Silent Navigation Information: Distance & Travel Estimate */}
          <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-sky-950 block">Navigasi Hening (Silent Navigation):</span>
              <span className="text-sky-800">
                Garis lurus: <strong>{selectedPoint.distanceMeters} meter</strong> (±
                {Math.ceil(selectedPoint.distanceMeters / 80)} mnt jalan kaki / ±2 mnt motor)
              </span>
            </div>
            <div className="text-right font-mono font-black text-sky-900 text-sm">
              {selectedPoint.distanceMeters} m
            </div>
          </div>

          {/* Action Buttons: 1-Tap Google Maps / Waze / UsahaQu */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() =>
                handleLaunchGoogleMaps(selectedPoint.lat, selectedPoint.lng, selectedPoint.name)
              }
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Buka Google Maps</span>
            </button>
            <button
              type="button"
              onClick={() =>
                handleLaunchWaze(selectedPoint.lat, selectedPoint.lng, selectedPoint.name)
              }
              className="py-2.5 px-3 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Waze</span>
            </button>
            {onOpenUsaha && selectedPoint.businessMode && (
              <button
                type="button"
                onClick={onOpenUsaha}
                className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Store className="w-4 h-4" />
                <span className="hidden xs:inline">Buka Usaha</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. COURIER DETAIL SHEET (JIKA IKON 🛵 DIPILIH)            */}
      {/* ========================================================= */}
      {selectedCourier && (
        <div className="bg-white border-t border-stone-200 p-3.5 shadow-2xl animate-in slide-in-from-bottom duration-200 shrink-0 z-20 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-black text-xl shadow-2xs">
                🛵
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-base text-stone-900 leading-tight">
                    {selectedCourier.driverName}
                  </h3>
                  <span className="text-[10px] bg-sky-100 text-sky-800 font-extrabold px-2 py-0.5 rounded-full">
                    {selectedCourier.status === 'mengantar' ? 'Sedang Antar' : 'Standby di Pos'}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  Plat: {selectedCourier.vehiclePlate} • Baterai: {Math.round(selectedCourier.batteryPercent)}%
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCourier(null)}
              className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 flex items-center justify-between">
            <span>Tugas Aktif: <strong>{selectedCourier.currentTask}</strong></span>
            <span className="font-mono text-sky-700 text-[11px] font-bold">
              {selectedCourier.speedKmh} km/jam
            </span>
          </div>

          {/* 1-Click AppQu Local Chat & WhatsApp Chat/Call to Driver */}
          <div className="flex items-center gap-2 pt-1">
            {onOpenChat && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCourier(null);
                  onOpenChat('thread_transport_slamet');
                }}
                className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-emerald-400 border border-emerald-600/40 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Chat Driver (AppQu Local)</span>
              </button>
            )}
            <a
              href={`https://wa.me/${selectedCourier.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODAL: SEWA LAPAK DIGITAL (RP 30.000 / TRIAL 10 HARI)  */}
      {/* ========================================================= */}
      {isRentalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-4 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-stone-900 leading-tight">
                    Sewa Lapak Digital AreaQu
                  </h3>
                  <p className="text-xs text-stone-500">Monetisasi Mandiri & Prioritas Peta</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRentalModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Paket Langganan Warga
                </span>
                <span className="text-xs bg-amber-600 text-white font-black px-2 py-0.5 rounded-full">
                  Trial 10 Hari Gratis
                </span>
              </div>
              <div className="text-2xl font-black text-amber-950">
                Rp 30.000 <span className="text-xs font-normal text-amber-800">/ bulan</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Tampilkan usaha Anda dengan pin prioritas bercahaya (glowing pin) di peta radius
                AreaQu, serta etalase katalog paling atas untuk seluruh warga lingkungan.
              </p>
            </div>

            <div className="space-y-2 text-xs text-stone-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pin Peta Emas Berkedip dengan Radius Filter hingga 100km</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Navigasi Langsung (Silent Navigation) ke WhatsApp & Google Maps</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Dukungan Offline-First & Gratis Biaya Server (Supabase Free Tier)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  showNotification('Trial 10 Hari Sewa Lapak Digital berhasil diaktifkan!');
                  setIsRentalModalOpen(false);
                }}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Aktifkan Trial 10 Hari Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. MODAL: KEBIJAKAN NETRALITAS (ORMAS & PARTAI POLITIK)   */}
      {/* ========================================================= */}
      {isNeutralityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-4 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center font-black">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-stone-900 leading-tight">
                    Kebijakan Netralitas AppQu
                  </h3>
                  <p className="text-xs text-stone-500">Bebas Politik Praktis & Propaganda</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNeutralityModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-700 leading-relaxed">
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <strong className="text-stone-900 block font-black">1. Netralitas Peta AreaQu:</strong>
                <span>
                  Markas ormas / partai politik dari OpenStreetMap (OSM) hanya menjadi{' '}
                  <strong>titik statis biasa</strong>. DILARANG membeli fitur Sewa Lapak Digital atau
                  iklan prioritas komersial.
                </span>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <strong className="text-stone-900 block font-black">2. Komando Panic Button RT:</strong>
                <span>
                  Ormas dan Partai Politik <strong>TIDAK MEMILIKI akses khusus</strong> atau wewenang
                  komando atas tombol darurat Panic Button RT. Jalur keamanan murni di bawah koordinasi
                  RT, Hansip, Babinsa, dan Bhabinkamtibmas.
                </span>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <strong className="text-stone-900 block font-black">3. Moderasi Otomatis (≥ 3 Laporan):</strong>
                <span>
                  Postingan provokatif, kampanye pemilu, atau ajakan ormas di WargaQu yang dilaporkan
                  oleh minimal 3 warga akan otomatis disembunyikan (Auto-Hide).
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsNeutralityModalOpen(false)}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Saya Mengerti & Setuju
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
