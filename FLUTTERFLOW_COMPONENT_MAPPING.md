# FlutterFlow Visual Component Mapping

## Current Web App → FlutterFlow Components

### 🏠 Landing Page
**Current**: React landing page with tier cards
**FlutterFlow**: 
- `PageView` with onboarding slides
- `GridView` for membership tier cards
- `ElevatedButton` for "Get Started"
- `Image` widgets for luxury backgrounds

**Visual Structure**:
```
Column
├── Container (Hero Section)
│   ├── Image (Background)
│   ├── Text (Welcome Message)
│   └── Button (Get Started)
├── Text ("Choose Your Tier")
└── GridView (3 Membership Cards)
    ├── MembershipCard (Silver)
    ├── MembershipCard (Gold)
    └── MembershipCard (Platinum)
```

### 🏡 Home Dashboard
**Current**: React dashboard with stats and transactions
**FlutterFlow**:
- `AppBar` with profile avatar
- `SingleChildScrollView` for scrollable content
- `Card` widgets for stats
- `ListView.builder` for transactions

**Visual Structure**:
```
Scaffold
├── AppBar
│   ├── Text ("Welcome Back")
│   └── CircleAvatar (Profile Image)
└── SingleChildScrollView
    └── Column
        ├── WelcomeCard (Custom Component)
        ├── StatsRow (Row of 3 stat cards)
        ├── Text ("Recent Transactions")
        └── ListView (Transaction Items)
```

### 💳 Membership Card
**Current**: SVG-based membership card
**FlutterFlow**:
- `Container` with gradient decoration
- `QrImage` widget for QR code
- `Stack` for layered design

**Visual Structure**:
```
Container (Gradient Background)
└── Stack
    ├── Positioned (Top Right - Tier Badge)
    ├── Column (Center Content)
    │   ├── Text (Member Name)
    │   ├── QrImage (QR Code)
    │   ├── Text (Member ID)
    │   └── Text (Expires)
    └── Positioned (Bottom - Balance)
```

### 💰 Digital Wallet
**Current**: React wallet with balance and transactions
**FlutterFlow**:
- `Card` for balance display
- `ToggleButtons` for currency switch
- `ListView.separated` for transactions

**Visual Structure**:
```
Column
├── BalanceCard (Custom Component)
│   ├── Text (Current Balance)
│   ├── Text (Amount)
│   └── ToggleButtons (MXN/USD)
├── FilterRow (Transaction Filters)
└── Expanded
    └── ListView.separated
        └── TransactionTile (Custom Component)
```

### 🎉 VIP Events
**Current**: React grid of event cards
**FlutterFlow**:
- `GridView.builder` for event cards
- `Card` with event details
- `Chip` for tier requirements

**Visual Structure**:
```
GridView.builder
└── EventCard (Custom Component)
    └── Card
        ├── ClipRRect (Rounded Image)
        ├── Padding
        │   ├── Text (Event Title)
        │   ├── Text (Date)
        │   ├── Chip (Tier Required)
        │   └── ElevatedButton (Book Now)
```

### 👤 Profile Page
**Current**: React profile with user info
**FlutterFlow**:
- `CircleAvatar` for profile image
- `TextFormField` for editable fields
- `Card` for membership info

**Visual Structure**:
```
SingleChildScrollView
└── Column
    ├── Center
    │   └── Stack
    │       ├── CircleAvatar (Profile Image)
    │       └── Positioned (Edit Icon)
    ├── Card (Personal Info)
    │   └── Column
    │       ├── TextFormField (First Name)
    │       ├── TextFormField (Last Name)
    │       └── TextFormField (Email)
    ├── Card (Membership Details)
    └── WelcomeGiftsList
```

### 🔧 Admin Panel
**Current**: React admin dashboard
**FlutterFlow**:
- `TabBar` with different admin sections
- `DataTable` for user management
- `FloatingActionButton` for quick actions

