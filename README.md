# ViriShare Frontend

React + Vite frontend for ViriShare — A Localized Video Sharing Platform for Nepal, built as a Final Year Project (CPP501) at Virinchi College / Asia e University.

## About

ViriShare is a localized video sharing platform built for Nepali creators and viewers. The frontend is a single-page application with three role-based portals — User, Creator, and Admin — and focuses on solving real gaps in the Nepali market: local payment gateway support (eSewa and Khalti), low-barrier creator monetization, multi-language UI, and regional content visibility.

## Features

**User Portal**
- Browse and search videos — free and paid
- Adaptive video playback with view sync
- Shorts feed with vertical scroll player
- Like, comment, and subscribe to creators
- Purchase subscription plans via eSewa, Khalti, or Stripe
- Watch history, notifications, and profile management
- YouTube API video playback integration
- Multi-language UI switching (Nepali, Maithili, and more)

**Creator Portal**
- Drag-and-drop video and Shorts upload with real-time progress bar
- Analytics dashboard — views, watch time, CTR, subscriber growth (Recharts)
- My Videos and My Shorts with status filter (Pending / Approved / Rejected)
- Built-in Video Editor and Thumbnail Studio (text, shapes, emojis, PNG export)
- Monthly earnings breakdown and payout request (eSewa / Khalti)

**Admin Portal**
- Platform dashboard — total views, users, videos, and revenue
- Video moderation — approve or reject with reason modal
- Videos and Shorts toggle with status filter and search
- User management — update role, subscription plan, and account status
- Revenue reports with date range filter and CSV export
- Pending payout review and processing

**Authentication**
- Email/password sign-up and sign-in
- Google, GitHub, and Outlook OAuth2 login
- OTP-based two-factor authentication
- JWT access and refresh token management via Axios interceptor

## Tech Stack

- **React 18** + **Vite 5**
- **React Router DOM v6** — client-side routing
- **Zustand** — global state management
- **Material-UI (MUI) v9** + **Tailwind CSS** — UI and styling
- **Recharts** — analytics dashboards
- **Notistack** — in-app notifications
- **html2canvas + jsPDF** — report export

## Prerequisites

- Node.js 18+ LTS
- npm 9+
- ViriShare Backend running on `http://localhost:8080`

## Getting Started

```bash
git clone https://github.com/Amish00/VSP_Frontend.git
cd VSP_Frontend
npm install
```

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_YOUTUBE_API_KEY=YOUR_YOUTUBE_API_KEY
VITE_PAYMENT_SUCCESS_URL=http://localhost:5173/payment/success
VITE_PAYMENT_FAILURE_URL=http://localhost:5173/payment/failure
```

Run:

```bash
npm run dev
```

App runs at `http://localhost:5173`.

## Scripts

```bash
npm run dev       # Development server
npm run build     # Production build
npm run preview   # Preview production build
```

## Related

- [ViriShare Backend](https://github.com/Amish00/VSP_Backend)
- CPP501 Final Year Project — Virinchi College / Asia e University
