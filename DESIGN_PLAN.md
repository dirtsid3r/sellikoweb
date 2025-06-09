# SELLIKO - COMPLETE DESIGN & FLOW PLAN

// ... existing code ...

**READY FOR NEXT SECTION:**
The **Admin Approval Interface** is now comprehensively detailed! Should we proceed with the **Client Interface** specification next?

---

## 3. CLIENT INTERFACE - COMPLETE SPECIFICATION

### 3.1 Client Dashboard Overview
```
CLIENT DASHBOARD LAYOUT:
┌─────────────────────────────────────────────────────────┐
│ 🏷️ selliko Client Portal                    👤 Deepika Das │
│                                                         │
│ Navigation                                              │
│ 🏠 Dashboard                                            │
│ ➕ List Device                                          │
│ 📋 My Listings                                         │
│ 📦 Orders                                              │
│ 👤 Profile                                             │
│                                                         │
│ Welcome back, Deepika! 👋                              │
│ Manage your device listings and track your sales from  │
│ Kerala's trusted mobile resale platform.               │
│                                                         │
│ Quick Actions                                           │
│ ┌─────────────────────────────────────────────────┐     │
│ │ [➕ List New Device] [📋 View My Listings]      │     │
│ │ [📦 Track Orders]                               │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
└─────────────────────────────────────────────────────────┘

SPECIFICATIONS:
- Clean Sidebar: Simple navigation with icons and labels
- Minimal Dashboard: Welcome message and essential quick actions only
- Quick Actions: Direct navigation to core client functions
- No Stats Cards: Focus on functionality over metrics
- Professional Branding: selliko in Plus Jakarta Sans font
- Kerala-focused: Emphasis on local trusted platform
```

### 3.2 Device Listing Wizard (4-Step Process)
```
STEP 1: DEVICE INFORMATION
┌─────────────────────────────────────────────────────────┐
│ selliko - List Your Device                     Step 1/4 │
│                                                         │
│ Device Information                                      │
│                                                         │
│ Brand *                                                 │
│ ┌─────────────────────────────────────────────────┐     │
│ │ [Apple ▼]                                       │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ Model *                                                 │
│ ┌─────────────────────────────────────────────────┐     │
│ │ [iPhone 14 Pro Max ▼]                          │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ Storage Capacity *                                      │
│ ┌─────────────────────────────────────────────────┐     │
│ │ [256GB ▼]                                       │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ Color *                                                 │
│ ┌─────────────────────────────────────────────────┐     │
│ │ [Space Black ▼]                                 │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ Condition *                                             │
│ ○ Excellent  ○ Good  ○ Fair  ○ Poor                     │
│                                                         │
│              [Cancel]           [Next Step →]          │
│                                                         │
└─────────────────────────────────────────────────────────┘

STEP 2: TECHNICAL DETAILS & PRICING
┌─────────────────────────────────────────────────────────┐
│ selliko - List Your Device                     Step 2/4 │
│                                                         │
│ Technical Details                                       │
│                                                         │
│ IMEI 1 * (15 digits)                                   │
│ ┌─────────────────────────────────────────────────┐     │
│ │ [123456789012345]                               │     │
│ └─────────────────────────────────────────────────┘     │
│ 📱 Find in Settings > General > About                   │
│                                                         │
│ IMEI 2 (if dual SIM)                                   │
│ ┌─────────────────────────────────────────────────┐     │
│ │ [Optional]                                      │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ Battery Health (%)                                      │
│ ┌─────────────────────────────────────────────────┐     │
│ │ [89]                                            │     │
│ └─────────────────────────────────────────────────┘     │
│ 📱 Find in Settings > Battery > Battery Health          │
│                                                         │
│ Your Asking Price *                                     │
│ ┌─────────────────────────────────────────────────┐     │
│ │ ₹ [55,000]                                      │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ Description *                                           │
│ ┌─────────────────────────────────────────────────┐     │
│ │ [Excellent condition iPhone with all           │     │
│ │  accessories. Minimal usage, no scratches...]   │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│            [← Back]              [Next Step →]         │
│                                                         │
└─────────────────────────────────────────────────────────┘

STEP 3: PHOTOS & DOCUMENTATION
┌─────────────────────────────────────────────────────────┐
│ selliko - List Your Device                     Step 3/4 │
│                                                         │
│ Photos & Documentation                                  │
│                                                         │
│ Device Photos * (4-6 required)                         │
│ ┌─────────────────────────────────────────────────┐     │
│ │ [📸 Upload Photos]                              │     │
│ │                                                 │     │
│ │ [📱 Front] [📱 Back] [📱 Screen] [📱 Ports]     │     │
│ │ ✅ Uploaded ✅ Uploaded ⏳ Upload ⏳ Upload      │     │
│ └─────────────────────────────────────────────────┘     │
│ 💡 Include: Front, back, screen, charging port, sides   │
│                                                         │
│ Purchase Bill (Optional)                                │
│ ┌─────────────────────────────────────────────────┐     │
│ │ [📄 Upload Bill Photo]                          │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ Warranty Information                                    │
│ ☐ Device has active warranty                           │
│                                                         │
│ If warranty active:                                     │
│ Warranty Type: [Apple Care ▼]                          │
│ Expires: [Mar 2025 ▼]                                  │
│                                                         │
│            [← Back]              [Next Step →]         │
│                                                         │
└─────────────────────────────────────────────────────────┘

STEP 4: PICKUP DETAILS
┌─────────────────────────────────────────────────────────┐
│ selliko - List Your Device                     Step 4/4 │
│                                                         │
│ Pickup Information                                      │
│                                                         │
│ Pickup Address *                                        │
│ ┌─────────────────────────────────────────────────┐     │
│ │ Street Address                                  │     │
│ │ [TC 15/2890, Pattoor Road]                      │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ ┌─────────────────────────────────────────────────┐     │
│ │ City *          │ State *        │ Pincode *     │     │
│ │ [Thiruvanantha…] │ [Kerala ▼]    │ [695011]      │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ Landmark (Optional)                                     │
│ ┌─────────────────────────────────────────────────┐     │
│ │ [Near Technopark Gate]                          │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ Preferred Pickup Time *                                 │
│ ○ Morning (9 AM - 12 PM)                               │
│ ○ Afternoon (12 PM - 4 PM)                             │
│ ○ Evening (4 PM - 8 PM)                                │
│                                                         │
│ ┌─────────────────────────────────────────────────┐     │
│ │ ✅ I agree to the terms and conditions          │     │
│ │ ✅ Device details provided are accurate         │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│            [← Back]              [Submit Listing]      │
│                                                         │
└─────────────────────────────────────────────────────────┘

WIZARD SUCCESS PAGE
┌─────────────────────────────────────────────────────────┐
│ Listing Submitted Successfully! ✅                      │
│                                                         │
│ 📱 iPhone 14 Pro Max 256GB                             │
│ Listing ID: #SLK2024001234                             │
│                                                         │
│ What happens next:                                      │
│ 1. Admin review (2-6 hours)                           │
│ 2. Listing goes live for bidding                       │
│ 3. You'll get WhatsApp notifications                   │
│                                                         │
│ [View My Listings] [List Another Device]               │
│                                                         │
└─────────────────────────────────────────────────────────┘

SPECIFICATIONS:
- 4-Step Progressive Wizard: Device Info, Technical Details, Photos, Pickup
- Follows CreateListingRequest API structure exactly
- Required Fields: Marked with * as per API specification
- IMEI Validation: 15-digit validation with helper text
- Photo Upload: 4-6 photos required with visual feedback
- Kerala-Specific: State dropdown defaulting to Kerala
- File Handling: Support for device photos and bill photos
- Warranty Capture: Conditional fields for warranty information
- Pickup Preferences: Time slot selection (Morning/Afternoon/Evening)
- Address Validation: Complete pickup address with landmark
- Terms Agreement: Required checkboxes before submission
- Success Flow: Clear next steps and navigation options
```

### 3.3 My Listings Management
```
MY LISTINGS VIEW:
┌─────────────────────────────────────────────────────────┐
│ My Device Listings                      [+ List Device] │
│                                                         │
│ [All Status ▼] [Date ▼] [Search listings...]           │
│                                                         │
│ ┌─────────────────────────────────────────────────┐     │
│ │ 📱 iPhone 14 Pro Max 256GB                     │     │
│ │ Listed: Dec 15, 2024 • Status: 🟡 Pending      │     │
│ │ Asking: ₹55,000 • Admin Review in Progress     │     │
│ │ [View Details] [Edit] [Cancel Listing]         │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ ┌─────────────────────────────────────────────────┐     │
│ │ 📱 Samsung Galaxy S23 Ultra                    │     │
│ │ Listed: Dec 12, 2024 • Status: ✅ Active       │     │
│ │ Asking: ₹75,000 • Current Bid: ₹73,000        │     │
│ │ 3 bids • 6h 12m left                          │     │
│ │ [View Bids] [Accept Current] [Manage]          │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
└─────────────────────────────────────────────────────────┘

SPECIFICATIONS:
- Simple List View: Card layout showing key information
- Status Indicators: Color-coded status (Pending, Active, Sold, Expired)
- Filter Options: Status and date filtering
- Action Buttons: Context-appropriate actions for each listing
- Bid Management: View and accept bids for active listings
- Clear Hierarchy: Most important information prominently displayed
```

### 3.4 Client Order Status Tracking
```
CLIENT ORDER TRACKING:
┌─────────────────────────────────────────────────────────┐
│ Your Device Sale Status                                 │
│                                                         │
│ 📱 iPhone 14 Pro Max 256GB                             │
│ Order #SLK2024001234                                    │
│                                                         │
│ 🔄 Assigning Pickup Agent                               │
│                                                         │
│ What's happening now:                                   │
│ • Your device has been sold successfully               │
│ • We're assigning a pickup agent for verification      │
│ • The agent will contact you within 2 hours           │
│ • You'll receive verification details on WhatsApp      │
│                                                         │
│ Timeline:                                               │
│ ✅ Listing approved                                     │
│ ✅ Bid won by Kochi Mobile Store                        │
│ 🔄 Assigning pickup agent (current)                    │
│ ⏳ Agent verification                                    │
│ ⏳ Payment processing                                    │
│                                                         │
│ What happens next:                                      │
│ 1. Agent will be assigned within 2 hours              │
│ 2. Agent will contact you to schedule pickup          │
│ 3. Verification at your location                       │
│ 4. Accept final offer via OTP                         │
│                                                         │
│ Need help? [Contact Support]                           │
│                                                         │
└─────────────────────────────────────────────────────────┘

SPECIFICATIONS:
- Client-Focused: Clear explanation of what's happening
- Assignment Status: Show that agent assignment is in progress
- Timeline: Updated progression with assignment phase
- Clear Expectations: What the client can expect next
- Support Access: Easy way to get help if needed
- WhatsApp Integration: Notifications mentioned prominently
- Real-time Updates: Current status with visual indicators
- Progressive Disclosure: Next steps clearly outlined
```

### 3.5 Client Sidebar Navigation
```
CLIENT SIDEBAR LAYOUT:
┌─────────────────────────┐
│ selliko                 │
│ Client Portal           │
│                         │
│ Navigation              │
│ 🏠 Dashboard            │
│ ➕ List Device          │
│ 📋 My Listings          │
│ 📦 Orders               │
│ 👤 Profile              │
│                         │
│ Account                 │
│ 👤 Deepika Das          │
│    +919876331197        │
│    CLIENT               │
│                         │
│ [Sign Out]              │
└─────────────────────────┘

SPECIFICATIONS:
- Clean Branding: selliko in Plus Jakarta Sans font
- Essential Navigation: Only core client functions
- User Profile: Name, phone, role badge display
- Simple Design: Minimal, functional layout
- Consistent Icons: Heroicons 2 throughout
- Account Section: User info with sign out option
```

---

## 6. BIDDING SYSTEM INTERFACE - COMPLETE SPECIFICATION

