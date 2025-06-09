# SELLIKO FRONTEND DEVELOPMENT STRATEGY
## Apple/Airbnb-Level Mobile-First Implementation Plan

### 🎯 PROJECT OVERVIEW
SELLIKO is a premium mobile device resale auction platform for Kerala, India, featuring a sophisticated 5-user role system with real-time bidding, WhatsApp OTP authentication, and professional agent verification workflows.

**Target Quality:** Apple/Airbnb-level design excellence
**Primary Focus:** Mobile-first (80% mobile users in Kerala)
**Technical Stack:** Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
**Design System:** Plus Jakarta Sans font, #007AFF primary, 8px grid, 300ms animations

---

## 🏗️ DEVELOPMENT PHASES BREAKDOWN

### PHASE 1: FOUNDATION & DESIGN SYSTEM (1-2 hours)
**Goal:** Establish bulletproof design foundation and core components

#### 1.1 Design System Setup
```typescript
// Design tokens implementation
const theme = {
  colors: {
    primary: '#007AFF',      // iOS Blue
    secondary: '#5856D6',    // iOS Purple  
    success: '#34C759',      // iOS Green
    warning: '#FF9500',      // iOS Orange
    danger: '#FF3B30',       // iOS Red
    gray: {
      50: '#F2F2F7',
      100: '#E5E5EA',
      200: '#D1D1D6',
      300: '#C7C7CC',
      400: '#AEAEB2',
      500: '#8E8E93',
      600: '#636366',
      700: '#48484A',
      800: '#3A3A3C',
      900: '#1C1C1E',
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  }
}
```

#### 1.2 Core Components Library
**Priority Components:**
- `Button` (Primary, Secondary, Ghost, Danger variants)
- `Input` (Text, Phone, OTP, Search with validation states)
- `Card` (Device listing, bid history, notification cards)
- `Badge` (Status indicators, urgency levels)
- `Avatar` (User profiles, agent photos)
- `Modal` (Bidding, confirmation, details)
- `Skeleton` (Loading states for all components)
- `Toast` (Success, error, info notifications)

```typescript
// Example: Premium Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant,
  size,
  loading,
  icon,
  children,
  fullWidth,
  className,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-primary text-white hover:bg-primary/90 active:bg-primary/80': variant === 'primary',
          'bg-secondary text-white hover:bg-secondary/90': variant === 'secondary',
          'border border-input bg-background hover:bg-accent': variant === 'ghost',
          'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'danger',
        },
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4 text-base': size === 'md',
          'h-12 px-6 text-lg': size === 'lg',
        },
        {
          'w-full': fullWidth,
        },
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
```

#### 1.3 Layout System
```typescript
// Mobile-first responsive grid system
const GridSystem = {
  Container: 'max-w-md mx-auto px-4 sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl',
  Grid: 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  Stack: 'flex flex-col space-y-4',
  Inline: 'flex items-center space-x-4',
}
```

### PHASE 2: AUTHENTICATION SYSTEM (45 minutes)
**Goal:** Implement WhatsApp OTP authentication with premium UX

#### 2.1 Login Flow Screens
**Screen: Phone Number Entry**
```typescript
// components/auth/PhoneEntry.tsx
export const PhoneEntry = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <AuthLayout
      title="Welcome to SELLIKO"
      subtitle="Kerala's trusted mobile resale platform"
    >
      <div className="space-y-6">
        <PhoneInput
          value={phone}
          onChange={setPhone}
          placeholder="+91 98765 43210"
          error={errors.phone}
        />
        
        <Button
          fullWidth
          size="lg"
          loading={loading}
          onClick={handleSendOTP}
          disabled={!isValidPhone(phone)}
        >
          Send OTP via WhatsApp
        </Button>
        
        <TrustIndicators />
      </div>
    </AuthLayout>
  );
};
```

