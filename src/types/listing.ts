import { ListingStatus, DeviceCondition, Address, BidStatus, PickupTimeSlot } from './index';

// Device Listing Types
export interface DeviceListing {
  id: string;
  clientId: string;
  
  // Device Information (Step 1)
  brand: string;
  model: string;
  variant?: string;
  storageCapacity: string;
  color: string;
  condition: DeviceCondition;
  
  // Technical Details (Step 2)
  imei1: string;
  imei2?: string;
  batteryHealth?: number; // 1-100%
  askingPrice: number; // in paise
  description: string;
  
  // Photos & Documentation (Step 3)
  devicePhotos: string[]; // S3 URLs
  billPhoto?: string;
  hasWarranty: boolean;
  warrantyType?: string;
  warrantyExpiry?: string;
  
  // Pickup Details (Step 4)
  pickupAddress: Address;
  pickupTime: PickupTimeSlot;
  
  // System Fields
  status: ListingStatus;
  submittedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  auctionStartTime?: string;
  auctionEndTime?: string;
  
  // Analytics
  views: number;
  watchers: string[]; // user IDs
  
  // Metadata
  metadata?: Record<string, any>;
}

export interface CreateListingRequest {
  // Step 1: Device Information
  brand: string;
  model: string;
  variant?: string;
  storageCapacity: string;
  color: string;
  condition: DeviceCondition;
  
  // Step 2: Technical Details
  imei1: string;
  imei2?: string;
  batteryHealth?: number;
  askingPrice: number; // in rupees, will convert to paise
  description: string;
  
  // Step 3: Files & Documentation
  devicePhotos: File[]; // 4-6 photos required
  billPhoto?: File;
  hasWarranty: boolean;
  warrantyType?: string;
  warrantyExpiry?: string;
  
  // Step 4: Pickup Details
  pickupAddress: Address;
  pickupTime: PickupTimeSlot;
}

export interface UpdateListingRequest {
  description?: string;
  askingPrice?: number;
  pickupAddress?: Address;
  pickupTime?: PickupTimeSlot;
}

export interface ListingApprovalRequest {
  approved: boolean;
  rejectionReason?: string;
  auctionDurationHours?: number; // default 24
}

// Bidding Types
export interface Bid {
  id: string;
  listingId: string;
  vendorId: string;
  amount: number; // in paise
  message?: string;
  status: BidStatus;
  isInstantWin: boolean;
  isWinning: boolean;
  placedAt: string;
  expiresAt: string;
}

export interface PlaceBidRequest {
  listingId: string;
  amount: number; // in rupees
  message?: string;
}

export interface PlaceBidResponse {
  success: boolean;
  bidId: string;
  currentStatus: {
    isWinning: boolean;
    position: number; // 1st, 2nd, etc.
    highestBid: number;
    timeRemaining: number; // seconds until bidding ends
  };
  instantWin?: {
    won: boolean;
    orderId?: string;
    message: string;
  };
}

export interface BiddingStatus {
  listingId: string;
  status: 'ACTIVE' | 'CLOSED' | 'ACCEPTED';
  timeRemaining: number; // seconds
  currentHighestBid: {
    amount: number;
    vendorName?: string; // Anonymous or actual name
    placedAt: string;
  };
  totalBids: number;
  askingPrice: number;
  instantWinAvailable: boolean;
}

// Marketplace Types
export interface MarketplaceListing extends DeviceListing {
  currentBid?: number;
  totalBids: number;
  timeLeft: number; // minutes
  isWatched?: boolean;
  distance?: number; // km from user location
}

export interface MarketplaceFilters {
  search?: string;
  brand?: string;
  condition?: DeviceCondition;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  sortBy?: 'newest' | 'ending-soon' | 'lowest-price' | 'highest-price' | 'nearest';
  page?: number;
  limit?: number;
}

export interface MarketplaceResponse {
  listings: MarketplaceListing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: {
    availableBrands: string[];
    priceRange: { min: number; max: number };
    locations: string[];
  };
}

// Device Information
export interface DeviceSpecs {
  brand: string;
  model: string;
  variant?: string;
  storageOptions: string[];
  colorOptions: string[];
  launchPrice?: number;
  specifications?: {
    display?: string;
    processor?: string;
    camera?: string;
    battery?: string;
    os?: string;
  };
} 