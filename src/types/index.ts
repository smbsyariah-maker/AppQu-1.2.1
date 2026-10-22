// ==========================================
// BAKSOQU 1.0 POS & RESTAURANT TYPES
// ==========================================
export type TableStatus = 'kosong' | 'terisi' | 'menunggu_bayar';

export interface TableItem {
  id: string;
  name: string;
  number: number;
  status: TableStatus;
  orderId?: string;
  customerName?: string;
  pax?: number;
  totalAmount?: number;
  itemsCount?: number;
  openedAt?: string;
  positionIndex: number;
}

export type MenuCategory = 'bakso_kuah' | 'pelengkap' | 'minuman' | 'paket';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
}

export interface OrderItem {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export type OrderType = 'meja' | 'bungkus';
export type PaymentMethod = 'tunai' | 'qris';

export interface Order {
  id: string;
  receiptNumber: string;
  type: OrderType;
  tableId?: string;
  tableName?: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'draft' | 'saved' | 'paid' | 'cancelled';
  createdAt: string;
  paidAt?: string;
  paymentMethod?: PaymentMethod;
  cashAmount?: number;
  changeAmount?: number;
}

export interface Ingredient {
  id: string;
  name: string;
  initialQty: number;
  unit: 'kg' | 'gr' | 'pcs' | 'liter' | 'ikat' | 'pack';
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  updatedAt: string;
}

export interface RestaurantProfile {
  name: string;
  slogan: string;
  address: string;
  phone: string;
  receiptHeader: string;
  receiptFooter: string;
  currency: string;
}

export interface PrinterConfig {
  paperSize: '58mm' | '80mm';
  autoPrintKitchen: boolean;
  autoPrintReceipt: boolean;
  connectedDeviceName?: string;
  isSimulator: boolean;
}

// ==========================================
// APPQU ECOSYSTEM TYPES (4 CORE MODULES & AREAQU)
// ==========================================

// Role-Based Access Control (RBAC) - 15 Kategori Peran dalam 4 Tier
export type RoleTier = 
  | 'tier1_akar_rumput' 
  | 'tier2_pengurus_rt' 
  | 'tier3_administrasi_mikro' 
  | 'tier4_pemerintahan'
  | 'governance' 
  | 'pengurus' 
  | 'koordinator' 
  | 'warga';

export type RoleDetail =
  // Tier 1 (Akar Rumput)
  | 'warga'
  | 'relawan'
  | 'keamanan_hansip'
  // Tier 2 (Pengurus RT / Paguyuban)
  | 'koordinator'
  | 'sekretaris'
  | 'bendahara'
  | 'wakil_rt'
  | 'ketua_rt'
  // Tier 3 (Administrasi Mikro)
  | 'pengurus_rw'
  | 'lurah_kades'
  // Tier 4 (Pemerintahan)
  | 'camat'
  | 'bupati_walikota'
  | 'gubernur'
  // Spesialis Wilayah & Lapangan
  | 'aparat_bhabinsa'
  | 'kurir_transportasiqu'
  // Legacy Aliases
  | 'gubernur_pemda'
  | 'camat_lurah'
  | 'koor_lingkungan'
  | 'koor_keamanan'
  | 'koor_kebersihan';

export type VerificationStatus = 
  | 'unverified'          // 0/2 atau 1/2 saksi tetangga
  | 'temporary_active'    // 2 saksi tetangga valid, aktif max 30 hari
  | 'permanent_verified'  // Disetujui penuh oleh RT/RW (Tier 2/3)
  | 'expired';            // Lewat 30 hari tanpa persetujuan RT

export interface WitnessRecord {
  id: string;
  name: string;
  blockNumber: string;
  phone: string;
  confirmedAt: string;
}

export interface UserProfile {
  id: string;
  nik: string;
  noKk: string;
  name: string;
  roleTier: RoleTier;
  roleDetail: RoleDetail;
  roleTitle: string;
  blockNumber: string;
  phone: string;
  emergencyContact: string;
  isVerified: boolean;
  verificationStatus?: VerificationStatus;
  witnessCount?: number; // 0, 1, atau 2
  witnesses?: WitnessRecord[];
  temporaryDaysLeft?: number; // Sisa hari dari 30 hari
  guarantorMonthlyQuota?: number; // Kuota jamin tetangga, max 10/bulan
  guarantorUsedCount?: number; // Jumlah yang sudah dijamin bulan ini
  deviceFingerprint?: string; // Pengikatan unik HP (Device Lock)
  residentStatus: 'tetap' | 'kontrak' | 'kos';
  occupation: string;
  joinedAt: string;
  avatarUrl?: string;
}

// ==========================================
// AREAQU (PETA & SEWA LAPAK DIGITAL) & TRANSPORTASIQU
// ==========================================
export type BusinessMode = 'mode_a_pos' | 'mode_b_katalog';

export interface TransportasiCourier {
  id: string;
  driverName: string;
  phone: string;
  vehiclePlate: string;
  vehicleType: 'motor' | 'sepeda' | 'gerobak';
  lat: number;
  lng: number;
  speedKmh: number;
  batteryPercent: number;
  status: 'mengantar' | 'standby' | 'istirahat';
  currentTask?: string;
  lastHeartbeatSeconds: number; // Updated every 5-10s
}

export interface AreaPoint {
  id: string;
  name: string;
  category: 'kuliner' | 'sembako' | 'jasa' | 'klinik' | 'bengkel' | 'transportasi' | 'fasum' | 'titik_netral';
  businessMode?: BusinessMode;
  osmTag?: string; // Auto-detection tag OpenStreetMap (e.g., 'amenity=restaurant')
  lat: number;
  lng: number;
  distanceMeters: number;
  ownerName?: string;
  phone?: string;
  blockNumber: string;
  rating: number;
  isDigitalStallRented: boolean; // Sewa Lapak Digital Rp 30.000/bulan
  digitalStallTrialDaysLeft?: number; // Trial 10 hari
  isPoliticalOrNeutralOnly: boolean; // Titik netral ormas/partai (dilarang iklan prioritas)
  description: string;
  catalogCount?: number;
  courierInfo?: TransportasiCourier;
}

// ==========================================
// PANIC BUTTON RT & AUTO EPHEMERAL SOS ROOM
// ==========================================
export interface SOSChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: string;
  isAction?: boolean;
  isAudioSummary?: boolean;
}