### 6.1 Vendor Dashboard Overview
```
VENDOR DASHBOARD LAYOUT:
┌─────────────────────────────────────────────────────────┐
│ 🏷️ selliko Vendor                            👤 Kochi Store │
│                                                         │
│  📊 Your Performance                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────┐│
│  │ 🔥 Active   │ │ ✅ Won      │ │ 💰 Total    │ │ ⭐  ││
│  │ Bids        │ │ Auctions    │ │ Spent       │ │ 4.8 ││
│  │    8        │ │    23       │ │  ₹12.5L     │ │     ││
│  │ └────────────┘ └────────────┘ └────────────┘ └─────┘│
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [📱 Browse Listings] [📋 My Bids] [🔔 Notifications] │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Recent Activity                                        │
│  • You won iPhone 14 Pro bid - ₹52,000                │
│  • New listing: Samsung Galaxy S21 - ₹35,000          │
│  • Bid expired: OnePlus 9 - Your bid: ₹28,000         │
│                                                         │
└─────────────────────────────────────────────────────────┘

SPECIFICATIONS:
- Performance Cards: bg-card rounded-lg p-6 text-center hover:shadow-md
- Card Icons: Heroicons/solid size-8 text-primary
- Card Numbers: text-3xl font-bold text-foreground
- Navigation Tabs: Prominent buttons to main vendor sections
- Activity Feed: Recent 5-8 items with actionable insights
- Rating Display: Star rating with number, hover shows breakdown
```

### 6.2 Browse Listings - Device Cards with Filters
```
BROWSE LISTINGS LAYOUT:
┌─────────────────────────────────────────────────────────┐
│ Available Device Listings                               │
│                                                         │
│ 🔍 [Search devices...] [Filters ▼] [Sort: Newest ▼]    │
│                                                         │
│ Filters: [All Brands ▼] [Price Range ▼] [Condition ▼]  │
│          [Location ▼] [Time Left ▼]                     │
│                                                         │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ │
│ │ 📱 iPhone 14 Pro│ │ 📱 Samsung S21  │ │ 📱 OnePlus 9│ │
│ │ ⏱️ 18h 24m left │ │ ⏱️ 2h 45m left  │ │ ⏱️ 6h 12m   │ │
│ │ ₹55,000 asking  │ │ ₹35,000 asking  │ │ ₹28,000     │ │
│ │ Current: ₹52K   │ │ Current: ₹33K   │ │ Current: ₹26K│ │
│ │ 🔴 5 bids       │ │ 🟡 2 bids       │ │ 🟢 1 bid    │ │
│ │ Kochi          │ │ Thrissur       │ │ Calicut     │ │
│ │ [Place Bid]     │ │ [Place Bid]     │ │ [Place Bid] │ │
│ └─────────────────┘ └─────────────────┘ └─────────────┘ │
│                                                         │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ │
│ │ 📱 iPhone 13    │ │ 📱 Pixel 7      │ │ 📱 Realme GT│ │
│ │ ⏱️ 12h 8m left  │ │ ⏱️ 4h 33m left  │ │ ⏱️ 1h 55m   │ │
│ │ ₹48,000 asking  │ │ ₹32,000 asking  │ │ ₹22,000     │ │
│ │ Current: ₹45K   │ │ Current: ₹30K   │ │ No bids yet │ │
│ │ 🟡 3 bids       │ │ 🟢 1 bid        │ │ 🆕 New      │ │
│ │ Kochi          │ │ Kochi          │ │ Ernakulam   │ │
│ │ [Place Bid]     │ │ [Place Bid]     │ │ [Place Bid] │ │
│ └─────────────────┘ └─────────────────┘ └─────────────┘ │
│                                                         │
│ Showing 12 of 47 listings          [1] 2 3 4 5 Next   │
└─────────────────────────────────────────────────────────┘

DEVICE CARD COMPONENT (Vendor View):
┌─────────────────┐
│ [Device Image]  │
│ ⏱️ 18h 24m left │ ← Urgent styling when < 2 hours
│                 │
│ iPhone 14 Pro   │ ← text-lg font-semibold
│ 128GB, Blue     │ ← text-sm text-muted-foreground
│                 │
│ Asking: ₹55,000 │ ← text-primary font-medium
│ Current: ₹52,000│ ← text-xl font-bold
│ 🔴 5 active bids│ ← Color by bid count
│                 │
│ 📍 Kochi        │ ← Location
│                 │
│ [Place Bid]     │ ← Prominent CTA button
└─────────────────┘

SPECIFICATIONS:
- Search Bar: Real-time search by device name, brand, model
- Filters: Multi-select dropdowns with clear/apply actions
- Sort Options: Newest, Ending Soon, Lowest Price, Highest Price, Nearest Location
- Card Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Timer Colors: Green (>6h), Yellow (2-6h), Red (<2h), Flashing (<30min)
- Bid Indicators: Color-coded by competition level
- Location Display: City name for quick filtering
- CTA Button: bg-primary hover:bg-primary/90, disabled if vendor's max bid reached
```

### 6.3 Bid Placement Modal (Manual Entry)
```
BID PLACEMENT MODAL:
┌─────────────────────────────────────────────────────────┐
│ Place Your Bid                                      ✕   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐     │
│ │ 📱 iPhone 14 Pro Max 256GB Space Black         │     │
│ │ Condition: Excellent • Location: Kochi         │     │
│ │ ⏱️ Time Left: 18h 24m                          │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ Current Bidding Status:                                 │
│ • Asking Price: ₹55,000                                │
│ • Highest Bid: ₹52,000 (TechWorld Store)              │
│ • Total Bids: 5                                        │
│                                                         │
│ Your Bid Amount *                                       │
│ ┌─────────────────────────────────────────────────┐     │
│ │ ₹ [53,000]                                      │     │
│ └─────────────────────────────────────────────────┘     │
│ ⚠️ Minimum bid: ₹52,100 (current + ₹100)               │
│ 🎯 Instant Win: ₹55,000 (asking price)                 │
│                                                         │
│ ┌─────────────────────────────────────────────────┐     │
│ │ 🏆 BID AT ASKING PRICE TO WIN INSTANTLY         │     │
│ │                                                 │     │
│ │ Bidding at or above ₹55,000 will immediately   │     │
│ │ close this auction and you'll win the device.  │     │
│ │ Order tracking will begin automatically.       │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ Bid Terms:                                              │
│ ☐ I understand bids are binding commitments            │
│ ☐ I agree to complete purchase if I win                │
│                                                         │
│          [Cancel]              [Place Bid]             │
│                                                         │
└─────────────────────────────────────────────────────────┘

SPECIFICATIONS:
- Device Summary: Key details at top for quick reference
- Current Status: Clear hierarchy of asking vs current vs minimum bid
- Bid Input: ₹ symbol prefix, real-time validation, number formatting
- Instant Win Callout: Prominent bg-primary/10 border border-primary rounded-lg p-4
- Auto-close Logic: Bids >= asking price trigger immediate win
- Validation: Minimum bid enforcement, maximum reasonable bid caps
- Terms: Required checkboxes before bid submission
- Success State: "Bid placed successfully!" with current position
- Instant Win State: "Congratulations! You won this auction!"
```

### 6.4 My Bids Table (Vendor Bid History)
```
MY BIDS TABLE:
┌─────────────────────────────────────────────────────────┐
│ My Bids & Won Auctions                [Filters ▼]       │
│                                                         │
│ Filters: [All Status ▼] [Date Range ▼] [Device Type ▼] │
│                                                         │
│ ┌─────┬─────────────┬────────┬──────────┬────────┬─────┐│
│ │Date │ Device      │ My Bid │ Status   │ Result │Action││
│ ├─────┼─────────────┼────────┼──────────┼────────┼─────┤│
│ │12/15│ iPhone 14   │ ₹55,000│ 🏆 Won   │ Instant│Track││
│ │12/14│ Samsung S21 │ ₹35,000│ 🟡 Active│ Leading│ View││
│ │12/13│ OnePlus 9   │ ₹28,000│ ❌ Lost  │ Outbid │ -   ││
│ │12/12│ iPhone 13   │ ₹48,000│ ⏱️ Pending│ 2nd    │ View││
│ │12/11│ Pixel 7     │ ₹32,000│ ✅ Won   │ Timer  │Track││
│ └─────┴─────────────┴────────┴──────────┴────────┴─────┘│
│                                                         │
│ Status Legend:                                          │
│ 🏆 Won (Instant) • ✅ Won (Timer) • 🟡 Active •        │
│ ⏱️ Pending • ❌ Lost • 🚫 Cancelled                     │
│                                                         │
│ Win Rate: 67% (12 won / 18 total)                      │
│ Total Spent: ₹4,85,000 • Average: ₹40,417             │
│                                                         │
│ Showing 1-10 of 34 bids             [1] 2 3 4 Next    │
└─────────────────────────────────────────────────────────┘

SPECIFICATIONS:
- Status Categories: Won (instant/timer), Active, Pending, Lost, Cancelled
- Result Column: Shows win method (instant/timer) or position (leading/2nd/outbid)
- Action Column: Track order for won bids, View details for active
- Performance Stats: Win rate, total spent, average bid at bottom
- Filters: Multi-dimensional filtering for comprehensive analysis
- Export Option: CSV download for accounting/analysis
```

### 6.5 Order Tracking for Won Bids
```
ORDER TRACKING LAYOUT:
┌─────────────────────────────────────────────────────────┐
│ Order #SLK2024001234                                    │
│                                                         │
│ 📱 iPhone 14 Pro Max 256GB Space Black                 │
│ Won for: ₹55,000 (Instant Win)                         │
│ Seller: Pradeep Kumar                                   │
│                                                         │
│ Order Status: 🚚 Agent En Route                         │
│                                                         │
│ ┌─────────────────────────────────────────────────┐     │
│ │ Order Timeline:                                 │     │
│ │                                                 │     │
│ │ ✅ Dec 15, 10:30 AM - Bid Won                   │     │
│ │ ✅ Dec 15, 11:15 AM - Payment Processed        │     │
│ │ ✅ Dec 15, 12:00 PM - Agent Assigned           │     │
│ │ 🔄 Dec 15, 2:30 PM - Agent En Route            │     │
│ │ ⏳ Expected: Today 4:00 PM - Pickup & Verify   │     │
│ │ ⏳ Expected: Tomorrow - Delivery to You        │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ 👤 Seller Information:                                  │
│ Name: Pradeep Kumar                                     │
│ Location: MG Road, Kochi                               │
│ Pickup Time: Today 3:00-5:00 PM                       │
│                                                         │
│ 🚚 Agent Details:                                       │
│ Name: Arun Verification                                │
│ Phone: +91 98765 43210                                 │
│ ETA: 4:00 PM (Live tracking)                          │
│                                                         │
│ Need Help? [Contact Support] [Track Live]              │
│                                                         │
└─────────────────────────────────────────────────────────┘

SPECIFICATIONS:
- Order Header: Order number, device details, win amount and method
- Progress Timeline: Visual progress with checkmarks and timestamps
- Seller Info: Contact details and pickup logistics
- Agent Tracking: Real-time updates and live location (if available)
- Support Options: Direct contact and live tracking features
- Expected Delivery: Clear timeline expectations
- Notification Integration: WhatsApp updates at each stage
```

### 6.6 Universal Notifications Tab
```
NOTIFICATIONS LAYOUT (All User Types):
┌─────────────────────────────────────────────────────────┐
│ 🔔 Notifications                          [Mark All Read] │
│                                                         │
│ ┌─────────────────────────────────────────────────┐     │
│ │ 🔴 2 mins ago                                   │     │
│ │ New bid on iPhone 14 Pro                       │     │
│ │ TechWorld Store bid ₹53,000 - You're leading  │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ ┌─────────────────────────────────────────────────┐     │
│ │ 📱 1 hour ago                                   │     │ 
│ │ Device verification complete                    │     │
│ │ iPhone 13 verified and paid - Order delivered │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ ┌─────────────────────────────────────────────────┐     │
│ │ ⚠️ 3 hours ago                                  │     │
│ │ Bid expiring soon                               │     │
│ │ Samsung Galaxy S21 ends in 30 minutes         │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ ┌─────────────────────────────────────────────────┐     │
│ │ ✅ Yesterday, 4:30 PM                           │     │
│ │ Listing approved                                │     │
│ │ Your OnePlus 9 is now live for bidding        │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ ┌─────────────────────────────────────────────────┐     │
│ │ 📋 Dec 14, 2:15 PM                             │     │
│ │ New agent assigned                              │     │
│ │ Arun will verify your device tomorrow 2-4 PM  │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ Load More Notifications...                              │
└─────────────────────────────────────────────────────────┘

ROLE-SPECIFIC NOTIFICATION TYPES:

CLIENT NOTIFICATIONS:
• New bid received on your device
• Listing approved/rejected by admin
• Agent assigned for verification
• Bid accepted - verification scheduled
• Payment completed
• Listing expired without bids

VENDOR NOTIFICATIONS:
• New device matching your criteria
• Bid placed successfully
• Outbid on a device
• Won an auction (instant/timer)
• Order status updates
• Payment processed

AGENT NOTIFICATIONS:
• New verification assigned
• Client confirmation received
• Verification deadline approaching
• Payment authorization needed

ADMIN NOTIFICATIONS:
• New listing submitted for review
• Verification completed
• Payment disputes
• System alerts

SPECIFICATIONS:
- Browser History Style: Chronological list with timestamps
- Icon-based Categories: Color-coded by notification type
- Read/Unread States: Bold text for unread, muted for read
- Click Actions: Navigate to relevant page/modal
- Mark as Read: Individual and bulk actions
- Infinite Scroll: Load more notifications on scroll
- Push Integration: Real-time updates via WebSocket
- WhatsApp Sync: Mirror important notifications to WhatsApp
```

