import React, { useState } from 'react';
import {
  Store,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Star,
  Phone,
  Plus,
  X,
  Wrench,
  Activity,
  CheckCircle,
  ExternalLink,
  Tag,
  PackageCheck,
  Percent,
  ChevronRight,
  List,
  LayoutGrid,
  Compass,
  MessageSquare,
} from 'lucide-react';
import { LocalBusiness, UserProfile, LocalProduct, BusinessMode } from '../../types';

interface UsahaQuViewProps {
  currentUser: UserProfile;
  businesses: LocalBusiness[];
  onSwitchToBaksoQu: () => void;
  onSwitchToBengkelQu: () => void;
  onSwitchToKlinikQu: () => void;
  onSwitchToRitelQu: () => void;
  onOpenAreaQu?: () => void;
  onOpenChat?: (threadId?: string) => void;
  onUpdateBusinesses: (businesses: LocalBusiness[]) => void;
  showNotification: (msg: string) => void;
}

export const UsahaQuView: React.FC<UsahaQuViewProps> = ({
  currentUser,
  businesses,
  onSwitchToBaksoQu,
  onSwitchToBengkelQu,
  onSwitchToKlinikQu,
  onSwitchToRitelQu,
  onOpenAreaQu,
  onOpenChat,
  onUpdateBusinesses,
  showNotification,
}) => {
  const [displayMode, setDisplayMode] = useState<'list' | 'katalog'>('list');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<'all' | 'mode_a' | 'mode_b'>('all');
  const [selectedBusiness, setSelectedBusiness] = useState<LocalBusiness | null>(null);
  const [isRegisterBizOpen, setIsRegisterBizOpen] = useState(false);

  // New Business Form State
  const [newBizName, setNewBizName] = useState('');
  const [newBizCat, setNewBizCat] = useState<LocalBusiness['category']>('kuliner');
  const [newBizMode, setNewBizMode] = useState<BusinessMode>('mode_a_pos');
  const [newBizPhone, setNewBizPhone] = useState('');
  const [newBizDesc, setNewBizDesc] = useState('');

  const filteredBusinesses = businesses.filter((b) => {
    if (activeCategory !== 'all' && b.category !== activeCategory) return false;
    if (modeFilter === 'mode_a' && b.businessMode === 'mode_b_katalog') return false;
    if (modeFilter === 'mode_b' && b.businessMode !== 'mode_b_katalog') return false;
    return true;
  });

  const handleRegisterBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim()) return;

    const newBiz: LocalBusiness = {
      id: `biz-${Date.now()}`,
      name: newBizName,
      category: newBizCat,
      ownerName: currentUser.name,
      blockNumber: currentUser.blockNumber,
      phone: newBizPhone || currentUser.phone,
      description: newBizDesc || 'Lapak ekonomi warga terdaftar di UsahaQu RT 04.',
      rating: 5.0,
      badge: 'Lapak Baru Warga',
      products: [
        {
          id: `p-${Date.now()}-1`,
          name: 'Produk / Jasa Unggulan',
          price: 15000,
          unit: 'item',
          description: 'Layanan / produk lokal berkualitas',
        },
      ],
    };

    onUpdateBusinesses([newBiz, ...businesses]);
    setIsRegisterBizOpen(false);
    setNewBizName('');
    setNewBizDesc('');
    showNotification('Usaha warga baru berhasil terdaftar di UsahaQu!');
  };

  return (
    <div className="flex-1 flex flex-col bg-stone-100 overflow-y-auto">
      {/* ========================================================= */}
      {/* USAHAQU - LIST VIEW HANYA LOGO/IKON & NAMA                */}
      {/* ========================================================= */}
      <div className="p-3.5 bg-white border-b border-stone-200 shadow-2xs shrink-0 space-y-2.5">
        {/* Header UsahaQu (sebelumnya Switch Master Unit Usaha) */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-stone-900 font-bold uppercase tracking-wider">
            <Store className="w-4 h-4 text-emerald-700 shrink-0" />
            <h2 className="text-base font-black tracking-tight text-stone-900">UsahaQu</h2>
          </div>
          <span className="text-xs bg-stone-100 text-stone-600 font-bold px-2.5 py-0.5 rounded-full">
            4 Unit Usaha
          </span>
        </div>

        {/* List View: Hanya Logo/Ikon dan Nama */}
        <div className="divide-y divide-stone-100 bg-stone-50/70 rounded-2xl border border-stone-200/80 overflow-hidden shadow-2xs">
          {[
            {
              id: 'baksoqu',
              name: 'BaksoQu',
              icon: Store,
              bg: 'bg-amber-500',
              onClick: onSwitchToBaksoQu,
            },
            {
              id: 'bengkelqu',
              name: 'BengkelQu',
              icon: Wrench,
              bg: 'bg-emerald-600',
              onClick: onSwitchToBengkelQu,
            },
            {
              id: 'klinikqu',
              name: 'KlinikQu',
              icon: Activity,
              bg: 'bg-teal-600',
              onClick: onSwitchToKlinikQu,
            },
            {
              id: 'ritelqu',
              name: 'RitelQu',
              icon: ShoppingBag,
              bg: 'bg-blue-600',
              onClick: onSwitchToRitelQu,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white active:bg-stone-100 transition-colors cursor-pointer group text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${item.bg} text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-base text-stone-900 group-hover:text-emerald-800 transition-colors">
                    {item.name}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories and Actions */}
      <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'all', label: 'Semua Lapak' },
            { id: 'kesehatan', label: 'Kesehatan & Klinik' },
            { id: 'otomotif', label: 'Otomotif & Bengkel' },
            { id: 'kuliner', label: 'Kuliner' },
            { id: 'sembako', label: 'Sembako' },
            { id: 'laundry', label: 'Laundry' },
            { id: 'jasa', label: 'Jasa & Servis' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenAreaQu && (
            <button
              type="button"
              onClick={onOpenAreaQu}
              className="px-2.5 py-1.5 bg-teal-800 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Lihat di AreaQu</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsRegisterBizOpen(true)}
            className="px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Daftar Usaha</span>
          </button>
        </div>
      </div>

      {/* Mode A (POS Kasir Warung) & Mode B (Etalase Katalog Murni) Toggle */}
      <div className="px-3 py-1.5 bg-white border-b border-stone-200 flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar">
        <span className="font-bold text-stone-600 text-[11px] shrink-0">Tipe Operasional:</span>
        <button
          type="button"
          onClick={() => setModeFilter('all')}
          className={`px-2 py-0.5 rounded-lg font-bold transition text-[11px] shrink-0 cursor-pointer ${
            modeFilter === 'all'
              ? 'bg-stone-900 text-white'
              : 'bg-stone-100 text-stone-600 hover:text-stone-900'
          }`}
        >
          Semua Mode
        </button>
        <button
          type="button"
          onClick={() => setModeFilter('mode_a')}
          className={`px-2 py-0.5 rounded-lg font-bold transition text-[11px] flex items-center gap-1 shrink-0 cursor-pointer ${
            modeFilter === 'mode_a'
              ? 'bg-emerald-800 text-white'
              : 'bg-stone-100 text-stone-600 hover:text-stone-900'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Mode A: POS Warung</span>
        </button>
        <button
          type="button"
          onClick={() => setModeFilter('mode_b')}
          className={`px-2 py-0.5 rounded-lg font-bold transition text-[11px] flex items-center gap-1 shrink-0 cursor-pointer ${
            modeFilter === 'mode_b'
              ? 'bg-purple-800 text-white'
              : 'bg-stone-100 text-stone-600 hover:text-stone-900'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
          <span>Mode B: Katalog Murni</span>
        </button>
      </div>

      {/* Directory of Local Businesses */}
      <div className="p-3 space-y-3 pb-12">
        <div className="flex items-center justify-between px-1 text-xs text-stone-500 font-medium">
          <span>Lapak UMKM Warga ({filteredBusinesses.length} Usaha)</span>
          <div className="flex items-center gap-1 bg-stone-200/80 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setDisplayMode('list')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                displayMode === 'list'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <List className="w-3 h-3" />
              <span>List View</span>
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('katalog')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                displayMode === 'katalog'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Katalog</span>
            </button>
          </div>
        </div>

        {displayMode === 'list' ? (
          /* List View: Hanya Logo/Ikon dan Nama */
          <div className="divide-y divide-stone-100 bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-2xs">
            {filteredBusinesses.map((biz) => {
              const isBaksoQu = biz.posModuleKey === 'baksoqu';
              const isBengkelQu = biz.posModuleKey === 'bengkelqu';
              const isKlinikQu = biz.posModuleKey === 'klinikqu';
              const isRitelQu = biz.posModuleKey === 'ritelqu';

              const handleClick = () => {
                if (isBaksoQu) onSwitchToBaksoQu();
                else if (isBengkelQu) onSwitchToBengkelQu();
                else if (isKlinikQu) onSwitchToKlinikQu();
                else if (isRitelQu) onSwitchToRitelQu();
                else setSelectedBusiness(biz);
              };

              return (
                <button
                  key={biz.id}
                  type="button"
                  onClick={handleClick}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-stone-50 active:bg-stone-100 transition-colors cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shrink-0 shadow-2xs group-hover:scale-105 transition-transform ${
                        isBaksoQu
                          ? 'bg-amber-500 text-white'
                          : isBengkelQu
                          ? 'bg-emerald-600 text-white'
                          : isKlinikQu
                          ? 'bg-teal-600 text-white'
                          : isRitelQu
                          ? 'bg-blue-600 text-white'
                          : 'bg-emerald-700 text-white'
                      }`}
                    >
                      {isBaksoQu ? (
                        <Store className="w-5 h-5" />
                      ) : isBengkelQu ? (
                        <Wrench className="w-5 h-5" />
                      ) : isKlinikQu ? (
                        <Activity className="w-5 h-5" />
                      ) : isRitelQu ? (
                        <ShoppingBag className="w-5 h-5" />
                      ) : (
                        biz.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="font-bold text-base text-stone-900 group-hover:text-emerald-800 transition-colors">
                      {biz.name}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition-colors" />
                </button>
              );
            })}
          </div>
        ) : (
          /* Katalog View: Detail Card */
          filteredBusinesses.map((biz) => {
            const isBaksoQu = biz.posModuleKey === 'baksoqu';
            const isBengkelQu = biz.posModuleKey === 'bengkelqu';
            const isKlinikQu = biz.posModuleKey === 'klinikqu';
            const isRitelQu = biz.posModuleKey === 'ritelqu';

            return (
              <div
                key={biz.id}
                className={`bg-white rounded-2xl border p-4 shadow-2xs transition-all space-y-3 ${
                  isBaksoQu
                    ? 'border-amber-300 ring-1 ring-amber-300/40'
                    : isBengkelQu
                    ? 'border-emerald-400 ring-1 ring-emerald-300/50'
                    : isKlinikQu
                    ? 'border-teal-400 ring-1 ring-teal-300/50'
                    : isRitelQu
                    ? 'border-blue-400 ring-1 ring-blue-300/50'
                    : 'border-stone-200/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 ${
                        isBaksoQu
                          ? 'bg-gradient-to-br from-amber-500 to-red-600 text-white shadow'
                          : isBengkelQu
                          ? 'bg-emerald-800 text-amber-300 shadow'
                          : isKlinikQu
                          ? 'bg-emerald-600 text-white shadow'
                          : isRitelQu
                          ? 'bg-blue-600 text-white shadow'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isBaksoQu ? (
                        'BQ'
                      ) : isBengkelQu ? (
                        <Wrench className="w-6 h-6" />
                      ) : isKlinikQu ? (
                        <Activity className="w-6 h-6" />
                      ) : isRitelQu ? (
                        <ShoppingBag className="w-6 h-6" />
                      ) : (
                        biz.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-stone-900 leading-snug">{biz.name}</h3>
                        {biz.badge && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              isBengkelQu
                                ? 'bg-emerald-100 text-emerald-800'
                                : isKlinikQu
                                ? 'bg-teal-100 text-teal-800'
                                : isRitelQu
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {biz.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        {biz.ownerName} · {biz.blockNumber}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[11px] font-bold text-amber-900">{biz.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">{biz.description}</p>

                {/* Sample Products */}
                <div className="pt-2 border-t border-stone-100 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">
                    Menu / Layanan Pilihan
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {biz.products.map((p) => (
                      <div
                        key={p.id}
                        className="p-2 rounded-xl bg-stone-50 border border-stone-200/60 text-xs flex justify-between items-center"
                      >
                        <span className="text-[11px] font-medium text-stone-800 truncate mr-1">
                          {p.name}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-emerald-800 shrink-0">
                          Rp {p.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${biz.phone}`}
                      className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{biz.phone}</span>
                    </a>
                    {onOpenChat && (
                      <button
                        type="button"
                        onClick={() => onOpenChat('thread_usaha_bakso')}
                        className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                        title="Chat Transaksi Instant (Auto-Purge 24 Jam)"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat Lapak</span>
                      </button>
                    )}
                  </div>

                  {isBaksoQu ? (
                    <button
                      onClick={onSwitchToBaksoQu}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Masuk Kasir POS</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : isBengkelQu ? (
                    <button
                      onClick={onSwitchToBengkelQu}
                      className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5 text-amber-300" />
                      <span>Buka BengkelQu</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : isKlinikQu ? (
                    <button
                      onClick={onSwitchToKlinikQu}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      <Activity className="w-3.5 h-3.5 text-white" />
                      <span>Buka KlinikQu</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : isRitelQu ? (
                    <button
                      onClick={onSwitchToRitelQu}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-white" />
                      <span>Buka RitelQu</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        showNotification(`Pemesanan langsung terhubung ke WhatsApp ${biz.ownerName}.`)
                      }
                      className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                      <span>Pesan Produk</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL: DAFTAR USAHA WARGA BARU */}
      {/* ---------------------------------------------------- */}
      {isRegisterBizOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-md p-4 space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-bold text-stone-900">
                Pendaftaran Lapak Ekonomi UsahaQu
              </h3>
              <button
                onClick={() => setIsRegisterBizOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterBusiness} className="space-y-2.5 text-xs">
              <div>
                <label className="font-bold text-stone-700">Nama Usaha / Toko</label>
                <input
                  type="text"
                  value={newBizName}
                  onChange={(e) => setNewBizName(e.target.value)}
                  placeholder="Contoh: Kue Basah Bu Anisa..."
                  className="w-full mt-1 p-2 rounded-xl border border-stone-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700">Kategori</label>
                  <select
                    value={newBizCat}
                    onChange={(e) => setNewBizCat(e.target.value as any)}
                    className="w-full mt-1 p-2 rounded-xl border border-stone-300"
                  >
                    <option value="otomotif">Otomotif & Bengkel</option>
                    <option value="kuliner">Kuliner & Makanan</option>
                    <option value="sembako">Sembako & Kebutuhan</option>
                    <option value="laundry">Laundry & Pakaian</option>
                    <option value="jasa">Jasa & Servis</option>
                    <option value="kerajinan">Kerajinan Tangan</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700">Nomor WhatsApp</label>
                  <input
                    type="text"
                    value={newBizPhone}
                    onChange={(e) => setNewBizPhone(e.target.value)}
                    placeholder="0812..."
                    className="w-full mt-1 p-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700">Deskripsi & Produk</label>
                <textarea
                  value={newBizDesc}
                  onChange={(e) => setNewBizDesc(e.target.value)}
                  rows={2}
                  placeholder="Jelaskan produk atau jasa yang ditawarkan kepada tetangga..."
                  className="w-full mt-1 p-2 rounded-xl border border-stone-300"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
              >
                Daftarkan ke UsahaQu
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