export interface SOSEphemeralRoom {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterBlock: string;
  reporterPhone: string;
  type: 'kemalingan' | 'medis' | 'kebakaran' | 'bencana';
  status: 'active' | 'resolved';
  createdAt: string;
  expiresAt: string; // 72 jam auto-purge
  hoursRemaining: number;
  liveLocation: {
    lat: number;
    lng: number;
    address: string;
    geofenceValid: boolean;
  };
  audioRecorded: boolean;
  audioDurationSeconds: number;
  audioSummaryText?: string;
  messages: SOSChatMessage[];
  quickActionsTriggered: string[];
  escalatedToWhatsApp: boolean;
}

// 1. PAGUYUBANQU: Feed, Poll, Agenda, Kas, Surat Pengantar
export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  postType: 'pengumuman' | 'diskusi' | 'polling' | 'lapor';
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  likes: number;
  hasLiked?: boolean;
  commentsCount: number;
  pollData?: {
    question: string;
    options: PollOption[];
    userVotedOptionId?: string;
    totalVotes: number;
  };
}

export interface AgendaEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: 'kerja_bakti' | 'ronda' | 'rapat' | 'sosial' | 'senam';
  rsvpCount: { hadir: number; tidak: number };
  userRsvp?: 'hadir' | 'tidak';
  isCompleted: boolean;
  presensiCode?: string;
}

export interface KasTransaction {
  id: string;
  userId?: string;
  userName: string;
  blockNumber: string;
  type: 'iuran' | 'pengeluaran' | 'donasi_duka';
  title: string;
  amount: number;
  date: string;
  status: 'verified' | 'pending' | 'rejected';
  category: string;
  proofUrl?: string;
  ocrData?: {
    bank: string;
    sender: string;
    amount: number;
    transactionTime: string;
    matchScore: number;
  };
  notes?: string;
}

export interface SuratPengantar {
  id: string;
  letterNumber: string;
  userId: string;
  userName: string;
  nik: string;
  noKk: string;
  blockNumber: string;
  type: 'skck' | 'ktp_baru' | 'domisili' | 'izin_usaha' | 'kematian' | 'nikah';
  purpose: string;
  status: 'draft' | 'pending_sekretaris' | 'pending_ketua' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  digitalSignatureQr?: string;
}

// 2. WARGAQU: Buku Induk Warga
export interface ResidentData extends UserProfile {
  familyMembersCount: number;
  gender: 'L' | 'P';
  birthDate: string;
  religion: string;
  bloodType: string;
}

// 3. USAHAQU: Lapak UMKM Warga & Switch Master Bisnis
export interface LocalProduct {
  id: string;
  name: string;
  price: number;
  unit: string;
  description: string;
  imageUrl?: string;
}

