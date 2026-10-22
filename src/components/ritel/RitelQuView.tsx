import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Check,
  X,
  User,
  Printer,
  ChevronRight,
  Package,
  Barcode,
  ShoppingBag,
  DollarSign,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Mic,
  MicOff,
  Bot,
  Send,
  Download,
  Share2,
  Users,
  RotateCcw,
  Percent,
  FileText,
  Mail,
  HelpCircle,
  Phone,
  Save,
  Trash2,
  Calendar,
  Layers,
  Camera,
  MapPin,
  ExternalLink,
  Copy,
  CheckCircle2,
  Headphones,
  FileCheck,
  Settings,
  UserPlus,
  UserCheck,
  ShieldCheck,
  Lock,
  Briefcase,
  Key,
} from 'lucide-react';

import {
  RitelProduct,
  RitelCartItem,
  RitelInvoice,
  RitelCustomer,
  RitelEmployee,
  RitelEmployeeRole,
  RitelAttendanceRecord,
  UserProfile,
} from '../../types';
import {
  RitelStorageService,
  DEFAULT_RITEL_PRODUCTS,
  compressImage,
  RitelStoreProfile,
} from '../../services/storageRitel';
import {
  RitelAiService,
  VoiceMatchResult,
  CrossSellItem,
} from '../../services/ritelAiService';

interface RitelQuViewProps {
  currentUser: UserProfile;
  onBackToAppQu: () => void;
  showNotification: (msg: string) => void;
}

