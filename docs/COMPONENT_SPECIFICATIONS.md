# SELLIKO COMPONENT SPECIFICATIONS
## Premium UI Component Library Implementation

### 🎯 COMPONENT ARCHITECTURE PRINCIPLES

**Design Philosophy:** Apple/Airbnb-level component quality
**Consistency:** Every component follows the same patterns
**Accessibility:** WCAG 2.1 AA compliance built-in
**Performance:** Optimized for mobile-first rendering

---

## 🧱 FOUNDATION COMPONENTS

### Button Component
```typescript
// components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  rounded = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = [
    'inline-flex items-center justify-center font-medium transition-all duration-300',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98] transform-gpu',
  ];

  const variantClasses = {
    primary: [
      'bg-primary text-white shadow-sm',
      'hover:bg-primary/90 hover:shadow-md',
      'active:bg-primary/80',
    ],
    secondary: [
      'bg-secondary text-white shadow-sm',
      'hover:bg-secondary/90 hover:shadow-md',
      'active:bg-secondary/80',
    ],
    ghost: [
      'text-foreground hover:bg-accent hover:text-accent-foreground',
      'border border-input bg-background',
    ],
    danger: [
      'bg-destructive text-destructive-foreground shadow-sm',
      'hover:bg-destructive/90 hover:shadow-md',
    ],
    success: [
      'bg-green-600 text-white shadow-sm',
      'hover:bg-green-700 hover:shadow-md',
    ],
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-sm gap-1.5',
    md: 'h-10 px-4 text-base gap-2',
    lg: 'h-12 px-6 text-lg gap-2.5',
    xl: 'h-14 px-8 text-xl gap-3',
  };

  const roundedClasses = rounded ? 'rounded-full' : 'rounded-lg';
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        roundedClasses,
        widthClasses,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="shrink-0">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="shrink-0">{icon}</span>
          )}
        </>
      )}
    </button>
  );
};

// Usage Examples:
<Button variant="primary" size="lg" fullWidth>
  Submit Listing
</Button>

<Button variant="ghost" icon={<Heart />} iconPosition="left">
  Add to Wishlist
</Button>

<Button variant="danger" loading={isDeleting}>
  Delete Listing
</Button>
```

### Input Component
```typescript
// components/ui/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  success?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  isLoading,
  success,
  className,
  id,
  ...props
}) => {
  const inputId = id || useId();
  
  const inputClasses = cn(
    'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2',
    'text-sm ring-offset-background transition-colors duration-200',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    {
      'border-destructive focus-visible:ring-destructive': error,
      'border-green-500 focus-visible:ring-green-500': success,
      'pl-10': leftIcon,
      'pr-10': rightIcon || isLoading,
    },
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={inputId} className="text-sm font-medium">
          {label}
          {props.required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        
        <input
          id={inputId}
          className={inputClasses}
          {...props}
        />
        
        {(rightIcon || isLoading) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              rightIcon
            )}
          </div>
        )}
      </div>
      
      {(error || hint) && (
        <div className="space-y-1">
          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {error}
            </p>
          )}
          {hint && !error && (
            <p className="text-sm text-muted-foreground">{hint}</p>
          )}
        </div>
      )}
    </div>
  );
};

// Usage Examples:
<Input
  label="Phone Number"
  placeholder="+91 98765 43210"
  leftIcon={<Phone className="h-4 w-4" />}
  error={errors.phone}
  required
/>

<Input
  label="Search devices..."
  leftIcon={<Search className="h-4 w-4" />}
  rightIcon={<Filter className="h-4 w-4" />}
/>
```

### Card Component
```typescript
// components/ui/Card.tsx
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  clickable?: boolean;
  loading?: boolean;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  clickable = false,
  loading = false,
  children,
  className,
  ...props
}) => {
  const cardClasses = cn(
    'rounded-lg border bg-card text-card-foreground transition-all duration-300',
    {
      'shadow-sm': variant === 'default',
      'border-2': variant === 'outlined',
      'shadow-lg border-0': variant === 'elevated',
      'border-0 bg-transparent': variant === 'ghost',
      'cursor-pointer hover:shadow-md active:scale-[0.99]': clickable,
      'animate-pulse': loading,
    },
    {
      'p-0': padding === 'none',
      'p-3': padding === 'sm',
      'p-4': padding === 'md',
      'p-6': padding === 'lg',
    },
    className
  );

  return (
    <div className={cardClasses} {...props}>
      {loading ? <CardSkeleton /> : children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h3
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div className={cn('p-6 pt-0', className)} {...props} />
);

// Usage Examples:
<Card variant="elevated" clickable>
  <CardHeader>
    <CardTitle>iPhone 14 Pro Max</CardTitle>
  </CardHeader>
  <CardContent>
    <p>256GB Space Black • Excellent condition</p>
  </CardContent>
</Card>
```

