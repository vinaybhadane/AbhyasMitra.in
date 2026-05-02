# AbhyasMitra - Educational Blogging Platform

A production-ready full-stack educational blogging platform built for SPPU Engineering students, using Next.js (App Router), Firebase, and Tailwind CSS.

## 🚀 Features

- **Modern Tech Stack**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4.
- **Firebase Backend**: Firestore (Database), Authentication (Google Sign-In), Storage (Media).
- **SEO Optimized**: Dynamic metadata, Open Graph tags, JSON-LD schema, Semantic HTML, Sitemap, robots.txt, fast load times.
- **Admin Panel**: Secure dashboard restricted to authorized admins. Rich text editor (TipTap) for creating posts, media library, and comment moderation.
- **Interactive UI**: Responsive design, Dark/Light mode toggle, animated transitions, subject categorization, reading time, and auto-generated Table of Contents.
- **Comments System**: Nested comments (threads) gated by Google authentication.
- **Analytics Ready**: Configured for Google Analytics 4 (GA4) and AdSense integration.

## 🛠 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Firebase project (Google Account)
- A Vercel account for frontend hosting

## 🔧 Setup Instructions

### 1. Firebase Configuration

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Firestore Database**:
   - Go to Build > Firestore Database > Create database.
   - Start in **Production mode**.
   - Choose a region close to your target audience.
3. Enable **Authentication**:
   - Go to Build > Authentication > Get Started.
   - Click "Add new provider" and enable **Google**.
4. Enable **Storage**:
   - Go to Build > Storage > Get Started.
   - Start in **Production mode**.
5. Get your Firebase config:
   - Go to Project Overview > Project settings (gear icon) > General.
   - Scroll down to "Your apps", click the **Web** icon `</>`, and register your app.
   - Copy the `firebaseConfig` object values.

### 2. Local Setup

1. Rename `.env.local` or create a new one based on the template:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
2. Install Firebase Tools globally (if you haven't):
   ```bash
   npm install -g firebase-tools
   ```
3. Login and link your Firebase project:
   ```bash
   firebase login
   firebase use --add
   ```
4. Deploy the security rules and indexes to your Firebase project:
   ```bash
   firebase deploy --only firestore,storage
   ```
5. Install dependencies and start the development server:
   ```bash
   npm install
   npm run dev
   ```

### 3. Granting Admin Access

By default, admin access is hardcoded for specific emails to ensure security. 
1. Open `src/lib/firebase.ts`.
2. Find the `ADMIN_EMAILS` array.
3. Update it to include your Google email addresses:
   ```typescript
   export const ADMIN_EMAILS = [
     'vinaybhadane06@gmail.com',
     'bhadane123vinay@gmail.com',
     'your_email@gmail.com'
   ];
   ```
   *(Also make sure to update the emails in `firestore.rules` and `storage.rules` and re-deploy them using `firebase deploy --only firestore,storage` if you add new admins).*

## 🌍 Deployment Steps (Vercel)

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. In the **Environment Variables** section, add all the variables from your `.env.local` file. Make sure to update `NEXT_PUBLIC_SITE_URL` to your actual production domain.
5. Click **Deploy**.

## 📈 SEO & Analytics Setup

1. **Google Search Console**: 
   - Add your domain property in GSC.
   - Copy the HTML tag verification content attribute.
   - Add it to `NEXT_PUBLIC_GSC_VERIFICATION` in your environment variables.
2. **Google Analytics 4**: 
   - Create a GA4 property and get the Measurement ID.
   - Add it to `NEXT_PUBLIC_GA_ID` in your environment variables.
3. **AdSense**: 
   - Get your Publisher ID from Google AdSense.
   - Add it to `NEXT_PUBLIC_ADSENSE_ID` in your environment variables.

## 📁 Project Structure

- `/src/app` - Next.js App Router pages and layouts.
- `/src/components` - Reusable UI components (Navbar, Footer, BlogCard, etc.).
- `/src/lib` - Utility functions, Firebase configuration, SEO helpers, and Type definitions.
- `/src/contexts` - React Context providers (Auth).
- `firestore.rules` & `storage.rules` - Firebase Security Rules.
- `firestore.indexes.json` - Firestore Composite Indexes.