export const RitelQuView: React.FC<RitelQuViewProps> = ({
  currentUser,
  onBackToAppQu,
  showNotification,
}) => {
  // Navigation: Kasir (⚡), Stok & CRM (📦), Karyawan (👥), Laporan & Promo (📊), Pengaturan (⚙️)
  const [activeNav, setActiveNav] = useState<'kasir' | 'stok' | 'karyawan' | 'laporan' | 'pengaturan'>('kasir');

  // Karyawan Sub-tabs: 'absen' (Absensi & Presensi) | 'daftar' (Daftar & Tambah Karyawan) | 'hak_akses' (SPV, Kasir, Admin)
  const [karyawanTab, setKaryawanTab] = useState<'absen' | 'daftar' | 'hak_akses'>('absen');
  const [employees, setEmployees] = useState<RitelEmployee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<RitelAttendanceRecord[]>([]);
  const [employeeRoleFilter, setEmployeeRoleFilter] = useState<'all' | 'spv' | 'kasir' | 'admin'>('all');
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  // New Employee Form
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empRole, setEmpRole] = useState<RitelEmployeeRole>('kasir');
  const [empNotes, setEmpNotes] = useState('');

  // Attendance Form
  const [attEmployeeId, setAttEmployeeId] = useState('');
  const [attStatus, setAttStatus] = useState<'hadir' | 'terlambat' | 'izin' | 'sakit'>('hadir');
  const [attShift, setAttShift] = useState<'Pagi' | 'Siang' | 'Malam' | 'Full Day'>('Pagi');
  const [attNotes, setAttNotes] = useState('');

  // Active Cashier Employee in Session
  const [activeCashierId, setActiveCashierId] = useState<string>('emp-2');

  // Pengaturan Sub-tabs: 'profil' (Ubah Profil & Contoh Struk) | 'care' (Customer Care & Prompt Dev) | 'sistem' (Data & Replikasi)
  const [pengaturanTab, setPengaturanTab] = useState<'profil' | 'care' | 'sistem'>('profil');

  // Sub-tabs for other views
  const [stokTab, setStokTab] = useState<'inventaris' | 'crm'>('inventaris');
  const [laporanTab, setLaporanTab] = useState<'omset' | 'promosi'>('omset');

  // Core Data
  const [products, setProducts] = useState<RitelProduct[]>([]);
  const [invoices, setInvoices] = useState<RitelInvoice[]>([]);
  const [customers, setCustomers] = useState<RitelCustomer[]>([]);
  const [deviceId, setDeviceId] = useState<string>('RITEL-DEV01');

  // Toko Profile Data (Ubah Profil & Auto Header)
  const [storeName, setStoreName] = useState<string>('Toko Kelontong Berkah RT 04');
  const [ownerName, setOwnerName] = useState<string>('Ibu Sri Wahyuni / Pak RT Bambang');
  const [storePhone, setStorePhone] = useState<string>('081234567890');
  const [address, setAddress] = useState<string>('Jl. Graha Kencana Raya No. 04, RT 04 / RW 02');
  const [shareloc, setShareloc] = useState<string>('https://maps.google.com/?q=-6.200000,106.816666');
  const [headerPhoto, setHeaderPhoto] = useState<string>('');
  const [isCompressingPhoto, setIsCompressingPhoto] = useState<boolean>(false);
  const [compressionFeedback, setCompressionFeedback] = useState<string>('');

  // Contoh Struk Thermal PDF Options
  const [strukWidth, setStrukWidth] = useState<'58mm' | '80mm'>('58mm');

  // Customer Care: Keluhan / Masalah Koding App - Auto Prompt Developer Generator
  const [devCategory, setDevCategory] = useState<string>('🐛 Bug / Error Tampilan UI');
  const [devDescription, setDevDescription] = useState<string>('');
  const [devErrorLog, setDevErrorLog] = useState<string>('');
  const [devSteps, setDevSteps] = useState<string>('');
  const [generatedDevPrompt, setGeneratedDevPrompt] = useState<{
    promptMarkdown: string;
    emailMailto: string;
    whatsappUrl: string;
  } | null>(null);
  const [isPromptCopied, setIsPromptCopied] = useState<boolean>(false);

  // Kasir Active Cart State (Key: productId, Value: qty)
  const [cart, setCart] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState<string>('Pembeli Langsung (Warga)');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isBarcodeScanMode, setIsBarcodeScanMode] = useState<boolean>(false);
  const [manualSkuInput, setManualSkuInput] = useState<string>('');

  // Speech-to-Text State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [voiceQueryText, setVoiceQueryText] = useState<string>('');

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'qris' | 'transfer' | 'bon_warga'>('tunai');
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [checkoutNotes, setCheckoutNotes] = useState<string>('');

  // Receipt Modal State
  const [paidInvoice, setPaidInvoice] = useState<RitelInvoice | null>(null);

  // New Product Modal State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<RitelProduct['category']>('sembako');
  const [newProdPrice, setNewProdPrice] = useState<number>(10000);
  const [newProdBuyPrice, setNewProdBuyPrice] = useState<number>(8500);
  const [newProdStock, setNewProdStock] = useState<number>(20);
  const [newProdUnit, setNewProdUnit] = useState<string>('Pcs');
  const [newProdExpiry, setNewProdExpiry] = useState<string>('');

  // New Customer Modal
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustBlock, setNewCustBlock] = useState('Blok C1 No. 01');

  // AI Chat & Consultation State
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatMessages, setAiChatMessages] = useState<
    { sender: 'user' | 'ai'; text: string; source?: 'gemini' | 'local_expert'; time: string }[]
  >([
    {
      sender: 'ai',
      text: 'Halo! Saya RitelQu AI, asisten pintar manajemen toko ritel Anda (100% Gratis). Saya siap menganalisis stok menipis, strategi promosi bundling, catatan bon warga, hingga troubleshooting printer thermal Bluetooth!',
      source: 'local_expert',
      time: 'Baru saja',
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Initial Load
  useEffect(() => {
    const id = RitelStorageService.getDeviceId();
    setDeviceId(id);
    setProducts(RitelStorageService.getProducts());
    setInvoices(RitelStorageService.getInvoices());
    setCustomers(RitelStorageService.getCustomers());

    const prof = RitelStorageService.getStoreProfile();
    setStoreName(prof.storeName);
    setOwnerName(prof.ownerName);
    setStorePhone(prof.phone);
    setAddress(prof.address);
    setShareloc(prof.shareloc);
    setHeaderPhoto(prof.headerPhoto);

    const emps = RitelStorageService.getEmployees();
    setEmployees(emps);
    setAttendanceRecords(RitelStorageService.getAttendance());
    if (emps.length > 0) {
      const defaultCashier = emps.find((e) => e.role === 'kasir') || emps[0];
      setActiveCashierId(defaultCashier.id);
    }
  }, []);

  // Grand Total & Total Item Count
  const grandTotal = Object.entries(cart).reduce((sum, [productId, qty]) => {
    const prod = products.find((p) => p.id === productId);
    return sum + (prod ? prod.price * qty : 0);
  }, 0);

  const totalItemCount = Object.values(cart).reduce((a, b) => a + b, 0);

  // Cross Selling Recommendations from RitelQu AI
  const crossSellItems: CrossSellItem[] = RitelAiService.getCrossSellRecommendations(
    Object.keys(cart),
    products
  );

  // Cart Operations
  const handleAddToCart = (productId: string, addQty: number = 1) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const currentQty = cart[productId] || 0;
    if (currentQty + addQty > prod.stock) {
      showNotification(`Stok ${prod.name} hanya tersisa ${prod.stock} ${prod.unit}.`);
      return;
    }

    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + addQty,
    }));
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const currentQty = cart[productId] || 0;
    const newQty = currentQty + delta;

    if (newQty <= 0) {
      const nextCart = { ...cart };
      delete nextCart[productId];
      setCart(nextCart);
    } else {
      if (newQty > prod.stock) {
        showNotification(`Maksimal stok ${prod.name} hanya ${prod.stock} ${prod.unit}.`);
        return;
      }
      setCart((prev) => ({
        ...prev,
        [productId]: newQty,
      }));
    }
  };

  const handleClearCart = () => {
    setCart({});
  };

  // Barcode / SKU Direct Quick Enter
  const handleSkuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSkuInput.trim()) return;

    const found = products.find(
      (p) => p.sku === manualSkuInput.trim() || p.sku.endsWith(manualSkuInput.trim())
    );

    if (found) {
      handleAddToCart(found.id, 1);
      showNotification(`+ ${found.name} berhasil ditambahkan via scan SKU!`);
      setManualSkuInput('');
    } else {
      showNotification(`SKU ${manualSkuInput} tidak ditemukan dalam stok!`);
    }
  };

  // Speech-to-Text Feature
  const handleStartVoiceEntry = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setIsListening(true);
        showNotification('🎙️ Mendengarkan ucapan... (Sebutkan nama barang & jumlah)');

        recognition.onresult = (event: any) => {
          const spoken = event.results[0][0].transcript;
          setIsListening(false);
          processVoiceMatch(spoken);
        };

        recognition.onerror = () => {
          setIsListening(false);
          setIsVoiceModalOpen(true);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
        return;
      } catch (e) {
        console.warn('SpeechRecognition error:', e);
      }
    }

    // Fallback modal if Web Speech API is blocked or unsupported
    setIsVoiceModalOpen(true);
  };

  const processVoiceMatch = (spokenText: string) => {
    const match = RitelAiService.parseVoiceToCart(spokenText, products);
    if (match) {
      handleAddToCart(match.product.id, match.qty);
      showNotification(
        `🎙️ "${spokenText}" -> Ditambahkan: ${match.product.name} (x${match.qty})`
      );
    } else {
      showNotification(`RitelQu AI belum menemukan barang sesuai: "${spokenText}"`);
    }
    setIsVoiceModalOpen(false);
    setVoiceQueryText('');
  };

  // Checkout Open
  const handleOpenCheckout = () => {
    if (grandTotal <= 0) return;
    setCashGiven(grandTotal);
    setPaymentMethod('tunai');
    setIsCheckoutOpen(true);
  };

  // Confirm Payment & Record Invoice
  const handleConfirmPayment = () => {
    if (grandTotal <= 0) return;

    const items: RitelCartItem[] = Object.entries(cart).map(([productId, qty]) => {
      const prod = products.find((p) => p.id === productId)!;
      return {
        id: `ci-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: prod.id,
        sku: prod.sku,
        name: prod.name,
        price: prod.price,
        qty,
        unit: prod.unit,
      };
    });

    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = invoices.length + 1;
    const invoiceNum = `INV-RIT-${dateStr}-${String(count).padStart(2, '0')}`;

    const newInvoice: RitelInvoice = {
      id: `inv-rit-${Date.now()}`,
      invoiceNumber: invoiceNum,
      cashierName: currentCashier.name || currentUser.name || 'Kasir Toko',
      customerName: customerName || 'Pembeli Warga',
      customerPhone: customerPhone,
      items,
      total: grandTotal,
      cashGiven: paymentMethod === 'tunai' ? cashGiven : grandTotal,
      change: paymentMethod === 'tunai' ? Math.max(0, cashGiven - grandTotal) : 0,
      paymentMethod,
      status: paymentMethod === 'bon_warga' ? 'bon' : 'lunas',
      createdAt: date.toISOString(),
      notes: checkoutNotes,
    };

    RitelStorageService.addInvoice(newInvoice);
    setInvoices([newInvoice, ...invoices]);
    setProducts(RitelStorageService.getProducts());
    setCustomers(RitelStorageService.getCustomers());
    setCart({});
    setIsCheckoutOpen(false);
    setPaidInvoice(newInvoice);
    showNotification(`Transaksi ${invoiceNum} sukses! Struk tercatat.`);
  };

  // Add Product Handler
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const skuCode = newProdSku || '899' + Math.floor(10000000 + Math.random() * 90000000);
    const newProduct: RitelProduct = {
      id: `rit-${Date.now()}`,
      sku: skuCode,
      name: newProdName,
      category: newProdCategory,
      price: newProdPrice,
      buyPrice: newProdBuyPrice,
      stock: newProdStock,
      unit: newProdUnit || 'Pcs',
      minStock: 5,
      expiryDate: newProdExpiry || undefined,
    };

    const updated = [newProduct, ...products];
    setProducts(updated);
    RitelStorageService.saveProducts(updated);
    setIsAddProductOpen(false);
    setNewProdName('');
    setNewProdSku('');
    showNotification(`Barang ${newProduct.name} berhasil ditambahkan ke inventaris.`);
  };

  // Adjust Stock
  const handleAdjustStock = (productId: string, delta: number) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        return { ...p, stock: Math.max(0, p.stock + delta) };
      }
      return p;
    });
    setProducts(updated);
    RitelStorageService.saveProducts(updated);
  };

  // Add Customer Handler
  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    const newCust: RitelCustomer = {
      id: `cust-${Date.now()}`,
      name: newCustName,
      phone: newCustPhone || '081234567890',
      blockNumber: newCustBlock,
      points: 10,
      totalDebt: 0,
    };

    const updated = [newCust, ...customers];
    setCustomers(updated);
    RitelStorageService.saveCustomers(updated);
    setIsAddCustomerOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    showNotification(`Pelanggan ${newCust.name} berhasil didaftarkan!`);
  };

  // Pay Bon / Debt
  const handlePayDebt = (customerId: string, amount: number) => {
    RitelStorageService.payCustomerDebt(customerId, amount);
    setCustomers(RitelStorageService.getCustomers());
    showNotification(`Pelunasan bon sebesar Rp ${amount.toLocaleString('id-ID')} berhasil dicatat!`);
  };

  // Send WhatsApp Reminder
  const handleSendDebtWa = (customer: RitelCustomer) => {
    const msg = RitelAiService.generateDebtReminderWa(customer, storeName);
    const phone = customer.phone.replace(/[^0-9]/g, '');
    const targetPhone = phone.startsWith('0') ? '62' + phone.slice(1) : phone;
    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Broadcast Promo WA
  const handleBroadcastPromoWa = () => {
    const msg = RitelAiService.generatePromoBroadcast(storeName, products);
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Standalone Downloads
  const handleDownloadKatalog = () => {
    const html = RitelStorageService.generateKatalogHtml(storeName, products, storePhone);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `katalog-${storeName.toLowerCase().replace(/\s+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Berkas katalog.html berhasil diunduh!');
  };

  const handleDownloadKasir = () => {
    const html = RitelStorageService.generateKasirHtml(storeName, products, currentUser.name);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kasir-mandiri-${storeName.toLowerCase().replace(/\s+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Berkas kasir.html berhasil diunduh! Siap dibuka di HP kedua.');
  };

  const handleDownloadCabang = () => {
    const html = RitelStorageService.generateCabangModulHtml(storeName, 'Cabang Baru RT 04', products);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cabang_modul.html`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Berkas cabang_modul.html berhasil diunduh!');
  };

  // AI Chat Submit
  const handleSendAiPrompt = async (promptText?: string) => {
    const query = promptText || aiChatInput;
    if (!query.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: query,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setAiChatMessages((prev) => [...prev, userMsg]);
    if (!promptText) setAiChatInput('');
    setIsAiLoading(true);

    try {
      const response = await RitelAiService.askRitelAi(query, {
        products,
        invoices,
        customers,
        storeName,
        deviceId,
      });

      const aiMsg = {
        sender: 'ai' as const,
        text: response.answer,
        source: response.source,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };

      setAiChatMessages((prev) => [...prev, aiMsg]);
    } catch {
      setAiChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'RitelQu AI siap membantu mengelola toko Anda.',
          source: 'local_expert',
          time: 'Baru saja',
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Customer Care Bug Report Draft
  const handleDraftSupportEmail = () => {
    const emailData = RitelAiService.generateCustomerCareEmail(
      'Kendala pemindaian barcode / sinkronisasi struk kasir RitelQu.',
      deviceId,
      storeName
    );
    window.location.href = emailData.mailtoUrl;
    showNotification('Draf email support AppQu telah dibuka!');
  };

  // ----------------------------------------------------
  // PROFILE, GPS, COMPRESSED PHOTO & SAMPLE RECEIPT
  // ----------------------------------------------------
  // GPS Location detector
  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      showNotification('Browser atau perangkat tidak mendukung deteksi GPS.');
      return;
    }
    showNotification('Mendeteksi titik koordinat GPS...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const mapsUrl = `https://maps.google.com/?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`;
        setShareloc(mapsUrl);
        showNotification(`Titik GPS berhasil disetel: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      (err) => {
        showNotification('Gagal mengambil GPS: ' + (err.message || 'Izin lokasi ditolak'));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Compress and set Header Photo
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingPhoto(true);
    setCompressionFeedback('Sedang mengompres foto toko...');
    try {
      const originalSizeKb = Math.round(file.size / 1024);
      const compressedDataUrl = await compressImage(file, 900, 380, 0.78);
      const compressedSizeKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);

      setHeaderPhoto(compressedDataUrl);
      setCompressionFeedback(
        `Kompresi sukses: ${originalSizeKb} KB ➔ ${compressedSizeKb} KB. Klik Simpan untuk terapkan Auto Header!`
      );
      showNotification('Foto toko berhasil dikompresi!');
    } catch (err) {
      console.error('Compress error:', err);
      showNotification('Gagal memproses dan mengompres foto.');
      setCompressionFeedback('Gagal mengompres foto toko.');
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  // Save Store Profile & Auto Header
  const handleSaveProfile = () => {
    RitelStorageService.setStoreProfile({
      storeName,
      ownerName,
      phone: storePhone,
      address,
      shareloc,
      headerPhoto,
    });
    showNotification('Profil toko & Auto Header berhasil disimpan!');
  };

  // Generate Structured Developer Auto-Fix Prompt (100% Gratis)
  const handleGenerateDevPrompt = () => {
    if (!devDescription.trim()) {
      showNotification('Tuliskan keluhan atau masalah koding terlebih dahulu.');
      return;
    }

    const result = RitelAiService.generateDeveloperFixPrompt({
      category: devCategory,
      description: devDescription,
      errorLog: devErrorLog.trim() || undefined,
      stepsToReproduce: devSteps.trim() || undefined,
      storeName: storeName || 'RitelQu',
      deviceId,
    });

    setGeneratedDevPrompt(result);
    setIsPromptCopied(false);
    showNotification('Auto-Prompt Developer berhasil dibuat (100% Gratis)!');
  };

  // Copy Prompt to Clipboard
  const handleCopyDevPrompt = () => {
    if (!generatedDevPrompt) return;
    navigator.clipboard.writeText(generatedDevPrompt.promptMarkdown);
    setIsPromptCopied(true);
    showNotification('Auto-Prompt berhasil disalin ke clipboard!');
    setTimeout(() => setIsPromptCopied(false), 3000);
  };

  // Ask AI about this dev issue for instant workaround
  const handleAskAiAboutDevIssue = () => {
    if (!devDescription.trim()) return;
    const promptForAi = `Saya mendapati kendala koding / aplikasi pada RitelQu:\nKategori: ${devCategory}\nKeluhan: ${devDescription}\n${
      devErrorLog ? `Log Error: ${devErrorLog}\n` : ''
    }Mohon berikan analisis akar masalah dan rekomendasi solusi mandiri / mitigasi sementara sambil menunggu perbaikan developer.`;
    handleSendAiPrompt(promptForAi);
    setPengaturanTab('care');
    showNotification('Menganalisis solusi bersama Customer Care AI...');
  };

  // Print Sample Receipt (Cetak / Simpan PDF)
  const handlePrintSampleStruk = () => {
    window.print();
    showNotification('Membuka dialog cetak thermal / simpan PDF struk...');
  };

  // Share Sample Receipt to WhatsApp
  const handleShareSampleStrukWa = () => {
    const sampleText =
`*================================*
*${(storeName || 'RITELQU').toUpperCase()}*
Pemilik : ${ownerName || '-'}
Alamat  : ${address || '-'}
Telp/WA : ${storePhone || '-'}
Lokasi  : ${shareloc || '-'}
*================================*
Waktu   : ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
Kasir   : Bu RT / Hendra
No.     : INV-RIT-SAMPLE-01
--------------------------------
• Beras Premium 5KG    x1  Rp 72.500
• Minyak Goreng 2L     x1  Rp 34.000
• Gula Pasir 1KG       x2  Rp 34.000
• Telur Ayam Segar 1KG x1  Rp 28.000
--------------------------------
Subtotal        : Rp 168.500
Diskon RT 04    : -Rp 5.000
*TOTAL BELANJA  : RP 163.500*
Bayar (QRIS)    : Rp 163.500
Kembali         : Rp 0
*================================*
Terima Kasih Telah Berbelanja di
Toko Warga RT 04!
Barang yang dibeli tidak dapat ditukar.
AppQu POS RitelQu • Solusi Cerdas Masa Kini`;

    const url = `https://wa.me/?text=${encodeURIComponent(sampleText)}`;
    window.open(url, '_blank');
  };

  // ----------------------------------------------------
  // KARYAWAN: DAFTAR, ABSENSI & HAK AKSES HANDLERS
  // ----------------------------------------------------
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim()) {
      showNotification('Nama karyawan wajib diisi!');
      return;
    }
    const newEmp = RitelStorageService.addEmployee({
      name: empName.trim(),
      email: empEmail.trim() || `${empName.toLowerCase().replace(/\s+/g, '')}@ritelqu.id`,
      phone: empPhone.trim() || '081234567890',
      role: empRole,
      status: 'aktif',
      notes: empNotes.trim() || `Karyawan role ${empRole.toUpperCase()}`,
    });
    setEmployees(RitelStorageService.getEmployees());
    setIsAddEmployeeOpen(false);
    setEmpName('');
    setEmpEmail('');
    setEmpPhone('');
    setEmpRole('kasir');
    setEmpNotes('');
    showNotification(`Karyawan ${newEmp.name} (${newEmp.role.toUpperCase()}) berhasil didaftarkan!`);
  };

  const handleDeleteEmployee = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus data karyawan "${name}"?`)) {
      RitelStorageService.deleteEmployee(id);
      setEmployees(RitelStorageService.getEmployees());
      showNotification(`Data karyawan ${name} berhasil dihapus.`);
    }
  };

  const handleUpdateRole = (id: string, newRole: RitelEmployeeRole) => {
    const emp = employees.find((e) => e.id === id);
    if (!emp) return;
    const updated = { ...emp, role: newRole };
    RitelStorageService.updateEmployee(updated);
    setEmployees(RitelStorageService.getEmployees());
    showNotification(`Hak akses ${emp.name} diperbarui menjadi ${newRole.toUpperCase()}.`);
  };

  const handleToggleEmployeeStatus = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    if (!emp) return;
    const newStatus = emp.status === 'aktif' ? 'nonaktif' : 'aktif';
    const updated = { ...emp, status: newStatus as 'aktif' | 'nonaktif' };
    RitelStorageService.updateEmployee(updated);
    setEmployees(RitelStorageService.getEmployees());
    showNotification(`Status ${emp.name} sekarang: ${newStatus.toUpperCase()}`);
  };

  const handleRecordAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((x) => x.id === attEmployeeId);
    if (!emp) {
      showNotification('Silakan pilih nama karyawan terlebih dahulu.');
      return;
    }
    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);
    const todayStr = now.toISOString().split('T')[0];

    RitelStorageService.recordAttendance({
      employeeId: emp.id,
      employeeName: emp.name,
      employeeRole: emp.role,
      date: todayStr,
      checkInTime: currentTime,
      status: attStatus,
      shift: attShift,
      notes: attNotes.trim() || undefined,
    });
    setAttendanceRecords(RitelStorageService.getAttendance());
    setIsAttendanceModalOpen(false);
    setAttNotes('');
    showNotification(`Presensi masuk ${emp.name} (${attStatus.toUpperCase()}) tercatat jam ${currentTime}!`);
  };

  const handleCheckOutAttendance = (recordId: string, empName: string) => {
    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);
    RitelStorageService.checkOutAttendance(recordId, currentTime);
    setAttendanceRecords(RitelStorageService.getAttendance());
    showNotification(`Presensi pulang ${empName} tercatat jam ${currentTime}!`);
  };

  const handleShareAttendanceToWa = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecords = attendanceRecords.filter((r) => r.date === todayStr);
    const text =
`*📋 REKAP PRESENSI KARYAWAN RITELQU*
Toko: ${storeName || 'RitelQu RT 04'}
Tanggal: ${todayStr}
Total Karyawan: ${employees.length} Orang
Hadir: ${todayRecords.filter((r) => r.status === 'hadir').length} | Terlambat: ${todayRecords.filter((r) => r.status === 'terlambat').length} | Izin/Sakit: ${todayRecords.filter((r) => r.status === 'izin' || r.status === 'sakit').length}

*Daftar Presensi Hari Ini:*
${todayRecords.length > 0 ? todayRecords.map((r, i) => `${i + 1}. ${r.employeeName} (${r.employeeRole.toUpperCase()})
   Status: ${r.status.toUpperCase()} [Masuk: ${r.checkInTime}${r.checkOutTime ? ` - Pulang: ${r.checkOutTime}` : ' (Bertugas)'}]
   Shift: ${r.shift}${r.notes ? ` • ${r.notes}` : ''}`).join('\n') : 'Belum ada presensi tercatat hari ini.'}

Dicatat otomatis via Sistem POS AppQu RitelQu`;

    const targetPhone = storePhone ? storePhone.replace(/[^0-9]/g, '') : '';
    const url = targetPhone ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    showNotification('Membuka WhatsApp untuk mengirim rekap presensi...');
  };

  // Active Cashier on Duty
  const currentCashier = employees.find((e) => e.id === activeCashierId) || {
    id: 'emp-default',
    name: ownerName ? `${ownerName} (Admin)` : 'Kasir Toko',
    role: 'kasir' as RitelEmployeeRole,
  };

  // Filtered Products for Kasir & Stok
  const filteredProducts = products.filter((p) => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchQuery =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.includes(searchQuery);
    return matchCat && matchQuery;
  });

  return (
    <div className="ritelqu-scope bg-white text-slate-800 antialiased h-full flex flex-col overflow-hidden relative select-none text-[15px]">
      {/* ========================================================= */}
      {/* HEADER TOKO DENGAN DUKUNGAN AUTO HEADER FOTO KOMPRESI     */}
      {/* ========================================================= */}
      <header
        className={`px-5 py-3 shadow-sm flex justify-between items-center z-10 shrink-0 transition-all relative overflow-hidden ${
          headerPhoto ? 'bg-slate-900 text-white' : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white'
        }`}
        style={
          headerPhoto
            ? {
                backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.90), rgba(30, 58, 138, 0.85)), url(${headerPhoto})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        <div className="flex items-center gap-2.5 z-10">
          <button
            onClick={onBackToAppQu}
            className="h-8 px-2.5 rounded-lg bg-black/25 hover:bg-black/45 text-white flex items-center gap-1 text-sm font-bold transition-all active:scale-95 cursor-pointer border border-white/20 backdrop-blur-xs"
            title="Kembali ke AppQu"
          >
            <span>◀ AppQu</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg tracking-wide uppercase leading-tight drop-shadow-xs">
                {storeName || 'RitelQu RT 04'}
              </h1>
              {headerPhoto && (
                <span className="text-sm bg-emerald-500 text-white font-extrabold px-1.5 py-0.5 rounded shadow-2xs">
                  Auto Header
                </span>
              )}
            </div>
            <p className="text-sm text-blue-100/90 font-medium drop-shadow-xs line-clamp-1">
              {ownerName ? `Pemilik: ${ownerName}` : `ID: ${deviceId}`} {address ? `• ${address}` : ''}
            </p>
          </div>
        </div>

        <div className="text-right flex items-center gap-2 z-10">
          <button
            onClick={() => {
              setActiveNav('pengaturan');
              setPengaturanTab('care');
            }}
            className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-sm font-bold border border-white/20 backdrop-blur-xs flex items-center gap-1 transition cursor-pointer"
            title="Buka Customer Care & Bantuan AI"
          >
            <Headphones className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Customer Care</span>
          </button>
          <span
            className="text-sm bg-black/20 backdrop-blur-xs px-2.5 py-1 rounded-full font-bold border border-white/20"
            id="cabang-label"
          >
            Cabang Utama
          </span>
        </div>
      </header>

      {/* ========================================================= */}
      {/* SUB MENU ATAS (PINDAH KE ATAS, BERDASARKAN ACTIVE NAV)    */}
      {/* ========================================================= */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between shrink-0 shadow-2xs z-10 overflow-x-auto no-scrollbar">
        {/* SUB MENU KASIR: KATEGORI PRODUK & KASIR AKTIF */}
        {activeNav === 'kasir' && (
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: 'all', label: 'Semua Produk' },
                { id: 'sembako', label: 'Sembako' },
                { id: 'makanan', label: 'Makanan' },
                { id: 'minuman', label: 'Minuman' },
                { id: 'kebersihan', label: 'Kebersihan' },
                { id: 'bumbu', label: 'Bumbu Dapur' },
                { id: 'rokok_korek', label: 'Rokok & Korek' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1 rounded-xl text-sm font-bold transition-all shrink-0 cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Kasir Bertugas Selector */}
            <div className="flex items-center gap-1.5 shrink-0 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-sm">
              <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <div className="flex flex-col text-sm leading-tight">
                <span className="text-sm text-slate-400 font-bold uppercase">Kasir POS</span>
                <select
                  value={activeCashierId}
                  onChange={(e) => {
                    setActiveCashierId(e.target.value);
                    const sel = employees.find((x) => x.id === e.target.value);
                    if (sel) showNotification(`Kasir bertugas: ${sel.name} (${sel.role.toUpperCase()})`);
                  }}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                  title="Pilih Karyawan yang sedang bertugas di meja kasir"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* SUB MENU STOK: INVENTARIS VS CRM */}
        {activeNav === 'stok' && (
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setStokTab('inventaris')}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all cursor-pointer shrink-0 ${
                  stokTab === 'inventaris'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                📦 Stok & Inventaris ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setStokTab('crm')}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all cursor-pointer shrink-0 ${
                  stokTab === 'crm'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                👥 Member & Bon CRM ({customers.length})
              </button>
            </div>

            {stokTab === 'inventaris' ? (
              <button
                type="button"
                onClick={() => setIsAddProductOpen(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>(+) Tambah Barang</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddCustomerOpen(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>(+) Member Warga</span>
              </button>
            )}
          </div>
        )}

        {/* SUB MENU KARYAWAN: ABSENSI, DAFTAR KARYAWAN, HAK AKSES */}
        {activeNav === 'karyawan' && (
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setKaryawanTab('absen')}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  karyawanTab === 'absen'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Absensi & Presensi</span>
              </button>
              <button
                type="button"
                onClick={() => setKaryawanTab('daftar')}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  karyawanTab === 'daftar'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Daftar Karyawan ({employees.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setKaryawanTab('hak_akses')}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  karyawanTab === 'hak_akses'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Hak Akses SPV/Kasir/Admin</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (employees.length > 0 && !attEmployeeId) {
                    setAttEmployeeId(employees[0].id);
                  }
                  setIsAttendanceModalOpen(true);
                }}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl flex items-center gap-1 shadow-xs cursor-pointer"
                title="Input Presensi / Absen Cepat"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Absen Masuk</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddEmployeeOpen(true)}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl flex items-center gap-1 shadow-xs cursor-pointer"
                title="Tambah Karyawan Baru"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>(+) Karyawan</span>
              </button>
            </div>
          </div>
        )}

        {/* SUB MENU LAPORAN: OMSET VS PROMOSI */}
        {activeNav === 'laporan' && (
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setLaporanTab('omset')}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all cursor-pointer shrink-0 ${
                  laporanTab === 'omset'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                📊 Laporan Omset & Keuangan ({invoices.length})
              </button>
              <button
                type="button"
                onClick={() => setLaporanTab('promosi')}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all cursor-pointer shrink-0 ${
                  laporanTab === 'promosi'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                🏷️ Promosi & Standalone Berkas
              </button>
            </div>
          </div>
        )}

        {/* SUB MENU PENGATURAN: PROFIL & STRUK VS CUSTOMER CARE VS SISTEM */}
        {activeNav === 'pengaturan' && (
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setPengaturanTab('profil')}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  pengaturanTab === 'profil'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Ubah Profil & Struk</span>
              </button>
              <button
                type="button"
                onClick={() => setPengaturanTab('care')}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  pengaturanTab === 'care'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Headphones className="w-3.5 h-3.5 text-emerald-500" />
                <span>Customer Care (Gratis Dev Prompt)</span>
              </button>
              <button
                type="button"
                onClick={() => setPengaturanTab('sistem')}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  pengaturanTab === 'sistem'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Data & Sistem</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* KONTEN UTAMA (SIDEBAR KIRI HIDDEN, LAYOUT PUTIH BERSIH)    */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col overflow-hidden pb-16 bg-white">
        {/* ======================================================= */}
        {/* VIEW 1: KASIR & TRANSAKSI (POS QUICK SCAN + SPEECH 🎙️)  */}
        {/* ======================================================= */}
        {activeNav === 'kasir' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Quick Customer & Voice Barcode Strip (Minimalist & Floating Focus) */}
            <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5 flex items-center justify-between text-base shrink-0 gap-2">
              <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                <User className="w-4 h-4 text-blue-600 shrink-0" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nama Pembeli / Warga..."
                  className="w-full text-base bg-transparent font-medium text-slate-800 focus:outline-none truncate"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Search / Scan Input with Autohide focus */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari SKU / nama barang..."
                    className="pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-base w-36 xs:w-48 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Speech-to-Text Button */}
                <button
                  onClick={handleStartVoiceEntry}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  }`}
                  title="Smart Entry Suara (Speech-to-Text)"
                  aria-label="Input Suara"
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Barcode Manual Direct Scanner Toggle */}
                <button
                  onClick={() => setIsBarcodeScanMode(!isBarcodeScanMode)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    isBarcodeScanMode
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Mode Scan SKU / Barcode Cepat"
                >
                  <Barcode className="w-4 h-4" />
                </button>

                {totalItemCount > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-slate-400 hover:text-red-500 font-bold px-1.5 cursor-pointer"
                    title="Reset Keranjang"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Floating Barcode SKU Quick Input Bar (Autohide) */}
            {isBarcodeScanMode && (
              <form
                onSubmit={handleSkuSubmit}
                className="bg-blue-50/70 border-b border-blue-200 px-4 py-2 flex items-center gap-2 animate-in fade-in"
              >
                <Barcode className="w-5 h-5 text-blue-600 shrink-0" />
                <input
                  type="text"
                  value={manualSkuInput}
                  onChange={(e) => setManualSkuInput(e.target.value)}
                  placeholder="Ketik / Scan Barcode (misal: 89910012001) lalu tekan Enter..."
                  autoFocus
                  className="flex-1 px-3 py-1.5 bg-white border border-blue-300 rounded-xl text-base font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-xl cursor-pointer hover:bg-blue-700"
                >
                  Tambah
                </button>
              </form>
            )}

            {/* Smart Cross-Selling Strip (RitelQu AI) */}
            {crossSellItems.length > 0 && (
              <div className="bg-amber-50/70 border-b border-amber-200/80 px-4 py-1.5 flex items-center gap-2 text-sm overflow-x-auto no-scrollbar shrink-0">
                <span className="font-bold text-amber-900 flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Saran AI:</span>
                </span>
                {crossSellItems.map((cs) => (
                  <button
                    key={cs.product.id}
                    onClick={() => handleAddToCart(cs.product.id, 1)}
                    className="px-2.5 py-1 bg-white border border-amber-300 hover:bg-amber-100 rounded-lg text-slate-900 font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition shadow-2xs"
                    title={cs.reason}
                  >
                    <span>+ {cs.product.name}</span>
                    <span className="text-blue-600 font-mono">
                      (Rp {cs.product.price.toLocaleString('id-ID')})
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Category Filter Chips */}
            <div className="px-5 py-2.5 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 text-base">
              {[
                { id: 'all', label: 'Semua Produk' },
                { id: 'sembako', label: 'Sembako' },
                { id: 'makanan', label: 'Makanan & Snack' },
                { id: 'minuman', label: 'Minuman' },
                { id: 'kebersihan', label: 'Kebersihan' },
                { id: 'bumbu', label: 'Bumbu Dapur' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-4 py-1.5 rounded-full text-base font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeCategory === c.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Area List View Minimalis (Tanpa Kotak-kotak, Garis Pembatas Bawah Tipis, Huruf 16px - 24px) */}
            <section
              className="flex-1 overflow-y-auto px-5 py-3 divide-y divide-slate-100"
              id="list-container"
            >
              {filteredProducts.map((prod) => {
                const qty = cart[prod.id] || 0;
                const isSelected = qty > 0;

                return (
                  <div
                    key={prod.id}
                    onClick={() => handleAddToCart(prod.id)}
                    className={`py-4 flex justify-between items-center cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/40 -mx-5 px-5' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="pr-3 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-slate-900 uppercase tracking-tight leading-snug">
                          {prod.name}
                        </h3>
                        {isSelected && (
                          <span className="text-sm bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full font-mono">
                            x{qty}
                          </span>
                        )}
                        {prod.stock <= (prod.minStock || 5) && (
                          <span className="text-sm bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                            Sisa {prod.stock}
                          </span>
                        )}
                      </div>
                      <p className="text-base text-slate-600 mt-1">
                        SKU: {prod.sku} • Stok: {prod.stock} {prod.unit}
                      </p>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-3">
                      <div>
                        <span className="font-black text-lg text-blue-600 font-mono">
                          RP {prod.price.toLocaleString('id-ID')}
                        </span>
                      </div>

                      {/* Interactive Counter Stepper */}
                      {isSelected ? (
                        <div
                          className="flex items-center gap-1.5 bg-white border border-blue-300 rounded-lg p-1 shadow-2xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleUpdateQty(prod.id, -1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded text-sm font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-mono text-base font-bold px-1.5 text-slate-900">
                            {qty}
                          </span>
                          <button
                            onClick={() => handleUpdateQty(prod.id, 1)}
                            className="w-6 h-6 flex items-center justify-center text-blue-700 hover:bg-blue-100 rounded text-sm font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-600 transition-colors">
                          <Plus className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Area Ringkasan Pembayaran Ringkas */}
            <section className="bg-slate-50 border-t border-slate-100 px-5 py-3.5 flex justify-between items-center shrink-0">
              <div>
                <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">
                  Total Tagihan {totalItemCount > 0 ? `(${totalItemCount} Item)` : ''}
                </p>
                <p className="font-black text-lg text-slate-900 font-mono" id="grand-total">
                  RP {grandTotal.toLocaleString('id-ID')}
                </p>
              </div>

              {/* TOMBOL BIRU PROSES BAYAR */}
              <button
                onClick={handleOpenCheckout}
                disabled={grandTotal <= 0}
                className={`bg-blue-600 hover:bg-blue-700 text-white font-bold text-base uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-sm transition active:scale-98 cursor-pointer ${
                  grandTotal <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Proses Bayar
              </button>
            </section>
          </div>
        )}

        {/* ======================================================= */}
        {/* VIEW 2: STOK & CRM (📦 SMART INVENTORY & BON WARGA)     */}
        {/* ======================================================= */}
        {activeNav === 'stok' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Sub Tabs: Inventaris Stok vs Buku CRM Pelanggan & Bon */}
            <div className="border-b border-slate-200 px-5 py-2.5 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStokTab('inventaris')}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                    stokTab === 'inventaris'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Stok & Inventaris ({products.length})
                </button>
                <button
                  onClick={() => setStokTab('crm')}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                    stokTab === 'crm'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Pelanggan & Bon Warga ({customers.length})
                </button>
              </div>

              {stokTab === 'inventaris' ? (
                <button
                  onClick={() => setIsAddProductOpen(true)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Barang</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsAddCustomerOpen(true)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Warga</span>
                </button>
              )}
            </div>

            {/* TAB 1: INVENTARIS STOK */}
            {stokTab === 'inventaris' && (
              <div className="flex-1 overflow-y-auto px-5 py-3 divide-y divide-slate-100">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="py-4 flex justify-between items-center hover:bg-slate-50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-slate-900 uppercase tracking-tight">
                          {prod.name}
                        </h3>
                        <span className="text-sm bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded font-bold">
                          {prod.category}
                        </span>
                        {prod.stock <= (prod.minStock || 5) && (
                          <span className="text-sm bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded">
                            Re-Order!
                          </span>
                        )}
                      </div>

                      <p className="text-base text-slate-600">
                        SKU: <span className="font-mono">{prod.sku}</span> · Beli: Rp{' '}
                        {(prod.buyPrice || prod.price * 0.85).toLocaleString('id-ID')} · Jual: Rp{' '}
                        {prod.price.toLocaleString('id-ID')}
                      </p>

                      {prod.expiryDate && (
                        <p className="text-sm text-amber-700 font-medium">
                          Kedaluwarsa (ED): {prod.expiryDate}
                        </p>
                      )}
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="text-sm text-slate-400">Jumlah Stok</div>
                        <span className="font-black text-lg text-slate-900 font-mono">
                          {prod.stock} {prod.unit}
                        </span>
                      </div>

                      {/* Quick Stock Opnam (+ / -) */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => handleAdjustStock(prod.id, -1)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center cursor-pointer shadow-2xs"
                          title="Kurangi Stok Opnam"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleAdjustStock(prod.id, 5)}
                          className="px-2 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center cursor-pointer shadow-2xs"
                          title="Tambah 5 Stok Opnam"
                        >
                          +5
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: CRM PELANGGAN & BON WARGA */}
            {stokTab === 'crm' && (
              <div className="flex-1 overflow-y-auto px-5 py-3 divide-y divide-slate-100">
                {customers.map((cust) => (
                  <div
                    key={cust.id}
                    className="py-4 flex justify-between items-center hover:bg-slate-50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-slate-900 uppercase tracking-tight">
                          {cust.name}
                        </h3>
                        <span className="text-sm bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                          {cust.blockNumber}
                        </span>
                        <span className="text-sm bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                          {cust.points} Poin
                        </span>
                      </div>

                      <p className="text-base text-slate-600">
                        WA: {cust.phone} {cust.notes ? `· ${cust.notes}` : ''}
                      </p>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="text-sm text-slate-400">Total Bon / Hutang</div>
                        <span
                          className={`font-black text-lg font-mono ${
                            cust.totalDebt > 0 ? 'text-red-600' : 'text-emerald-600'
                          }`}
                        >
                          Rp {cust.totalDebt.toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {cust.totalDebt > 0 && (
                          <>
                            <button
                              onClick={() => handleSendDebtWa(cust)}
                              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer"
                              title="Kirim Pengingat Bon via WA"
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handlePayDebt(cust.id, cust.totalDebt)}
                              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold cursor-pointer"
                              title="Tandai Bon Lunas"
                            >
                              Lunasi
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* VIEW 3: KARYAWAN (👥 ABSENSI, DAFTAR & HAK AKSES)       */}
        {/* ======================================================= */}
        {activeNav === 'karyawan' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
            {/* TAB 1: ABSENSI & PRESENSI */}
            {karyawanTab === 'absen' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Real-time Summary Card */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                        Presensi Harian Toko
                      </span>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">
                        {new Date().toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {storeName || 'RitelQu'} • Lokasi Toko RT 04
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleShareAttendanceToWa}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition"
                        title="Bagikan Rekap Presensi ke WhatsApp Pemilik"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Kirim WA</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (employees.length > 0 && !attEmployeeId) {
                            setAttEmployeeId(employees[0].id);
                          }
                          setIsAttendanceModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Absen Masuk</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Metric Counters */}
                  <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                        Total
                      </div>
                      <div className="text-lg font-black text-slate-900 font-mono">
                        {employees.length}
                      </div>
                    </div>

                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="text-sm font-bold text-emerald-700 uppercase tracking-wider">
                        Hadir
                      </div>
                      <div className="text-lg font-black text-emerald-700 font-mono">
                        {
                          attendanceRecords.filter(
                            (r) =>
                              r.date === new Date().toISOString().split('T')[0] &&
                              r.status === 'hadir'
                          ).length
                        }
                      </div>
                    </div>

                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="text-sm font-bold text-amber-700 uppercase tracking-wider">
                        Terlambat
                      </div>
                      <div className="text-lg font-black text-amber-700 font-mono">
                        {
                          attendanceRecords.filter(
                            (r) =>
                              r.date === new Date().toISOString().split('T')[0] &&
                              r.status === 'terlambat'
                          ).length
                        }
                      </div>
                    </div>

                    <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="text-sm font-bold text-blue-700 uppercase tracking-wider">
                        Izin / Sakit
                      </div>
                      <div className="text-lg font-black text-blue-700 font-mono">
                        {
                          attendanceRecords.filter(
                            (r) =>
                              r.date === new Date().toISOString().split('T')[0] &&
                              (r.status === 'izin' || r.status === 'sakit')
                          ).length
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Log Presensi List */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <h4 className="font-bold text-sm text-slate-900">
                        Catatan Kehadiran Hari Ini (
                        {
                          attendanceRecords.filter(
                            (r) => r.date === new Date().toISOString().split('T')[0]
                          ).length
                        }
                        )
                      </h4>
                    </div>
                    <span className="text-sm text-slate-400 font-medium">Real-Time Log</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {attendanceRecords.filter(
                      (r) => r.date === new Date().toISOString().split('T')[0]
                    ).length === 0 ? (
                      <div className="py-8 text-center text-slate-400 space-y-2">
                        <Clock className="w-8 h-8 mx-auto text-slate-300" />
                        <p className="text-sm">Belum ada karyawan yang absen masuk hari ini.</p>
                        <button
                          type="button"
                          onClick={() => {
                            if (employees.length > 0 && !attEmployeeId) {
                              setAttEmployeeId(employees[0].id);
                            }
                            setIsAttendanceModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-bold rounded-xl cursor-pointer"
                        >
                          + Catat Presensi Pertama
                        </button>
                      </div>
                    ) : (
                      attendanceRecords
                        .filter((r) => r.date === new Date().toISOString().split('T')[0])
                        .map((rec) => {
                          const isHadir = rec.status === 'hadir';
                          const isTerlambat = rec.status === 'terlambat';
                          const isIzin = rec.status === 'izin';
                          const isSakit = rec.status === 'sakit';

                          return (
                            <div
                              key={rec.id}
                              className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-2xs ${
                                    rec.employeeRole === 'admin'
                                      ? 'bg-purple-600'
                                      : rec.employeeRole === 'spv'
                                      ? 'bg-emerald-600'
                                      : 'bg-blue-600'
                                  }`}
                                >
                                  {rec.employeeName
                                    .split(' ')
                                    .map((n) => n[0])
                                    .slice(0, 2)
                                    .join('')
                                    .toUpperCase()}
                                </div>

                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-sm text-slate-900">
                                      {rec.employeeName}
                                    </span>
                                    <span
                                      className={`text-sm font-black uppercase px-1.5 py-0.2 rounded ${
                                        rec.employeeRole === 'admin'
                                          ? 'bg-purple-100 text-purple-700'
                                          : rec.employeeRole === 'spv'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-blue-100 text-blue-700'
                                      }`}
                                    >
                                      {rec.employeeRole.toUpperCase()}
                                    </span>
                                  </div>

                                  <div className="text-sm text-slate-500 flex items-center gap-2">
                                    <span>
                                      Shift {rec.shift} • Masuk:{' '}
                                      <strong className="text-slate-800 font-mono">
                                        {rec.checkInTime}
                                      </strong>
                                    </span>
                                    {rec.checkOutTime ? (
                                      <span>
                                        Pulang:{' '}
                                        <strong className="text-slate-800 font-mono">
                                          {rec.checkOutTime}
                                        </strong>
                                      </span>
                                    ) : (
                                      <span className="text-emerald-600 font-semibold">
                                        (Sedang Bertugas)
                                      </span>
                                    )}
                                  </div>

                                  {rec.notes && (
                                    <p className="text-sm text-slate-400 italic">
                                      Catatan: {rec.notes}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span
                                  className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                                    isHadir
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : isTerlambat
                                      ? 'bg-amber-100 text-amber-800'
                                      : isIzin
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {rec.status.toUpperCase()}
                                </span>

                                {!rec.checkOutTime && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCheckOutAttendance(rec.id, rec.employeeName)
                                    }
                                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg cursor-pointer transition shadow-2xs"
                                    title="Catat Jam Pulang"
                                  >
                                    Pulang
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

                {/* Riwayat Lengkap Presensi Sebelumnya */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="font-bold text-sm text-slate-700 uppercase tracking-wider">
                      Semua Riwayat Presensi ({attendanceRecords.length} Catatan)
                    </h4>
                    <span className="text-sm text-slate-400">Arsip Lokal</span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar text-sm">
                    {attendanceRecords.map((ar) => (
                      <div
                        key={ar.id}
                        className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-800">{ar.employeeName}</span>{' '}
                          <span className="text-slate-400">({ar.date})</span>
                          <div className="text-sm text-slate-500">
                            Shift {ar.shift} • {ar.checkInTime}
                            {ar.checkOutTime ? ` - ${ar.checkOutTime}` : ' (Bertugas)'}
                          </div>
                        </div>
                        <span
                          className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                            ar.status === 'hadir'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {ar.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DAFTAR KARYAWAN (+) */}
            {karyawanTab === 'daftar' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Header Filter & Action */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                        Manajemen SDM
                      </span>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">
                        Daftar Karyawan Toko
                      </h3>
                      <p className="text-sm text-slate-500">
                        Kelola data staf toko, nomor WhatsApp, email, dan wewenang hak akses kasir.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddEmployeeOpen(true)}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition active:scale-98"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>(+) Tambah Karyawan</span>
                    </button>
                  </div>

                  {/* Role Filter Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                    {[
                      { id: 'all', label: `Semua (${employees.length})` },
                      {
                        id: 'spv',
                        label: `SPV (${employees.filter((e) => e.role === 'spv').length})`,
                      },
                      {
                        id: 'kasir',
                        label: `Kasir (${employees.filter((e) => e.role === 'kasir').length})`,
                      },
                      {
                        id: 'admin',
                        label: `Admin (${employees.filter((e) => e.role === 'admin').length})`,
                      },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setEmployeeRoleFilter(f.id as any)}
                        className={`px-3 py-1 rounded-xl text-sm font-bold transition cursor-pointer ${
                          employeeRoleFilter === f.id
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Employees Cards List */}
                <div className="space-y-2.5">
                  {employees
                    .filter(
                      (e) => employeeRoleFilter === 'all' || e.role === employeeRoleFilter
                    )
                    .map((emp) => {
                      const isSpv = emp.role === 'spv';
                      const isKasir = emp.role === 'kasir';
                      const isAdmin = emp.role === 'admin';
                      const isDutyCashier = activeCashierId === emp.id;

                      return (
                        <div
                          key={emp.id}
                          className={`bg-white rounded-2xl p-4 border shadow-2xs transition-all space-y-3 ${
                            isDutyCashier
                              ? 'border-blue-400 ring-2 ring-blue-400/30'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm shrink-0 shadow-2xs ${
                                  isAdmin
                                    ? 'bg-gradient-to-br from-purple-600 to-indigo-800'
                                    : isSpv
                                    ? 'bg-gradient-to-br from-emerald-600 to-teal-700'
                                    : 'bg-gradient-to-br from-blue-600 to-indigo-600'
                                }`}
                              >
                                {emp.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join('')
                                  .toUpperCase()}
                              </div>

                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-extrabold text-base text-slate-900 leading-tight">
                                    {emp.name}
                                  </h4>
                                  <span
                                    className={`text-sm font-black uppercase px-2 py-0.5 rounded-full ${
                                      isAdmin
                                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                        : isSpv
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                                    }`}
                                  >
                                    {emp.role.toUpperCase()}
                                  </span>
                                  {isDutyCashier && (
                                    <span className="text-sm bg-blue-600 text-white font-extrabold px-1.5 py-0.2 rounded shadow-2xs">
                                      Bertugas di Kasir
                                    </span>
                                  )}
                                </div>

                                <div className="text-sm text-slate-500 space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span>{emp.email}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="font-mono">{emp.phone}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleEmployeeStatus(emp.id)}
                              className={`text-sm font-bold px-2 py-1 rounded-full cursor-pointer transition ${
                                emp.status === 'aktif'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}
                              title="Klik untuk ubah status aktif/nonaktif"
                            >
                              {emp.status === 'aktif' ? '● Aktif' : '○ Nonaktif'}
                            </button>
                          </div>

                          {emp.notes && (
                            <p className="text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              {emp.notes}
                            </p>
                          )}

                          {/* Quick Actions Row */}
                          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm gap-2">
                            <div className="flex items-center gap-1.5">
                              {/* Chat WA */}
                              <a
                                href={`https://wa.me/${emp.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>WA</span>
                              </a>

                              {/* Absenkan */}
                              <button
                                type="button"
                                onClick={() => {
                                  setAttEmployeeId(emp.id);
                                  setIsAttendanceModalOpen(true);
                                }}
                                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>Absenkan</span>
                              </button>

                              {/* Set as Active Duty Cashier */}
                              {!isDutyCashier && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveCashierId(emp.id);
                                    showNotification(`${emp.name} disetel sebagai kasir bertugas.`);
                                  }}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition"
                                  title="Jadikan Staf Ini Sebagai Kasir yang Bertugas"
                                >
                                  Pilih Kasir
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {/* Role Selector dropdown */}
                              <select
                                value={emp.role}
                                onChange={(e) =>
                                  handleUpdateRole(emp.id, e.target.value as RitelEmployeeRole)
                                }
                                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 cursor-pointer focus:outline-none"
                                title="Ubah Hak Akses Staf Ini"
                              >
                                <option value="kasir">Role: Kasir</option>
                                <option value="spv">Role: SPV</option>
                                <option value="admin">Role: Admin</option>
                              </select>

                              {/* Delete Employee */}
                              <button
                                type="button"
                                onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer transition"
                                title="Hapus Karyawan"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* TAB 3: HAK AKSES (SPV, KASIR, ADMIN) */}
            {karyawanTab === 'hak_akses' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Header Info */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1.5">
                  <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                    Role-Based Access Control
                  </span>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Matriks Hak Akses & Wewenang
                  </h3>
                  <p className="text-sm text-slate-500">
                    Struktur wewenang operasional kasir toko ritel berjenjang untuk menjaga
                    keamanan stok, data omset, dan integritas pencatatan transaksi warga.
                  </p>
                </div>

                {/* 3 Role Cards */}
                <div className="space-y-3.5">
                  {/* 1. SPV (Supervisor) */}
                  <div className="bg-white rounded-2xl p-4 border border-emerald-300 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-base text-slate-900">
                            Supervisor (SPV)
                          </h4>
                          <span className="text-sm text-emerald-700 font-semibold">
                            Pengawas Operasional & Shift
                          </span>
                        </div>
                      </div>
                      <span className="text-sm bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                        Tingkat 2
                      </span>
                    </div>

                    <p className="text-sm text-slate-600">
                      Bertanggung jawab memantau operasional meja kasir, verifikasi stok opname,
                      dan absensi staf harian.
                    </p>

                    <div className="space-y-1.5 text-sm">
                      <div className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                        Wewenang & Fitur yang Diizinkan:
                      </div>
                      <div className="space-y-1 text-slate-600">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Membuka transaksi kasir & scanning barcode SKU</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Verifikasi diskon khusus promosi & pembatalan bon belanja</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Penyesuaian stok opname fisik barang (+ / - stok)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Mencatat dan memantau presensi harian seluruh kasir</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Melihat rekap omset dan transaksi kasir shift hari ini</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Dibatasi: Tidak dapat mereset database / menghapus toko</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Kasir */}
                  <div className="bg-white rounded-2xl p-4 border border-blue-300 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-blue-100 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-base text-slate-900">Kasir</h4>
                          <span className="text-sm text-blue-700 font-semibold">
                            Front-Liner Transaksi & Pembayaran
                          </span>
                        </div>
                      </div>
                      <span className="text-sm bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
                        Tingkat 1
                      </span>
                    </div>

                    <p className="text-sm text-slate-600">
                      Bertugas melayani belanja langsung warga RT 04, scanning produk, menerima
                      pembayaran tunai & digital, serta mencetak struk belanja.
                    </p>

                    <div className="space-y-1.5 text-sm">
                      <div className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                        Wewenang & Fitur yang Diizinkan:
                      </div>
                      <div className="space-y-1 text-slate-600">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Memulai sesi penjualan & scan barcode SKU cepat</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Menerima bayar Tunai, QRIS, Transfer, dan Bon Warga</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Cetak struk thermal kasir & kwitansi belanja warga</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Input presensi kehadiran masuk & pulang pribadi</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Dibatasi: Tidak dapat melihat rahasia harga modal beli</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Dibatasi: Tidak dapat menghapus riwayat transaksi permanen</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Admin */}
                  <div className="bg-white rounded-2xl p-4 border border-purple-300 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-purple-100 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold">
                          <Key className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-base text-slate-900">
                            Admin (Pemilik Toko)
                          </h4>
                          <span className="text-sm text-purple-700 font-semibold">
                            Akses Penuh Seluruh Sistem
                          </span>
                        </div>
                      </div>
                      <span className="text-sm bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full">
                        Tingkat 3 (Utama)
                      </span>
                    </div>

                    <p className="text-sm text-slate-600">
                      Otoritas tertinggi atas seluruh operasional toko, keuangan, manajemen data,
                      dan pemeliharaan aplikasi bersama tim developer.
                    </p>

                    <div className="space-y-1.5 text-sm">
                      <div className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                        Wewenang & Fitur yang Diizinkan:
                      </div>
                      <div className="space-y-1 text-slate-600">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>Akses tanpa batas ke seluruh modul, transaksi, dan stok</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>Menambah, mengedit, mengubah hak akses, & menghapus karyawan</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>Ubah profil toko, upload foto auto header, & titik GPS</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>Laporan keuangan lengkap, margin laba kotor & ekspor PDF/Excel</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>Pencadangan backup data JSON & reset data pabrik</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>Customer Care & auto-prompt perbaikan developer (Gratis)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* VIEW 4: LAPORAN & PROMOSI (📊 OMSET & MARKETING)        */}
        {/* ======================================================= */}
        {activeNav === 'laporan' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Sub-tabs: Laporan Penjualan vs Marketing & Promosi */}
            <div className="border-b border-slate-200 px-5 py-2.5 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLaporanTab('omset')}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                    laporanTab === 'omset'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Laporan Omset & Laba
                </button>
                <button
                  onClick={() => setLaporanTab('promosi')}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                    laporanTab === 'promosi'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Marketing & Promosi WA
                </button>
              </div>

              {laporanTab === 'promosi' && (
                <button
                  onClick={handleDownloadKatalog}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download katalog.html</span>
                </button>
              )}
            </div>

            {/* TAB 1: OMSET & LABA */}
            {laporanTab === 'omset' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Summary KPI Strip */}
                <div className="bg-slate-50 border-b border-slate-100 px-5 py-3.5 grid grid-cols-3 gap-3 text-base">
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">
                      Total Omset
                    </p>
                    <p className="font-black text-lg text-blue-600 font-mono mt-0.5">
                      RP {invoices.reduce((sum, i) => sum + i.total, 0).toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">
                      Estimasi Laba Bersih
                    </p>
                    <p className="font-black text-lg text-emerald-600 font-mono mt-0.5">
                      RP{' '}
                      {Math.round(
                        invoices.reduce((sum, i) => sum + i.total * 0.15, 0)
                      ).toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">
                      Transaksi
                    </p>
                    <p className="font-black text-lg text-slate-900 font-mono mt-0.5">
                      {invoices.length} Struk
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-3 divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <div
                      key={inv.id}
                      onClick={() => setPaidInvoice(inv)}
                      className="py-4 flex justify-between items-center hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-slate-500">
                            {inv.invoiceNumber}
                          </span>
                          <span
                            className={`text-sm font-bold px-2 py-0.5 rounded uppercase ${
                              inv.paymentMethod === 'bon_warga'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {inv.paymentMethod.replace('_', ' ')}
                          </span>
                        </div>

                        <h3 className="font-bold text-lg text-slate-900 uppercase tracking-tight">
                          {inv.customerName}
                        </h3>

                        <p className="text-base text-slate-600">
                          {inv.items.map((i) => `${i.name} (x${i.qty})`).join(', ')}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-lg text-blue-600 font-mono">
                          RP {inv.total.toLocaleString('id-ID')}
                        </span>
                        <div className="text-sm text-slate-400 mt-0.5">
                          {new Date(inv.createdAt).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: MARKETING & PROMOSI WA */}
            {laporanTab === 'promosi' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-2">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-lg">
                    <Share2 className="w-5 h-5 text-blue-600" />
                    <span>Broadcast Promosi WhatsApp Warga</span>
                  </div>
                  <p className="text-base text-blue-800 leading-relaxed">
                    Kirimkan daftar promo sembako hemat hari ini langsung ke grup WhatsApp RT 04
                    dengan satu kali klik via wa.me:
                  </p>
                  <button
                    onClick={handleBroadcastPromoWa}
                    className="mt-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Buka WhatsApp & Kirim Promo</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-lg">
                      Generator Berkas Standalone
                    </span>
                    <span className="text-sm bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                      Offline-First
                    </span>
                  </div>
                  <p className="text-base text-slate-600">
                    Unduh file mandiri yang dapat dibuka langsung di perangkat mana pun tanpa instalasi:
                  </p>
                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <button
                      onClick={handleDownloadKatalog}
                      className="p-3 bg-white border border-slate-200 hover:border-blue-500 rounded-xl text-left cursor-pointer transition shadow-2xs"
                    >
                      <Download className="w-4 h-4 text-blue-600 mb-1" />
                      <div className="font-bold text-sm text-slate-900">katalog.html</div>
                      <div className="text-sm text-slate-500">Katalog digital interaktif</div>
                    </button>

                    <button
                      onClick={handleDownloadKasir}
                      className="p-3 bg-white border border-slate-200 hover:border-blue-500 rounded-xl text-left cursor-pointer transition shadow-2xs"
                    >
                      <ShoppingBag className="w-4 h-4 text-blue-600 mb-1" />
                      <div className="font-bold text-sm text-slate-900">kasir.html</div>
                      <div className="text-sm text-slate-500">Kasir mobile HP kedua</div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* VIEW 4: PENGATURAN, PROFIL, STRUK & CUSTOMER CARE (⚙️)  */}
        {/* ======================================================= */}
        {activeNav === 'pengaturan' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
            {/* Sub-Tabs Pengaturan: Ubah Profil | Customer Care | Data & Sistem */}
            <div className="border-b border-slate-200 px-4 py-2 bg-white flex items-center justify-between shrink-0 shadow-2xs">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full">
                <button
                  onClick={() => setPengaturanTab('profil')}
                  className={`px-3 py-1.5 rounded-xl text-sm font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    pengaturanTab === 'profil'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Ubah Profil & Struk</span>
                </button>

                <button
                  onClick={() => setPengaturanTab('care')}
                  className={`px-3 py-1.5 rounded-xl text-sm font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    pengaturanTab === 'care'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Headphones className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Customer Care</span>
                  <span className="text-sm bg-emerald-500 text-white px-1.5 py-0.2 rounded-full font-extrabold">
                    Gratis
                  </span>
                </button>

                <button
                  onClick={() => setPengaturanTab('sistem')}
                  className={`px-3 py-1.5 rounded-xl text-sm font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    pengaturanTab === 'sistem'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Data & Sistem</span>
                </button>
              </div>
            </div>

            {/* TAB 1: UBAH PROFIL (sebelumnya pengaturan toko dan manajemen cabang) & CARD CONTOH STRUK PDF */}
            {pengaturanTab === 'profil' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* CARD 1: FORM UBAH PROFIL & AUTO HEADER */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-4">
                  <div className="border-b border-slate-100 pb-2.5">
                    <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                      Identitas Toko
                    </span>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">
                      Ubah Profil
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Perbarui profil toko, nama pemilik, alamat, sharelok peta, dan pasang foto banner auto header toko.
                    </p>
                  </div>

                  <div className="space-y-3.5 text-sm">
                    {/* Nama Toko */}
                    <div>
                      <label className="font-bold text-slate-700 block text-sm uppercase tracking-wider">
                        Nama Toko <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="Contoh: Toko Kelontong Berkah RT 04"
                        className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>

                    {/* Nama Pemilik */}
                    <div>
                      <label className="font-bold text-slate-700 block text-sm uppercase tracking-wider">
                        Nama Pemilik <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="Contoh: Ibu Sri Wahyuni / Pak RT Bambang"
                        className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>

                    {/* Nomor WhatsApp */}
                    <div>
                      <label className="font-bold text-slate-700 block text-sm uppercase tracking-wider">
                        Nomor WhatsApp Toko
                      </label>
                      <input
                        type="text"
                        value={storePhone}
                        onChange={(e) => setStorePhone(e.target.value)}
                        placeholder="081234567890"
                        className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>

                    {/* Alamat */}
                    <div>
                      <label className="font-bold text-slate-700 block text-sm uppercase tracking-wider">
                        Alamat
                      </label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={2}
                        placeholder="Alamat lengkap toko warga..."
                        className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>

                    {/* Sharelok */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-700 text-sm uppercase tracking-wider">
                          Sharelok (Link Google Maps)
                        </label>
                        <button
                          type="button"
                          onClick={handleGetGpsLocation}
                          className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          <span>Ambil Lokasi GPS</span>
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={shareloc}
                          onChange={(e) => setShareloc(e.target.value)}
                          placeholder="https://maps.google.com/?q=-6.2000,106.8166"
                          className="flex-1 p-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500 bg-slate-50/50 truncate"
                        />
                        {shareloc && (
                          <a
                            href={shareloc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                            title="Buka Link Peta di Tab Baru"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Peta</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Foto Toko (Kompres) Auto Header */}
                    <div className="space-y-2 pt-1 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-700 text-sm uppercase tracking-wider flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-blue-600" />
                          <span>Foto Toko (Kompres) Auto Header</span>
                        </label>
                        {headerPhoto && (
                          <button
                            type="button"
                            onClick={() => {
                              setHeaderPhoto('');
                              setCompressionFeedback('');
                              showNotification('Foto header toko dihapus.');
                            }}
                            className="text-sm text-red-600 hover:text-red-700 font-bold cursor-pointer"
                          >
                            Hapus Foto
                          </button>
                        )}
                      </div>

                      {/* File Upload Input */}
                      <div className="relative">
                        <input
                          type="file"
                          id="foto-toko-input"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="foto-toko-input"
                          className="w-full p-3 border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50/80 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition text-blue-800 text-sm font-bold"
                        >
                          <Camera className="w-4 h-4 text-blue-600" />
                          <span>
                            {headerPhoto ? 'Pilih / Ganti Foto Toko' : 'Unggah Foto Toko (Auto Kompres)'}
                          </span>
                        </label>
                      </div>

                      {isCompressingPhoto && (
                        <div className="text-sm text-blue-600 font-semibold flex items-center gap-1.5 animate-pulse">
                          <Sparkles className="w-3.5 h-3.5 animate-spin" />
                          <span>Mengompres foto toko ke ukuran hemat & optimal...</span>
                        </div>
                      )}

                      {compressionFeedback && (
                        <p className="text-sm text-slate-600 bg-slate-100 p-2 rounded-lg font-mono">
                          ℹ️ {compressionFeedback}
                        </p>
                      )}

                      {/* Live Auto Header Banner Preview */}
                      {headerPhoto && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 shadow-2xs relative">
                          <div
                            className="h-24 w-full bg-cover bg-center relative p-3 flex flex-col justify-end"
                            style={{
                              backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.88), rgba(30, 58, 138, 0.8)), url(${headerPhoto})`,
                            }}
                          >
                            <span className="absolute top-2 right-2 text-sm bg-emerald-500 text-white font-black px-2 py-0.5 rounded-full shadow-xs">
                              Live Preview Auto Header
                            </span>
                            <div className="text-white drop-shadow-xs">
                              <h4 className="font-extrabold text-sm uppercase leading-tight">
                                {storeName || 'RitelQu'}
                              </h4>
                              <p className="text-sm text-blue-100 opacity-90 line-clamp-1">
                                Pemilik: {ownerName} • {address}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tombol Simpan Auto Header */}
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl uppercase tracking-wider shadow-sm transition active:scale-98 cursor-pointer flex items-center justify-center gap-2 mt-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>(Simpan) Auto Header</span>
                    </button>
                  </div>
                </div>

                {/* CARD 2: (CARD CONTOH STRUK PDF) */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div>
                      <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                        Thermal Printer & POS
                      </span>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">
                        Contoh Struk Belanja Kasir (PDF / Cetak)
                      </h3>
                    </div>

                    {/* Paper Width Toggle: 58mm vs 80mm */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-sm font-mono font-bold">
                      <button
                        type="button"
                        onClick={() => setStrukWidth('58mm')}
                        className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                          strukWidth === '58mm'
                            ? 'bg-white text-blue-600 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        58 mm
                      </button>
                      <button
                        type="button"
                        onClick={() => setStrukWidth('80mm')}
                        className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                          strukWidth === '80mm'
                            ? 'bg-white text-blue-600 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        80 mm
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-500">
                    Format struk thermal resmi siap cetak Bluetooth atau simpan sebagai berkas PDF.
                  </p>

                  {/* REALISTIC THERMAL RECEIPT PREVIEW (PAPER EFFECT) */}
                  <div
                    className={`mx-auto bg-stone-50 border border-slate-300 rounded-xl p-4 font-mono text-slate-800 shadow-inner select-text transition-all ${
                      strukWidth === '58mm' ? 'max-w-[290px] text-sm' : 'max-w-[370px] text-sm'
                    }`}
                  >
                    {/* Header Struk */}
                    <div className="text-center space-y-0.5 pb-2">
                      <div className="font-black text-sm uppercase tracking-wide text-slate-900">
                        {storeName || 'TOKO KELONTONG BERKAH RT 04'}
                      </div>
                      <div className="text-sm text-slate-600">
                        Pemilik: {ownerName || 'Ibu Sri Wahyuni / Pak RT'}
                      </div>
                      <div className="text-sm text-slate-600 leading-tight">
                        {address || 'Jl. Graha Kencana Raya RT 04 / RW 02'}
                      </div>
                      <div className="text-sm text-slate-600">
                        Telp/WA: {storePhone || '081234567890'}
                      </div>
                      {shareloc && (
                        <div className="text-sm text-blue-700 underline truncate pt-0.5">
                          Maps: {shareloc}
                        </div>
                      )}
                    </div>

                    <div className="border-b border-dashed border-slate-400 my-2"></div>

                    {/* Metadata Struk */}
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>{new Date().toLocaleDateString('id-ID')}</span>
                      <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Kasir: Bu RT / Hendra</span>
                      <span>No: INV-RIT-SAMPLE-01</span>
                    </div>

                    <div className="border-b border-dashed border-slate-400 my-2"></div>

                    {/* Item List */}
                    <div className="space-y-1.5 py-1">
                      <div className="flex justify-between">
                        <span className="font-semibold truncate">Minyak Goreng 2L Pouch</span>
                        <span className="text-right shrink-0 ml-2">34.000</span>
                      </div>
                      <div className="text-sm text-slate-500 pl-2">1 x 34.000</div>

                      <div className="flex justify-between">
                        <span className="font-semibold truncate">Beras Premium 5KG</span>
                        <span className="text-right shrink-0 ml-2">72.500</span>
                      </div>
                      <div className="text-sm text-slate-500 pl-2">1 x 72.500</div>

                      <div className="flex justify-between">
                        <span className="font-semibold truncate">Gula Pasir 1KG</span>
                        <span className="text-right shrink-0 ml-2">34.000</span>
                      </div>
                      <div className="text-sm text-slate-500 pl-2">2 x 17.000</div>

                      <div className="flex justify-between">
                        <span className="font-semibold truncate">Telur Ayam Segar 1KG</span>
                        <span className="text-right shrink-0 ml-2">28.000</span>
                      </div>
                      <div className="text-sm text-slate-500 pl-2">1 x 28.000</div>
                    </div>

                    <div className="border-b border-dashed border-slate-400 my-2"></div>

                    {/* Totals */}
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>Rp 168.500</span>
                      </div>
                      <div className="flex justify-between text-emerald-700">
                        <span>Diskon Warga:</span>
                        <span>-Rp 5.000</span>
                      </div>
                      <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-300">
                        <span>TOTAL TAGIHAN:</span>
                        <span>RP 163.500</span>
                      </div>
                      <div className="flex justify-between pt-0.5">
                        <span>Bayar (QRIS/Tunai):</span>
                        <span>Rp 163.500</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kembalian:</span>
                        <span>Rp 0</span>
                      </div>
                    </div>

                    <div className="border-b border-dashed border-slate-400 my-2"></div>

                    {/* Footer Struk */}
                    <div className="text-center text-sm text-slate-600 space-y-0.5 pt-1">
                      <p className="font-bold">Terima Kasih Telah Berbelanja!</p>
                      <p>Barang yang sudah dibeli tidak dapat ditukar.</p>
                      <p className="text-sm text-slate-400 pt-0.5">
                        AppQu POS RitelQu • Solusi Cerdas Masa Kini
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons for Receipt */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handlePrintSampleStruk}
                      className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak / Simpan PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShareSampleStrukWa}
                      className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Bagikan ke WA</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CUSTOMER CARE (sebelumnya RitelQu AI) & AUTO PROMPT DEVELOPER */}
            {pengaturanTab === 'care' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Header Banner Customer Care */}
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold text-blue-100">
                        <Headphones className="w-5 h-5 text-emerald-300" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-lg uppercase tracking-tight">Customer Care</h3>
                          <span className="text-sm bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-full">
                            100% Gratis
                          </span>
                        </div>
                        <p className="text-sm text-blue-100">
                          Pusat Bantuan & Asisten Pintar Operasional Toko Ritel
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleDraftSupportEmail}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email Support</span>
                    </button>
                  </div>
                </div>

                {/* FITUR KHUSUS: KELUHAN / MASALAH KODING APP - AUTO PROMPT PERBAIKAN DEVELOPER (GRATIS) */}
                <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-2xs space-y-3.5">
                  <div className="border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                        Layanan Bantuan Pengembang
                      </span>
                      <span className="text-sm bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.2 rounded-full">
                        Gratis
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                      Keluhan / Masalah Koding App
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
                      Mengalami bug tampilan, scanner macet, atau ingin request fitur koding baru?
                      Sistem akan membuat <strong>Auto Prompt Terstruktur</strong> yang siap dikirimkan
                      ke developer untuk perbaikan langsung tanpa ribet!
                    </p>
                  </div>

                  <div className="space-y-3 text-sm">
                    {/* Kategori Kendala */}
                    <div>
                      <label className="font-bold text-slate-700 block text-sm uppercase tracking-wider mb-1.5">
                        Kategori Masalah / Permintaan
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 text-sm">
                        {[
                          '🐛 Bug / Error Tampilan UI',
                          '⚡ Kasir & Perhitungan Transaksi',
                          '🔍 Pemindaian Barcode / Scanner',
                          '🖨️ Cetak Struk / Printer Thermal',
                          '📦 Manajemen Stok & CRM Bon Warga',
                          '✨ Permintaan Fitur Koding Baru',
                          '⚠️ Error Sistem / Lainnya',
                        ].map((cat, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setDevCategory(cat)}
                            className={`p-2 rounded-xl font-bold text-left transition cursor-pointer border ${
                              devCategory === cat
                                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Detail Keluhan */}
                    <div>
                      <label className="font-bold text-slate-700 block text-sm uppercase tracking-wider">
                        Detail Keluhan / Masalah Koding <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={devDescription}
                        onChange={(e) => setDevDescription(e.target.value)}
                        rows={3}
                        placeholder="Contoh: Pada HP layar kecil, tombol scan barcode terhalang keyboard, atau struk kepotong di sisi kanan..."
                        className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>

                    {/* Pesan Error / Log Teknis (Opsional) */}
                    <div>
                      <label className="font-bold text-slate-700 block text-sm uppercase tracking-wider">
                        Pesan Error / Log Teknis (Opsional)
                      </label>
                      <textarea
                        value={devErrorLog}
                        onChange={(e) => setDevErrorLog(e.target.value)}
                        rows={2}
                        placeholder="Contoh error di konsol / deskripsi langkah..."
                        className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>

                    {/* Tombol Generate Auto Prompt */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleGenerateDevPrompt}
                        className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-xs transition active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Generate Auto-Prompt Developer</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleAskAiAboutDevIssue}
                        disabled={!devDescription.trim()}
                        className="py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-sm uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <Bot className="w-4 h-4 text-indigo-600" />
                        <span>Analisis Solusi AI Instan</span>
                      </button>
                    </div>

                    {/* HASIL GENERATED AUTO PROMPT */}
                    {generatedDevPrompt && (
                      <div className="mt-3 p-3.5 bg-slate-900 text-slate-100 rounded-xl space-y-3 border border-slate-800">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-1.5">
                            <FileCheck className="w-4 h-4 text-emerald-400" />
                            <span className="font-bold text-sm text-emerald-400 uppercase tracking-wider">
                              Auto-Prompt Siap Dikirim ke Developer
                            </span>
                          </div>
                          <span className="text-sm bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
                            Markdown Format
                          </span>
                        </div>

                        {/* Raw Prompt Preview */}
                        <pre className="text-sm font-mono text-slate-300 bg-slate-950 p-2.5 rounded-lg overflow-x-auto max-h-48 whitespace-pre-wrap leading-relaxed">
                          {generatedDevPrompt.promptMarkdown}
                        </pre>

                        {/* Prompt Action Buttons */}
                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={handleCopyDevPrompt}
                            className={`py-2 px-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-1 transition cursor-pointer ${
                              isPromptCopied
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}
                          >
                            {isPromptCopied ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{isPromptCopied ? 'Tersalin!' : 'Salin Prompt'}</span>
                          </button>

                          <a
                            href={generatedDevPrompt.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-1 cursor-pointer transition"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Kirim WA</span>
                          </a>

                          <a
                            href={generatedDevPrompt.emailMailto}
                            className="py-2 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-1 cursor-pointer transition"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Kirim Email</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* KONSULTASI INTERAKTIF AI CUSTOMER CARE */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[420px]">
                  <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-sm text-slate-800 uppercase tracking-wide">
                        Asisten AI Customer Care
                      </span>
                    </div>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                      Offline + Cloud Brain
                    </span>
                  </div>

                  {/* Consultation Quick Chips */}
                  <div className="p-2 border-b border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto no-scrollbar text-sm">
                    {[
                      { label: '🔍 Cek Stok Menipis', prompt: 'Barang apa saja yang stoknya menipis dan perlu di-reorder?' },
                      { label: '💡 Strategi Promo', prompt: 'Berikan ide bundling sembako hemat untuk warga minggu ini.' },
                      { label: '📋 Rekap Bon Warga', prompt: 'Bagaimana status piutang bon warga dan tips penagihan santun?' },
                      { label: '🖨️ Printer Thermal', prompt: 'Bagaimana panduan setting printer thermal Bluetooth 58mm?' },
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendAiPrompt(chip.prompt)}
                        className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 text-sm font-semibold whitespace-nowrap border border-slate-200 cursor-pointer"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  {/* Conversation Stream */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-sm">
                    {aiChatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-3 shadow-2xs space-y-1 ${
                            msg.sender === 'user'
                              ? 'bg-blue-600 text-white rounded-br-xs'
                              : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between text-sm opacity-75 gap-2">
                            <span className="font-bold">
                              {msg.sender === 'user' ? 'Anda' : 'Customer Care AI'}
                            </span>
                            <span>{msg.time}</span>
                          </div>
                          <p className="text-sm whitespace-pre-line leading-relaxed">
                            {msg.text}
                          </p>
                        </div>
                      </div>
                    ))}

                    {isAiLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-slate-500 text-sm flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                          <span>Menganalisis jawaban terbaik...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-1.5 shrink-0">
                    <input
                      type="text"
                      value={aiChatInput}
                      onChange={(e) => setAiChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendAiPrompt()}
                      placeholder="Ketik pertanyaan atau kendala operasional toko..."
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleSendAiPrompt()}
                      disabled={!aiChatInput.trim() || isAiLoading}
                      className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl cursor-pointer shadow-xs transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: DATA & REPLIKASI CABANG */}
            {pengaturanTab === 'sistem' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Thermal Printer Settings */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-base">
                    <Printer className="w-4 h-4 text-blue-600" />
                    <span>Koneksi Printer Struk Thermal</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Mendukung printer thermal Bluetooth / USB standar ESC/POS ukuran 58mm dan 80mm
                    (RPP02N, Panda, Iware, Zywell, VSC). Anda dapat menguji cetak via Card Contoh Struk PDF di tab Ubah Profil.
                  </p>
                </div>

                {/* Standalone Replikasi Cabang */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Replikasi Modul Cabang</h3>
                      <p className="text-sm text-slate-500">
                        Hasilkan file modul cabang mandiri untuk membuka kasir cabang di lokasi lain.
                      </p>
                    </div>
                    <button
                      onClick={handleDownloadCabang}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>cabang_modul.html</span>
                    </button>
                  </div>
                </div>

                {/* Generator File Mandiri: katalog.html & kasir.html */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm">Generator File Standalone</h3>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={handleDownloadKatalog}
                      className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl text-left cursor-pointer transition shadow-2xs"
                    >
                      <Download className="w-4 h-4 text-blue-600 mb-1" />
                      <div className="font-bold text-sm text-slate-900">katalog.html</div>
                      <div className="text-sm text-slate-500">Katalog digital belanja WA</div>
                    </button>

                    <button
                      onClick={handleDownloadKasir}
                      className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl text-left cursor-pointer transition shadow-2xs"
                    >
                      <ShoppingBag className="w-4 h-4 text-blue-600 mb-1" />
                      <div className="font-bold text-sm text-slate-900">kasir.html</div>
                      <div className="text-sm text-slate-500">Kasir mandiri HP kedua</div>
                    </button>
                  </div>
                </div>

                {/* Data Management: Backup & Restore */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm">Pencadangan & Pemulihan Data</h3>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => {
                        const json = RitelStorageService.exportBackupJson();
                        const blob = new Blob([json], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `backup-ritelqu-${Date.now()}.json`;
                        a.click();
                        showNotification('Backup JSON berhasil diunduh!');
                      }}
                      className="p-2.5 bg-slate-50 border border-slate-300 hover:bg-slate-100 rounded-xl text-sm font-bold text-slate-800 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Backup JSON</span>
                    </button>

                    <button
                      onClick={() => {
                        const input = prompt('Tempelkan isi JSON backup untuk me-restore data:');
                        if (input) {
                          const ok = RitelStorageService.restoreBackupJson(input);
                          if (ok) {
                            setProducts(RitelStorageService.getProducts());
                            setInvoices(RitelStorageService.getInvoices());
                            setCustomers(RitelStorageService.getCustomers());
                            const p = RitelStorageService.getStoreProfile();
                            setStoreName(p.storeName);
                            setOwnerName(p.ownerName);
                            setStorePhone(p.phone);
                            setAddress(p.address);
                            setShareloc(p.shareloc);
                            setHeaderPhoto(p.headerPhoto);
                            showNotification('Data RitelQu berhasil dipulihkan!');
                          } else {
                            showNotification('Format JSON tidak valid.');
                          }
                        }
                      }}
                      className="p-2.5 bg-slate-50 border border-slate-300 hover:bg-slate-100 rounded-xl text-sm font-bold text-slate-800 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Data</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Yakin ingin mereset database RitelQu ke setelan awal pabrik?')) {
                          RitelStorageService.resetDatabase();
                          setProducts(RitelStorageService.getProducts());
                          setInvoices(RitelStorageService.getInvoices());
                          setCustomers(RitelStorageService.getCustomers());
                          showNotification('Database RitelQu berhasil di-reset.');
                        }
                      }}
                      className="p-2.5 bg-red-50 border border-red-200 hover:bg-red-100 rounded-xl text-sm font-bold text-red-700 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Reset Data</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* NAVBAR BAWAH (MOBILE FIRST NAVIGATION) - HANYA IKON       */}
      {/* ========================================================= */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex justify-around items-center px-3 z-20 text-slate-600 shadow-xs select-none">
        {/* 1. Kasir 🛍️ */}
        <button
          type="button"
          onClick={() => setActiveNav('kasir')}
          title="Kasir & Transaksi"
          aria-label="Kasir"
          className={`flex items-center justify-center flex-1 h-full transition-all cursor-pointer relative ${
            activeNav === 'kasir' ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'
          }`}
        >
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              activeNav === 'kasir'
                ? 'bg-blue-50 text-blue-600 scale-105 shadow-2xs'
                : 'hover:bg-slate-50'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
          </div>
          {activeNav === 'kasir' && (
            <span className="absolute bottom-1 w-2 h-1 rounded-full bg-blue-600"></span>
          )}
        </button>

        {/* 2. Stok 📦 */}
        <button
          type="button"
          onClick={() => setActiveNav('stok')}
          title="Stok & CRM Pelanggan"
          aria-label="Stok"
          className={`flex items-center justify-center flex-1 h-full transition-all cursor-pointer relative ${
            activeNav === 'stok' ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'
          }`}
        >
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              activeNav === 'stok'
                ? 'bg-blue-50 text-blue-600 scale-105 shadow-2xs'
                : 'hover:bg-slate-50'
            }`}
          >
            <Package className="w-5 h-5" />
          </div>
          {activeNav === 'stok' && (
            <span className="absolute bottom-1 w-2 h-1 rounded-full bg-blue-600"></span>
          )}
        </button>

        {/* 3. Karyawan 👥 */}
        <button
          type="button"
          onClick={() => setActiveNav('karyawan')}
          title="Karyawan & Absensi"
          aria-label="Karyawan"
          className={`flex items-center justify-center flex-1 h-full transition-all cursor-pointer relative ${
            activeNav === 'karyawan' ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'
          }`}
        >
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              activeNav === 'karyawan'
                ? 'bg-blue-50 text-blue-600 scale-105 shadow-2xs'
                : 'hover:bg-slate-50'
            }`}
          >
            <Users className="w-5 h-5" />
          </div>
          {activeNav === 'karyawan' && (
            <span className="absolute bottom-1 w-2 h-1 rounded-full bg-blue-600"></span>
          )}
        </button>

        {/* 4. Laporan 📊 */}
        <button
          type="button"
          onClick={() => setActiveNav('laporan')}
          title="Laporan & Keuangan"
          aria-label="Laporan"
          className={`flex items-center justify-center flex-1 h-full transition-all cursor-pointer relative ${
            activeNav === 'laporan' ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'
          }`}
        >
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              activeNav === 'laporan'
                ? 'bg-blue-50 text-blue-600 scale-105 shadow-2xs'
                : 'hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
          </div>
          {activeNav === 'laporan' && (
            <span className="absolute bottom-1 w-2 h-1 rounded-full bg-blue-600"></span>
          )}
        </button>

        {/* 5. Pengaturan ⚙️ */}
        <button
          type="button"
          onClick={() => setActiveNav('pengaturan')}
          title="Pengaturan & Customer Care"
          aria-label="Pengaturan"
          className={`flex items-center justify-center flex-1 h-full transition-all cursor-pointer relative ${
            activeNav === 'pengaturan' ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'
          }`}
        >
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              activeNav === 'pengaturan'
                ? 'bg-blue-50 text-blue-600 scale-105 shadow-2xs'
                : 'hover:bg-slate-50'
            }`}
          >
            <Settings className="w-5 h-5" />
          </div>
          {activeNav === 'pengaturan' && (
            <span className="absolute bottom-1 w-2 h-1 rounded-full bg-blue-600"></span>
          )}
        </button>
      </nav>

      {/* ========================================================= */}
      {/* MODAL 1: CHECKOUT & PROSES BAYAR                          */}
      {/* ========================================================= */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-slate-900 uppercase tracking-tight">
                Pembayaran Belanja
              </h3>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-base space-y-1.5">
              <div className="flex justify-between text-slate-500">
                <span>Pelanggan:</span>
                <span className="font-bold text-slate-900">{customerName}</span>
              </div>
              <div className="flex justify-between text-slate-500 items-center">
                <span>Total Belanja:</span>
                <span className="font-black text-blue-600 font-mono text-lg">
                  RP {grandTotal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-base font-bold text-slate-700 uppercase tracking-wider block">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-sm">
                {[
                  { id: 'tunai', label: 'Tunai' },
                  { id: 'qris', label: 'QRIS' },
                  { id: 'transfer', label: 'Transfer' },
                  { id: 'bon_warga', label: 'Bon Warga' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`py-2 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      paymentMethod === m.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === 'tunai' && (
              <div className="space-y-2">
                <div>
                  <label className="text-base font-bold text-slate-700 uppercase tracking-wider block">
                    Uang Tunai Diterima (Rp)
                  </label>
                  <input
                    type="number"
                    value={cashGiven}
                    onChange={(e) => setCashGiven(Number(e.target.value))}
                    className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 font-mono font-bold text-lg"
                  />
                </div>

                {/* Quick Cash Presets */}
                <div className="grid grid-cols-3 gap-2">
                  {[grandTotal, 50000, 100000].map((amt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCashGiven(amt)}
                      className="py-1.5 bg-slate-100 hover:bg-slate-200 text-sm font-mono font-bold rounded-lg text-slate-700 cursor-pointer"
                    >
                      {amt === grandTotal ? 'Pas' : `Rp ${amt.toLocaleString('id-ID')}`}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between text-base pt-1 text-slate-500">
                  <span>Kembalian:</span>
                  <span className="font-mono font-black text-slate-900 text-lg">
                    RP {Math.max(0, cashGiven - grandTotal).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === 'bon_warga' && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-sm text-amber-900">
                Tagihan sebesar <strong>Rp {grandTotal.toLocaleString('id-ID')}</strong> akan
                tercatat otomatis ke buku bon piutang warga: <strong>{customerName}</strong>.
              </div>
            )}

            <div>
              <label className="text-base font-bold text-slate-700 uppercase tracking-wider block">
                Catatan Transaksi
              </label>
              <textarea
                value={checkoutNotes}
                onChange={(e) => setCheckoutNotes(e.target.value)}
                placeholder="Catatan belanja / pesanan..."
                rows={2}
                className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 text-base"
              />
            </div>

            <button
              onClick={handleConfirmPayment}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base uppercase tracking-wider rounded-xl shadow-sm active:scale-98 cursor-pointer"
            >
              Konfirmasi & Selesai
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: KWITANSI RESMI BELANJA RITELQU LUNAS             */}
      {/* ========================================================= */}
      {paidInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="text-center border-b border-slate-200 pb-3">
              <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                {storeName}
              </span>
              <h3 className="font-black text-lg text-slate-900 mt-1">Struk Pembayaran</h3>
              <p className="text-sm font-mono text-slate-400 mt-0.5">{paidInvoice.invoiceNumber}</p>
            </div>

            <div className="text-base space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Pembeli:</span>
                <span className="font-bold text-slate-900">{paidInvoice.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode:</span>
                <span className="uppercase font-semibold">{paidInvoice.paymentMethod}</span>
              </div>
            </div>

            <div className="border-t border-b border-slate-100 py-3 space-y-2">
              {paidInvoice.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center text-base">
                  <span className="text-slate-800">
                    {it.name} (x{it.qty})
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    RP {(it.price * it.qty).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Tagihan:</span>
              <span className="text-lg font-black font-mono text-blue-600">
                RP {paidInvoice.total.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  window.print();
                  showNotification('Mencetak struk kasir thermal...');
                }}
                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-base flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak</span>
              </button>
              <button
                onClick={() => setPaidInvoice(null)}
                className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: INPUT BARANG BARU                                */}
      {/* ========================================================= */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-slate-900 uppercase tracking-tight">
                Tambah Barang Baru
              </h3>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 text-base">
              <div>
                <label className="font-bold text-slate-700 block">Nama Produk</label>
                <input
                  type="text"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Contoh: Terigu Segitiga Biru 1KG"
                  className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 text-base"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block">Kategori</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as any)}
                    className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 text-base"
                  >
                    <option value="sembako">Sembako</option>
                    <option value="makanan">Makanan & Snack</option>
                    <option value="minuman">Minuman</option>
                    <option value="kebersihan">Kebersihan</option>
                    <option value="bumbu">Bumbu Dapur</option>
                    <option value="rokok_korek">Rokok & Korek</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block">Satuan Unit</label>
                  <input
                    type="text"
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    placeholder="Pcs / Kg / Dus"
                    className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block">Harga Beli (Modal)</label>
                  <input
                    type="number"
                    value={newProdBuyPrice}
                    onChange={(e) => setNewProdBuyPrice(Number(e.target.value))}
                    className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 font-mono text-base"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block">Harga Jual</label>
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 font-mono text-base font-bold text-blue-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block">Stok Awal</label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 font-mono text-base font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block">Kedaluwarsa (ED)</label>
                  <input
                    type="date"
                    value={newProdExpiry}
                    onChange={(e) => setNewProdExpiry(e.target.value)}
                    className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base uppercase tracking-wider rounded-xl shadow-sm cursor-pointer"
              >
                Simpan ke Stok
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: INPUT PELANGGAN BARU (CRM)                       */}
      {/* ========================================================= */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-slate-900 uppercase tracking-tight">
                Tambah Warga / Member
              </h3>
              <button
                onClick={() => setIsAddCustomerOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3 text-base">
              <div>
                <label className="font-bold text-slate-700 block">Nama Warga / Pelanggan</label>
                <input
                  type="text"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="Contoh: Ibu Ani"
                  className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 text-base"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block">Nomor WhatsApp</label>
                <input
                  type="text"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 font-mono text-base"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block">Blok Rumah</label>
                <input
                  type="text"
                  value={newCustBlock}
                  onChange={(e) => setNewCustBlock(e.target.value)}
                  placeholder="Blok C2 No. 08"
                  className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 text-base"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base uppercase tracking-wider rounded-xl shadow-sm cursor-pointer"
              >
                Daftarkan Member
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: SMART SPEECH-TO-TEXT ASSISTANT MODAL             */}
      {/* ========================================================= */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-lg text-slate-900">Input Suara RitelQu AI</h3>
              </div>
              <button
                onClick={() => setIsVoiceModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600">
              Ketik atau sebutkan nama barang dan jumlahnya. RitelQu AI akan mencocokkan stok barang
              secara presisi:
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={voiceQueryText}
                onChange={(e) => setVoiceQueryText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && processVoiceMatch(voiceQueryText)}
                placeholder="Contoh: Minyak goreng dua pouch..."
                autoFocus
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-base focus:outline-none focus:border-blue-500 font-medium"
              />

              <div className="text-sm text-slate-500 font-bold uppercase tracking-wide">
                Contoh Cepat:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Minyak goreng 2 pouch',
                  'Beras 1 sak',
                  'Gula pasir 2 pcs',
                  'Kopi 1 renteng',
                  'Telur 1 kg',
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => processVoiceMatch(sample)}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold cursor-pointer hover:bg-blue-100"
                  >
                    + "{sample}"
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => processVoiceMatch(voiceQueryText)}
              disabled={!voiceQueryText.trim()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-base rounded-xl cursor-pointer"
            >
              Cocokkan & Masukkan Keranjang
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: TAMBAH KARYAWAN BARU (+)                         */}
      {/* ========================================================= */}
      {isAddEmployeeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-lg text-slate-900">Tambah Karyawan Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEmployeeOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-3 text-sm">
              <div>
                <label className="font-bold text-slate-700 block text-sm">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  placeholder="Contoh: Rina Anggraini"
                  className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block text-sm">Email Karyawan</label>
                <input
                  type="email"
                  value={empEmail}
                  onChange={(e) => setEmpEmail(e.target.value)}
                  placeholder="Contoh: rina.kasir@ritelqu.id"
                  className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block text-sm">
                  Nomor WhatsApp (WA) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={empPhone}
                  onChange={(e) => setEmpPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block text-sm">
                  Hak Akses / Wewenang
                </label>
                <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                  {[
                    { id: 'kasir' as const, label: 'Kasir', desc: 'Front-liner' },
                    { id: 'spv' as const, label: 'SPV', desc: 'Pengawas' },
                    { id: 'admin' as const, label: 'Admin', desc: 'Akses Penuh' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setEmpRole(r.id)}
                      className={`p-2 rounded-xl text-center cursor-pointer transition ${
                        empRole === r.id
                          ? 'bg-blue-600 text-white shadow-2xs font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <div className="text-sm uppercase">{r.label}</div>
                      <div className="text-sm opacity-80">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block text-sm">
                  Catatan Penugasan / Shift
                </label>
                <textarea
                  value={empNotes}
                  onChange={(e) => setEmpNotes(e.target.value)}
                  placeholder="Contoh: Kasir shift pagi & penerima barang belanja..."
                  rows={2}
                  className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-sm cursor-pointer"
              >
                Daftarkan Karyawan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 7: INPUT PRESENSI / ABSENSI KARYAWAN                */}
      {/* ========================================================= */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-lg text-slate-900">Catat Presensi Karyawan</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAttendanceModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordAttendance} className="space-y-3 text-sm">
              <div>
                <label className="font-bold text-slate-700 block text-sm">
                  Pilih Karyawan <span className="text-red-500">*</span>
                </label>
                <select
                  value={attEmployeeId}
                  onChange={(e) => setAttEmployeeId(e.target.value)}
                  className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-blue-500 bg-slate-50/50"
                  required
                >
                  <option value="">-- Pilih Karyawan --</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.role.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block text-sm">Status Kehadiran</label>
                <div className="grid grid-cols-4 gap-1 mt-1.5">
                  {[
                    { id: 'hadir' as const, label: 'Hadir', color: 'emerald' },
                    { id: 'terlambat' as const, label: 'Terlambat', color: 'amber' },
                    { id: 'izin' as const, label: 'Izin', color: 'blue' },
                    { id: 'sakit' as const, label: 'Sakit', color: 'red' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setAttStatus(s.id)}
                      className={`py-2 rounded-xl text-center text-sm font-bold cursor-pointer transition ${
                        attStatus === s.id
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block text-sm">Shift Kerja</label>
                <div className="grid grid-cols-4 gap-1 mt-1.5">
                  {(['Pagi', 'Siang', 'Malam', 'Full Day'] as const).map((sh) => (
                    <button
                      key={sh}
                      type="button"
                      onClick={() => setAttShift(sh)}
                      className={`py-2 rounded-xl text-center text-sm font-bold cursor-pointer transition ${
                        attShift === sh
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {sh}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Jam Masuk Dicatat:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {new Date().toTimeString().split(' ')[0].substring(0, 5)} WIB
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block text-sm">Catatan (Opsional)</label>
                <input
                  type="text"
                  value={attNotes}
                  onChange={(e) => setAttNotes(e.target.value)}
                  placeholder="Keterangan tugas shift..."
                  className="w-full mt-1.5 p-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-sm cursor-pointer"
              >
                Catat Presensi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hidden Thermal Container for Printing Sample Receipt via @media print */}
      <div id="printable-receipt" className="hidden print:block font-mono text-black text-sm leading-tight">
        <div className="text-center pb-2">
          <div className="font-bold text-sm uppercase">{storeName || 'TOKO KELONTONG BERKAH RT 04'}</div>
          <div>Pemilik: {ownerName || '-'}</div>
          <div>{address || '-'}</div>
          <div>Telp/WA: {storePhone || '-'}</div>
          {shareloc && <div>Maps: {shareloc}</div>}
        </div>
        <div className="border-b border-dashed border-black my-1"></div>
        <div className="flex justify-between">
          <span>{new Date().toLocaleDateString('id-ID')}</span>
          <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
        </div>
        <div className="flex justify-between">
          <span>Kasir: Bu RT / Hendra</span>
          <span>No: INV-RIT-SAMPLE-01</span>
        </div>
        <div className="border-b border-dashed border-black my-1"></div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Minyak Goreng 2L</span>
            <span>34.000</span>
          </div>
          <div className="text-sm pl-2">1 x 34.000</div>
          <div className="flex justify-between">
            <span>Beras Premium 5KG</span>
            <span>72.500</span>
          </div>
          <div className="text-sm pl-2">1 x 72.500</div>
          <div className="flex justify-between">
            <span>Gula Pasir 1KG</span>
            <span>34.000</span>
          </div>
          <div className="text-sm pl-2">2 x 17.000</div>
          <div className="flex justify-between">
            <span>Telur Ayam Segar 1KG</span>
            <span>28.000</span>
          </div>
          <div className="text-sm pl-2">1 x 28.000</div>
        </div>
        <div className="border-b border-dashed border-black my-1"></div>
        <div className="flex justify-between font-bold text-sm">
          <span>TOTAL:</span>
          <span>RP 163.500</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Bayar (QRIS):</span>
          <span>Rp 163.500</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Kembali:</span>
          <span>Rp 0</span>
        </div>
        <div className="border-b border-dashed border-black my-1"></div>
        <div className="text-center text-sm pt-1">
          <p className="font-bold">Terima Kasih Telah Berbelanja!</p>
          <p>Barang yang dibeli tidak dapat ditukar.</p>
          <p>AppQu POS RitelQu RT 04</p>
        </div>
      </div>
    </div>
  );
};