**Screen: OTP Verification**
```typescript
// components/auth/OTPVerification.tsx
export const OTPVerification = () => {
  return (
    <AuthLayout
      title="Enter OTP"
      subtitle={`We sent a code to ${maskedPhone}`}
      showBack
    >
      <div className="space-y-6">
        <OTPInput
          length={6}
          onComplete={handleVerifyOTP}
          error={errors.otp}
        />
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Didn't receive code?{' '}
            <Button variant="ghost" size="sm" onClick={handleResend}>
              Resend OTP
            </Button>
          </p>
        </div>
        
        <Timer initialTime={120} onExpire={handleExpire} />
      </div>
    </AuthLayout>
  );
};
```

#### 2.2 Advanced Authentication Components
```typescript
// components/auth/PhoneInput.tsx - Premium phone input with validation
export const PhoneInput = ({ value, onChange, error }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="phone">Phone Number</Label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <IndiaFlag className="h-5 w-5" />
        </div>
        <Input
          id="phone"
          type="tel"
          value={value}
          onChange={(e) => formatAndSetPhone(e.target.value, onChange)}
          placeholder="+91 98765 43210"
          className="pl-12"
          error={error}
        />
      </div>
      {error && <ErrorMessage message={error} />}
    </div>
  );
};

// components/auth/OTPInput.tsx - Smooth OTP input experience
export const OTPInput = ({ length, onComplete, error }) => {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    // Auto-advance to next input
    // Auto-paste handling
    // Backspace navigation
  };

  return (
    <div className="flex justify-center space-x-3">
      {otp.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => (refs.current[index] = el)}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          className="w-12 h-12 text-center text-lg font-bold"
          maxLength={1}
          inputMode="numeric"
        />
      ))}
    </div>
  );
};
```

### PHASE 3: CLIENT INTERFACE (90 minutes)
**Goal:** Build complete device listing flow and client dashboard

#### 3.1 4-Step Device Listing Wizard
**Wizard Navigation Component:**
```typescript
// components/listing/WizardSteps.tsx
export const WizardSteps = ({ currentStep, steps }) => {
  return (
    <div className="flex items-center justify-between px-4 py-6">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <StepIndicator
            step={index + 1}
            title={step.title}
            status={getStepStatus(index, currentStep)}
          />
          {index < steps.length - 1 && (
            <Connector isCompleted={currentStep > index} />
          )}
        </div>
      ))}
    </div>
  );
};
```

**Step 1: Device Information**
```typescript
// components/listing/steps/DeviceInfo.tsx
export const DeviceInfo = ({ data, onChange, onNext }) => {
  return (
    <StepLayout
      title="Device Information"
      subtitle="Tell us about your device"
      step="1/4"
    >
      <div className="space-y-6">
        <Select
          label="Brand"
          value={data.brand}
          onValueChange={(brand) => onChange({ brand })}
          options={DEVICE_BRANDS}
          required
        />
        
        <Select
          label="Model"
          value={data.model}
          onValueChange={(model) => onChange({ model })}
          options={getModelsForBrand(data.brand)}
          disabled={!data.brand}
          required
        />
        
        <Select
          label="Storage Capacity"
          value={data.storage}
          onValueChange={(storage) => onChange({ storage })}
          options={STORAGE_OPTIONS}
          required
        />
        
        <Select
          label="Color"
          value={data.color}
          onValueChange={(color) => onChange({ color })}
          options={getColorsForModel(data.brand, data.model)}
          required
        />
        
        <ConditionSelector
          value={data.condition}
          onChange={(condition) => onChange({ condition })}
        />
      </div>
      
      <WizardActions
        onNext={onNext}
        nextDisabled={!isStepValid(data)}
        nextText="Continue to Technical Details"
      />
    </StepLayout>
  );
};
```

