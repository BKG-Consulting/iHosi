/**
 * Professional Icon System
 * Standardized icons for healthcare application
 */

import {
  // Core Medical Icons
  Stethoscope,
  Heart,
  Activity,
  Pill,
  Syringe,
  Thermometer,
  Microscope,
  
  // Patient & User Icons
  User,
  Users,
  UserCheck,
  UserPlus,
  UserX,
  UserCog,
  
  // Scheduling & Time Icons
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Clock,
  Timer,
  Hourglass,
  
  // Documents & Records Icons
  FileText,
  File,
  FileCheck,
  Files,
  Clipboard,
  ClipboardList,
  ClipboardCheck,
  FolderOpen,
  Archive,
  
  // Communication Icons
  Mail,
  MessageSquare,
  Phone,
  PhoneCall,
  Bell,
  BellRing,
  
  // Navigation Icons
  Home,
  Menu,
  Search,
  Filter,
  Settings,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  
  // Action Icons
  Plus,
  Minus,
  Edit,
  Trash2,
  Download,
  Upload,
  Save,
  Check,
  X,
  MoreVertical,
  MoreHorizontal,
  
  // Status Icons
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  
  // Security Icons
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  
  // Data & Analytics Icons
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity as ActivityIcon,
  
  // Facility Icons
  Building2,
  Hospital,
  Bed,
  Warehouse,
  MapPin,
  
  // Tech Icons
  Zap,
  Cpu,
  Database,
  Server,
  Cloud,
  Wifi,
  Globe,
  Monitor,
  Smartphone,
  Laptop,
  
  // UI Enhancement Icons
  Star,
  Award,
  Target,
  Sparkles,
  Crown,
  Badge,
  
  // Direction Icons
  Navigation,
  Compass,
  Map,
  
  // Other
  Layers,
  Grid,
  Layout,
  Package,
  Box,
  Tag,
  
  type LucideIcon,
} from 'lucide-react';

/**
 * Healthcare Icon Categories
 */
export const HealthcareIcons = {
  // Medical
  stethoscope: Stethoscope,
  heart: Heart,
  activity: Activity,
  pill: Pill,
  syringe: Syringe,
  thermometer: Thermometer,
  microscope: Microscope,
  
  // Patients
  patient: User,
  patients: Users,
  patientVerified: UserCheck,
  patientAdd: UserPlus,
  patientRemove: UserX,
  patientSettings: UserCog,
  
  // Appointments
  calendar: Calendar,
  appointment: CalendarCheck,
  appointmentTime: CalendarClock,
  schedule: CalendarDays,
  clock: Clock,
  timer: Timer,
  waiting: Hourglass,
  
  // Records
  record: FileText,
  file: File,
  recordVerified: FileCheck,
  records: Files,
  clipboard: Clipboard,
  checklist: ClipboardList,
  clipboardVerified: ClipboardCheck,
  folder: FolderOpen,
  archive: Archive,
  
  // Communication
  email: Mail,
  message: MessageSquare,
  phone: Phone,
  call: PhoneCall,
  notification: Bell,
  alert: BellRing,
} as const;

/**
 * UI Action Icons
 */
export const ActionIcons = {
  add: Plus,
  remove: Minus,
  edit: Edit,
  delete: Trash2,
  download: Download,
  upload: Upload,
  save: Save,
  confirm: Check,
  cancel: X,
  moreVertical: MoreVertical,
  moreHorizontal: MoreHorizontal,
} as const;

/**
 * Status & Feedback Icons
 */
export const StatusIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  help: HelpCircle,
  alert: AlertCircle,
} as const;

/**
 * Security Icons
 */
export const SecurityIcons = {
  shield: Shield,
  verified: ShieldCheck,
  lock: Lock,
  unlock: Unlock,
  key: Key,
  visible: Eye,
  hidden: EyeOff,
} as const;

/**
 * Analytics Icons
 */
export const AnalyticsIcons = {
  barChart: BarChart3,
  lineChart: LineChart,
  pieChart: PieChart,
  trendUp: TrendingUp,
  trendDown: TrendingDown,
  activity: ActivityIcon,
} as const;

/**
 * Facility Icons
 */
export const FacilityIcons = {
  building: Building2,
  hospital: Hospital,
  bed: Bed,
  warehouse: Warehouse,
  location: MapPin,
} as const;

/**
 * Technology Icons
 */
export const TechIcons = {
  fast: Zap,
  cpu: Cpu,
  database: Database,
  server: Server,
  cloud: Cloud,
  wifi: Wifi,
  globe: Globe,
  desktop: Monitor,
  mobile: Smartphone,
  laptop: Laptop,
} as const;

/**
 * Navigation Icons
 */
export const NavigationIcons = {
  home: Home,
  menu: Menu,
  search: Search,
  filter: Filter,
  settings: Settings,
  right: ChevronRight,
  left: ChevronLeft,
  down: ChevronDown,
  up: ChevronUp,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  navigate: Navigation,
  compass: Compass,
  map: Map,
} as const;

/**
 * UI Enhancement Icons
 */
export const EnhancementIcons = {
  star: Star,
  award: Award,
  target: Target,
  sparkles: Sparkles,
  crown: Crown,
  badge: Badge,
} as const;

/**
 * Layout Icons
 */
export const LayoutIcons = {
  layers: Layers,
  grid: Grid,
  layout: Layout,
  package: Package,
  box: Box,
  tag: Tag,
} as const;

/**
 * Combined Icon System
 */
export const Icons = {
  healthcare: HealthcareIcons,
  action: ActionIcons,
  status: StatusIcons,
  security: SecurityIcons,
  analytics: AnalyticsIcons,
  facility: FacilityIcons,
  tech: TechIcons,
  navigation: NavigationIcons,
  enhancement: EnhancementIcons,
  layout: LayoutIcons,
} as const;

/**
 * Icon Size Presets
 */
export const IconSizes = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
  '2xl': 'h-10 w-10',
  '3xl': 'h-12 w-12',
} as const;

/**
 * Icon Color Presets
 */
export const IconColors = {
  primary: 'text-blue-600',
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  danger: 'text-red-600',
  info: 'text-indigo-600',
  muted: 'text-slate-400',
  dark: 'text-slate-900',
  white: 'text-white',
} as const;

// Type exports
export type IconType = LucideIcon;
export type IconSize = keyof typeof IconSizes;
export type IconColor = keyof typeof IconColors;

