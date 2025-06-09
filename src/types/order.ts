import { OrderStatus } from './index';

// Order Types
export interface Order {
  id: string;
  listingId: string;
  clientId: string;
  vendorId: string;
  agentId?: string;
  winningBidId: string;
  
  // Pricing
  bidAmount: number; // in paise
  finalAmount?: number;
  deductionsTotal: number;
  platformFee: number;
  agentCommission: number;
  
  // Status Tracking
  status: OrderStatus;
  phase: 'ASSIGNMENT' | 'VERIFICATION' | 'PAYMENT' | 'DELIVERY' | 'COMPLETE';
  
  // Timestamps
  createdAt: string;
  agentAssignedAt?: string;
  verificationCompletedAt?: string;
  paymentCompletedAt?: string;
  completedAt?: string;
  
  // Status History
  statusHistory: OrderStatusEvent[];
  
  // Metadata
  metadata?: Record<string, any>;
}

export interface OrderStatusEvent {
  status: OrderStatus;
  timestamp: string;
  updatedBy: string;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface OrderDetails extends Order {
  listing: {
    id: string;
    deviceName: string;
    photos: string[];
    condition: string;
    pickupAddress: any;
  };
  client: {
    id: string;
    name: string;
    phoneNumber: string;
    address: any;
  };
  vendor: {
    id: string;
    name: string;
    businessName?: string;
    phoneNumber: string;
  };
  agent?: {
    id: string;
    name: string;
    phoneNumber: string;
    rating: number;
  };
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface OrderSummary {
  id: string;
  deviceName: string;
  clientName: string;
  vendorName: string;
  finalAmount: number;
  status: OrderStatus;
  createdAt: string;
  completedAt?: string;
}

export interface OrderMetrics {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  completionRate: number;
}

export interface PaymentDistribution {
  clientAmount: number;      // Final offer amount
  agentCommission: number;   // 5% of final offer
  platformFee: number;       // 2% of final offer
  vendorDeduction: number;   // Total deductions
}

export interface OrderTimeline {
  events: Array<{
    type: 'STATUS_CHANGE' | 'NOTE_ADDED' | 'LOCATION_UPDATE' | 'PAYMENT' | 'COMMUNICATION';
    timestamp: string;
    title: string;
    description?: string;
    user?: string;
    metadata?: Record<string, any>;
  }>;
  currentStage: string;
  nextStage?: string;
  estimatedCompletion?: string;
} 