export interface LocalBusiness {
  id: string;
  name: string;
  category: 'kuliner' | 'jasa' | 'sembako' | 'laundry' | 'kerajinan' | 'otomotif' | 'kesehatan';
  ownerName: string;
  blockNumber: string;
  phone: string;
  description: string;
  rating: number;
  isPosActive?: boolean;
  posModuleKey?: 'baksoqu' | 'bengkelqu' | 'klinikqu' | 'ritelqu';
  businessMode?: BusinessMode;
  osmTag?: string; // Tag auto-detect OSM (e.g. amenity=restaurant, shop=convenience)
  badge?: string;
  imageUrl?: string;
  products: LocalProduct[];
}

// 4. SIAGAQU: Panic Button, Patroli Ronda, Tanggap Duka & Dompet Solidaritas
export interface EmergencyLog {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterPhone: string;
  blockNumber: string;
  type: 'kemalingan' | 'medis' | 'kebakaran' | 'bencana';
  status: 'active' | 'dispatched' | 'resolved';
  timestamp: string;
  notes: string;
  coordinates: { lat: number; lng: number };
  nearestCctvId: string;
  cctvName: string;
  sirenActive: boolean;
  responders: string[];
}

export interface PatrolCheckpoint {
  id: string;
  code: string;
  name: string;
  locationDesc: string;
  lastScannedAt?: string;
  lastScannedBy?: string;
  status: 'safe' | 'attention' | 'unsafe';
}

export interface PatrolLog {
  id: string;
  officerId: string;
  officerName: string;
  checkpointCode: string;
  checkpointName: string;
  condition: 'safe' | 'attention' | 'unsafe';
  timestamp: string;
  notes: string;
  photoUrl?: string;
}

export interface MusibahItem {
  id: string;
  title: string;
  victimFamily: string;
  blockNumber: string;
  date: string;
  type: 'kematian' | 'sakit_kritis' | 'musibah_bencana';
  description: string;
  donationTarget: number;
  donationCollected: number;
  isUrgent: boolean;
  donators: {
    id: string;
    name: string;
    amount: number;
    time: string;
    block: string;
  }[];
}

export interface PiketTask {
  id: string;
  musibahId: string;
  taskType: 'takziah' | 'pengurusan_jenazah' | 'konsumsi_tenda' | 'keamanan_parkir';
  assignedFamily: string;
  blockNumber: string;
  shiftTime: string;
  isDone: boolean;
}

// ==========================================
// 5. BENGKELQU: ASISTEN PINTAR & OPERASIONAL BENGKEL (USAHAQU)
// ==========================================
export interface BengkelPart {
  id: string;
  code: string;
  name: string;
  category: 'oli' | 'cvt' | 'rem' | 'busi' | 'filter' | 'aki' | 'ban' | 'cairan' | 'jasa';
  stock: number;
  minStock: number; // Smart Re-Order Point
  costPrice: number;
  sellPrice: number;
  unit: string;
  suitableFor: string;
}

export interface VehicleChecklist {
  bodiLecet: boolean;
  lampuUtama: boolean;
  remDepanBelakang: boolean;
  indikatorBensin: 'E' | '1/4' | '1/2' | '3/4' | 'F';
  klakson: boolean;
  tekananBan: boolean;
}

export interface ServiceWorkOrder {
  id: string;
  spkNumber: string;
  customerName: string;
  customerPhone: string;
  customerBlock?: string;
  plateNumber: string;
  vehicleBrand: string;
  vehicleModel: string;
  currentKm: number;
  complaintNotes: string;
  checklist: VehicleChecklist;
  items: {
    id: string;
    partId?: string;
    name: string;
    category: 'jasa' | 'sparepart' | 'upsell';
    price: number;
    qty: number;
  }[];
  upSellingOffered: {
    id: string;
    name: string;
    price: number;
    reason: string;
    accepted: boolean;
  }[];
  total: number;
  status: 'antre' | 'dikerjakan' | 'selesai' | 'diambil';
  mechanicName: string;
  createdAt: string;
  finishedAt?: string;
  nextOilChangeKm?: number;
}

// ==========================================
// 6. KLINIKQU: KASIR & LAYANAN MEDIS (USAHAQU)
// ==========================================
export interface KlinikServiceItem {
  id: string;
  name: string;
  description: string;
  category: 'konsultasi' | 'tindakan' | 'laboratorium' | 'obat' | 'paket';
  price: number;
}

export interface KlinikPatientRecord {
  id: string;
  name: string;
  nik: string;
  blockNumber: string;
  gender: 'L' | 'P';
  age: number;
  phone: string;
  bloodType: string;
  allergies?: string;
  lastVisit: string;
  totalVisits: number;
}

export interface KlinikBillItem {
  id: string;
  serviceId: string;
  name: string;
  price: number;
  qty: number;
}

