# h4ul - Product Requirements Document (MVP)

## 1. Product Overview

### Vision
h4ul is a social platform for fashion-forward college students and young adults to document, organize, and discover clothing purchases. Think Letterboxd for fashion - a visual diary of your wardrobe with social discovery elements.

### Target Audience
- **Primary**: College students and young adults (18-25)
- **Psychographic**: Fashion-forward, seeking inspiration, active on social media
- **Geographic**: US-based initially (Berkeley/college campuses)

### Success Metrics (MVP)
- 100+ active users in first 2 months
- 60% weekly retention rate
- Average 3+ posts per active user per month
- 20% of users engage with others' content (likes/follows)

---

## 2. Core Features (MVP Scope)

### 2.1 User Authentication

**Must Have:**
- Email/password registration and login
- Google Sign-In
- Apple Sign-In
- Basic profile setup (username, profile photo, bio)
- Password reset functionality

**User Stories:**
- As a new user, I want to sign up quickly with my Google account so I can start using the app immediately
- As a user, I want to create a unique username so others can find and follow me

### 2.2 Creating Posts

**Must Have:**
- Upload photo of clothing item (required, max 1 image per post for MVP)
- Add caption (optional, 500 character limit)
- Add tags (optional, select from predefined list + custom tags)
  - Predefined categories: tops, bottoms, outerwear, shoes, accessories, dresses, bags
  - Mood/vibe tags: casual, formal, streetwear, vintage, minimalist, maximalist, athleisure, preppy
  - Season tags: spring, summer, fall, winter, all-season
- Add to existing collection during post creation (optional)
- Post visibility settings (public/private toggle)

**User Stories:**
- As a user, I want to upload a photo of my new jacket and tag it as "outerwear" and "streetwear" so I can organize it properly
- As a user, I want to add a caption explaining where I bought an item so my followers can ask me about it
- As a user, I want to add items to my "Winter Essentials" collection while posting so I can organize as I go

**Technical Notes:**
- Image upload max size: 10MB
- Supported formats: JPG, PNG, HEIC
- Client-side image compression before upload (target <2MB)
- Firebase Storage for image hosting

### 2.3 Social Features

**Following System:**
- Follow/unfollow other users
- View followers/following lists
- Following count displayed on profile

**Engagement:**
- Like posts (single tap, heart icon)
- Like count displayed on posts
- View list of users who liked a post

**Feed:**
- Chronological feed of posts from followed users
- Pagination (20 posts per page)
- Pull-to-refresh functionality
- Empty state for new users with suggestions to follow

**User Stories:**
- As a user, I want to follow my friends so I can see what they're buying
- As a user, I want to like posts I find inspiring so I can show appreciation
- As a user, I want a chronological feed so I don't miss recent posts from people I follow

**Out of Scope for MVP:**
- Comments (Phase 2)
- Complex recommendation algorithms
- Push notifications (Phase 2)

### 2.4 Personal Organization

**My Wardrobe:**
- Grid view of all user's own posts
- Filter by tags
- Filter by collection
- Search within own posts
- Sort by: date posted (newest/oldest), most liked

**Collections System:**
- Create unlimited custom collections
- Name collections (50 character limit)
- Add posts to multiple collections (multi-category sorting)
- Default collection: "My Wishlist" (auto-created for all users)
- Edit/delete collections
- View posts within a collection (grid view)

**My Wishlist:**
- Pre-created collection that cannot be deleted
- Save other users' posts to wishlist (bookmark icon)
- Organized in grid view like other collections
- Can be segmented/filtered by tags

**User Stories:**
- As a user, I want to create a "Date Night Outfits" collection so I can organize items for specific occasions
- As a user, I want to add items to multiple collections (e.g., "Winter" and "Casual") so I can categorize flexibly
- As a user, I want to save other users' posts to my wishlist so I can remember items I want to buy
- As a user, I want to view all my saved wishlist items and filter by "shoes" so I can find specific inspiration