**Step 2: Technical Details & Pricing**
```typescript
// components/listing/steps/TechnicalDetails.tsx
export const TechnicalDetails = ({ data, onChange, onNext, onBack }) => {
  return (
    <StepLayout
      title="Technical Details"
      subtitle="Device specifications and pricing"
      step="2/4"
    >
      <div className="space-y-6">
        <Input
          label="IMEI 1"
          value={data.imei1}
          onChange={(imei1) => onChange({ imei1 })}
          placeholder="123456789012345"
          maxLength={15}
          hint="Find in Settings > General > About"
          required
          pattern="[0-9]{15}"
        />
        
        <Input
          label="IMEI 2 (Dual SIM)"
          value={data.imei2}
          onChange={(imei2) => onChange({ imei2 })}
          placeholder="Optional for dual SIM devices"
          maxLength={15}
        />
        
        <BatteryHealthSlider
          value={data.batteryHealth}
          onChange={(batteryHealth) => onChange({ batteryHealth })}
        />
        
        <PriceInput
          label="Your Asking Price"
          value={data.askingPrice}
          onChange={(askingPrice) => onChange({ askingPrice })}
          currency="₹"
          min={1000}
          max={200000}
          required
        />
        
        <Textarea
          label="Description"
          value={data.description}
          onChange={(description) => onChange({ description })}
          placeholder="Describe your device condition, accessories included..."
          maxLength={500}
          required
        />
      </div>
      
      <WizardActions
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!isStepValid(data)}
        nextText="Add Photos"
      />
    </StepLayout>
  );
};
```

**Step 3: Photos & Documentation**
```typescript
// components/listing/steps/PhotoUpload.tsx
export const PhotoUpload = ({ data, onChange, onNext, onBack }) => {
  return (
    <StepLayout
      title="Photos & Documentation"
      subtitle="Show your device in the best light"
      step="3/4"
    >
      <div className="space-y-6">
        <PhotoUploadGrid
          photos={data.photos}
          onPhotosChange={(photos) => onChange({ photos })}
          minPhotos={4}
          maxPhotos={6}
          guidelines={[
            "Include front, back, screen, and charging port",
            "Use good lighting and clear focus",
            "Show any scratches or damage honestly"
          ]}
        />
        
        <BillPhotoUpload
          billPhoto={data.billPhoto}
          onBillPhotoChange={(billPhoto) => onChange({ billPhoto })}
        />
        
        <WarrantyInfo
          hasWarranty={data.hasWarranty}
          warrantyType={data.warrantyType}
          warrantyExpiry={data.warrantyExpiry}
          onChange={(warranty) => onChange(warranty)}
        />
      </div>
      
      <WizardActions
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!isStepValid(data)}
        nextText="Set Pickup Details"
      />
    </StepLayout>
  );
};
```

**Step 4: Pickup Details**
```typescript
// components/listing/steps/PickupDetails.tsx
export const PickupDetails = ({ data, onChange, onSubmit, onBack }) => {
  return (
    <StepLayout
      title="Pickup Information"
      subtitle="Where and when to collect your device"
      step="4/4"
    >
      <div className="space-y-6">
        <AddressForm
          address={data.pickupAddress}
          onChange={(pickupAddress) => onChange({ pickupAddress })}
          required
        />
        
        <PickupTimeSelector
          value={data.preferredPickupTime}
          onChange={(preferredPickupTime) => onChange({ preferredPickupTime })}
          options={[
            { value: 'morning', label: 'Morning (9 AM - 12 PM)' },
            { value: 'afternoon', label: 'Afternoon (12 PM - 4 PM)' },
            { value: 'evening', label: 'Evening (4 PM - 8 PM)' }
          ]}
          required
        />
        
        <TermsAndConditions
          termsAccepted={data.termsAccepted}
          accuracyConfirmed={data.accuracyConfirmed}
          onChange={(legal) => onChange(legal)}
        />
      </div>
      
      <WizardActions
        onBack={onBack}
        onNext={onSubmit}
        nextText="Submit Listing"
        nextIcon={<Upload />}
        nextDisabled={!isStepValid(data)}
        loading={submitting}
      />
    </StepLayout>
  );
};
```

#### 3.2 Client Dashboard
```typescript
// components/client/Dashboard.tsx
export const ClientDashboard = () => {
  return (
    <DashboardLayout
      title="Your Device Sales"
      subtitle="Manage listings and track sales"
    >
      <div className="space-y-6">
        <QuickActions />
        <ActiveListings />
        <RecentActivity />
      </div>
    </DashboardLayout>
  );
};

// components/client/QuickActions.tsx
export const QuickActions = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <ActionCard
        title="List New Device"
        description="Start selling your mobile device"
        icon={<Plus />}
        href="/list-device"
        primary
      />
      <ActionCard
        title="Track Orders"
        description="Check your sale progress"
        icon={<Package />}
        href="/orders"
      />
    </div>
  );
};
```