### 6.7 Bidding Logic & Auto-Close System
```typescript
// Bidding system logic
interface BidPlacement {
  listingId: string;
  vendorId: string;
  bidAmount: number;
  askingPrice: number;
  currentHighestBid: number;
}

const placeBid = async (bidData: BidPlacement) => {
  // Validation
  if (bidData.bidAmount < bidData.currentHighestBid + 100) {
    throw new Error('Bid must be at least ₹100 higher than current bid');
  }
  
  // Auto-close logic
  if (bidData.bidAmount >= bidData.askingPrice) {
    return {
      type: 'INSTANT_WIN',
      message: 'Congratulations! You won this auction instantly!',
      orderId: generateOrderId(),
      nextStep: 'ADMIN_ASSIGNMENT'
    };
  }
  
  // Regular bid
  return {
    type: 'BID_PLACED',
    message: 'Bid placed successfully!',
    currentPosition: await getCurrentBidPosition(bidData.listingId, bidData.vendorId),
    timeLeft: await getAuctionTimeLeft(bidData.listingId)
  };
};

// Create admin task for agent assignment (NOT auto-assignment)
const onInstantWin = async (orderId: string) => {
  await createAdminTask({
    type: 'ASSIGN_AGENT',
    orderId,
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
  });
  
  await sendNotifications({
    vendor: 'Order confirmed - Assigning pickup agent',
    client: 'Your device sold! Assigning pickup agent',
    admin: 'New instant win - Assign agent for pickup'
  });
};
```

### 6.8 Responsive Design Adaptations
```css
/* Mobile bidding interface */
@media (max-width: 640px) {
  /* Device cards stack properly */
  .device-grid { grid-template-columns: 1fr; gap: 1rem; }
  
  /* Bid modal adjustments */
  .bid-modal { 
    margin: 0.5rem; 
    max-height: 95vh; 
    overflow-y: auto; 
  }
  
  /* Table becomes card layout */
  .bids-table { display: none; }
  .bids-cards { display: block; space-y: 0.75rem; }
  
  /* Notifications full width */
  .notification-item { 
    margin: 0 0.5rem; 
    padding: 0.75rem; 
  }
  
  /* Timer urgency on mobile */
  .timer-urgent { 
    animation: pulse 2s infinite; 
    border: 2px solid #ef4444; 
  }
}
```

---

## 🔗 BACKEND INTEGRATION REFERENCES

### Bidding System API Endpoints:
```typescript
// Listings for vendors
GET /api/vendor/listings?page=1&search=&filters={}
Response: { listings: DeviceListing[], total: number, hasMore: boolean }

// Bid placement
POST /api/vendor/bids
Body: { listingId: string, bidAmount: number }
Response: { 
  success: boolean, 
  type: 'BID_PLACED' | 'INSTANT_WIN',
  orderId?: string,
  message: string 
}

// Vendor bid history
GET /api/vendor/my-bids?page=1&status=all
Response: { bids: VendorBid[], stats: BidStats }

// Order tracking
GET /api/vendor/orders/:orderId
Response: { order: OrderDetails, timeline: OrderEvent[] }

// Notifications (universal)
GET /api/notifications?page=1&unread=false
POST /api/notifications/:id/read
POST /api/notifications/mark-all-read

// Real-time updates
WebSocket: /ws/bidding/:listingId
WebSocket: /ws/notifications/:userId
```

**READY FOR NEXT SECTION:**
The **Bidding System Interface** is now comprehensively detailed with device cards, manual bidding, auto-close functionality, and universal notifications! Should we proceed with the **Agent Verification Process** specification next?

---

## 7. AGENT VERIFICATION PROCESS - COMPLETE SPECIFICATION

### 7.1 Agent Dashboard Overview
```
AGENT DASHBOARD LAYOUT:
┌─────────────────────────────────────────────────────────┐
│ 🏷️ selliko Agent                               👤 Arun Kumar │
│                                                         │
│  📋 Assigned Pickup Tasks                               │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📱 iPhone 14 Pro Max • Order #SLK2024001234    │   │
│  │ 👤 Pradeep Kumar • 📞 +91 98765 43210          │   │
│  │ 📍 MG Road, Kochi                              │   │
│  │ 💰 Order Value: ₹55,000                        │   │
│  │ Assigned by: Admin • Just now                  │   │
│  │ [📞 Call Client] [🗺️ Navigate] [Accept Task]   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📱 Samsung Galaxy S21 • Order #SLK2024001235   │   │
│  │ 👤 Rahul Menon • 📞 +91 87654 32109            │   │
│  │ 📍 Kakkanad, Kochi                             │   │
│  │ 💰 Order Value: ₹35,000                        │   │
│  │ Assigned by: Admin • 2 hours ago               │   │
│  │ [📞 Call Client] [🗺️ Navigate] [Accept Task]   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Completed Tasks:                                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ✅ OnePlus 9 • Order #SLK2024001233             │   │
│  │ Completed verification and delivery              │   │
│  │ [View Details]                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘

SPECIFICATIONS:
- Admin Assignment: Show "Assigned by: Admin" with timestamp
- Manual Task List: Admin-assigned pickup tasks displayed
- Contact Integration: Direct call buttons for client communication
- Navigation: Simple link to customer location (Google Maps)
- Accept Tasks: Agent accepts assignments when ready
- Mobile-First: Optimized for field work on mobile devices
```

### 7.2 Verification Workflow (10-Step Process)
```
MOBILE VERIFICATION FLOW:
┌─────────────────────────────────────┐
│ 🏷️ selliko                    ≡    │
│                                     │
│ Verification: Order #SLK2024001234  │
│                                     │
│ ● ● ● ○ ○ ○ ○ ○ ○ ○                │
│ 1 2 3 4 5 6 7 8 9 10                │
│                                     │
│ Step 3: Verify Customer Identity    │
│                                     │
│ 📱 iPhone 14 Pro Max 256GB         │
│ 👤 Pradeep Kumar                    │
│                                     │
│ Upload Customer ID Card:            │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📸 Capture ID Card Photo        │ │
│ │ [Take Photo]                    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Verify Identity:                    │
│ ☐ Name matches order details        │
│ ☐ Phone number verified            │
│ ☐ Address confirmed                 │
│                                     │
│ [← Previous]           [Continue →] │
│                                     │
└─────────────────────────────────────┘

VERIFICATION STEPS (Per CELLFLIPEXPECTATIONS.md):
1. 🏠 Arrive at Customer Location
2. 📞 Contact Customer  
3. 👤 Verify Customer Identity (Upload ID Card)
4. 📱 Inspect Device Condition
5. 📸 Upload Verification Photos (Device, Bill, Packaging)
6. 📝 Document Device Condition
7. 💰 Calculate Any Necessary Deductions
8. 📱 Generate Final Offer
9. 🔐 Process Customer Acceptance via OTP
10. 📦 Complete Pickup Documentation

SPECIFICATIONS:
- Step Indicator: Visual progress with current step highlighted
- Simple Process: Follow exact CELLFLIPEXPECTATIONS.md workflow
- Photo Upload: Required verification photos only
- Basic Documentation: Simple condition recording
- OTP Processing: Customer acceptance verification
```

### 7.3 Device Inspection Interface
```
DEVICE INSPECTION:
┌─────────────────────────────────────┐
│ Device Condition Inspection         │
│                                     │
│ Expected Device Details:            │
│ ┌─────────────────────────────────┐ │
│ │ Device: iPhone 14 Pro Max 256GB │ │
│ │ Color: Space Black              │ │
│ │ Condition Listed: Excellent     │ │
│ │ IMEI 1: 123456789012345         │ │
│ │ IMEI 2: 678901234567890         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Actual Device Condition:            │
│ ┌─────────────────────────────────┐ │
│ │ ○ Matches description exactly   │ │
│ │ ○ Minor differences found       │ │
│ │ ○ Significant differences       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Issues Found (if any):              │
│ ┌─────────────────────────────────┐ │
│ │ [Describe any issues found...]  │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Deduction Amount:                   │
│ ┌─────────────────────────────────┐ │
│ │ ₹ 0                             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Continue to Photos]                │
│                                     │
└─────────────────────────────────────┘

SPECIFICATIONS:
- Simple Comparison: Expected vs actual device condition
- Basic Assessment: Simple condition matching
- Issue Documentation: Text description of any problems
- Basic Deductions: Simple amount entry if needed
- No Complex Calculations: Keep it straightforward
```

### 7.4 Photo Upload Requirements
```
PHOTO DOCUMENTATION:
┌─────────────────────────────────────┐
│ Upload Verification Photos          │
│                                     │
│ Required Photos (3 types):          │
│                                     │
│ ┌─────────────┐ ┌─────────────┐     │
│ │ 📱 Device   │ │ 📄 Bill     │     │
│ │ Photos      │ │ [Upload]    │     │
│ │ [Upload]    │ │ [Upload]    │     │
│ └─────────────┘ └─────────────┘     │
│                                     │
│ ┌─────────────┐                     │
│ │ 📦 Packaging│                     │
│ │ Photos      │                     │
│ │ [Upload]    │                     │
│ └─────────────┘                     │
│                                     │
│ Photo Guidelines:                   │
│ • Clear, well-lit photos            │
│ • Show device condition clearly     │
│ • Include bill if available         │
│ • Show packaging/accessories        │
│                                     │
│ Upload Status:                      │
│ ✅ Device photos uploaded           │
│ ⏳ Bill photo pending               │
│ ⏳ Packaging photo pending          │
│                                     │
│ [Continue to Final Offer]           │
│                                     │
└─────────────────────────────────────┘

SPECIFICATIONS:
- Three Photo Types: Device, Bill, Packaging (per CELLFLIPEXPECTATIONS.md)
- Simple Upload: Basic photo capture and upload
- Clear Guidelines: Simple photo requirements
- Progress Tracking: Show which photos are uploaded
- No Quality Validation: Keep it simple
```

### 7.5 Final Offer & Customer Acceptance
```
FINAL OFFER PROCESSING:
┌─────────────────────────────────────┐
│ Generate Final Offer                │
│                                     │
│ Bid Details:                        │
│ ┌─────────────────────────────────┐ │
│ │ Winning Bid Amount: ₹55,000     │ │
│ │ Deductions (if any): -₹0        │ │
│ │ ──────────────────────────────  │ │
│ │ Final Offer: ₹55,000           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ This offer will be sent to customer │
│ via WhatsApp notification.          │
│                                     │
│ [Send Final Offer to Customer]      │
│                                     │
│ ──────────────────────────────────  │
│                                     │
│ Customer Acceptance:                │
│                                     │
│ Waiting for customer OTP...         │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Enter OTP from Customer:        │ │
│ │ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐       │ │
│ │ │ │ │ │ │ │ │ │ │ │ │ │       │ │
│ │ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Process Customer Acceptance]       │
│                                     │
└─────────────────────────────────────┘

SPECIFICATIONS:
- Simple Calculation: Bid amount minus any deductions
- WhatsApp Integration: Send offer via WhatsApp (per expectations)
- OTP Verification: Customer provides acceptance OTP
- No Complex Processing: Keep payment simple
- Clear Status: Show waiting for customer response
```

