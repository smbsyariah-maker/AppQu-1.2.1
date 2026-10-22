import React, { useState, useEffect } from 'react';
import { Smartphone, Maximize2 } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  appLabel?: string;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  appLabel = 'AppQu',
}) => {
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const isCapacitorNative = !!(window as any).Capacitor?.isNativePlatform?.();
    return isCapacitorNative || window.innerWidth < 768;
  });

  const [isFramed, setIsFramed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const isCapacitorNative = !!(window as any).Capacitor?.isNativePlatform?.();
    return !isCapacitorNative && window.innerWidth >= 768;
  });

  useEffect(() => {
    const handleResize = () => {
      const isCapacitorNative = !!(window as any).Capacitor?.isNativePlatform?.();
      const mobile = isCapacitorNative || window.innerWidth < 768;
      setIsMobileScreen(mobile);
      if (mobile) {
        setIsFramed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mode Native Mobile / Layar HP Asli (APK Android)
  if (isMobileScreen || !isFramed) {
    return (
      <div className="w-full min-h-screen min-h-[100dvh] bg-stone-100 text-stone-900 flex flex-col relative antialiased selection:bg-emerald-600 selection:text-white">
        {/* Kontrol Desktop Toggle jika di layar besar */}
        {!isMobileScreen && (
          <div className="hidden sm:flex fixed top-3 right-3 items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/90 border border-stone-800 text-xs text-stone-400 backdrop-blur z-50 shadow-lg">
            <button
              onClick={() => setIsFramed(true)}
              className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Ganti ke Frame HP</span>
            </button>
          </div>
        )}

        <div className="flex-1 w-full max-w-md mx-auto flex flex-col relative overflow-x-hidden bg-stone-100">
          {children}
        </div>
      </div>
    );
  }

  // Mode Simulasi Frame HP (Untuk Desktop testing)
  return (
    <div className="min-h-screen w-full bg-stone-950 flex flex-col items-center justify-center p-2 sm:p-4 text-stone-100 antialiased selection:bg-emerald-600 selection:text-white">
      {/* Top Floating Viewport Mode Switcher for Desktop Testing */}
      <div className="hidden sm:flex items-center gap-3 mb-2 px-3 py-1.5 rounded-full bg-stone-900/90 border border-stone-800 text-xs text-stone-400 backdrop-blur z-50">
        <div className="flex items-center gap-1.5 font-medium text-stone-300">
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Simulasi Android {appLabel}:</span>
        </div>
        <button
          onClick={() => setIsFramed(true)}
          className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all bg-emerald-700 text-white shadow-sm cursor-pointer"
        >
          HP Portrait Frame
        </button>
        <button
          onClick={() => setIsFramed(false)}
          className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 text-stone-400 hover:text-white cursor-pointer"
        >
          <Maximize2 className="w-3 h-3" />
          Full Screen
        </button>
      </div>

      {/* Main HP Frame Container */}
      <div className="w-full max-w-[420px] h-[860px] max-h-[94vh] rounded-[44px] border-[9px] border-stone-900 shadow-2xl ring-1 ring-white/10 flex flex-col bg-stone-100 text-stone-900 overflow-hidden relative">
        <div className="flex-1 flex flex-col relative overflow-hidden bg-stone-100">
          {children}
        </div>

        {/* Android Gesture Navigation Pill at Bottom */}
        <div className="bg-stone-900/95 py-1.5 flex items-center justify-center shrink-0 z-40 select-none">
          <div className="w-32 h-1 bg-stone-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