### PHASE 4: VENDOR MARKETPLACE (75 minutes)
**Goal:** Build sophisticated marketplace browsing and bidding system

#### 4.1 Device Marketplace
```typescript
// components/marketplace/DeviceGrid.tsx
export const DeviceGrid = () => {
  const { data: listings, loading, error } = useListings();
  
  return (
    <div className="space-y-6">
      <MarketplaceFilters />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings?.map((listing) => (
          <DeviceCard key={listing.id} listing={listing} />
        ))}
      </div>
      <Pagination />
    </div>
  );
};

// components/marketplace/DeviceCard.tsx
export const DeviceCard = ({ listing }) => {
  const timeLeft = useCountdown(listing.auctionEndTime);
  const isUrgent = timeLeft < 2 * 60 * 60 * 1000; // 2 hours
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <Image
          src={listing.photos[0]}
          alt={listing.title}
          className="aspect-square object-cover"
        />
        <Badge
          variant={isUrgent ? 'destructive' : 'secondary'}
          className="absolute top-2 right-2"
        >
          {formatTimeLeft(timeLeft)}
        </Badge>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg">{listing.title}</h3>
          <p className="text-sm text-muted-foreground">
            {listing.storage} • {listing.color} • {listing.condition}
          </p>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm">Asking: <span className="font-medium">₹{listing.askingPrice.toLocaleString()}</span></p>
          {listing.currentBid ? (
            <p className="text-lg font-bold text-primary">₹{listing.currentBid.toLocaleString()}</p>
          ) : (
            <p className="text-muted-foreground">No bids yet</p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <BidIndicator count={listing.bidCount} />
          <p className="text-sm text-muted-foreground">📍 {listing.location}</p>
        </div>
        
        <Button fullWidth onClick={() => openBidModal(listing)}>
          Place Bid
        </Button>
      </CardContent>
    </Card>
  );
};
```

#### 4.2 Bidding System
```typescript
// components/bidding/BidModal.tsx
export const BidModal = ({ listing, open, onClose }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  
  const minBid = listing.currentBid + 100;
  const instantWin = listing.askingPrice;
  
  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <h2>Place Your Bid</h2>
          <p className="text-sm text-muted-foreground">{listing.title}</p>
        </ModalHeader>
        
        <div className="space-y-6">
          <BiddingStatus
            askingPrice={listing.askingPrice}
            currentBid={listing.currentBid}
            totalBids={listing.bidCount}
            timeLeft={listing.timeLeft}
          />
          
          <div className="space-y-2">
            <Label htmlFor="bid">Your Bid Amount</Label>
            <PriceInput
              id="bid"
              value={bidAmount}
              onChange={setBidAmount}
              min={minBid}
              error={validateBid(bidAmount, minBid)}
            />
            <p className="text-sm text-muted-foreground">
              Minimum bid: ₹{minBid.toLocaleString()}
            </p>
          </div>
          
          {parseInt(bidAmount) >= instantWin && (
            <InstantWinAlert price={instantWin} />
          )}
          
          <BidTerms />
        </div>
        
        <ModalActions>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handlePlaceBid}
            loading={loading}
            disabled={!isValidBid(bidAmount, minBid)}
          >
            Place Bid
          </Button>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};
```

### PHASE 5: REAL-TIME FEATURES (45 minutes)
**Goal:** Implement WebSocket connections for live bidding and notifications