export interface KlinikInvoice {
  id: string;
  invoiceNumber: string;
  patientName: string;
  patientNik?: string;
  patientBlock: string;
  doctorName: string;
  items: KlinikBillItem[];
  total: number;
  paymentMethod: 'tunai' | 'qris' | 'bpjs_subsidi';
  status: 'lunas' | 'antre';
  createdAt: string;
  notes?: string;
}

// ==========================================
// RITELQU: KASIR & TOKO KELONTONG WARGA
// ==========================================
export interface RitelProduct {
  id: string;
  sku: string;
  name: string;
  category: 'sembako' | 'minuman' | 'makanan' | 'kebersihan' | 'rokok_korek' | 'bumbu';
  price: number;
  buyPrice?: number;
  stock: number;
  unit: string;
  minStock?: number;
  expiryDate?: string;
  promoType?: 'none' | 'percent' | 'nominal' | 'buy1get1' | 'wholesale';
  promoValue?: number;
}

export interface RitelCustomer {
  id: string;
  name: string;
  phone: string;
  blockNumber: string;
  points: number;
  totalDebt: number; // Catatan Bon Hutang
  notes?: string;
}

export interface RitelCartItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: number;
  qty: number;
  unit: string;
}

export interface RitelInvoice {
  id: string;
  invoiceNumber: string;
  cashierName: string;
  customerName?: string;
  customerPhone?: string;
  items: RitelCartItem[];
  total: number;
  cashGiven?: number;
  change?: number;
  paymentMethod: 'tunai' | 'qris' | 'transfer' | 'bon_warga';
  status: 'lunas' | 'bon';
  createdAt: string;
  notes?: string;
}

export type RitelEmployeeRole = 'admin' | 'spv' | 'kasir';

export interface RitelEmployee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: RitelEmployeeRole;
  status: 'aktif' | 'nonaktif';
  joinedDate: string;
  pin?: string;
  notes?: string;
}

export interface RitelAttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: RitelEmployeeRole;
  date: string; // YYYY-MM-DD
  checkInTime: string; // HH:mm:ss
  checkOutTime?: string; // HH:mm:ss
  status: 'hadir' | 'terlambat' | 'izin' | 'sakit';
  shift: 'Pagi' | 'Siang' | 'Malam' | 'Full Day';
  notes?: string;
}

// ==========================================
// APPQU CHAT & LOCAL HISTORY TYPES (RAM 1 GB, BIAYA Rp 0)
// ==========================================
export type ChatCategory = 'transaksi' | 'komunitas' | 'sos';
export type ChatSubType = 'usaha' | 'transportasi' | 'warga_private' | 'grup_rt' | 'sos_darurat';

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  senderPhoneRaw?: string;
  senderPhoneMasked?: string;
  text: string;
  imageUrl?: string; // Compressed client-side <100KB
  audioUrl?: string; // Voice note 15-30s
  audioDurationSec?: number;
  isSpeechTranscript?: boolean;
  timestamp: string;
  isMe: boolean;
  status: 'sent' | 'delivered' | 'read';
}

export interface ChatThread {
  id: string;
  title: string;
  subtitle: string;
  type: ChatCategory;
  subType: ChatSubType;
  targetId?: string;
  targetPhoneRaw: string;
  isPhoneMasked: boolean;
  participantNames: string[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  avatarText: string;
  avatarColor: string;
  status: 'active' | 'selesai' | 'blocked';
  completedAt?: string;
  purgeAfterHours?: number; // 24-48 jam untuk transaksi, 72 jam untuk ephemeral SOS
  isAutoPurged?: boolean;
  // Metadata khusus darurat (SOS)
  sosMetadata?: {
    gpsLat: number;
    gpsLng: number;
    locationDesc: string;
    incidentType: string;
    triggerTime: string;
    voiceTranscript?: string;
    audioRecordedUrl?: string;
    bapExported?: boolean;
    escalatedToAparat?: boolean;
  };
}

export interface SOSHistoryRecord {
  id: string;
  threadId: string;
  incidentType: string;
  reporterName: string;
  reporterPhone: string;
  rtRw: string;
  timestamp: string;
  gps: { lat: number; lng: number };
  locationDesc: string;
  audioTranscript: string;
  audioDurationSec: number;
  resolvedAt: string;
  actionsTaken: string[];
  status: 'selesai' | 'eskalasi_aparat';
  bapDocumentText: string;
  archivedToIndexedDBAt: string;
}

export interface ChatReportRecord {
  id: string;
  reportedUserId: string;
  reportedUserName: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  timestamp: string;
}