---

## 📱 MARKETPLACE COMPONENTS

### DeviceCard Component
```typescript
// components/marketplace/DeviceCard.tsx
interface DeviceCardProps {
  listing: DeviceListing;
  onBidClick?: (listing: DeviceListing) => void;
  onWishlistToggle?: (listingId: string) => void;
  variant?: 'grid' | 'list';
  showQuickActions?: boolean;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  listing,
  onBidClick,
  onWishlistToggle,
  variant = 'grid',
  showQuickActions = true,
}) => {
  const timeLeft = useCountdown(listing.auctionEndTime);
  const isUrgent = timeLeft < 2 * 60 * 60 * 1000; // 2 hours
  const { isWishlisted, toggleWishlist } = useWishlist(listing.id);

  if (variant === 'list') {
    return <DeviceCardList {...props} />;
  }

  return (
    <Card 
      className="overflow-hidden group hover:shadow-lg transition-all duration-300"
      clickable={false}
    >
      <div className="relative">
        <AspectRatio ratio={1}>
          <Image
            src={listing.photos[0]}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </AspectRatio>
        
        {/* Time Left Badge */}
        <Badge
          variant={isUrgent ? 'destructive' : 'secondary'}
          className="absolute top-2 right-2 font-medium"
        >
          <Clock className="h-3 w-3 mr-1" />
          {formatTimeLeft(timeLeft)}
        </Badge>
        
        {/* Wishlist Button */}
        {showQuickActions && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm"
            onClick={() => toggleWishlist()}
          >
            <Heart
              className={cn('h-4 w-4', {
                'fill-red-500 text-red-500': isWishlisted,
                'text-gray-600': !isWishlisted,
              })}
            />
          </Button>
        )}
        
        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button variant="secondary" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            Quick View
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
          <p className="text-sm text-muted-foreground">
            {listing.storage} • {listing.color} • {listing.condition}
          </p>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Asking</span>
            <span className="font-medium">₹{listing.askingPrice.toLocaleString()}</span>
          </div>
          
          {listing.currentBid ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Bid</span>
              <span className="text-lg font-bold text-primary">
                ₹{listing.currentBid.toLocaleString()}
              </span>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-2">
              No bids yet
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <BidIndicator count={listing.bidCount} />
          <LocationBadge location={listing.location} />
        </div>
        
        <Button
          fullWidth
          size="md"
          onClick={() => onBidClick?.(listing)}
          disabled={listing.status !== 'active'}
        >
          {listing.currentBid ? 'Place Bid' : 'Start Bidding'}
        </Button>
      </CardContent>
    </Card>
  );
};

// Supporting Components
const BidIndicator: React.FC<{ count: number }> = ({ count }) => (
  <div className="flex items-center gap-1 text-sm text-muted-foreground">
    <Gavel className="h-3 w-3" />
    <span>{count} {count === 1 ? 'bid' : 'bids'}</span>
  </div>
);

const LocationBadge: React.FC<{ location: string }> = ({ location }) => (
  <div className="flex items-center gap-1 text-sm text-muted-foreground">
    <MapPin className="h-3 w-3" />
    <span>{location}</span>
  </div>
);
```

