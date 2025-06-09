import { TaskStatus, VerificationStatus } from './index';

// Agent Task Types
export interface AgentTask {
  id: string;
  agentId: string;
  orderId: string;
  type: 'pickup' | 'delivery' | 'verification';
  priority: 'high' | 'normal' | 'low';
  
  // Task Details
  description: string;
  clientContact: {
    name: string;
    phoneNumber: string;
    address: string;
  };
  deviceInfo: {
    brand: string;
    model: string;
    storageCapacity: string;
    color: string;
    condition: string;
  };
  orderValue: number;
  
  // Status
  status: TaskStatus;
  assignedAt: string;
  assignedBy: string;
  acceptedAt?: string;
  completedAt?: string;
  
  // Commission
  commissionAmount: number;
  isPaid: boolean;
  
  // Metadata
  metadata?: Record<string, any>;
}

export interface AcceptTaskResponse {
  success: boolean;
  taskId: string;
  clientContactAllowed: boolean;
  navigationDetails: {
    address: string;
    coordinates?: { lat: number; lng: number };
    mapsUrl: string;
  };
  message: string;
}

export interface DeviceVerification {
  id: string;
  transactionId: string;
  agentId: string;
  
  // Customer Identity
  customerIdVerified: boolean;
  idType?: 'AADHAAR' | 'PAN' | 'DRIVING_LICENSE';
  idNumber?: string;
  idPhoto?: string;
  
  // Device Inspection
  actualCondition?: string;
  inspectionNotes?: string;
  functionalIssues: string[]; // JSON array
  physicalIssues: string[];
  accessoriesIncluded: string[];
  batteryHealth?: number;
  
  // Photos
  devicePhotos: string[]; // Required verification photos
  billPhoto?: string;
  packagingPhoto?: string;
  
  // Deductions
  deductions: Array<{
    category: string;
    description: string;
    amount: number;
  }>;
  finalOffer: number;
  
  // OTP Verification
  customerOtpVerified: boolean;
  customerOtpVerifiedAt?: string;
  
  status: VerificationStatus;
  completedAt?: string;
  
  createdAt: string;
}

export interface VerificationSubmissionRequest {
  // Customer Identity
  customerIdVerified: boolean;
  idType: 'AADHAAR' | 'PAN' | 'DRIVING_LICENSE';
  idNumber: string;
  idPhoto: File;
  
  // Device Inspection
  actualCondition: string;
  functionalIssues: string[]; // JSON array
  physicalIssues: string[];
  accessoriesIncluded: string[];
  batteryHealth?: number;
  inspectionNotes: string;
  
  // Photos
  devicePhotos: File[]; // Required verification photos
  billPhoto?: File;
  packagingPhoto?: File;
  
  // Deductions
  deductions: Array<{
    category: string;
    description: string;
    amount: number;
  }>;
  finalOffer: number;
}

export interface VerificationSubmissionResponse {
  success: boolean;
  finalOffer: number;
  deductionsTotal: number;
  customerOtpSent: boolean;
  message: string;
  nextStep: 'AWAIT_CUSTOMER_ACCEPTANCE';
}

export interface AgentTasksResponse {
  success: boolean;
  data: {
    assigned: AgentTask[];
    completed: Array<{
      id: string;
      device: string;
      completedAt: string;
      commission: number;
    }>;
  };
  summary: {
    totalCommission: number;
    completedToday: number;
    activeTasks: number;
  };
}

export interface AvailableAgent {
  id: string;
  name: string;
  phoneNumber: string;
  location: { city: string; state: string };
  availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  stats: {
    rating: number;
    totalPickups: number;
    activeAssignments: number;
    completionRate: number;
  };
  distance?: number; // km from pickup location
  estimatedTime?: number; // minutes to reach
}

export interface AssignAgentRequest {
  agentId: string;
  scheduledDateTime?: string; // ISO string
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  notes?: string;
}

export interface AssignAgentResponse {
  success: boolean;
  assignmentId: string;
  agentNotified: boolean;
  clientNotified: boolean;
  message: string;
}

export interface AgentPerformanceMetrics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  failedTasks: number;
  averageRating: number;
  totalEarnings: number;
  completionRate: number;
  averageCompletionTime: number; // in minutes
  monthlyStats: {
    month: string;
    completed: number;
    earnings: number;
    rating: number;
  }[];
} 