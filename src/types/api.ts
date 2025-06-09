// Standard API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  timestamp: string;
  requestId?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId?: string;
  };
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Request/Response pairs for all endpoints
export interface ListingsQuery {
  status?: string;
  clientId?: string;
  page?: number;
  limit?: number;
  search?: string;
  brand?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  sortBy?: string;
}

export interface BidsQuery {
  vendorId?: string;
  listingId?: string;
  status?: 'active' | 'won' | 'lost';
  page?: number;
  limit?: number;
}

export interface OrdersQuery {
  clientId?: string;
  vendorId?: string;
  agentId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface MarketplaceQuery {
  search?: string;
  brand?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'ending-soon' | 'lowest-price' | 'highest-price';
  page?: number;
  limit?: number;
}

export interface AgentTasksQuery {
  status?: string;
  priority?: string;
  date?: string;
}

export interface NotificationsQuery {
  unreadOnly?: boolean;
  type?: string;
  limit?: number;
}

// HTTP Method Types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API Configuration
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
}

// Request Options
export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
  timeout?: number;
}

// File Upload
export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResponse {
  success: boolean;
  urls: string[];
  message: string;
}

// WebSocket Events
export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: string;
  userId?: string;
}

// Admin Dashboard Response
export interface AdminDashboardResponse {
  metrics: {
    pendingReviews: number;
    availableAgents: number;
    activeListings: number;
    pendingAssignments: number;
    totalRevenue: number;
    platformFees: number;
  };
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: string;
  }>;
}

// Search & Filters
export interface SearchFilters {
  query?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} 