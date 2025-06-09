import { UserRole, Address, BankDetails } from './index';

// User Types
export interface User {
  id: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  role: UserRole;
  isVerified: boolean;
  isApproved: boolean;
  profileImage?: string;
  address?: Address;
  bankDetails?: BankDetails;
  businessInfo?: BusinessInfo;
  agentInfo?: AgentInfo;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface BusinessInfo {
  businessName: string;
  businessType: string;
  gstNumber?: string;
  registrationNumber?: string;
  yearEstablished?: number;
  description?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export interface AgentInfo {
  agentId: string;
  coverageAreas: string[];
  rating: number;
  totalPickups: number;
  completionRate: number;
  totalEarnings: number;
  activeTasks: number;
  isAvailable: boolean;
  workingHours?: {
    start: string;
    end: string;
    days: string[];
  };
  vehicleInfo?: {
    type: 'bike' | 'car' | 'scooter';
    registrationNumber: string;
  };
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email?: string;
  address?: Address;
  bankDetails?: BankDetails;
  businessInfo?: BusinessInfo;
  agentInfo?: Partial<AgentInfo>;
}

export interface CreateUserRequest {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  email?: string;
  address?: Address;
  businessInfo?: BusinessInfo;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: Address;
  bankDetails?: BankDetails;
  businessInfo?: BusinessInfo;
  agentInfo?: Partial<AgentInfo>;
}

export interface UserStats {
  totalListings?: number;
  totalSales?: number;
  totalBids?: number;
  totalWins?: number;
  totalTasks?: number;
  totalEarnings?: number;
  successRate?: number;
  averageRating?: number;
}

export interface UserPreferences {
  notifications: {
    whatsapp: boolean;
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  language: string;
  currency: string;
  timezone: string;
} 