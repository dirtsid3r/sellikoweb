// Application Constants
export const APP_CONFIG = {
  name: 'selliko',
  description: 'Kerala\'s trusted mobile device resale platform',
  version: '1.0.0',
  domain: process.env.NODE_ENV === 'production' ? 'selliko.com' : 'localhost:3000',
  supportPhone: '+918000012345',
  supportEmail: 'support@selliko.com'
} as const;

// User Roles
export const USER_ROLES = {
  ANONYMOUS: 'ANONYMOUS',
  CLIENT: 'CLIENT',
  VENDOR: 'VENDOR',
  AGENT: 'AGENT',
  ADMIN: 'ADMIN'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Device Brands & Models
export const DEVICE_BRANDS = {
  APPLE: 'Apple',
  SAMSUNG: 'Samsung',
  GOOGLE: 'Google',
  ONEPLUS: 'OnePlus',
  XIAOMI: 'Xiaomi',
  REALME: 'Realme',
  OPPO: 'OPPO',
  VIVO: 'Vivo',
  MOTOROLA: 'Motorola',
  NOTHING: 'Nothing'
} as const;

export const DEVICE_MODELS = {
  [DEVICE_BRANDS.APPLE]: [
    'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
    'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
    'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 Mini',
    'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 12 Mini',
    'iPhone SE (3rd Gen)', 'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11'
  ],
  [DEVICE_BRANDS.SAMSUNG]: [
    'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24',
    'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23',
    'Galaxy S22 Ultra', 'Galaxy S22+', 'Galaxy S22',
    'Galaxy Note 20 Ultra', 'Galaxy Note 20',
    'Galaxy Z Fold 5', 'Galaxy Z Flip 5',
    'Galaxy A54 5G', 'Galaxy A34 5G', 'Galaxy A24'
  ],
  [DEVICE_BRANDS.GOOGLE]: [
    'Pixel 8 Pro', 'Pixel 8', 'Pixel 7a',
    'Pixel 7 Pro', 'Pixel 7', 'Pixel 6a',
    'Pixel 6 Pro', 'Pixel 6', 'Pixel 5a'
  ]
} as const;

// Storage Options
export const STORAGE_OPTIONS = [
  '64GB', '128GB', '256GB', '512GB', '1TB', '2TB'
] as const;

// Device Conditions
export const DEVICE_CONDITIONS = {
  EXCELLENT: 'Excellent',
  GOOD: 'Good', 
  FAIR: 'Fair',
  POOR: 'Poor'
} as const;

export type DeviceCondition = typeof DEVICE_CONDITIONS[keyof typeof DEVICE_CONDITIONS];

// Listing Status
export const LISTING_STATUS = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  LIVE: 'LIVE',
  SOLD: 'SOLD',
  EXPIRED: 'EXPIRED'
} as const;

export type ListingStatus = typeof LISTING_STATUS[keyof typeof LISTING_STATUS];

