import React from 'react';
import { UtensilsCrossed, Boxes, TrendingUp, FileText, Settings } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  occupiedCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  occupiedCount = 0,
}) => {
  const tabs = [
    { id: 'kasir', label: 'Kasir', icon: UtensilsCrossed, badge: occupiedCount > 0 ? occupiedCount : null },
    { id: 'bahan', label: 'Modal', icon: Boxes, badge: null },
    { id: 'omset', label: 'Omset', icon: TrendingUp, badge: null },
    { id: 'laporan', label: 'Laporan', icon: FileText, badge: null },
    { id: 'setting', label: 'Setting', icon: Settings, badge: null },
  ];

  return (
    <nav className="w-full bg-stone-900/98 border-t border-stone-800 text-stone-400 px-2 py-2 flex items-center justify-around shrink-0 z-30 shadow-lg select-none h-14">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            title={tab.label}
            aria-label={tab.label}
            onClick={() => {
              if (navigator.vibrate) {
                try {
                  navigator.vibrate(20);
                } catch {}
              }
              onSelectTab(tab.id);
            }}
            className={`relative flex items-center justify-center min-w-[56px] h-full py-1 px-2 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
              isActive
                ? 'text-amber-400 font-semibold bg-stone-800/60'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/30'
            }`}
          >
            {/* Active Pill Accent */}
            {isActive && (
              <span className="absolute -top-2 w-8 h-1 bg-amber-500 rounded-full"></span>
            )}

            <div className="relative flex items-center justify-center">
              <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
              {tab.badge !== null && (
                <span className="absolute -top-1.5 -right-2.5 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-1 ring-stone-900 animate-pulse">
                  {tab.badge}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </nav>
  );
};
