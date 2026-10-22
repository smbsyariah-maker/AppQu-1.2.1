import React from 'react';
import {
  Users,
  Contact,
  ShoppingBag,
  Compass,
  ShieldAlert,
  MessageSquare,
  Database,
} from 'lucide-react';

interface AppQuBottomNavProps {
  activeModule: 'paguyuban' | 'warga' | 'usaha' | 'area' | 'siaga' | 'arsitektur' | 'chat';
  onSelectModule: (module: 'paguyuban' | 'warga' | 'usaha' | 'area' | 'siaga' | 'arsitektur' | 'chat') => void;
  pendingApprovalsCount?: number;
  activeEmergencyCount?: number;
  unreadChatCount?: number;
}

export const AppQuBottomNav: React.FC<AppQuBottomNavProps> = ({
  activeModule,
  onSelectModule,
  pendingApprovalsCount = 0,
  activeEmergencyCount = 0,
  unreadChatCount = 1,
}) => {
  const tabs = [
    {
      id: 'paguyuban' as const,
      label: 'PaguyubanQu',
      icon: Users,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null,
      sublabel: 'Sosial & Kas',
    },
    {
      id: 'warga' as const,
      label: 'WargaQu',
      icon: Contact,
      badge: null,
      sublabel: 'Buku Induk',
    },
    {
      id: 'usaha' as const,
      label: 'UsahaQu',
      icon: ShoppingBag,
      badge: 'POS',
      badgeColor: 'bg-amber-600',
      sublabel: 'Lapak & POS',
    },
    {
      id: 'area' as const,
      label: 'AreaQu',
      icon: Compass,
      badge: 'Peta',
      badgeColor: 'bg-teal-600',
      sublabel: 'Peta & Sewa',
    },
    {
      id: 'siaga' as const,
      label: 'SiagaQu',
      icon: ShieldAlert,
      badge: activeEmergencyCount > 0 ? 'SOS' : 'SOS',
      badgeColor: 'bg-red-600',
      sublabel: 'Darurat & Ronda',
    },
    {
      id: 'chat' as const,
      label: 'ChatQu',
      icon: MessageSquare,
      badge: unreadChatCount > 0 ? unreadChatCount : null,
      badgeColor: 'bg-emerald-600',
      sublabel: 'Percakapan',
    },
  ];

  return (
    <nav className="w-full bg-stone-900 border-t border-stone-800 text-stone-400 px-2 py-2 flex items-center justify-around shrink-0 z-30 shadow-xl select-none h-14">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeModule === tab.id;

        return (
          <button
            key={tab.id}
            title={`${tab.label} (${tab.sublabel})`}
            aria-label={tab.label}
            onClick={() => {
              if (navigator.vibrate) {
                try {
                  navigator.vibrate(20);
                } catch {}
              }
              onSelectModule(tab.id);
            }}
            className={`relative flex items-center justify-center flex-1 h-full py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
              isActive
                ? 'text-emerald-400 font-bold bg-stone-800/60'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/30'
            }`}
          >
            {/* Top Active Indicator */}
            {isActive && (
              <span className="absolute -top-2 w-8 h-1 bg-emerald-400 rounded-full"></span>
            )}

            <div className="relative flex items-center justify-center">
              <Icon
                className={`w-6 h-6 transition-transform ${
                  isActive ? 'scale-110 text-emerald-400' : 'text-stone-400'
                }`}
              />

              {tab.badge && (
                <span
                  className={`absolute -top-1.5 -right-3 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center justify-center ring-1 ring-stone-900 ${
                    tab.badgeColor ? tab.badgeColor : 'bg-red-600'
                  }`}
                >
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