### 7.6 Pickup Completion & Vendor Delivery
```
PICKUP COMPLETION:
┌─────────────────────────────────────┐
│ Complete Pickup Documentation       │
│                                     │
│ Order #SLK2024001234                │
│ ✅ Customer OTP Verified            │
│ ✅ Payment Processed Automatically  │
│                                     │
│ Device Collected:                   │
│ 📱 iPhone 14 Pro Max 256GB         │
│ 💰 Final Amount: ₹55,000           │
│                                     │
│ [Mark Pickup Complete]              │
│                                     │
│ ──────────────────────────────────  │
│                                     │
│ Vendor Delivery:                    │
│                                     │
│ 🏪 Deliver to: Kochi Mobile Store   │
│ 👤 Contact: Raj Kumar               │
│ 📞 Phone: +91 98765 12345           │
│ 📍 Address: MG Road, Kochi          │
│                                     │
│ [🗺️ Navigate to Vendor]             │
│                                     │
│ At Vendor Location:                 │
│ ┌─────────────────────────────────┐ │
│ │ Enter Vendor OTP:               │ │
│ │ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐       │ │
│ │ │ │ │ │ │ │ │ │ │ │ │ │       │ │
│ │ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Complete Handover]                 │
│                                     │
└─────────────────────────────────────┘

SPECIFICATIONS:
- Pickup Documentation: Simple completion marking
- Automatic Payment: Payment processed automatically (per expectations)
- Vendor Details: Basic vendor contact information  
- Navigation Link: Simple link to vendor location
- Vendor OTP: Complete handover with vendor OTP
- Update Status: Mark transaction complete
```

### 7.7 Task Completion Summary
```
TASK COMPLETION:
┌─────────────────────────────────────┐
│ Task Complete! ✅                   │
│                                     │
│ Order #SLK2024001234                │
│ 📱 iPhone 14 Pro Max 256GB         │
│ 👤 Pradeep Kumar → Kochi Store      │
│ 💰 Amount: ₹55,000                  │
│                                     │
│ All steps completed:                │
│ ✅ Customer verification            │
│ ✅ Device inspection                │
│ ✅ Photo documentation              │
│ ✅ Customer OTP processed           │
│ ✅ Payment completed                │
│ ✅ Vendor delivery confirmed        │
│                                     │
│ [Return to Dashboard]               │
│                                     │
└─────────────────────────────────────┘

SPECIFICATIONS:
- Simple Summary: Basic completion confirmation
- Task Overview: Show what was completed
- Clean Finish: Return to dashboard for next task
- No Performance Metrics: Just completion status
```

---

## 🔗 BACKEND INTEGRATION REFERENCES

### Simple Agent API Endpoints:
```typescript
// View assigned tasks
GET /api/agent/tasks
Response: { tasks: AgentTask[] }

// Accept task assignment
POST /api/agent/tasks/:taskId/accept

// Update verification step
PUT /api/agent/tasks/:taskId/step
Body: { step: number, data: any }

// Upload verification photos
POST /api/agent/tasks/:taskId/photos
Body: { photos: File[], type: 'device' | 'bill' | 'packaging' }

// Process customer OTP
POST /api/agent/tasks/:taskId/customer-otp
Body: { otp: string }

// Complete vendor handover
POST /api/agent/tasks/:taskId/vendor-otp
Body: { vendorOtp: string }

// Mark task complete
POST /api/agent/tasks/:taskId/complete
```

---

## 8. STATUS TRACKING PAGES - COMPLETE SPECIFICATION

### 8.1 Universal Order Status Interface
```
ORDER STATUS LAYOUT (All User Types):
┌─────────────────────────────────────────────────────────┐
│ Order Status: #SLK2024001234                           │
│                                                         │
│ 📱 iPhone 14 Pro Max 256GB Space Black                 │
│ Listed by: Pradeep Kumar                               │
│ Won by: Kochi Mobile Store (₹55,000)                   │
│                                                         │
│ Order Progress:                                         │
│                                                         │
│ ✅ Dec 15, 10:30 AM - Listing Created                  │
│ ✅ Dec 15, 11:00 AM - Admin Approved                   │
│ ✅ Dec 15, 11:30 AM - Bidding Started                  │
│ ✅ Dec 15, 2:00 PM - Bid Won (Instant)                 │
│ 🔄 Dec 15, 2:30 PM - Assigning Pickup Agent            │
│ ⏳ Pending - Agent Verification                         │
│ ⏳ Pending - Customer Payment                           │
│ ⏳ Pending - Vendor Delivery                            │
│                                                         │
│ Current Status: Assigning Pickup Agent                 │
│ Next Step: Agent will be assigned shortly              │
│                                                         │
│ Contact Information:                                    │
│ Support: +91 80000 12345                               │
│                                                         │
└─────────────────────────────────────────────────────────┘

SPECIFICATIONS:
- Universal View: Same interface for all user types with role-appropriate details
- Timeline View: Clear progression through all stages
- Current Status: Show "Assigning Pickup Agent" instead of waiting message
- Next Steps: Clear indication of what happens next
- Contact Info: Relevant contact details based on current stage
- Real-time Updates: Status updates as they happen
```

### 8.2 Client Status View
```
CLIENT ORDER TRACKING:
┌─────────────────────────────────────────────────────────┐
│ Your Device Sale Status                                 │
│                                                         │
│ 📱 iPhone 14 Pro Max 256GB                             │
│ Order #SLK2024001234                                    │
│                                                         │
│ 🔄 Assigning Pickup Agent                               │
│                                                         │
│ What's happening now:                                   │
│ • Your device has been sold successfully               │
│ • We're assigning a pickup agent for verification      │
│ • The agent will contact you within 2 hours           │
│ • You'll receive verification details on WhatsApp      │
│                                                         │
│ Timeline:                                               │
│ ✅ Listing approved                                     │
│ ✅ Bid won by Kochi Mobile Store                        │
│ 🔄 Assigning pickup agent (current)                    │
│ ⏳ Agent verification                                    │
│ ⏳ Payment processing                                    │
│                                                         │
│ What happens next:                                      │
│ 1. Agent will be assigned within 2 hours              │
│ 2. Agent will contact you to schedule pickup          │
│ 3. Verification at your location                       │
│ 4. Accept final offer via OTP                         │
│                                                         │
│ Need help? [Contact Support]                           │
│                                                         │
└─────────────────────────────────────────────────────────┘

SPECIFICATIONS:
- Client-Focused: Clear explanation of what's happening
- Assignment Status: Show that agent assignment is in progress
- Timeline: Updated progression with assignment phase
- Clear Expectations: What the client can expect next
- Support Access: Easy way to get help if needed
```

### 8.3 Vendor Status View
```
VENDOR ORDER TRACKING:
┌─────────────────────────────────────────────────────────┐
│ Your Won Bid Status                                     │
│                                                         │
│ 📱 iPhone 14 Pro Max 256GB                             │
│ Order #SLK2024001234                                    │
│ Your Winning Bid: ₹55,000                              │
│                                                         │
│ 🔄 Agent Collecting Device                              │
│                                                         │
│ What's happening now:                                   │
│ • Agent is verifying device with seller                │
│ • Device will be delivered to your store               │
│ • You'll receive delivery confirmation OTP             │
│                                                         │
│ Timeline:                                               │
│ ✅ Your bid won the auction                             │
│ ✅ Agent assigned for pickup                            │
│ 🔄 Device collection in progress                        │
│ ⏳ Delivery to your store                               │
│                                                         │
│ Delivery Address:                                       │
│ 🏪 Kochi Mobile Store                                   │
│ 📍 MG Road, Kochi 682001                               │
│                                                         │
│ Estimated Delivery: Today evening                       │
│                                                         │
└─────────────────────────────────────────────────────────┘

SPECIFICATIONS:
- Vendor-Focused: Emphasizes their winning bid and delivery
- Delivery Information: Clear delivery expectations
- Store Details: Delivery address confirmation
- Timeline: Vendor-relevant status updates
```

### 8.4 Admin Status View
```
ADMIN ORDER TRACKING:
┌─────────────────────────────────────────────────────────┐
│ Order Management: #SLK2024001234                        │
│                                                         │
│ 📱 iPhone 14 Pro Max 256GB Space Black                 │
│ Client: Pradeep Kumar (+91 98765 43210)                │
│ Vendor: Kochi Mobile Store                             │
│ Agent: Arun Kumar                                       │
│                                                         │
│ Current Status: Verification in Progress                │
│                                                         │
│ Detailed Timeline:                                      │
│ ✅ Dec 15, 10:30 AM - Listing submitted                │
│ ✅ Dec 15, 11:00 AM - Approved by Admin                │
│ ✅ Dec 15, 11:30 AM - Bidding opened                   │
│ ✅ Dec 15, 2:00 PM - Won by vendor (instant)           │
│ ✅ Dec 15, 2:30 PM - Agent Arun assigned              │
│ 🔄 Dec 15, 3:00 PM - Verification started              │
│ ⏳ Pending - Customer OTP acceptance                    │
│ ⏳ Pending - Payment processing                         │
│ ⏳ Pending - Vendor delivery                            │
│                                                         │
│ Actions Available:                                      │
│ [Reassign Agent] [Contact Client] [Contact Vendor]     │
│ [View Full Details] [Manual Override]                  │
│                                                         │
└─────────────────────────────────────────────────────────┘

SPECIFICATIONS:
- Complete Overview: All participants and contact details
- Admin Actions: Management capabilities for intervention
- Detailed Timeline: Comprehensive status tracking
- Manual Override: Ability to handle exceptions
- Full Control: Access to all order management functions
```

### 8.5 Status Page Mobile Responsive
```css
/* Mobile status tracking */
@media (max-width: 640px) {
  .status-container { 
    padding: 1rem; 
    margin: 0.5rem; 
  }
  
  .timeline-item { 
    padding: 0.75rem; 
    margin-bottom: 0.5rem; 
  }
  
  .contact-info { 
    font-size: 0.875rem; 
  }
  
  .action-buttons { 
    display: flex; 
    flex-direction: column; 
    gap: 0.5rem; 
  }
}
```

---

## 🔗 BACKEND INTEGRATION REFERENCES

### Status Tracking API Endpoints:
```typescript
// Get order status (role-based view)
GET /api/orders/:orderId/status
Response: { order: OrderDetails, timeline: StatusEvent[], currentStage: string }

// Update order status (admin/agent only)
PUT /api/orders/:orderId/status
Body: { status: string, notes?: string }

// Get all orders for user (based on role)
GET /api/orders?status=all&page=1
Response: { orders: OrderSummary[], pagination: PaginationInfo }

// Real-time status updates
WebSocket: /ws/orders/:orderId/status
```

**READY FOR NEXT SECTION:**
**Section 7: Agent Verification Process** has been simplified to match CELLFLIPEXPECTATIONS.md (no performance metrics, scheduling, or complex features) and **Section 8: Status Tracking Pages** is complete! Should we proceed with **Section 9: Vendor Dashboard & Marketplace** specification next?

---

## 9. VENDOR DASHBOARD & MARKETPLACE - COMPLETE SPECIFICATION

### 9.1 Vendor Dashboard Overview
```
VENDOR DASHBOARD LAYOUT:
┌─────────────────────────────────────────────────────────┐
│ 🏷️ selliko Vendor                           👤 Kochi Mobile │
│                                                         │
│  📊 Your Business Summary                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ 🔥 Active   │ │ ✅ Won      │ │ 📱 Total    │       │
│  │ Bids        │ │ This Month  │ │ Devices     │       │
│  │    3        │ │    12       │ │    45       │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                         │
│  📋 Quick Actions                                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [📱 Browse New Listings] [📋 My Bids]           │   │
│  │ [🔔 Notifications] [📈 Transaction History]     │   │
│  │ [📋 My Bids] [🔔 Notifications] [📈 Transaction History] │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Recent Activity                                        │
│  • New listing: iPhone 14 Pro - ₹55,000               │
│  • Your bid accepted: Samsung S21 - ₹35,000           │
│  • Device delivered: OnePlus 9 - Order complete       │
│                                                         │
└─────────────────────────────────────────────────────────┘

SPECIFICATIONS:
- Simple Stats: Basic business metrics (active bids, won this month, total devices)
- Quick Actions: Direct navigation to main vendor functions
- Recent Activity: Simple activity feed with key updates
- Clean Layout: Focus on essential vendor operations
- WhatsApp Integration: Activity updates via WhatsApp
```