**Technical Notes:**
- No hard limit on number of collections
- Collections stored as references to posts (not duplicating post data)

### 2.5 Discovery & Explore

**Explore Feed:**
- Public feed showing recent posts from all users
- Filter by tags (tops, shoes, vintage, etc.)
- Chronological order (most recent first)
- 20 posts per page with pagination
- Ability to like and save posts directly from explore

**Search:**
- Search for users by username
- Search for posts by tags

**User Stories:**
- As a new user, I want to browse the explore feed to discover fashionable people to follow
- As a user, I want to filter the explore feed by "vintage" so I can find style inspiration in that category
- As a user, I want to search for other users so I can find and follow my friends

**Out of Scope for MVP:**
- Trending/algorithmic recommendations
- "For You" personalized feed
- Advanced search filters

### 2.6 User Profiles

**Profile Page:**
- Profile photo
- Username
- Bio (200 character limit)
- Follower/following counts
- Grid of user's public posts
- View user's collections (if public)
- Follow/unfollow button (when viewing others' profiles)

**Privacy Controls:**
- Profile visibility: Public (anyone can view) or Private (only approved followers)
- Post visibility: Individual posts can be public or private
- Collection visibility: Public or private per collection

**User Stories:**
- As a user, I want to make my profile private so only people I approve can see my posts
- As a user, I want to set some collections as private so I can keep personal wishlists hidden

---

## 3. Technical Architecture

### 3.1 Tech Stack

**Frontend:**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API + hooks
- **Image Handling**: next/image with optimization

**Backend & Services:**
- **Backend-as-a-Service**: Firebase
  - **Authentication**: Firebase Auth (Email/Password, Google, Apple)
  - **Database**: Cloud Firestore
  - **Storage**: Firebase Cloud Storage (images)
  - **Hosting**: Firebase Hosting (optional) or Vercel

**Deployment:**
- **Platform**: Vercel (frontend)
- **CI/CD**: GitHub Actions + Vercel auto-deploy
- **Domain**: Custom domain (haul.app or similar)

**Additional Tools:**
- **Image Optimization**: browser-image-compression (client-side)
- **Analytics**: Firebase Analytics
- **Error Tracking**: Console logging (can add Sentry later)
- **Icons**: Lucide React
- **Date Handling**: date-fns

### 3.2 Database Schema (Firestore)

**Collections Structure:**

```typescript
// Collection: users
interface User {
  uid: string; // Firebase Auth UID
  username: string; // unique, lowercase
  email: string;
  displayName: string;
  bio: string;
  profilePhotoUrl: string;
  isPrivate: boolean; // default: false
  followerCount: number; // default: 0
  followingCount: number; // default: 0
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Collection: posts
interface Post {
  postId: string;
  userId: string; // reference to user
  imageUrl: string; // Firebase Storage URL
  caption: string;
  tags: string[]; // array of tag strings
  collectionIds: string[]; // array of collection IDs this post belongs to
  isPrivate: boolean; // default: false
  likeCount: number; // default: 0
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Collection: collections
interface Collection {
  collectionId: string;
  userId: string; // owner of collection
  name: string; // max 50 chars
  isPrivate: boolean; // default: false
  isWishlist: boolean; // true for auto-created wishlist, false otherwise
  postIds: string[]; // array of post IDs in this collection
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Collection: likes
interface Like {
  likeId: string;
  userId: string; // user who liked
  postId: string; // post that was liked
  createdAt: Timestamp;
}

// Collection: follows
interface Follow {
  followId: string;
  followerId: string; // user doing the following
  followingId: string; // user being followed
  createdAt: Timestamp;
}
```

**Firestore Indexes Required:**
- posts: `userId`, `createdAt` (descending)
- posts: `isPrivate`, `createdAt` (descending)
- posts: `tags` (array-contains), `createdAt` (descending)
- likes: `postId`, `userId` (composite)
- likes: `userId`, `createdAt` (descending)
- follows: `followerId`, `createdAt` (descending)
- follows: `followingId`, `createdAt` (descending)

### 3.3 Predefined Tags

```typescript
export const PREDEFINED_TAGS = {
  categories: [
    'tops',
    'bottoms',
    'outerwear',
    'shoes',
    'accessories',
    'dresses',
    'bags'
  ],
  vibes: [
    'casual',
    'formal',
    'streetwear',
    'vintage',
    'minimalist',
    'maximalist',
    'athleisure',
    'preppy'
  ],
  seasons: [
    'spring',
    'summer',
    'fall',
    'winter',
    'all-season'
  ]
};
```

---

## 4. User Flows

### 4.1 New User Onboarding
1. Land on homepage/login screen
2. Click "Sign Up"
3. Choose sign-up method (Google/Apple/Email)
4. Complete profile (username, profile photo, bio)
5. Auto-create "My Wishlist" collection
6. Directed to empty feed with "Explore" CTA

### 4.2 Creating a Post
1. Click "+" button (bottom nav or header)
2. Upload image from device
3. Image preview with crop/adjust (optional for MVP)
4. Add caption (optional)
5. Select tags from predefined + add custom
6. Choose collections to add to (multi-select)
7. Set visibility (public/private toggle)
8. Click "Post"
9. Redirected to "My Wardrobe" with new post visible

### 4.3 Browsing & Engaging
1. Open app → see feed of followed users
2. Scroll through posts
3. Like posts (heart icon)
4. Save posts to wishlist (bookmark icon)
5. Click on post → see full detail view
6. Click on user → see their profile
7. Follow user → their posts appear in feed
8. Switch to "Explore" tab → see all public posts
9. Filter explore by tags

### 4.4 Organizing Wardrobe
1. Navigate to "My Wardrobe" tab
2. View all own posts in grid
3. Click "Collections" → see all collections
4. Create new collection (e.g., "Summer Fits")
5. Add posts to collection (multi-select or from post detail)
6. View collection → see filtered posts
7. Edit/delete collection as needed

---

## 5. UI/UX Requirements

### 5.1 Design Principles
- **Mobile-first**: Optimized for vertical phone screens (responsive for desktop)
- **Clean & Minimal**: Focus on imagery, not UI clutter
- **Instagram-inspired**: Familiar patterns for social engagement
- **Fast & Responsive**: Smooth scrolling, quick image loading

### 5.2 Navigation Structure

**Bottom Navigation (Mobile):**
- Home (feed icon) → Main feed
- Explore (compass icon) → Explore page
- Create (+ icon) → Post creation
- Wardrobe (grid icon) → My Wardrobe
- Profile (person icon) → User profile

**Desktop:** Side navigation with same items

### 5.3 Color Scheme

**Recommended Palette:**
- **Primary**: Deep purple (#7C3AED) or Forest green (#059669)
- **Secondary**: Neutral grays (#6B7280, #F3F4F6)
- **Accent**: Rose (#F43F5E) for likes
- **Background**: White (#FFFFFF) / Light gray (#F9FAFB)
- **Text**: Dark gray (#111827)

### 5.4 Key Screens

**Main Screens:**
1. **Feed** - Chronological posts from followed users
2. **Explore** - Public posts with tag filters
3. **My Wardrobe** - Grid of own posts with filters
4. **Collections** - List of collections, tap to view posts
5. **Profile** - User profile with posts grid
6. **Post Detail** - Full post view with like/save actions
7. **Create Post** - Upload flow
8. **Settings** - Privacy controls, account settings

### 5.5 Component Requirements

**Post Card:**
- Square image (1:1 aspect ratio for grid consistency)
- User info at top (avatar + username) when in feed
- Like button (heart icon, filled when liked)
- Save button (bookmark icon, filled when saved)
- Tag pills (small chips below/overlay on image)
- Caption below image
- Timestamp (e.g., "2 days ago")

**Feed Post Card:**
- User avatar + username at top
- Post image (tap to view detail)
- Like and save buttons below image
- Like count
- Caption (truncated with "see more")
- Tags as small chips
- Timestamp

**Collection Card:**
- Cover image (first post in collection, or placeholder)
- Collection name
- Post count (e.g., "24 items")
- Privacy indicator (lock icon if private)

**User Card:**
- Profile photo (circular)
- Username
- Display name
- Follow/Following button
- Follower count (optional)

### 5.6 Responsive Design
- **Mobile** (< 768px): Single column, bottom nav
- **Tablet** (768px - 1024px): 2-column grid, bottom nav
- **Desktop** (> 1024px): 3-column grid, side nav, max-width container

---

## 6. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function getUserData(userId) {
      return get(/databases/$(database)/documents/users/$(userId)).data;
    }
    
    function isFollowing(userId) {
      return exists(/databases/$(database)/documents/follows/$(request.auth.uid + '_' + userId));
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId);
      allow delete: if isOwner(userId);
    }
    
    // Posts collection
    match /posts/{postId} {
      allow read: if isAuthenticated() && 
        (resource.data.isPrivate == false || 
         request.auth.uid == resource.data.userId ||
         (getUserData(resource.data.userId).isPrivate == false) ||
         isFollowing(resource.data.userId));
      allow create: if isAuthenticated();
      allow update, delete: if isOwner(resource.data.userId);
    }
    
    // Collections
    match /collections/{collectionId} {
      allow read: if isAuthenticated() &&
        (resource.data.isPrivate == false ||
         request.auth.uid == resource.data.userId);
      allow create, update, delete: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Likes
    match /likes/{likeId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      allow delete: if isOwner(resource.data.userId);
    }
    
    // Follows
    match /follows/{followId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() &&
        request.resource.data.followerId == request.auth.uid;
      allow delete: if isOwner(resource.data.followerId);
    }
  }
}
```

---

## 7. Firebase Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Posts images
    match /posts/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Profile images
    match /profiles/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 8. Key Interactions & Behaviors

### 8.1 Like Functionality
- **Action**: Tap heart icon on post
- **Behavior**: 
  - Optimistic UI update (heart fills immediately)
  - Create like document in Firestore
  - Increment post likeCount
  - If error, revert UI and show error message
- **Unlike**: Tap filled heart
  - Remove fill immediately
  - Delete like document
  - Decrement post likeCount

### 8.2 Save to Wishlist
- **Action**: Tap bookmark icon on post
- **Behavior**:
  - Add post ID to user's wishlist collection
  - Fill bookmark icon
  - Show toast: "Saved to wishlist"
- **Remove**: Tap filled bookmark
  - Remove post ID from wishlist
  - Unfill icon

### 8.3 Follow/Unfollow
- **Action**: Tap "Follow" button on profile
- **Behavior**:
  - Create follow document
  - Increment follower/following counts
  - Button changes to "Following"
  - User's posts appear in feed
- **Unfollow**: Tap "Following" button
  - Show confirmation modal: "Unfollow @username?"
  - Delete follow document
  - Decrement counts
  - Button changes to "Follow"

### 8.4 Image Upload
- **Flow**:
  1. User selects image from device
  2. Client-side compression (target <2MB, maintain quality)
  3. Show upload progress bar
  4. Upload to Firebase Storage
  5. Get download URL
  6. Save post with imageUrl to Firestore
  7. Redirect to wardrobe/feed

### 8.5 Tag Selection
- **UI**: Multi-select chip interface
- **Predefined tags**: Show in organized groups (Categories, Vibes, Seasons)
- **Custom tags**: Text input to add custom tag
- **Selected tags**: Show as filled chips
- **Deselect**: Tap chip again to remove

### 8.6 Collections Multi-Select
- **UI**: Modal with checkboxes
- **Behavior**: User can select multiple collections
- **Save**: Post ID added to postIds array of each selected collection
- **Create new**: Option to create new collection from modal

---

## 9. Error Handling & Edge Cases

### 9.1 Network Errors
- Show toast notification: "Connection lost. Please try again."
- Retry button for failed operations
- Cache data where possible (offline support not required for MVP)

### 9.2 Upload Failures
- Image upload fails: "Upload failed. Please try again."
- Image too large (>10MB): "Image too large. Please choose a smaller file."
- Unsupported format: "Unsupported file type. Please use JPG, PNG, or HEIC."

### 9.3 Authentication Errors
- Invalid credentials: "Invalid email or password."
- Email already in use: "This email is already registered."
- Weak password: "Password must be at least 6 characters."
- Username taken: "This username is already taken. Please choose another."

### 9.4 Empty States
- No posts in feed: "Your feed is empty. Follow users to see their posts!" + Explore CTA
- No posts in wardrobe: "You haven't posted anything yet. Share your first item!" + Create post CTA
- No collections: "Create your first collection to organize your wardrobe."
- No search results: "No users found. Try a different search."
- Private profile (not following): "This account is private. Follow to see their posts."

### 9.5 Loading States
- Feed loading: Skeleton loaders (3-5 post card skeletons)
- Image loading: Blur placeholder while loading
- Button actions: Spinner in button, disable while processing
- Profile loading: Skeleton for avatar, username, bio

---

## 10. Content Moderation (Manual for MVP)

### 10.1 Reporting System
- **Report Button**: Three-dot menu on posts → "Report"
- **Report Reasons**:
  - Inappropriate content
  - Spam
  - Harassment
- **Action**: Create report document in Firestore (reports collection)

### 10.2 Reports Collection Schema

```typescript
interface Report {
  reportId: string;
  reporterId: string; // user who reported
  postId: string; // reported post
  reason: 'inappropriate' | 'spam' | 'harassment';
  status: 'pending' | 'reviewed' | 'actioned';
  createdAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string; // admin user ID
}
```

### 10.3 Admin Dashboard (Basic)
- Protected route: /admin (check user.isAdmin field)
- View pending reports
- See reported post (image, caption, reporter info)
- Actions:
  - Dismiss report
  - Delete post
  - Ban user (set user.isBanned = true, prevent login)

---

## 11. Performance Requirements

### 11.1 Page Load
- Initial page load: < 2 seconds
- Time to interactive: < 3 seconds
- Feed scroll: 60fps smooth scrolling

### 11.2 Image Optimization
- Lazy loading: Images load as they enter viewport
- Next.js Image component: Automatic optimization, responsive images
- Compression: Client-side compression before upload (<2MB)
- Progressive loading: Blur placeholder → full image

### 11.3 Database Queries
- Pagination: Limit queries to 20 results
- Indexes: All queries use proper Firestore indexes
- Caching: Cache user data to avoid refetching

---

## 12. Accessibility Requirements

### 12.1 Visual
- Color contrast: WCAG AA compliant (4.5:1 for text)
- Focus indicators: Visible focus states on all interactive elements
- Text sizing: Minimum 16px for body text
- Alt text: All images have descriptive alt attributes

### 12.2 Keyboard Navigation
- Tab order: Logical tab sequence through page
- Skip links: "Skip to main content" for screen readers
- Enter/Space: Activate buttons and links
- Esc: Close modals

### 12.3 Screen Readers
- ARIA labels: All icon buttons have aria-label
- Semantic HTML: Use proper heading hierarchy (h1, h2, h3)
- Live regions: Announce dynamic content updates (toasts, errors)

---

## 13. Environment Variables

Create `.env.local` file:

```bash
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 14. File Structure

```
h4ul/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── setup-profile/
│   │   │       └── page.tsx
│   │   ├── (main)/
│   │   │   ├── feed/
│   │   │   │   └── page.tsx
│   │   │   ├── explore/
│   │   │   │   └── page.tsx
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   ├── wardrobe/
│   │   │   │   └── page.tsx
│   │   │   ├── collections/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── profile/
│   │   │   │   └── [username]/
│   │   │   │       └── page.tsx
│   │   │   ├── post/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── admin/
│   │   │   └── page.tsx
│   │   ├── api/ (optional, for server actions)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/ (reusable UI components)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── ...
│   │   ├── PostCard.tsx
│   │   ├── FeedPostCard.tsx
│   │   ├── UserCard.tsx
│   │   ├── CollectionCard.tsx
│   │   ├── Navigation.tsx
│   │   ├── BottomNav.tsx
│   │   ├── SideNav.tsx
│   │   ├── TagSelector.tsx
│   │   ├── CollectionSelector.tsx
│   │   ├── ImageUpload.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── firebase.ts (Firebase initialization)
│   │   ├── firestore.ts (Firestore helper functions)
│   │   ├── storage.ts (Firebase Storage functions)
│   │   ├── constants.ts (PREDEFINED_TAGS, etc.)
│   │   └── utils.ts (utility functions)
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePosts.ts
│   │   ├── useUsers.ts
│   │   ├── useCollections.ts
│   │   ├── useLikes.ts
│   │   └── useFollows.ts
│   ├── contexts/
│   │   └── AuthContext.tsx
│   └── types/
│       └── index.ts (TypeScript interfaces)
├── public/
│   └── (static assets)
├── .env.local
├── .env.local.example
├── .gitignore
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 15. Dependencies

### Required NPM Packages

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "firebase": "^10.7.0",
    "date-fns": "^3.0.0",
    "lucide-react": "^0.300.0",
    "browser-image-compression": "^2.0.2",
    "react-hook-form": "^7.49.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0",
    "tailwindcss": "^3.4.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

---

## 16. Future Enhancements (Post-MVP)

### Phase 2 (Months 2-4):
- Comments on posts
- Push notifications (likes, follows, comments)
- User blocking/muting
- Enhanced search (filter by multiple tags, date range)
- Activity feed (see likes and follows from people you follow)

### Phase 3 (Months 4-6):
- Recommendation engine (collaborative filtering)
- Trending items/users
- Brand/store tagging with purchase links
- Price tracking (add purchase price, track spending)
- Share to Instagram Stories
- Export collections as images

### Phase 4 (Months 6+):
- iOS native app (React Native)
- Android app
- AI-powered style matching
- Outfit creation (combine multiple items)
- AR try-on features
- Marketplace (buy/sell secondhand)
- Creator monetization

---

## 17. Testing Checklist

Before launch, verify:

### Authentication
- [ ] User can sign up with email/password
- [ ] User can sign up with Google
- [ ] User can sign up with Apple
- [ ] Username uniqueness is validated
- [ ] User can log in
- [ ] User can log out
- [ ] Password reset works
- [ ] Protected routes redirect to login

### Post Creation
- [ ] User can upload image
- [ ] Image compression works
- [ ] User can add caption
- [ ] User can select predefined tags
- [ ] User can add custom tags
- [ ] User can add to collections
- [ ] Post saves to Firestore correctly
- [ ] Image uploads to Firebase Storage
- [ ] Privacy toggle works

### Social Features
- [ ] User can follow/unfollow
- [ ] Follow counts update correctly
- [ ] User can like/unlike posts
- [ ] Like counts update correctly
- [ ] Feed shows only followed users' posts
- [ ] Feed is chronological
- [ ] User profile displays correctly
- [ ] Followers/following lists work

### Collections
- [ ] Wishlist auto-created on signup
- [ ] User can create collections
- [ ] Posts can be in multiple collections
- [ ] User can save to wishlist
- [ ] Collection detail page works
- [ ] User can edit/delete collections
- [ ] Cannot delete wishlist

### Explore
- [ ] Explore shows all public posts
- [ ] Tag filtering works
- [ ] User search works
- [ ] Can follow from explore

### UI/UX
- [ ] Mobile responsive (test on iPhone, Android)
- [ ] Tablet responsive
- [ ] Desktop responsive
- [ ] Loading states show correctly
- [ ] Error messages are clear
- [ ] Empty states display correctly
- [ ] Images lazy load
- [ ] Smooth scrolling

### Security
- [ ] Firestore security rules deployed
- [ ] Storage security rules deployed
- [ ] Private posts are hidden
- [ ] Cannot access other users' private data
- [ ] XSS protection (sanitize user input)

---

## 18. Launch Checklist

### Pre-Launch
- [ ] Firebase production project created
- [ ] Firestore security rules deployed
- [ ] Storage security rules deployed
- [ ] Environment variables configured
- [ ] Domain purchased and configured
- [ ] SSL certificate active
- [ ] Analytics set up
- [ ] Error tracking set up
- [ ] All tests passing

### Launch Day
- [ ] Deploy to production (Vercel)
- [ ] Smoke test all features in production
- [ ] Invite 20-30 beta users
- [ ] Monitor Firebase usage
- [ ] Watch for errors in logs
- [ ] Gather initial feedback

### Post-Launch (Week 1)
- [ ] Fix critical bugs
- [ ] Respond to user feedback
- [ ] Monitor performance metrics
- [ ] Track usage analytics
- [ ] Plan next iteration

---

## 19. Success Metrics

Track these metrics weekly:

### User Acquisition
- New signups
- Activation rate (% who complete profile + make first post)
- Referral source (organic, invite, etc.)

### Engagement
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Monthly Active Users (MAU)
- DAU/MAU ratio (stickiness)
- Posts per active user
- Likes per user
- Follows per user
- Session length
- Frequency (how often users return)

### Content
- Total posts created
- Posts with tags (%)
- Posts in collections (%)
- Average tags per post
- Collections created per user
- Wishlist saves per user

### Retention
- Day 1 retention
- Day 7 retention
- Day 30 retention
- Cohort retention curves

### Technical
- Page load time (p50, p95)
- Error rate
- API response time
- Firebase costs

---

## 20. Budget & Costs

### Development (Self-Built)
- **Time**: 8-12 weeks
- **Cost**: $0 (your time)

### Ongoing Costs (Monthly)
- **Firebase** (Blaze plan):
  - 0-100 users: $0-5/month
  - 100-500 users: $5-30/month
  - 500-1000 users: $30-100/month
- **Vercel**: $0 (free tier sufficient for MVP)
- **Domain**: $1-2/month ($12-20/year)

### Total Year 1
- **Best case**: ~$50 (low usage)
- **Expected**: ~$200-500 (moderate growth)
- **Scale case**: ~$1000+ (1000+ active users)

---

## Implementation Notes

### Critical Success Factors
1. **Mobile-first design** - Most users will be on phones
2. **Fast image loading** - Use next/image, lazy loading, compression
3. **Smooth UX** - Optimistic UI updates, loading states
4. **Data integrity** - Proper Firestore security rules
5. **Simple onboarding** - Get users posting in <2 minutes

### Development Priorities
1. Authentication + profile setup
2. Post creation + My Wardrobe
3. Social features (follow, like, feed)
4. Collections + Wishlist
5. Explore + Search
6. Polish + Security

### Risks & Mitigation
- **Risk**: Firebase costs spiral
  - *Mitigation*: Set billing alerts, optimize queries, monitor usage
- **Risk**: Poor performance with scale
  - *Mitigation*: Pagination, lazy loading, caching, indexes
- **Risk**: Low engagement
  - *Mitigation*: Focus on UX, fast iteration, user feedback
- **Risk**: Content moderation overhead
  - *Mitigation*: Start manual, add automated tools (Cloud Vision API) later

---

## Final Notes

This PRD covers all essential features for an MVP. The goal is to:
1. **Validate the concept** with real users (Berkeley students)
2. **Iterate quickly** based on feedback
3. **Scale thoughtfully** if traction is strong

Focus on building a solid, fast, beautiful core experience. Resist feature creep. Ship early, learn fast, improve continuously.

**Next Steps:**
1. Set up Firebase project
2. Initialize Next.js project
3. Build authentication
4. Implement core features
5. Test with beta users
6. Launch and iterate

Good luck! 🚀
