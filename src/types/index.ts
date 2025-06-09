// Enum Types (base types that other files depend on)
export type UserRole = 'ANONYMOUS' | 'CLIENT' | 'VENDOR' | 'AGENT' | 'ADMIN';

export type DeviceCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor';

export type ListingStatus = 
  | 'DRAFT' 
  | 'PENDING' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'LIVE' 
  | 'SOLD' 
  | 'EXPIRED';

export type OrderStatus = 
  | 'PENDING_ASSIGNMENT'
  | 'AGENT_ASSIGNED'
  | 'AGENT_EN_ROUTE'
  | 'VERIFICATION_IN_PROGRESS'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_COMPLETED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type BidStatus = 
  | 'ACTIVE'
  | 'OUTBID'
  | 'WON'
  | 'LOST'
  | 'CANCELLED';

export type TaskStatus = 
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED';

export type VerificationStatus = 
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED';

export type PickupTimeSlot = 
  | 'MORNING'
  | 'AFTERNOON'
  | 'EVENING';

export type NotificationType = 
  | 'LISTING_APPROVED'
  | 'LISTING_REJECTED'
  | 'NEW_BID'
  | 'BID_OUTBID'
  | 'BID_WON'
  | 'AGENT_ASSIGNED'
  | 'VERIFICATION_COMPLETE'
  | 'PAYMENT_COMPLETED'
  | 'ORDER_UPDATE'
  | 'TASK_ASSIGNED';

// Core Application Types
export interface AppConfig {
  name: string;
  description: string;
  version: string;
  domain: string;
  supportPhone: string;
  supportEmail: string;
}

// Common Types
export type UUID = string;
export type PhoneNumber = string;
export type Currency = number; // Always in paise
export type Timestamp = string; // ISO string

// File Upload Types
export interface FileUpload {
  file: File;
  url?: string;
  uploadProgress?: number;
  error?: string;
}

export interface UploadedFile {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

// Pagination Types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Filter Types
export interface BaseFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ListingFilters extends BaseFilters {
  brand?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  status?: string;
}

export interface OrderFilters extends BaseFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
}

// Notification Types
export interface NotificationData {
  listingId?: string;
  orderId?: string;
  bidId?: string;
  agentId?: string;
  amount?: number;
  [key: string]: any;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  priority: 'high' | 'normal' | 'low';
  title: string;
  message: string;
  data?: NotificationData;
  isRead: boolean;
  sentViaWhatsApp: boolean;
  whatsappMessageId?: string;
  createdAt: string;
  readAt?: string;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// WebSocket Types
export interface SocketEvent {
  type: string;
  data: any;
  timestamp: string;
}

export interface BiddingEvent extends SocketEvent {
  listingId: string;
  bidAmount?: number;
  currentHighest?: number;
  timeRemaining?: number;
  totalBids?: number;
}

// Address Types
export interface Address {
  streetAddress: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Bank Details Types
export interface BankDetails {
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  bankName: string;
  branchName?: string;
}

// Analytics Types
export interface DashboardMetrics {
  pendingReviews: number;
  availableAgents: number;
  activeListings: number;
  pendingAssignments: number;
  totalRevenue: number;
  platformFees: number;
}

export interface ActivityItem {
  type: string;
  message: string;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// Form Types
export interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface StepperFormState<T> extends FormState<T> {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
}

// Search & Filter Types
export interface SearchResult<T> {
  items: T[];
  total: number;
  facets?: Record<string, { value: string; count: number }[]>;
  suggestions?: string[];
}

// Real-time Data Types
export interface LiveData<T> {
  data: T;
  lastUpdated: string;
  isConnected: boolean;
  error?: string;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
  data?: any;
}

// Hook Return Types
export interface UseAuthReturn {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  sendOtp: (phone: string) => Promise<void>;
}

export interface UseSocketReturn {
  socket: any;
  isConnected: boolean;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
}

// Theme & Design System Types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
    destructive: string;
    warning: string;
    success: string;
  };
  spacing: Record<string, string>;
  typography: Record<string, any>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}

// Configuration Types
export interface DatabaseConfig {
  url: string;
  poolSize?: number;
  ssl?: boolean;
}

export interface RedisConfig {
  url: string;
  ttl?: number;
}

export interface FileStorageConfig {
  provider: 'aws-s3' | 'google-cloud' | 'local';
  bucket?: string;
  region?: string;
  accessKey?: string;
  secretKey?: string;
}

export interface PaymentConfig {
  provider: 'razorpay' | 'stripe';
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
}

export interface WhatsAppConfig {
  businessAccountId: string;
  phoneNumberId: string;
  accessToken: string;
  webhookVerifyToken: string;
  apiVersion: string;
}

// Utility Types
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Re-export from other files (after they're defined)
export * from './auth';
export * from './user';
export * from './listing';
export * from './order';
export * from './agent';
export * from './api'; 