### 9.2 Device Marketplace Browsing
```
MARKETPLACE LISTINGS:
┌─────────────────────────────────────────────────────────┐
│ Available Device Listings                [Filter ▼]     │
│                                                         │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ │
│ │ 📱 iPhone 14 Pro│ │ 📱 Samsung S21  │ │ 📱 OnePlus 9│ │
│ │ 256GB Space Black│ │ 128GB Phantom   │ │ 256GB Blue  │ │
│ │ Condition: Excel │ │ Condition: Good │ │ Condition: Exc│ │
│ │ Asking: ₹55,000 │ │ Asking: ₹35,000 │ │ Asking: ₹28K│ │
│ │ Location: Kochi │ │ Location: Thrissur│ │ Location: Cal│ │
│ │ Time Left: 18h  │ │ Time Left: 6h   │ │ Time Left: 12h│ │
│ │ Current Bid: 52K│ │ Current: ₹33K   │ │ No bids yet │ │
│ │ [View Details]  │ │ [View Details]  │ │ [View Details]│ │
│ │ [Place Bid]     │ │ [Place Bid]     │ │ [Place Bid] │ │
│ └─────────────────┘ └─────────────────┘ └─────────────┘ │
│                                                         │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ │
│ │ 📱 iPhone 13    │ │ 📱 Pixel 7      │ │ 📱 Realme GT│ │
│ │ 128GB Pink      │ │ 256GB Snow      │ │ 128GB Racing│ │
│ │ Condition: Good │ │ Condition: Excel │ │ Condition: Fair│ │
│ │ Asking: ₹48,000 │ │ Asking: ₹32,000 │ │ Asking: ₹22K│ │
│ │ Location: Kochi │ │ Location: Kochi │ │ Location: Ern│ │
│ │ Time Left: 4h   │ │ Time Left: 8h   │ │ Time Left: 2h│ │
│ │ Current: ₹45K   │ │ Current: ₹30K   │ │ Current: 20K│ │
│ │ [View Details]  │ │ [View Details]  │ │ [View Details]│ │
│ │ [Place Bid]     │ │ [Place Bid]     │ │ [Place Bid] │ │
│ └─────────────────┘ └─────────────────┘ └─────────────┘ │
│                                                         │
│ Showing 12 of 28 new listings          [Load More]     │
└─────────────────────────────────────────────────────────┘

SPECIFICATIONS:
- Device Cards: Simple card layout with key information
- Essential Info: Device, condition, asking price, location, time left
- Current Bids: Show current highest bid if any
- Quick Actions: View details and place bid buttons
- Simple Filtering: Basic filters for device type, location, price range
- Load More: Pagination for browsing all listings
```

### 9.3 Device Details View
```
DEVICE DETAILS PAGE:
┌─────────────────────────────────────────────────────────┐
│ ← Back to Listings                                      │
│                                                         │
│ iPhone 14 Pro Max 256GB Space Black                    │
│                                                         │
│ ┌─────────────────┐ ┌─────────────────────────────────┐ │
│ │                 │ │ Device Information:             │ │
│ │ [Main Photo]    │ │ • Brand: Apple                  │ │
│ │                 │ │ • Model: iPhone 14 Pro Max     │ │
│ │ [Photo] [Photo] │ │ • Storage: 256GB                │ │
│ │ [Photo] [Photo] │ │ • Color: Space Black            │ │
│ │                 │ │ • Condition: Excellent          │ │
│ └─────────────────┘ │ • IMEI 1: 123456789012345       │ │
│                     │ • IMEI 2: 678901234567890       │ │
│ Asking Price: ₹55,000 │ • Battery Health: 89%          │ │
│ Location: MG Road, Kochi │ • Original Box: Yes           │ │
│ Time Left: 18h 24m  │ • Warranty: Active until Mar 25│ │
│                     │                                 │ │
│ Current Bidding:    │ Seller Information:             │ │
│ Highest Bid: ₹52,000 │ • Listed by: Pradeep Kumar      │ │
│ Total Bids: 3       │ • Location: Kochi               │ │
│                     │ • Pickup: Home pickup           │ │
│ [Place Your Bid]    │                                 │ │
│                     └─────────────────────────────────┘ │
│                                                         │
│ Description:                                            │
│ Device is in excellent condition. Minimal usage.       │
│ All accessories included. No scratches or damage.      │
│                                                         │
└─────────────────────────────────────────────────────────┘

SPECIFICATIONS:
- Photo Gallery: Main photo with thumbnail gallery
- Device Specs: Complete device information as listed
- Bidding Info: Current bid status and competition
- Seller Details: Basic seller information
- Description: Seller-provided device description
- Place Bid: Prominent bidding action button
```

### 9.4 Bid Placement Interface
```
BID PLACEMENT MODAL:
┌─────────────────────────────────────────────────────────┐
│ Place Your Bid                                      ✕   │
│                                                         │
│ 📱 iPhone 14 Pro Max 256GB Space Black                 │
│ Condition: Excellent • Location: Kochi                 │
│                                                         │
│ Current Bidding Status:                                 │
│ • Asking Price: ₹55,000                                │
│ • Highest Bid: ₹52,000 (Mobile World)                 │
│ • Total Bids: 3                                        │
│ • Time Left: 18h 24m                                   │
│                                                         │
│ Your Bid Amount *                                       │
│ ┌─────────────────────────────────────────────────┐     │
│ │ ₹ [53,000]                                      │     │
│ └─────────────────────────────────────────────────┘     │
│ Minimum bid: ₹52,100 (current + ₹100)                  │
│                                                         │
│ ⚡ Instant Win at ₹55,000 (asking price)                │
│                                                         │
│ Bid Terms:                                              │
│ ☐ I understand bids are binding commitments            │
│ ☐ I agree to complete purchase if I win                │
│                                                         │
│            [Cancel]           [Place Bid]              │
│                                                         │
└─────────────────────────────────────────────────────────┘

SPECIFICATIONS:
- Device Summary: Quick device reference
- Bidding Context: Current bid status and competition
- Bid Input: Simple amount entry with validation
- Instant Win: Clear indication of instant win price
- Terms Agreement: Required acceptance of bid terms
- Simple Process: Straightforward bid placement
```

### 9.5 Vendor Bid History
```
VENDOR BID HISTORY:
┌─────────────────────────────────────────────────────────┐
│ My Bids & Transaction History          [Filter ▼]       │
│                                                         │
│ ┌─────┬─────────────┬────────┬─────────┬─────────────┐   │
│ │Date │ Device      │ My Bid │ Status  │ Action      │   │
│ ├─────┼─────────────┼────────┼─────────┼─────────────┤   │
│ │12/15│ iPhone 14   │ ₹55,000│ 🏆 Won  │ Track Order │   │
│ │12/14│ Samsung S21 │ ₹35,000│ 🟡 Active│ View Listing│   │
│ │12/13│ OnePlus 9   │ ₹28,000│ ❌ Lost │ -           │   │
│ │12/12│ iPhone 13   │ ₹48,000│ ⏱️ Pending│ View Status │   │
│ │12/11│ Pixel 7     │ ₹32,000│ ✅ Complete│ Receipt    │   │
│ └─────┴─────────────┴────────┴─────────┴─────────────┘   │
│                                                         │
│ Status Legend:                                          │
│ 🏆 Won • ✅ Complete • 🟡 Active • ⏱️ Pending • ❌ Lost │
│                                                         │
│ This Month: 5 bids placed, 3 won                       │
│                                                         │
└─────────────────────────────────────────────────────────┘

SPECIFICATIONS:
- Simple Table: Basic bid history with key information
- Status Tracking: Clear status indicators for each bid
- Action Column: Relevant actions based on bid status
- Basic Stats: Simple monthly summary
- Filtering: Basic filters for status and date range
```

### 9.6 Order Tracking for Won Bids
```
VENDOR ORDER TRACKING:
┌─────────────────────────────────────────────────────────┐
│ Order Tracking: #SLK2024001234                         │
│                                                         │
│ 📱 iPhone 14 Pro Max 256GB Space Black                 │
│ Your Winning Bid: ₹55,000                              │
│ Seller: Pradeep Kumar                                   │
│                                                         │
│ Current Status: 🔄 Agent Collecting Device              │
│                                                         │
│ Order Timeline:                                         │
│ ✅ Dec 15, 2:00 PM - Your bid won                      │
│ ✅ Dec 15, 2:30 PM - Agent assigned                    │
│ 🔄 Dec 15, 3:00 PM - Agent verifying device            │
│ ⏳ Pending - Device delivery to your store              │
│                                                         │
│ What happens next:                                      │
│ 1. Agent completes device verification                 │
│ 2. Device will be delivered to your store              │
│ 3. You'll receive delivery OTP via WhatsApp            │
│ 4. Confirm receipt to complete order                   │
│                                                         │
│ Delivery Address:                                       │
│ 🏪 Kochi Mobile Store                                   │
│ 📍 MG Road, Kochi 682001                               │
│                                                         │
│ Estimated Delivery: Today evening                       │
│                                                         │
│ Need help? [Contact Support]                           │
│                                                         │
└─────────────────────────────────────────────────────────┘

SPECIFICATIONS:
- Order Overview: Key order details and winning bid
- Status Timeline: Clear progression of order fulfillment
- Next Steps: Clear explanation of what happens next
- Delivery Info: Store address and delivery expectations
- Support Access: Easy way to get help if needed
```

### 9.7 Device Receipt Confirmation
```
DEVICE RECEIPT CONFIRMATION:
┌─────────────────────────────────────────────────────────┐
│ Confirm Device Receipt                                  │
│                                                         │
│ Order #SLK2024001234                                    │
│ 📱 iPhone 14 Pro Max 256GB Space Black                 │
│ Amount Paid: ₹55,000                                    │
│                                                         │
│ Agent Delivery Details:                                 │
│ 👤 Agent: Arun Kumar                                    │
│ 📅 Delivered: Dec 15, 2024 6:30 PM                     │
│ 📍 Location: Your store                                 │
│                                                         │
│ Device Verification:                                    │
│ ☐ Device matches description                            │
│ ☐ Condition as expected                                 │
│ ☐ All accessories included                              │
│ ☐ No damage during transport                           │
│                                                         │
│ Enter Delivery OTP:                                     │
│ ┌─────────────────────────────────────────────────┐     │
│ │ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐                       │     │
│ │ │ │ │ │ │ │ │ │ │ │ │ │                       │     │
│ │ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘                       │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ [Confirm Receipt & Complete Order]                      │
│                                                         │
└─────────────────────────────────────────────────────────┘

SPECIFICATIONS:
- Order Summary: Quick reference to order details
- Delivery Confirmation: Agent and delivery details
- Device Checklist: Simple verification checklist
- OTP Entry: Secure order completion process
- Final Confirmation: Complete the transaction
```

---

## 🔗 BACKEND INTEGRATION REFERENCES

### Vendor Dashboard API Endpoints:
```typescript
// Vendor dashboard summary
GET /api/vendor/dashboard
Response: { stats: VendorStats, recentActivity: Activity[] }

// Browse marketplace listings
GET /api/vendor/listings?page=1&filters={}
Response: { listings: MarketplaceListing[], total: number }

// Get device details
GET /api/vendor/listings/:listingId
Response: { listing: DetailedListing, photos: string[], bidHistory: Bid[] }

// Place bid
POST /api/vendor/bids
Body: { listingId: string, bidAmount: number }

// Vendor bid history
GET /api/vendor/bids?page=1&status=all
Response: { bids: VendorBid[], summary: BidSummary }

// Track won orders
GET /api/vendor/orders/:orderId
Response: { order: OrderDetails, timeline: StatusEvent[] }

// Confirm device receipt
POST /api/vendor/orders/:orderId/confirm-receipt
Body: { deliveryOtp: string, verificationChecklist: boolean[] }
```

---

## 10. NOTIFICATION SYSTEM - COMPLETE SPECIFICATION

### 10.1 WhatsApp Notification Integration
```
WHATSAPP NOTIFICATION FLOW:
┌─────────────────────────────────────────────────────────┐
│ WhatsApp Notifications (Primary Channel)               │
│                                                         │
│ CLIENT NOTIFICATIONS:                                   │
│ • "Your iPhone 14 Pro listing has been approved!"      │
│ • "New bid received: ₹52,000 from Kochi Mobile"       │
│ • "Congratulations! Your device sold for ₹55,000"     │
│ • "Agent Arun will visit today 3-5 PM for pickup"     │
│ • "Final offer: ₹55,000. Reply with OTP to accept"    │
│ • "Payment of ₹55,000 credited to your account"       │
│                                                         │
│ VENDOR NOTIFICATIONS:                                   │
│ • "New iPhone 14 Pro available - ₹55,000 asking"      │
│ • "Your bid of ₹52,000 placed successfully"           │
│ • "You've been outbid on Samsung Galaxy S21"          │
│ • "Congratulations! You won iPhone 14 Pro - ₹55,000"  │
│ • "Your device will be delivered today evening"        │
│ • "Device delivered. Use OTP 123456 to confirm"       │
│                                                         │
│ AGENT NOTIFICATIONS:                                    │
│ • "New pickup assigned: Order #SLK2024001234"         │
│ • "Customer contact: Pradeep Kumar +91 98765 43210"   │
│ • "Pickup address: MG Road, Kochi"                    │
│ • "Customer OTP received. Proceed with pickup"        │
│                                                         │
│ ADMIN NOTIFICATIONS:                                    │
│ • "New listing submitted for review"                   │
│ • "Instant win: Order #SLK2024001234 needs agent"     │
│ • "Verification completed, payment processed"          │
│ • "Order completed successfully"                       │
│                                                         │
└─────────────────────────────────────────────────────────┘

SPECIFICATIONS:
- Primary Channel: WhatsApp for all critical notifications
- Role-Based: Different message templates for each user type
- Actionable: Include relevant details and next steps
- Timely: Real-time notifications for important events
- Clear Language: Simple, easy to understand messages
```

