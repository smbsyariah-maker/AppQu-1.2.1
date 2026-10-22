import React, { useState } from 'react';
import {
  ShieldAlert,
  Store,
  FileCode,
  UserCheck,
  ChevronDown,
  Bell,
  Sparkles,
  ArrowRightLeft,
  Volume2,
  VolumeX,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import { UserProfile, RoleTier } from '../../types';
import { PRESET_USERS } from '../../services/storageAppQu';
import { sireneAudio } from '../../services/sireneAudio';

interface AppQuHeaderProps {
  currentUser: UserProfile;
  onChangeUser: (user: UserProfile) => void;
  onOpenPanic: () => void;
  onOpenChat?: () => void;
  onSwitchToBaksoQu: () => void;
  onSwitchToBengkelQu?: () => void;
  onSwitchToKlinikQu?: () => void;
  onSwitchToRitelQu?: () => void;
  onOpenArsitektur: () => void;
  onOpenHierarchy?: () => void;
  activeModuleName: string;
  unreadChatCount?: number;
}

export const AppQuHeader: React.FC<AppQuHeaderProps> = ({
  currentUser,
  onChangeUser,
  onOpenPanic,
  onOpenChat,
  onSwitchToBaksoQu,
  onSwitchToBengkelQu,
  onSwitchToKlinikQu,
  onSwitchToRitelQu,
  onOpenArsitektur,
  onOpenHierarchy,
  activeModuleName,
  unreadChatCount = 1,
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const isSirenPlaying = sireneAudio.getIsPlaying();

  const handleStopSiren = () => {
    sireneAudio.stopSiren();
  };

  return (
    <header className="sticky top-0 z-30 bg-emerald-950 text-stone-100 border-b border-emerald-900/60 px-3.5 py-2.5 flex items-center justify-between shrink-0 select-none shadow-md">
      {/* Left: Branding */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center font-black text-white text-sm shadow-md ring-1 ring-emerald-400/40">
          AQ
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-white tracking-tight">AppQu</span>
            <span className="text-[10px] font-semibold text-amber-300">
              RT 04 / RW 09
            </span>
          </div>
          <p className="text-[10px] text-emerald-200/80 truncate max-w-[130px] xs:max-w-[180px]">
            {activeModuleName}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5">
        {/* Siren Playing Active Mute Button */}
        {isSirenPlaying && (
          <button
            onClick={handleStopSiren}
            className="h-8 px-2 rounded-lg bg-red-600 hover:bg-red-500 text-white flex items-center gap-1 text-[11px] font-bold animate-bounce shadow"
            title="Matikan Suara Sirene"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Mute</span>
          </button>
        )}

        {/* Quick Chat Button with Badge */}
        {onOpenChat && (
          <button
            onClick={onOpenChat}
            title="Buka Modul Percakapan Local-First"
            className="relative h-8 px-2 rounded-lg bg-emerald-900/90 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 flex items-center gap-1 text-[11px] font-bold shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Chat</span>
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-stone-950 text-[9px] font-black flex items-center justify-center ring-1 ring-stone-900">
                {unreadChatCount}
              </span>
            )}
          </button>
        )}

        {/* Master Switch to BaksoQu POS */}
        <button
          onClick={onSwitchToBaksoQu}
          title="Switch Master ke POS Kasir BaksoQu"
          className="h-8 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center gap-1.5 text-[11px] font-bold shadow-sm transition-transform active:scale-95"
        >
          <Store className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">POS BaksoQu</span>
        </button>

        {/* Panic Button SOS */}
        <button
          onClick={onOpenPanic}
          title="Tombol Darurat SiagaQu"
          className="h-8 px-2.5 rounded-lg bg-red-700 hover:bg-red-600 text-white flex items-center gap-1 text-[11px] font-bold shadow-md shadow-red-950/40 transition-transform active:scale-95 cursor-pointer"
        >
          <ShieldAlert className="w-3.5 h-3.5 animate-pulse text-amber-300" />
          <span>SOS</span>
        </button>

        {/* Validasi Berantai / Saksi Modal Trigger */}
        {onOpenHierarchy && (
          <button
            onClick={onOpenHierarchy}
            title="Lihat Status Saksi Tetangga & Hirarki 15 Peran"
            className={`h-8 px-2 rounded-lg flex items-center gap-1 text-[11px] font-bold shadow-xs transition-transform active:scale-95 cursor-pointer ${
              (currentUser.witnessCount || 0) >= 2
                ? 'bg-emerald-900/90 text-emerald-200 border border-emerald-700/60'
                : 'bg-amber-500 text-stone-950 font-black animate-pulse'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">
              {(currentUser.witnessCount || 0) >= 2 ? 'Saksi 2/2' : 'Saksi 0/2'}
            </span>
          </button>
        )}

        {/* RBAC Role Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="h-8 px-2 rounded-lg bg-emerald-900/90 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/60 flex items-center gap-1 text-[11px] font-medium transition-all"
            title="Ganti Peran / Role Pengguna (Demo RBAC)"
          >
            <UserCheck className="w-3.5 h-3.5 text-teal-300" />
            <span className="max-w-[70px] truncate hidden sm:inline">
              {currentUser.name.split(' ')[0]}
            </span>
            <ChevronDown className="w-3 h-3 text-emerald-300" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 top-9 w-64 rounded-2xl bg-stone-900 border border-stone-800 text-stone-100 shadow-2xl z-50 p-2 space-y-1 text-xs animate-in fade-in-50 zoom-in-95">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-stone-400 border-b border-stone-800">
                Pilih Role Interaktif (RBAC)
              </div>

              {Object.entries(PRESET_USERS).map(([key, user]) => {
                const isSelected = currentUser.id === user.id;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      onChangeUser(user);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-all flex flex-col ${
                      isSelected
                        ? 'bg-emerald-800 text-white font-medium shadow-sm'
                        : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[12px]">{user.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-amber-300 font-mono">
                        {user.roleTier}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400 mt-0.5">
                      {user.roleTitle}
                    </span>
                  </button>
                );
              })}

              <div className="pt-1 border-t border-stone-800 space-y-0.5">
                {onSwitchToBengkelQu && (
                  <button
                    onClick={() => {
                      setIsRoleDropdownOpen(false);
                      onSwitchToBengkelQu();
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-amber-300 hover:bg-stone-800 flex items-center gap-1.5 text-[11px] font-semibold"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>Buka BengkelQu (100% Gratis)</span>
                  </button>
                )}

                {onSwitchToKlinikQu && (
                  <button
                    onClick={() => {
                      setIsRoleDropdownOpen(false);
                      onSwitchToKlinikQu();
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-emerald-300 hover:bg-stone-800 flex items-center gap-1.5 text-[11px] font-semibold"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Buka KlinikQu (Faskes Medis)</span>
                  </button>
                )}

                {onSwitchToRitelQu && (
                  <button
                    onClick={() => {
                      setIsRoleDropdownOpen(false);
                      onSwitchToRitelQu();
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-blue-300 hover:bg-stone-800 flex items-center gap-1.5 text-[11px] font-semibold"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span>Buka RitelQu (Toko Kelontong)</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsRoleDropdownOpen(false);
                    onOpenArsitektur();
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-emerald-400 hover:bg-emerald-950/60 flex items-center gap-1.5 text-[11px] font-semibold"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Lihat Dokumen Arsitektur & DB</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