**Visual Structure**:
```
DefaultTabController
└── Scaffold
    ├── AppBar
    │   └── TabBar
    │       ├── Tab (Users)
    │       ├── Tab (Transactions)
    │       └── Tab (Events)
    └── TabBarView
        ├── UserManagementTab
        ├── TransactionTab
        └── EventManagementTab
```

## 🎨 Custom Components to Create

### 1. MembershipCard Component
**Inputs**: tier, balance, userImage, userName, expiryDate
**Design**: Gradient background, tier-specific colors, QR code

### 2. TransactionTile Component  
**Inputs**: amount, description, date, type
**Design**: List tile with icon, amount color (green/red)

### 3. EventCard Component
**Inputs**: title, date, image, tierRequired, maxAttendees
**Design**: Card with image, badges, booking button

### 4. BalanceCard Component
**Inputs**: balance, currency, discountPercentage
**Design**: Large balance display, tier benefits

### 5. WelcomeCard Component
**Inputs**: userName, tier, profileImage
**Design**: Personalized greeting with tier badge

## 📱 FlutterFlow Widgets to Use

### Layout Widgets
- `Scaffold`: Main page structure
- `AppBar`: Top navigation
- `Column/Row`: Vertical/horizontal layout
- `Stack`: Overlapping elements
- `Positioned`: Absolute positioning
- `Expanded/Flexible`: Responsive sizing

### Display Widgets
- `Text`: All text content
- `Image`: Photos and icons
- `Card`: Grouped content
- `Container`: Custom styling
- `CircleAvatar`: Profile images
- `Chip`: Tags and badges

### Input Widgets
- `TextFormField`: Text input
- `ElevatedButton`: Primary actions
- `IconButton`: Icon actions
- `ToggleButtons`: Option selection
- `Switch`: Boolean settings

### List Widgets
- `ListView`: Scrollable lists
- `GridView`: Grid layouts
- `PageView`: Swipeable pages
- `TabBar`: Tab navigation

### Special Widgets
- `QrImage`: QR code generation
- `RefreshIndicator`: Pull to refresh
- `CircularProgressIndicator`: Loading states
- `SnackBar`: Toast messages

## 🔄 Data Flow in FlutterFlow

### Authentication Flow
```
1. SplashScreen → Check Auth State
2. If Not Logged In → OnboardingPage → AuthPage
3. If Logged In → HomePage
4. AuthPage Success → Create/Fetch Profile → HomePage
```

### Data Fetching Pattern
```
1. Page Load → Show Loading
2. Supabase Query → Get Data
3. Success → Update UI
4. Error → Show Error Message
```

### Real-time Updates
```
1. User Action → Optimistic Update
2. API Call → Supabase
3. Success → Confirm Update
4. Error → Revert + Show Error
```

## 🎯 Mobile-First Enhancements

### Touch Interactions
- **Swipe**: Navigate between pages
- **Long Press**: Additional options
- **Pull to Refresh**: Update data
- **Pinch to Zoom**: QR code viewing

### Mobile Navigation
- **Bottom Tab Bar**: Main navigation
- **Drawer**: Secondary options  
- **Floating Action Button**: Quick actions
- **Back Button**: iOS/Android navigation

### Platform Features
- **Biometric Auth**: Fingerprint/Face ID
- **Push Notifications**: Event reminders
- **Camera**: QR scanning
- **Photo Gallery**: Profile images
- **Location**: Find clinic locations

## 🚀 Implementation Order

### Phase 1: Core Structure
1. Create project and setup Supabase
2. Design authentication flow
3. Build main navigation structure
4. Create custom color theme

### Phase 2: Main Features
1. Home dashboard with membership card
2. Digital wallet with balance
3. Transaction history
4. VIP events listing

### Phase 3: Advanced Features
1. Profile management
2. QR code generation and scanning
3. Admin panel (if needed)
4. Push notifications

### Phase 4: Polish
1. Animations and transitions
2. Error handling
3. Offline support
4. Performance optimization

This mapping gives you a clear visual guide for recreating your luxury wellness platform in FlutterFlow with enhanced mobile functionality!