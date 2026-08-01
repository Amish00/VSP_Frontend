# ViriShare Frontend

React + Vite frontend for ViriShare — A Localized Video Sharing Platform for Nepal.

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
