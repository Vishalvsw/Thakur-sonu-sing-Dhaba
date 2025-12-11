
export enum BusinessUnit {
  DHABA = 'DHABA',
  BAR = 'BAR',
  ROOMS = 'ROOMS',
  SNOOKER = 'SNOOKER',
  ADMIN = 'ADMIN'
}

export enum UserRole {
  GUEST = 'GUEST',
  WAITER = 'WAITER',
  CHEF = 'CHEF',
  BARTENDER = 'BARTENDER',
  MANAGER = 'MANAGER',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum OrderStatus {
  INCOMING = 'INCOMING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  PICKED_UP = 'PICKED_UP',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  UPI = 'UPI',
  CARD = 'CARD',
  ROOM_CHARGE = 'ROOM_CHARGE',
  PENDING = 'PENDING'
}

export interface Product {
  id: string;
  name: string;
  localName: string; // Hindi/Local
  price: number;
  image: string;
  category: 'food' | 'drink' | 'snooker' | 'room';
  subCategory?: string; // New field for detailed categorization (e.g., Starters, Breads)
  bu: BusinessUnit;
  audioSrc?: string; // URL for voice label
  isAvailable?: boolean;
  isVeg?: boolean; // New dietary flag
  isRecommended?: boolean; // New flag for popular items
  variantPrices?: { // Optional override for specific sizes
    '30ml'?: number;
    '60ml'?: number;
    '90ml'?: number;
    'Btl'?: number;
  };
  stock?: number; // For inventory tracking
}

export interface CartItem extends Product {
  quantity: number;
  variant?: string; // e.g., '30ml', '60ml'
  notes?: string;
}

export interface Order {
  id: string;
  tableId: string; // Or Room ID / Source ID
  source: 'TABLE' | 'ROOM' | 'BAR' | 'SNOOKER';
  items: CartItem[];
  status: OrderStatus;
  paymentStatus: PaymentMethod;
  totalAmount: number;
  timestamp: number;
  bu: BusinessUnit;
}

export interface Staff {
  id: string;
  name: string;
  role: UserRole;
  pin: string;
  bu: BusinessUnit;
  photoUrl?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string; // Text description e.g. "Head Chef"
  bu: BusinessUnit;
  phone: string;
  salary: number; // Monthly Salary
  salaryPaid: number; // Amount paid this month
  status: 'Active' | 'On Leave' | 'Terminated';
  attendance: number; // Days present this month
  joinDate: string;
}

export interface VoiceParseResult {
  items: { item: string; quantity: number }[];
}