### BiddingModal Component
```typescript
// components/bidding/BiddingModal.tsx
interface BiddingModalProps {
  listing: DeviceListing;
  open: boolean;
  onClose: () => void;
  onSuccess?: (bid: Bid) => void;
}

export const BiddingModal: React.FC<BiddingModalProps> = ({
  listing,
  open,
  onClose,
  onSuccess,
}) => {
  const [bidAmount, setBidAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const minBid = (listing.currentBid || 0) + 100;
  const instantWin = listing.askingPrice;
  const isInstantWin = parseInt(bidAmount) >= instantWin;
  
  const { mutate: placeBid } = usePlaceBid();
  
  const handleSubmit = async () => {
    if (!validateBid()) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await placeBid({
        listingId: listing.id,
        amount: parseInt(bidAmount),
      });
      
      onSuccess?.(result);
      toast.success(
        isInstantWin 
          ? 'Congratulations! You won this auction!' 
          : 'Bid placed successfully!'
      );
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const validateBid = () => {
    if (parseInt(bidAmount) < minBid) {
      toast.error(`Minimum bid is ₹${minBid.toLocaleString()}`);
      return false;
    }
    if (!agreedToTerms) {
      toast.error('Please agree to the bidding terms');
      return false;
    }
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Place Your Bid</DialogTitle>
          <DialogDescription>
            {listing.title} • {listing.condition}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Bidding Status */}
          <BiddingStatus
            askingPrice={listing.askingPrice}
            currentBid={listing.currentBid}
            totalBids={listing.bidCount}
            timeLeft={listing.timeLeft}
          />
          
          {/* Bid Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="bidAmount">Your Bid Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                id="bidAmount"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="pl-8"
                placeholder={minBid.toString()}
                min={minBid}
                step={100}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Minimum bid: ₹{minBid.toLocaleString()}
            </p>
          </div>
          
          {/* Instant Win Alert */}
          {isInstantWin && (
            <Alert className="border-amber-200 bg-amber-50">
              <Trophy className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Instant Win!</AlertTitle>
              <AlertDescription className="text-amber-700">
                Bidding at or above ₹{instantWin.toLocaleString()} will immediately close this auction and you'll win the device.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Terms Agreement */}
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={setAgreedToTerms}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="terms"
                  className="text-sm font-normal cursor-pointer"
                >
                  I understand that bids are binding commitments
                </Label>
                <p className="text-xs text-muted-foreground">
                  You agree to complete the purchase if you win this auction.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!bidAmount || !agreedToTerms}
          >
            {isInstantWin ? 'Win Instantly' : 'Place Bid'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Supporting Component
const BiddingStatus: React.FC<{
  askingPrice: number;
  currentBid?: number;
  totalBids: number;
  timeLeft: number;
}> = ({ askingPrice, currentBid, totalBids, timeLeft }) => (
  <div className="bg-muted rounded-lg p-4 space-y-3">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-muted-foreground">Asking Price</p>
        <p className="text-lg font-bold">₹{askingPrice.toLocaleString()}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Time Left</p>
        <p className="text-lg font-bold text-amber-600">
          {formatTimeLeft(timeLeft)}
        </p>
      </div>
    </div>
    
    {currentBid ? (
      <div>
        <p className="text-sm text-muted-foreground">Highest Bid</p>
        <p className="text-xl font-bold text-primary">₹{currentBid.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground">{totalBids} total bids</p>
      </div>
    ) : (
      <p className="text-center text-muted-foreground">No bids yet</p>
    )}
  </div>
);
```

---

## 📝 FORM COMPONENTS

### DeviceListingWizard Component
```typescript
// components/listing/DeviceListingWizard.tsx
interface WizardStep {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  validation: (data: any) => boolean;
}

export const DeviceListingWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CreateListingRequest>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const steps: WizardStep[] = [
    {
      id: 'device-info',
      title: 'Device Information',
      component: DeviceInfoStep,
      validation: (data) => data.brand && data.model && data.storage && data.condition,
    },
    {
      id: 'technical-details',
      title: 'Technical Details',
      component: TechnicalDetailsStep,
      validation: (data) => data.imei1 && data.askingPrice && data.description,
    },
    {
      id: 'photos',
      title: 'Photos & Documentation',
      component: PhotosStep,
      validation: (data) => data.photos && data.photos.length >= 4,
    },
    {
      id: 'pickup',
      title: 'Pickup Details',
      component: PickupDetailsStep,
      validation: (data) => data.pickupAddress && data.preferredPickupTime,
    },
  ];
  
  const updateFormData = (stepData: Partial<CreateListingRequest>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };
  
  const goToNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };
  
  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createListing(formData);
      toast.success('Listing submitted for review!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to submit listing');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const CurrentStepComponent = steps[currentStep].component;
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = steps[currentStep].validation(formData);

  return (
    <div className="min-h-screen bg-gray-50">
      <WizardHeader
        steps={steps}
        currentStep={currentStep}
        onStepClick={setCurrentStep}
      />
      
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <CurrentStepComponent
          data={formData}
          onChange={updateFormData}
          onNext={goToNext}
          onBack={currentStep > 0 ? goToPrevious : undefined}
          canProceed={canProceed}
          isLastStep={isLastStep}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

// Wizard Header Component
const WizardHeader: React.FC<{
  steps: WizardStep[];
  currentStep: number;
  onStepClick: (step: number) => void;
}> = ({ steps, currentStep, onStepClick }) => (
  <div className="bg-white border-b">
    <div className="container max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                'flex items-center gap-2 cursor-pointer transition-colors',
                {
                  'text-primary': index <= currentStep,
                  'text-muted-foreground': index > currentStep,
                }
              )}
              onClick={() => onStepClick(index)}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  {
                    'bg-primary text-white': index < currentStep,
                    'bg-primary/20 text-primary border-2 border-primary': index === currentStep,
                    'bg-gray-200 text-gray-400': index > currentStep,
                  }
                )}
              >
                {index < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className="hidden sm:block text-sm font-medium">
                {step.title}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-4',
                  {
                    'bg-primary': index < currentStep,
                    'bg-gray-200': index >= currentStep,
                  }
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  </div>
);
```