// Order Status
export const ORDER_STATUS = {
  PENDING_ASSIGNMENT: 'PENDING_ASSIGNMENT',
  AGENT_ASSIGNED: 'AGENT_ASSIGNED',
  AGENT_EN_ROUTE: 'AGENT_EN_ROUTE',
  VERIFICATION_IN_PROGRESS: 'VERIFICATION_IN_PROGRESS',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// Kerala Cities
export const KERALA_CITIES = [
  'Thiruvananthapuram',
  'Kochi',
  'Kozhikode',
  'Thrissur',
  'Kollam',
  'Palakkad',
  'Alappuzha',
  'Malappuram',
  'Kannur',
  'Kasaragod',
  'Pathanamthitta',
  'Idukki',
  'Ernakulam',
  'Wayanad'
] as const;

// Pickup Time Slots
export const PICKUP_TIME_SLOTS = {
  MORNING: 'Morning (9 AM - 12 PM)',
  AFTERNOON: 'Afternoon (12 PM - 4 PM)', 
  EVENING: 'Evening (4 PM - 8 PM)'
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  LISTING_APPROVED: 'LISTING_APPROVED',
  LISTING_REJECTED: 'LISTING_REJECTED',
  NEW_BID: 'NEW_BID',
  BID_OUTBID: 'BID_OUTBID',
  BID_WON: 'BID_WON',
  AGENT_ASSIGNED: 'AGENT_ASSIGNED',
  VERIFICATION_COMPLETE: 'VERIFICATION_COMPLETE',
  PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
  ORDER_UPDATE: 'ORDER_UPDATE',
  TASK_ASSIGNED: 'TASK_ASSIGNED'
} as const;

// Payment Constants
export const PAYMENT_CONFIG = {
  PLATFORM_FEE_PERCENTAGE: 2, // 2%
  AGENT_COMMISSION_PERCENTAGE: 5, // 5%
  MIN_BID_INCREMENT: 100, // ₹100
  MIN_LISTING_PRICE: 1000, // ₹1,000
  MAX_LISTING_PRICE: 200000, // ₹2,00,000
  CURRENCY: 'INR',
  COUNTRY: 'IN'
} as const;

// File Upload Limits
export const FILE_UPLOAD_LIMITS = {
  DEVICE_PHOTOS: {
    MAX_FILES: 6,
    MIN_FILES: 4,
    MAX_SIZE_MB: 5,
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp']
  },
  BILL_PHOTO: {
    MAX_FILES: 1,
    MAX_SIZE_MB: 5,
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf']
  },
  ID_DOCUMENTS: {
    MAX_FILES: 1,
    MAX_SIZE_MB: 5,
    ALLOWED_TYPES: ['image/jpeg', 'image/png']
  }
} as const;

// Auction Settings
export const AUCTION_CONFIG = {
  DEFAULT_DURATION_HOURS: 24,
  ENDING_SOON_THRESHOLD_MINUTES: 30,
  AUTO_EXTEND_MINUTES: 5, // Extend if bid placed in last 5 minutes
  MAX_BID_ATTEMPTS_PER_HOUR: 10
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    SEND_OTP: '/api/auth/send-otp',
    VERIFY_OTP: '/api/auth/verify-otp',
    REFRESH_TOKEN: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout'
  },
  LISTINGS: {
    CREATE: '/api/listings',
    GET_ALL: '/api/listings',
    GET_BY_ID: '/api/listings',
    UPDATE: '/api/listings',
    DELETE: '/api/listings',
    APPROVE: '/api/admin/listings/approve'
  },
  BIDS: {
    CREATE: '/api/bids',
    GET_ALL: '/api/bids',
    GET_BY_LISTING: '/api/bids/listing'
  },
  ORDERS: {
    GET_ALL: '/api/orders',
    GET_BY_ID: '/api/orders',
    UPDATE_STATUS: '/api/orders/status'
  },
  MARKETPLACE: {
    BROWSE: '/api/marketplace',
    SEARCH: '/api/marketplace/search',
    FILTERS: '/api/marketplace/filters'
  },
  AGENT: {
    TASKS: '/api/agent/tasks',
    ACCEPT_TASK: '/api/agent/tasks/accept',
    COMPLETE_TASK: '/api/agent/tasks/complete',
    VERIFICATION: '/api/agent/verification'
  },
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    PENDING_LISTINGS: '/api/admin/listings/pending',
    ASSIGN_AGENT: '/api/admin/assign-agent',
    ANALYTICS: '/api/admin/analytics'
  },
  NOTIFICATIONS: {
    GET_ALL: '/api/notifications',
    MARK_READ: '/api/notifications/read',
    MARK_ALL_READ: '/api/notifications/read-all'
  },
  FILES: {
    UPLOAD: '/api/files/upload',
    DELETE: '/api/files/delete'
  }
} as const;

// WhatsApp Integration
export const WHATSAPP_CONFIG = {
  BUSINESS_NUMBER: '+918000012345',
  OTP_TEMPLATE: 'otp_verification',
  NOTIFICATION_TEMPLATE: 'order_update',
  BID_TEMPLATE: 'bid_notification'
} as const;

// UI Constants
export const UI_CONFIG = {
  SIDEBAR_WIDTH: 280,
  HEADER_HEIGHT: 64,
  MOBILE_BREAKPOINT: 768,
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  VALIDATION: 'Please check your input and try again.',
  FILE_UPLOAD: 'Failed to upload file. Please try again.',
  OTP_INVALID: 'Invalid OTP. Please try again.',
  OTP_EXPIRED: 'OTP has expired. Please request a new one.',
  PHONE_INVALID: 'Please enter a valid Indian phone number.',
  IMEI_INVALID: 'IMEI must be exactly 15 digits.',
  PRICE_INVALID: 'Price must be between ₹1,000 and ₹2,00,000.'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  OTP_SENT: 'OTP sent successfully to your WhatsApp!',
  LOGIN_SUCCESS: 'Login successful! Welcome to selliko.',
  LISTING_CREATED: 'Device listing submitted successfully!',
  BID_PLACED: 'Your bid has been placed successfully!',
  BID_WON: 'Congratulations! You won the auction!',
  VERIFICATION_COMPLETE: 'Device verification completed successfully!',
  PAYMENT_SUCCESS: 'Payment processed successfully!',
  ORDER_COMPLETE: 'Order completed successfully!'
} as const;

// Regex Patterns
export const REGEX_PATTERNS = {
  INDIAN_PHONE: /^\+91[6-9]\d{9}$/,
  IMEI: /^\d{15}$/,
  PINCODE: /^\d{6}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'selliko_auth_token',
  REFRESH_TOKEN: 'selliko_refresh_token',
  USER_DATA: 'selliko_user_data',
  CART: 'selliko_cart',
  PREFERENCES: 'selliko_preferences'
} as const; 