#### 5.1 Real-Time Bidding
```typescript
// hooks/useBidding.ts
export const useBidding = (listingId: string) => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const socket = io('/bidding');
    
    socket.emit('join_room', { listingId });
    
    socket.on('new_bid', (bid: Bid) => {
      setBids(prev => [bid, ...prev]);
      // Show toast notification
      toast.success(`New bid: ₹${bid.amount.toLocaleString()}`);
    });
    
    socket.on('auction_ending', ({ timeLeft }) => {
      if (timeLeft < 60000) { // 1 minute
        toast.warning('Auction ending in 1 minute!', {
          duration: 10000,
        });
      }
    });
    
    socket.on('instant_win', (data) => {
      toast.success(`Auction won by ${data.winnerName}!`);
    });
    
    return () => socket.disconnect();
  }, [listingId]);
  
  return { bids, isConnected };
};

// components/bidding/LiveBidding.tsx
export const LiveBidding = ({ listing }) => {
  const { bids, isConnected } = useBidding(listing.id);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant={isConnected ? 'success' : 'secondary'}>
          {isConnected ? '🟢 Live' : '🔴 Connecting...'}
        </Badge>
        <span className="text-sm">Real-time bidding</span>
      </div>
      
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {bids.map((bid) => (
          <BidItem key={bid.id} bid={bid} />
        ))}
      </div>
    </div>
  );
};
```

#### 5.2 Push Notifications
```typescript
// components/notifications/NotificationCenter.tsx
export const NotificationCenter = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <Button variant="ghost" size="sm" onClick={markAllAsRead}>
          Mark all read
        </Button>
      </div>
      
      <div className="space-y-2">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRead={() => markAsRead(notification.id)}
          />
        ))}
      </div>
    </div>
  );
};
```

### PHASE 6: ADMIN & AGENT INTERFACES (60 minutes)
**Goal:** Build approval workflows and agent task management

#### 6.1 Admin Approval Interface
```typescript
// components/admin/ListingReview.tsx
export const ListingReview = ({ listing }) => {
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);
  const [comments, setComments] = useState('');
  
  return (
    <div className="space-y-6">
      <ListingPreview listing={listing} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PhotoReview photos={listing.photos} />
        <DeviceDetails listing={listing} />
      </div>
      
      <ReviewDecision
        decision={decision}
        onDecisionChange={setDecision}
        comments={comments}
        onCommentsChange={setComments}
      />
      
      <div className="flex gap-4">
        <Button
          variant="danger"
          onClick={() => handleReview('reject')}
          disabled={decision !== 'reject'}
        >
          Reject Listing
        </Button>
        <Button
          onClick={() => handleReview('approve')}
          disabled={decision !== 'approve'}
        >
          Approve Listing
        </Button>
      </div>
    </div>
  );
};
```

#### 6.2 Agent Task Management
```typescript
// components/agent/TaskDashboard.tsx
export const AgentTaskDashboard = () => {
  const { tasks } = useAgentTasks();
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Assigned Tasks" value={tasks.assigned.length} />
        <StatsCard title="Completed Today" value={tasks.completedToday} />
        <StatsCard title="Total Earnings" value={`₹${tasks.totalEarnings}`} />
      </div>
      
      <TaskList tasks={tasks.assigned} />
    </div>
  );
};

// components/agent/TaskCard.tsx
export const TaskCard = ({ task }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="font-semibold">{task.deviceName}</h3>
            <p className="text-sm text-muted-foreground">
              Order #{task.orderId}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant={getPriorityVariant(task.priority)}>
                {task.priority}
              </Badge>
              <span className="text-sm">₹{task.orderValue.toLocaleString()}</span>
            </div>
          </div>
          
          <TaskActions task={task} />
        </div>
        
        <CustomerInfo customer={task.customer} />
      </CardContent>
    </Card>
  );
};
```

### PHASE 7: MOBILE OPTIMIZATION & POLISH (45 minutes)
**Goal:** Perfect mobile experience and performance optimization