### 10.2 In-App Notification Center
```
IN-APP NOTIFICATIONS:
┌─────────────────────────────────────────────────────────┐
│ 🔔 Notifications                          [Mark All Read] │
│                                                         │
│ Today                                                   │
│ ┌─────────────────────────────────────────────────┐     │
│ │ 🔴 2 mins ago                                   │     │
│ │ New bid received                                │     │
│ │ ₹53,000 from TechWorld Store                   │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ ┌─────────────────────────────────────────────────┐     │
│ │ 📱 1 hour ago                                   │     │
│ │ Agent assigned                                  │     │
│ │ Arun Kumar will contact you soon                │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ Yesterday                                               │
│ ┌─────────────────────────────────────────────────┐     │
│ │ ✅ 4:30 PM                                      │     │
│ │ Listing approved                                │     │
│ │ Your iPhone 14 Pro is now live                 │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ ┌─────────────────────────────────────────────────┐     │
│ │ 📋 2:15 PM                                      │     │
│ │ Listing submitted                               │     │
│ │ Admin review in progress                        │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ Load More Notifications...                              │
└─────────────────────────────────────────────────────────┘

SPECIFICATIONS:
- Grouped by Date: Today, Yesterday, etc.
- Icon-Coded: Different icons for different notification types
- Clickable: Navigate to relevant pages when clicked
- Read/Unread: Clear visual distinction
- Archive: Load more for historical notifications
```

### 10.3 Notification Preferences
```
NOTIFICATION SETTINGS:
┌─────────────────────────────────────────────────────────┐
│ Notification Preferences                                │
│                                                         │
│ WhatsApp Notifications:                                 │
│ ┌─────────────────────────────────────────────────┐     │
│ │ ✅ Critical alerts (bids, approvals, payments)  │     │
│ │ ✅ Order updates (agent assigned, delivery)     │     │
│ │ ☐ Marketing messages (promotions, tips)        │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ In-App Notifications:                                   │
│ ┌─────────────────────────────────────────────────┐     │
│ │ ✅ All notifications                            │     │
│ │ ✅ Push notifications enabled                   │     │
│ │ ✅ Sound alerts                                 │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ Frequency:                                              │
│ ┌─────────────────────────────────────────────────┐     │
│ │ ○ Instant (recommended)                         │     │
│ │ ○ Every 15 minutes                              │     │
│ │ ○ Hourly summary                                │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ [Save Preferences]                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘

SPECIFICATIONS:
- WhatsApp Control: Option to control WhatsApp message types
- In-App Settings: Standard push notification preferences
- Frequency Options: Control notification frequency
- Simple Interface: Easy to understand and configure
```

### 10.4 System-Wide Notification Events
```typescript
// Notification event triggers
interface NotificationEvents {
  // Client notifications
  'listing.approved': { listingId: string, deviceName: string },
  'listing.rejected': { listingId: string, reason: string },
  'bid.received': { listingId: string, bidAmount: number, vendorName: string },
  'bid.accepted': { listingId: string, finalAmount: number, vendorName: string },
  'agent.assigned': { orderId: string, agentName: string, agentPhone: string },
  'final.offer': { orderId: string, finalAmount: number, otp: string },
  'payment.completed': { orderId: string, amount: number },

  // Vendor notifications
  'listing.new': { listingId: string, deviceName: string, askingPrice: number },
  'bid.placed': { bidId: string, bidAmount: number, listingId: string },
  'bid.outbid': { bidId: string, newHighestBid: number },
  'bid.won': { orderId: string, deviceName: string, finalAmount: number },
  'delivery.scheduled': { orderId: string, estimatedTime: string },
  'delivery.ready': { orderId: string, deliveryOtp: string },

  // Agent notifications
  'task.assigned': { taskId: string, orderId: string, clientName: string },
  'client.contacted': { taskId: string, clientResponse: string },
  'payment.approved': { taskId: string, amount: number },

  // Admin notifications
  'listing.submitted': { listingId: string, clientName: string },
  'instant.win': { orderId: string, needsAgent: boolean },
  'verification.completed': { orderId: string, agentName: string },
  'payment.processed': { orderId: string, amount: number }
}

// Notification delivery methods
interface NotificationDelivery {
  whatsapp: boolean;
  inApp: boolean;
  push: boolean;
  email?: boolean; // Optional for future
}
```

---

## 🔒 SECURITY & VALIDATION

### Input Validation Schemas
```typescript
// Using Zod for runtime validation
import { z } from 'zod';

const phoneNumberSchema = z.string()
  .regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian phone number format');

const deviceListingSchema = z.object({
  brand: z.string().min(1).max(50),
  model: z.string().min(1).max(100),
  imei1: z.string().regex(/^\d{15}$/, 'IMEI must be 15 digits'),
  imei2: z.string().regex(/^\d{15}$/).optional(),
  askingPrice: z.number().min(1000).max(200000), // ₹1,000 to ₹2,00,000
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR'])
});

const bidSchema = z.object({
  amount: z.number().min(100), // Minimum ₹100 bid
  message: z.string().max(500).optional()
});

// Middleware for validation
const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
  };
};
```

### JWT Authentication
```typescript
// JWT Token Structure
interface JWTPayload {
  userId: string;
  role: 'CLIENT' | 'VENDOR' | 'AGENT' | 'ADMIN';
  phoneNumber: string;
  iat: number;
  exp: number; // 7 days expiry
}

// Auth Middleware
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    req.user = decoded as JWTPayload;
    next();
  });
};

// Role-based access control
const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    next();
  };
};
```

---

## 📁 FILE UPLOAD SPECIFICATION

### File Handling Strategy
```typescript
// Multer configuration for file uploads
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 6 // Maximum 6 files per upload
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  }
});

// S3 Upload Service
class FileUploadService {
  private s3Client: S3Client;
  
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });
  }
  
  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const key = `${folder}/${Date.now()}-${file.originalname}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    });
    
    await this.s3Client.send(command);
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }
  
  async uploadDevicePhotos(files: Express.Multer.File[], listingId: string): Promise<string[]> {
    const uploadPromises = files.map((file, index) => 
      this.uploadFile(file, `listings/${listingId}/device-${index + 1}`)
    );
    return Promise.all(uploadPromises);
  }
}
```

---

## 💳 PAYMENT INTEGRATION

### Razorpay Payment Processing
```typescript
// Razorpay Service Implementation
import Razorpay from 'razorpay';

interface PaymentDistribution {
  clientAmount: number;      // Final offer amount
  agentCommission: number;   // 5% of final offer
  platformFee: number;       // 2% of final offer
  vendorDeduction: number;   // Total deductions
}

class PaymentService {
  private razorpay: Razorpay;
  
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!
    });
  }
  
  calculatePaymentDistribution(finalOffer: number): PaymentDistribution {
    const agentCommission = Math.round(finalOffer * 0.05); // 5%
    const platformFee = Math.round(finalOffer * 0.02); // 2%
    const clientAmount = finalOffer - agentCommission - platformFee;
    
    return {
      clientAmount,
      agentCommission,
      platformFee,
      vendorDeduction: 0 // Calculated during verification
    };
  }
  
  async processTransactionPayment(transactionId: string) {
    const transaction = await db.transaction.findUnique({
      where: { id: transactionId },
      include: { client: true, agent: true, vendor: true }
    });
    
    const distribution = this.calculatePaymentDistribution(transaction.finalAmount);
    
    // Create payment transfers
    const transfers = await Promise.allSettled([
      // Pay client
      this.createTransfer({
        account: transaction.client.razorpayAccountId,
        amount: distribution.clientAmount * 100, // Convert to paise
        currency: 'INR',
        notes: { transactionId, type: 'CLIENT_PAYMENT' }
      }),
      
      // Pay agent commission
      this.createTransfer({
        account: transaction.agent.razorpayAccountId,
        amount: distribution.agentCommission * 100,
        currency: 'INR',
        notes: { transactionId, type: 'AGENT_COMMISSION' }
      })
    ]);
    
    return transfers;
  }
  
  private async createTransfer(data: any) {
    return this.razorpay.transfers.create(data);
  }
}
```

---

## 🚨 ERROR HANDLING & LOGGING

### Standardized Error Responses
```typescript
// Error Types
enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

// Standard Error Response Format
interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCodes;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
  };
}

// Global Error Handler
const globalErrorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] || generateRequestId();
  
  // Log error
  logger.error('API Error', {
    requestId,
    path: req.path,
    method: req.method,
    error: error.message,
    stack: error.stack,
    user: req.user?.userId
  });
  
  // Send appropriate response
  if (error instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
        requestId
      }
    });
  }
  
  // Default server error
  res.status(500).json({
    success: false,
    error: {
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      requestId
    }
  });
};
```

---

## 📊 MOCK DATA SPECIFICATION

### Development Mock Data
```typescript
// Mock Users for Testing
export const mockUsers = [
  {
    id: 'client_001',
    whatsappNumber: '+919876543210',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    role: 'CLIENT',
    isVerified: true,
    address: {
      street: 'TC 15/2890, Pattoor Road',
      city: 'Thiruvananthapuram',
      state: 'Kerala',
      pincode: '695011'
    },
    bankDetails: {
      accountNumber: '1234567890',
      ifscCode: 'SBIN0001234',
      accountHolderName: 'Rajesh Kumar',
      bankName: 'State Bank of India'
    }
  },
  {
    id: 'vendor_001',
    whatsappNumber: '+919876543211',
    firstName: 'Suresh',
    lastName: 'Menon',
    role: 'VENDOR',
    isVerified: true,
    isApproved: true,
    businessInfo: {
      businessName: 'Mobile Palace Thrissur',
      businessType: 'Electronics Retailer',
      gstNumber: '32ABCDE1234F1Z5'
    }
  },
  {
    id: 'agent_001',
    whatsappNumber: '+919876543212',
    firstName: 'Priya',
    lastName: 'Nair',
    role: 'AGENT',
    isVerified: true,
    isApproved: true,
    agentInfo: {
      agentId: 'AG001',
      coverageAreas: ['Thiruvananthapuram', 'Kollam'],
      rating: 4.9,
      totalPickups: 156
    }
  }
];

// Mock Device Listings
export const mockListings = [
  {
    id: 'listing_001',
    clientId: 'client_001',
    brand: 'Apple',
    model: 'iPhone 14 Pro Max',
    variant: 'Pro Max',
    storageCapacity: '256GB',
    color: 'Space Black',
    condition: 'EXCELLENT',
    askingPrice: 5500000, // ₹55,000 in paise
    imei1: '123456789012345',
    description: 'Excellent condition iPhone with all accessories',
    photos: [
      'https://example.com/photos/iphone-front.jpg',
      'https://example.com/photos/iphone-back.jpg'
    ],
    status: 'APPROVED',
    createdAt: '2024-01-15T10:30:00Z'
  }
];

// Mock API Response Helper
export const createMockResponse = <T>(data: T, message = 'Success'): ApiResponse<T> => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString()
});
```

---

## 🔧 DEVELOPMENT SETUP GUIDE

### Environment Configuration
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/selliko_dev"
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
JWT_EXPIRY="7d"

# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID="your_phone_number_id"
WHATSAPP_ACCESS_TOKEN="your_permanent_access_token"
WHATSAPP_VERIFY_TOKEN="your_webhook_verify_token"
WHATSAPP_WEBHOOK_URL="https://yourdomain.com/api/webhooks/whatsapp"

# File Storage (AWS S3)
AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
S3_BUCKET_NAME="selliko-uploads"

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"

# Development
NODE_ENV="development"
PORT=3001
LOG_LEVEL="debug"
```

