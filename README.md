# h4ul

A social platform for fashion-forward people to document, organize, and discover clothing. Think Letterboxd for fashion.

## Features

- **Authentication**: Email/password and Google sign-in
- **Posts**: Upload photos of clothing with tags and captions
- **Social**: Follow users, like posts, personalized feed
- **Collections**: Organize items into custom collections
- **Wishlist**: Save other users posts for inspiration
- **Explore**: Discover new styles and users
- **Profile**: Customize your profile and privacy settings

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **UI**: Lucide React icons, React Hook Form

## Getting Started

### 1. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project named "h4ul"
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
   - Enable Google
4. Create Firestore Database:
   - Go to Firestore Database > Create database
   - Start in test mode
   - Choose us-central1 region
5. Enable Storage:
   - Go to Storage > Get started
   - Start in test mode

### 2. Get Firebase Config

1. Go to Project Settings (gear icon) > General
2. Scroll to "Your apps" > Click Web icon (</>)
3. Register app with nickname "h4ul-web"
4. Copy the config values

### 3. Configure Environment

Copy `.env.local.example` to `.env.local` and fill in your Firebase config:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your values.

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

Push to GitHub and import to Vercel. Add environment variables in the Vercel dashboard.