### PriceInput Component
```typescript
// components/ui/PriceInput.tsx
interface PriceInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  value: number | string;
  onChange: (value: number) => void;
  currency?: string;
  error?: string;
  min?: number;
  max?: number;
}

export const PriceInput: React.FC<PriceInputProps> = ({
  label,
  value,
  onChange,
  currency = '₹',
  error,
  min = 0,
  max,
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState('');
  
  useEffect(() => {
    if (value) {
      setDisplayValue(formatCurrency(value));
    }
  }, [value]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = parseFloat(inputValue.replace(/[^0-9.]/g, ''));
    
    if (!isNaN(numericValue)) {
      onChange(numericValue);
      setDisplayValue(formatCurrency(numericValue));
    } else {
      onChange(0);
      setDisplayValue('');
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('₹', '');
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={props.id} className="text-sm font-medium">
          {label}
          {props.required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
          {currency}
        </span>
        <Input
          type="text"
          value={displayValue}
          onChange={handleChange}
          className="pl-8"
          error={error}
          {...props}
        />
      </div>
      
      {(min || max) && (
        <p className="text-sm text-muted-foreground">
          {min && max ? `Range: ${currency}${min.toLocaleString()} - ${currency}${max.toLocaleString()}` :
           min ? `Minimum: ${currency}${min.toLocaleString()}` :
           `Maximum: ${currency}${max.toLocaleString()}`}
        </p>
      )}
      
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
};
```

---

## 🖼️ MEDIA COMPONENTS

### PhotoUploadGrid Component
```typescript
// components/ui/PhotoUploadGrid.tsx
interface PhotoUploadGridProps {
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
  maxPhotos?: number;
  minPhotos?: number;
  guidelines?: string[];
  aspectRatio?: number;
}

export const PhotoUploadGrid: React.FC<PhotoUploadGridProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 6,
  minPhotos = 4,
  guidelines = [],
  aspectRatio = 1,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };
  
  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB
    );
    
    const totalFiles = photos.length + validFiles.length;
    const filesToAdd = totalFiles <= maxPhotos ? validFiles : validFiles.slice(0, maxPhotos - photos.length);
    
    if (filesToAdd.length > 0) {
      onPhotosChange([...photos, ...filesToAdd]);
    }
    
    if (totalFiles > maxPhotos) {
      toast.warning(`Maximum ${maxPhotos} photos allowed`);
    }
  };
  
  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };
  
  const canAddMore = photos.length < maxPhotos;
  const hasMinimumPhotos = photos.length >= minPhotos;

  return (
    <div className="space-y-4">
      {/* Guidelines */}
      {guidelines.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Photo Guidelines:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {guidelines.map((guideline, index) => (
              <li key={index} className="flex items-start gap-2">
                <Camera className="h-3 w-3 mt-0.5 shrink-0" />
                {guideline}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <PhotoThumbnail
            key={index}
            file={photo}
            onRemove={() => removePhoto(index)}
            aspectRatio={aspectRatio}
          />
        ))}
        
        {/* Add Photo Button */}
        {canAddMore && (
          <div
            className={cn(
              'border-2 border-dashed rounded-lg transition-colors cursor-pointer',
              'flex flex-col items-center justify-center gap-2 p-4',
              {
                'border-primary bg-primary/5': dragActive,
                'border-gray-300 hover:border-gray-400': !dragActive,
              }
            )}
            style={{ aspectRatio }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus className="h-8 w-8 text-gray-400" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Add Photo</p>
              <p className="text-xs text-gray-400">
                {photos.length}/{maxPhotos}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
      
      {/* Status Indicator */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {hasMinimumPhotos ? (
            <Badge variant="success" className="gap-1">
              <Check className="h-3 w-3" />
              {photos.length} photos uploaded
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              {minPhotos - photos.length} more photos needed
            </Badge>
          )}
        </div>
        
        <p className="text-muted-foreground">
          {photos.length}/{maxPhotos} photos
        </p>
      </div>
    </div>
  );
};

// Photo Thumbnail Component
const PhotoThumbnail: React.FC<{
  file: File;
  onRemove: () => void;
  aspectRatio: number;
}> = ({ file, onRemove, aspectRatio }) => {
  const [preview, setPreview] = useState<string>('');
  
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  
  return (
    <div className="relative group">
      <AspectRatio ratio={aspectRatio}>
        <Image
          src={preview}
          alt="Device photo"
          fill
          className="object-cover rounded-lg"
        />
      </AspectRatio>
      
      <Button
        variant="danger"
        size="sm"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
      
      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {(file.size / 1024 / 1024).toFixed(1)}MB
      </div>
    </div>
  );
};
```

This comprehensive component specifications document provides detailed implementation guidelines for building SELLIKO's premium UI components with Apple/Airbnb-level quality. Each component includes proper TypeScript interfaces, accessibility features, and mobile-first responsive design patterns. 