### Package.json Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "compression": "^1.7.4",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "zod": "^3.22.4",
    "prisma": "^5.6.0",
    "@prisma/client": "^5.6.0",
    "redis": "^4.6.10",
    "socket.io": "^4.7.4",
    "multer": "^1.4.5-lts.1",
    "@aws-sdk/client-s3": "^3.462.0",
    "razorpay": "^2.9.2",
    "winston": "^3.11.0",
    "node-cron": "^3.0.2"
  },
  "devDependencies": {
    "@types/node": "^20.9.0",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/multer": "^1.4.11",
    "typescript": "^5.2.2",
    "ts-node": "^10.9.1",
    "nodemon": "^3.0.1"
  }
}
```

### Quick Start Commands
```bash
# Initialize new project
npm init -y
npm install [dependencies]

# Database setup
npx prisma init
npx prisma generate
npx prisma migrate dev --name init

# Development server
npm run dev

# Production build
npm run build
npm start
```

This comprehensive backend specification provides everything needed for rapid development integration with the frontend design plan.

**🎯 DESIGN PLAN STATUS: COMPLETE** 
Ready for development implementation with 1,800+ lines of comprehensive specifications covering all user flows, technical requirements, and design standards per CELLFLIPEXPECTATIONS.md requirements. 

---

## 🚀 BACKEND INTEGRATION PLAN - COMPLETE SPECIFICATION

### Overview
This section provides comprehensive backend architecture and API specifications for rapid development integration. The backend follows a REST API architecture with WebSocket support for real-time features.

### Architecture Stack Recommendations
```typescript
// Recommended Technology Stack
const backendStack = {
  runtime: 'Node.js (v18+) with TypeScript',
  framework: 'Express.js or Fastify',
  database: 'PostgreSQL (primary) + Redis (cache/sessions)',
  authentication: 'JWT + WhatsApp Business API',
  fileStorage: 'AWS S3 or Cloudinary',
  payments: 'Razorpay or Stripe India',
  websockets: 'Socket.io',
  validation: 'Zod or Joi',
  orm: 'Prisma or TypeORM'
};
```

---

## 🗄️ DATABASE SCHEMA SPECIFICATION

### Core Tables Structure
```sql
-- Enum Types
CREATE TYPE user_role AS ENUM ('CLIENT', 'VENDOR', 'AGENT', 'ADMIN');
CREATE TYPE listing_status AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'SOLD', 'EXPIRED');
CREATE TYPE bid_status AS ENUM ('ACTIVE', 'OUTBID', 'WON', 'LOST', 'CANCELLED');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'AGENT_ASSIGNED', 'IN_VERIFICATION', 'PAYMENT_PENDING', 'COMPLETED', 'CANCELLED');
CREATE TYPE verification_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');

-- Users Table (All user types)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whatsapp_number VARCHAR(15) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    role user_role NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    profile_image TEXT,
    
    -- Address Information
    address JSONB,
    
    -- Bank Details (encrypted)
    bank_details JSONB,
    
    -- Role-specific data
    business_info JSONB, -- For vendors
    agent_info JSONB,    -- For agents
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Device Listings
CREATE TABLE device_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES users(id),
    
    -- Device Information
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    variant VARCHAR(100),
    storage_capacity VARCHAR(20),
    color VARCHAR(50),
    condition VARCHAR(20) NOT NULL,
    
    -- Pricing
    asking_price INTEGER NOT NULL, -- in paise
    
    -- Technical Details
    imei1 VARCHAR(15) NOT NULL,
    imei2 VARCHAR(15),
    description TEXT,
    battery_health INTEGER,
    
    -- Documentation
    photos JSONB NOT NULL, -- Array of photo URLs
    bill_photo TEXT,
    warranty_info JSONB,
    
    -- Pickup Information
    pickup_address JSONB NOT NULL,
    preferred_pickup_time VARCHAR(20),
    
    -- Status & Approval
    status listing_status DEFAULT 'PENDING',
    admin_approval JSONB,
    approved_at TIMESTAMP,
    expires_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Bids System
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES device_listings(id),
    vendor_id UUID REFERENCES users(id),
    
    amount INTEGER NOT NULL, -- in paise
    message TEXT,
    status bid_status DEFAULT 'ACTIVE',
    
    placed_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);

-- Transactions (Order Management)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES device_listings(id),
    client_id UUID REFERENCES users(id),
    vendor_id UUID REFERENCES users(id),
    agent_id UUID REFERENCES users(id),
    winning_bid_id UUID REFERENCES bids(id),
    
    -- Financial Information
    bid_amount INTEGER NOT NULL,
    final_amount INTEGER,
    deductions_total INTEGER DEFAULT 0,
    platform_fee INTEGER,
    agent_commission INTEGER,
    
    -- Status Tracking
    status transaction_status DEFAULT 'PENDING',
    phase VARCHAR(20) DEFAULT 'ASSIGNMENT',
    
    -- Timestamps
    agent_assigned_at TIMESTAMP,
    verification_completed_at TIMESTAMP,
    payment_completed_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Agent Assignments
CREATE TABLE agent_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id),
    agent_id UUID REFERENCES users(id),
    assigned_by_admin_id UUID REFERENCES users(id),
    
    scheduled_pickup_time TIMESTAMP,
    priority VARCHAR(10) DEFAULT 'NORMAL',
    assignment_notes TEXT,
    
    status VARCHAR(20) DEFAULT 'ASSIGNED',
    accepted_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Device Verifications
CREATE TABLE device_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id),
    agent_id UUID REFERENCES users(id),
    
    -- Customer Identity
    customer_id_verified BOOLEAN DEFAULT FALSE,
    id_type VARCHAR(20),
    id_number VARCHAR(50),
    id_photo TEXT,
    
    -- Device Inspection
    actual_condition VARCHAR(20),
    inspection_notes TEXT,
    functional_issues JSONB DEFAULT '[]',
    physical_issues JSONB DEFAULT '[]',
    accessories_included JSONB DEFAULT '[]',
    
    -- Photos
    device_photos JSONB, -- verification photos
    bill_photo TEXT,
    packaging_photo TEXT,
    
    -- Financial Calculation
    deductions JSONB DEFAULT '[]',
    final_offer INTEGER,
    
    -- OTP Verification
    customer_otp_verified BOOLEAN DEFAULT FALSE,
    customer_otp_verified_at TIMESTAMP,
    
    status verification_status DEFAULT 'PENDING',
    completed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- OTP Management
CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    purpose VARCHAR(50) NOT NULL,
    transaction_id UUID,
    
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    is_verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX idx_users_whatsapp ON users(whatsapp_number);
CREATE INDEX idx_listings_status ON device_listings(status, created_at DESC);
CREATE INDEX idx_bids_listing ON bids(listing_id, placed_at DESC);
CREATE INDEX idx_transactions_status ON transactions(status, created_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_otp_phone_purpose ON otp_verifications(phone_number, purpose, expires_at);
```

---

## 🔌 API ENDPOINTS SPECIFICATION

### Authentication Endpoints

#### POST `/api/auth/send-otp`
```typescript
// Request
interface SendOTPRequest {
  phoneNumber: string; // +91XXXXXXXXXX format
  purpose: 'LOGIN' | 'TRANSACTION_ACCEPT' | 'VENDOR_RECEIPT' | 'REGISTRATION';
  transactionId?: string; // Required for transaction purposes
}

// Response
interface SendOTPResponse {
  success: boolean;
  otpId: string;
  expiresIn: number; // seconds (600 = 10 minutes)
  message: string;
  attemptsRemaining?: number;
}

// Implementation Notes:
// - Generate 6-digit OTP, store in database with expiry
// - Send via WhatsApp Business API
// - Rate limit: max 3 OTPs per phone per hour
// - Block after 5 failed attempts for 30 minutes
```

#### POST `/api/auth/verify-otp`
```typescript
// Request
interface VerifyOTPRequest {
  phoneNumber: string;
  otpCode: string;
  purpose: string;
  transactionId?: string;
}

// Response
interface VerifyOTPResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    role: string;
    isFirstTime: boolean;
  };
  token?: string; // JWT token for authenticated endpoints
  message: string;
  nextStep?: 'COMPLETE_PROFILE' | 'DASHBOARD' | 'TRANSACTION_CONTINUE';
}
```

### Device Listing Endpoints

#### POST `/api/listings`
```typescript
// Request (multipart/form-data)
interface CreateListingRequest {
  // Device Information
  brand: string;
  model: string;
  variant: string;
  storageCapacity: string;
  color: string;
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  
  // Technical Details
  imei1: string; // 15 digits
  imei2?: string;
  description: string;
  batteryHealth?: number;
  askingPrice: number; // in rupees, will convert to paise
  
  // Files
  photos: File[]; // 4-6 photos required
  billPhoto?: File;
  
  // Warranty
  hasWarranty: boolean;
  warrantyExpiryDate?: string;
  warrantyType?: string;
  
  // Pickup Details
  pickupAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  preferredPickupTime: 'MORNING' | 'AFTERNOON' | 'EVENING';
}

// Response
interface CreateListingResponse {
  success: boolean;
  listingId: string;
  status: 'PENDING'; // Always pending initially
  estimatedApprovalTime: string; // "2-6 hours"
  message: string;
}
```

#### GET `/api/listings?status=pending&page=1`
```typescript
// Query Parameters
interface ListingsQuery {
  status?: 'pending' | 'approved' | 'active' | 'sold' | 'expired';
  clientId?: string; // For client's own listings
  page?: number;
  limit?: number;
  search?: string;
}