#### 7.1 Mobile Performance Optimization
```typescript
// hooks/useIntersectionObserver.ts
export const useIntersectionObserver = (options = {}) => {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [node, setNode] = useState<Element | null>(null);
  
  const observer = useRef<IntersectionObserver>();
  
  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(([entry]) => {
      setEntry(entry);
    }, options);
    
    if (node) observer.current.observe(node);
    
    return () => observer.current?.disconnect();
  }, [node, options]);
  
  return [setNode, entry];
};

// components/common/LazyImage.tsx
export const LazyImage = ({ src, alt, ...props }) => {
  const [setRef, entry] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  });
  
  const [imageSrc, setImageSrc] = useState('');
  const [imageRef, setImageRef] = useState<HTMLImageElement>();
  
  useEffect(() => {
    if (entry?.isIntersecting && src && !imageSrc) {
      setImageSrc(src);
    }
  }, [entry, src, imageSrc]);
  
  return (
    <div ref={setRef} {...props}>
      {imageSrc ? (
        <img
          ref={setImageRef}
          src={imageSrc}
          alt={alt}
          onLoad={() => setImageLoaded(true)}
          className={cn(
            'transition-opacity duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      ) : (
        <Skeleton className="w-full h-full" />
      )}
    </div>
  );
};
```

#### 7.2 Touch Interactions & Gestures
```typescript
// hooks/useSwipeGesture.ts
export const useSwipeGesture = (onSwipeLeft?: () => void, onSwipeRight?: () => void) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const minSwipeDistance = 50;
  
  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && onSwipeLeft) onSwipeLeft();
    if (isRightSwipe && onSwipeRight) onSwipeRight();
  };
  
  return { onTouchStart, onTouchMove, onTouchEnd };
};

// components/marketplace/SwipeableDeviceCard.tsx
export const SwipeableDeviceCard = ({ listing }) => {
  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipeGesture(
    () => addToWishlist(listing.id),
    () => openQuickView(listing.id)
  );
  
  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="touch-manipulation"
    >
      <DeviceCard listing={listing} />
    </div>
  );
};
```

---

## 🎨 DESIGN IMPLEMENTATION GUIDELINES

### Typography Scale
```css
/* Typography using Plus Jakarta Sans */
.text-xs { font-size: 12px; line-height: 16px; }
.text-sm { font-size: 14px; line-height: 20px; }
.text-base { font-size: 16px; line-height: 24px; }
.text-lg { font-size: 18px; line-height: 28px; }
.text-xl { font-size: 20px; line-height: 28px; }
.text-2xl { font-size: 24px; line-height: 32px; }
.text-3xl { font-size: 30px; line-height: 36px; }
```

### Animation Standards
```css
/* Consistent 300ms animations */
.transition-all { transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1); }
.animate-in { animation: slideIn 300ms ease-out; }
.animate-out { animation: slideOut 300ms ease-in; }

@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Touch Target Standards
```css
/* Minimum 44px touch targets */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## 🔧 DEVELOPMENT TOOLS & SETUP

### Required Dependencies
```json
{
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-toast": "^1.1.5",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.294.0",
    "socket.io-client": "^4.7.4",
    "react-hook-form": "^7.48.2",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.4",
    "react-query": "^3.39.3",
    "framer-motion": "^10.16.16"
  }
}
```

### Build Configuration
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['your-s3-bucket.s3.amazonaws.com'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## ⚡ PERFORMANCE BENCHMARKS

### Loading Performance Targets
- **Initial Page Load:** < 2 seconds on 3G
- **Route Transitions:** < 300ms
- **Image Loading:** Progressive with lazy loading
- **Bundle Size:** < 500KB initial, < 200KB per route

### Mobile Optimization Checklist
- ✅ Touch targets ≥ 44px
- ✅ Smooth 60fps animations
- ✅ Offline-first with service workers
- ✅ PWA capabilities
- ✅ iOS Safari compatibility
- ✅ Android Chrome optimization

---

## 🚀 DEPLOYMENT STRATEGY

### Production Optimization
```bash
# Build optimization
npm run build
npm run analyze # Bundle analysis

# Performance testing
npm run lighthouse
npm run test:e2e
```

### Environment Configuration
```env
# Production environment variables
NEXT_PUBLIC_API_URL=https://api.selliko.com
NEXT_PUBLIC_SOCKET_URL=wss://api.selliko.com
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_GA_ID=your_ga_id
```

This comprehensive strategy provides a complete roadmap for building SELLIKO with Apple/Airbnb-level quality, focusing on mobile-first design, premium user experience, and scalable architecture. Each phase builds upon the previous one, ensuring a solid foundation for the sophisticated auction platform. 