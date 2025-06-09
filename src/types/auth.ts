import { UserRole } from './index';

// Authentication Types
export interface LoginCredentials {
  phoneNumber: string;
  otp: string;
}

export interface SendOTPRequest {
  phoneNumber: string;
  purpose?: 'LOGIN' | 'TRANSACTION_ACCEPT' | 'VENDOR_RECEIPT' | 'REGISTRATION';
  transactionId?: string;
}

export interface SendOTPResponse {
  success: boolean;
  otpId: string;
  expiresIn: number; // seconds
  message: string;
  attemptsRemaining?: number;
}

export interface VerifyOTPRequest {
  phoneNumber: string;
  otpCode: string;
  purpose: string;
  transactionId?: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    role: string;
    isFirstTime: boolean;
  };
  token?: string;
  message: string;
  nextStep?: 'COMPLETE_PROFILE' | 'DASHBOARD' | 'TRANSACTION_CONTINUE';
}

export interface AuthUser {
  id: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface JWTPayload {
  userId: string;
  phoneNumber: string;
  role: UserRole;
  sessionId: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
} 