// Response
interface ListingsResponse {
  success: boolean;
  data: DeviceListing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

### Admin Endpoints

#### GET `/api/admin/listings/pending`
```typescript
// Response
interface PendingListingsResponse {
  success: boolean;
  data: Array<{
    id: string;
    device: string; // "iPhone 14 Pro Max 256GB"
    client: {
      name: string;
      phone: string;
      address: string;
    };
    askingPrice: number;
    submittedAt: string;
    photos: string[];
    documentation: {
      billPhoto?: string;
      warrantyInfo?: object;
    };
  }>;
}
```

#### POST `/api/admin/listings/:id/review`
```typescript
// Request
interface ReviewListingRequest {
  action: 'APPROVE' | 'REJECT';
  comments?: string; // Required if rejecting
}

// Response
interface ReviewListingResponse {
  success: boolean;
  action: string;
  listingId: string;
  message: string;
  notificationsSent: {
    client: boolean;
    vendors: boolean; // Only if approved
  };
}
```

#### GET `/api/admin/agents/available`
```typescript
// Query Parameters
interface AvailableAgentsQuery {
  city: string;
  state: string;
  priority?: 'HIGH' | 'NORMAL' | 'LOW';
}

// Response
interface AvailableAgentsResponse {
  success: boolean;
  data: Array<{
    id: string;
    name: string;
    phone: string;
    location: { city: string; state: string; };
    availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
    stats: {
      rating: number;
      totalPickups: number;
      activeAssignments: number;
    };
    distance?: number; // km from pickup location
    estimatedTime?: number; // minutes to reach
  }>;
}
```

#### POST `/api/admin/transactions/:id/assign-agent`
```typescript
// Request
interface AssignAgentRequest {
  agentId: string;
  scheduledDateTime: string; // ISO string
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  notes?: string;
}

// Response
interface AssignAgentResponse {
  success: boolean;
  assignmentId: string;
  agentNotified: boolean;
  clientNotified: boolean;
  message: string;
}
```

### Bidding Endpoints

#### POST `/api/listings/:id/bids`
```typescript
// Request
interface PlaceBidRequest {
  amount: number; // in rupees
  message?: string;
}

// Response
interface PlaceBidResponse {
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
```

#### GET `/api/listings/:id/bidding-status`
```typescript
// Response (for real-time bidding updates)
interface BiddingStatusResponse {
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
```

### Agent Endpoints

#### GET `/api/agent/tasks`
```typescript
// Response
interface AgentTasksResponse {
  success: boolean;
  data: {
    assigned: Array<{
      id: string;
      transactionId: string;
      device: string;
      client: {
        name: string;
        phone: string;
        address: object;
      };
      orderValue: number;
      assignedAt: string;
      priority: string;
      status: 'ASSIGNED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED';
    }>;
    completed: Array<{
      id: string;
      device: string;
      completedAt: string;
      commission: number;
    }>;
  };
}
```

#### POST `/api/agent/tasks/:taskId/accept`
```typescript
// Response
interface AcceptTaskResponse {
  success: boolean;
  taskId: string;
  clientContactAllowed: boolean;
  navigationDetails: {
    address: string;
    coordinates?: { lat: number; lng: number; };
    mapsUrl: string;
  };
  message: string;
}
```

#### POST `/api/agent/verification/:transactionId`
```typescript
// Request (multipart/form-data)
interface VerificationSubmissionRequest {
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

// Response
interface VerificationSubmissionResponse {
  success: boolean;
  finalOffer: number;
  deductionsTotal: number;
  customerOtpSent: boolean;
  message: string;
  nextStep: 'AWAIT_CUSTOMER_ACCEPTANCE';
}
```

---

## 📱 WHATSAPP INTEGRATION SPECIFICATION

### WhatsApp Business API Setup
```typescript
// WhatsApp Service Configuration
interface WhatsAppConfig {
  apiUrl: 'https://graph.facebook.com/v18.0';
  phoneNumberId: string; // From WhatsApp Business Account
  accessToken: string; // Permanent access token
  verifyToken: string; // Webhook verification token
  webhookUrl: string; // Your webhook endpoint
}

// Message Templates (Must be pre-approved by Meta)
const messageTemplates = {
  OTP_LOGIN: {
    name: 'otp_login',
    components: [{
      type: 'body',
      parameters: [
        { type: 'text', text: '{{otp}}' },
        { type: 'text', text: '{{expiry_minutes}}' }
      ]
    }]
  },
  
  LISTING_APPROVED: {
    name: 'listing_approved', 
    components: [{
      type: 'body',
      parameters: [
        { type: 'text', text: '{{client_name}}' },
        { type: 'text', text: '{{device_name}}' }
      ]
    }]
  },
  
  NEW_BID_RECEIVED: {
    name: 'new_bid_received',
    components: [{
      type: 'body', 
      parameters: [
        { type: 'text', text: '{{device_name}}' },
        { type: 'text', text: '{{bid_amount}}' },
        { type: 'text', text: '{{vendor_name}}' }
      ]
    }]
  },
  
  AGENT_ASSIGNED: {
    name: 'agent_assigned',
    components: [{
      type: 'body',
      parameters: [
        { type: 'text', text: '{{agent_name}}' },
        { type: 'text', text: '{{device_name}}' },
        { type: 'text', text: '{{pickup_time}}' }
      ]
    }]
  }
};

// WhatsApp Service Implementation
class WhatsAppService {
  async sendTemplateMessage(phoneNumber: string, templateName: string, parameters: string[]) {
    const response = await fetch(`${config.apiUrl}/${config.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneNumber.replace('+', ''),
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' },
          components: [{
            type: 'body',
            parameters: parameters.map(p => ({ type: 'text', text: p }))
          }]
        }
      })
    });
    
    return response.json();
  }
  
  async sendOTP(phoneNumber: string, otp: string, expiryMinutes: number) {
    return this.sendTemplateMessage(phoneNumber, 'otp_login', [otp, expiryMinutes.toString()]);
  }
}
```

---

## 🔄 WEBSOCKET SPECIFICATION

### Real-time Features Implementation
```typescript
// Socket.io Event Specifications
interface SocketEvents {
  // Bidding Events
  'bidding:join': { listingId: string };
  'bidding:leave': { listingId: string };
  'bidding:new_bid': { 
    listingId: string;
    bidAmount: number;
    currentHighest: number;
    timeRemaining: number;
    totalBids: number;
  };
  'bidding:instant_win': {
    listingId: string;
    vendorId: string;
    finalAmount: number;
  };
  
  // Notification Events
  'notifications:join': { userId: string };
  'notifications:new': {
    type: string;
    title: string;
    message: string;
    data?: object;
  };
  
  // Order Status Events
  'order:status_update': {
    orderId: string;
    status: string;
    timestamp: string;
    details?: object;
  };
}

// WebSocket Server Implementation
io.on('connection', (socket) => {
  // Join bidding room
  socket.on('bidding:join', ({ listingId }) => {
    socket.join(`listing_${listingId}`);
  });
  
  // Handle new bid broadcast
  socket.on('new_bid_placed', (data) => {
    io.to(`listing_${data.listingId}`).emit('bidding:new_bid', data);
  });
  
  // Join user notifications
  socket.on('notifications:join', ({ userId }) => {
    socket.join(`user_${userId}`);
  });
});
```

---

## 🔒 SECURITY & VALIDATION

### Input Validation Schemas
```typescript
// Using Zod for runtime validation
import { z } from 'zod';

const phoneNumberSchema = z.string()
  .regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian phone number format');

const deviceListingSchema = z.object({
  brand: z.string().min(1).max(50),
  model: z.string().min(1).max(100),
  imei1: z.string().regex(/^\d{15}$/, 'IMEI must be 15 digits'),
  imei2: z.string().regex(/^\d{15}$/).optional(),
  askingPrice: z.number().min(1000).max(200000), // ₹1,000 to ₹2,00,000
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR'])
});

const bidSchema = z.object({
  amount: z.number().min(100), // Minimum ₹100 bid
  message: z.string().max(500).optional()
});

// Middleware for validation
const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
  };
};
```

### JWT Authentication
```typescript
// JWT Token Structure
interface JWTPayload {
  userId: string;
  role: 'CLIENT' | 'VENDOR' | 'AGENT' | 'ADMIN';
  phoneNumber: string;
  iat: number;
  exp: number; // 7 days expiry
}

// Auth Middleware
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    req.user = decoded as JWTPayload;
    next();
  });
};

// Role-based access control
const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    next();
  };
};
```

---

## 📁 FILE UPLOAD SPECIFICATION

### File Handling Strategy
```typescript
// Multer configuration for file uploads
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 6 // Maximum 6 files per upload
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  }
});

// S3 Upload Service
class FileUploadService {
  private s3Client: S3Client;
  
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });
  }
  
  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const key = `${folder}/${Date.now()}-${file.originalname}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    });
    
    await this.s3Client.send(command);
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }
  
  async uploadDevicePhotos(files: Express.Multer.File[], listingId: string): Promise<string[]> {
    const uploadPromises = files.map((file, index) => 
      this.uploadFile(file, `listings/${listingId}/device-${index + 1}`)
    );
    return Promise.all(uploadPromises);
  }
}
```

---

## 💳 PAYMENT INTEGRATION

### Razorpay Payment Processing
```typescript
// Razorpay Service Implementation
import Razorpay from 'razorpay';

interface PaymentDistribution {
  clientAmount: number;      // Final offer amount
  agentCommission: number;   // 5% of final offer
  platformFee: number;       // 2% of final offer
  vendorDeduction: number;   // Total deductions
}

class PaymentService {
  private razorpay: Razorpay;
  
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!
    });
  }
  
  calculatePaymentDistribution(finalOffer: number): PaymentDistribution {
    const agentCommission = Math.round(finalOffer * 0.05); // 5%
    const platformFee = Math.round(finalOffer * 0.02); // 2%
    const clientAmount = finalOffer - agentCommission - platformFee;
    
    return {
      clientAmount,
      agentCommission,
      platformFee,
      vendorDeduction: 0 // Calculated during verification
    };
  }
  
  async processTransactionPayment(transactionId: string) {
    const transaction = await db.transaction.findUnique({
      where: { id: transactionId },
      include: { client: true, agent: true, vendor: true }
    });
    
    const distribution = this.calculatePaymentDistribution(transaction.finalAmount);
    
    // Create payment transfers
    const transfers = await Promise.allSettled([
      // Pay client
      this.createTransfer({
        account: transaction.client.razorpayAccountId,
        amount: distribution.clientAmount * 100, // Convert to paise
        currency: 'INR',
        notes: { transactionId, type: 'CLIENT_PAYMENT' }
      }),
      
      // Pay agent commission
      this.createTransfer({
        account: transaction.agent.razorpayAccountId,
        amount: distribution.agentCommission * 100,
        currency: 'INR',
        notes: { transactionId, type: 'AGENT_COMMISSION' }
      })
    ]);
    
    return transfers;
  }
  
  private async createTransfer(data: any) {
    return this.razorpay.transfers.create(data);
  }
}
```

---

## 🚨 ERROR HANDLING & LOGGING

### Standardized Error Responses
```typescript
// Error Types
enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

// Standard Error Response Format
interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCodes;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
  };
}

// Global Error Handler
const globalErrorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] || generateRequestId();
  
  // Log error
  logger.error('API Error', {
    requestId,
    path: req.path,
    method: req.method,
    error: error.message,
    stack: error.stack,
    user: req.user?.userId
  });
  
  // Send appropriate response
  if (error instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
        requestId
      }
    });
  }
  
  // Default server error
  res.status(500).json({
    success: false,
    error: {
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      requestId
    }
  });
};
```

---

## 📊 MOCK DATA SPECIFICATION

### Development Mock Data
```typescript
// Mock Users for Testing
export const mockUsers = [
  {
    id: 'client_001',
    whatsappNumber: '+919876543210',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    role: 'CLIENT',
    isVerified: true,
    address: {
      street: 'TC 15/2890, Pattoor Road',
      city: 'Thiruvananthapuram',
      state: 'Kerala',
      pincode: '695011'
    },
    bankDetails: {
      accountNumber: '1234567890',
      ifscCode: 'SBIN0001234',
      accountHolderName: 'Rajesh Kumar',
      bankName: 'State Bank of India'
    }
  },
  {
    id: 'vendor_001',
    whatsappNumber: '+919876543211',
    firstName: 'Suresh',
    lastName: 'Menon',
    role: 'VENDOR',
    isVerified: true,
    isApproved: true,
    businessInfo: {
      businessName: 'Mobile Palace Thrissur',
      businessType: 'Electronics Retailer',
      gstNumber: '32ABCDE1234F1Z5'
    }
  },
  {
    id: 'agent_001',
    whatsappNumber: '+919876543212',
    firstName: 'Priya',
    lastName: 'Nair',
    role: 'AGENT',
    isVerified: true,
    isApproved: true,
    agentInfo: {
      agentId: 'AG001',
      coverageAreas: ['Thiruvananthapuram', 'Kollam'],
      rating: 4.9,
      totalPickups: 156
    }
  }
];

// Mock Device Listings
export const mockListings = [
  {
    id: 'listing_001',
    clientId: 'client_001',
    brand: 'Apple',
    model: 'iPhone 14 Pro Max',
    variant: 'Pro Max',
    storageCapacity: '256GB',
    color: 'Space Black',
    condition: 'EXCELLENT',
    askingPrice: 5500000, // ₹55,000 in paise
    imei1: '123456789012345',
    description: 'Excellent condition iPhone with all accessories',
    photos: [
      'https://example.com/photos/iphone-front.jpg',
      'https://example.com/photos/iphone-back.jpg'
    ],
    status: 'APPROVED',
    createdAt: '2024-01-15T10:30:00Z'
  }
];

// Mock API Response Helper
export const createMockResponse = <T>(data: T, message = 'Success'): ApiResponse<T> => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString()
});
```

---

## 🔧 DEVELOPMENT SETUP GUIDE

### Environment Configuration
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/selliko_dev"
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
JWT_EXPIRY="7d"

# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID="your_phone_number_id"
WHATSAPP_ACCESS_TOKEN="your_permanent_access_token"
WHATSAPP_VERIFY_TOKEN="your_webhook_verify_token"
WHATSAPP_WEBHOOK_URL="https://yourdomain.com/api/webhooks/whatsapp"

# File Storage (AWS S3)
AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
S3_BUCKET_NAME="selliko-uploads"

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"

# Development
NODE_ENV="development"
PORT=3001
LOG_LEVEL="debug"
```

### Package.json Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "compression": "^1.7.4",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "zod": "^3.22.4",
    "prisma": "^5.6.0",
    "@prisma/client": "^5.6.0",
    "redis": "^4.6.10",
    "socket.io": "^4.7.4",
    "@aws-sdk/client-s3": "^3.462.0",
    "razorpay": "^2.9.2",
    "winston": "^3.11.0",
    "node-cron": "^3.0.2"
  },
  "devDependencies": {
    "@types/node": "^20.9.0",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/multer": "^1.4.11",
    "typescript": "^5.2.2",
    "ts-node": "^10.9.1",
    "nodemon": "^3.0.1"
  }
}
```

### Quick Start Commands
```bash
# Initialize new project
npm init -y
npm install [dependencies]

# Database setup
npx prisma init
npx prisma generate
npx prisma migrate dev --name init

# Development server
npm run dev

# Production build
npm run build
npm start
```

This comprehensive backend specification provides everything needed for rapid development integration with the frontend design plan.