// src/App.js
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/context/AuthContext';

// Auth pages
import SignInPage from './auth/pages/SignInPage';
import SignUpPage from './auth/pages/SignUpPage';
import ForgotPasswordPage from './auth/pages/ForgotPasswordPage';
import OtpPage from './auth/pages/OtpPage';
import ResetPasswordPage from './auth/pages/ResetPasswordPage';
import OAuth2RedirectHandler from './auth/pages/OAuth2RedirectHandler';

import Home from './user/pages/Home';
import AdminDashboard from './admin/pages/AdminDashboard';
import CreatorDashboard from './creator/pages/CreatorDashboard';
import UploadPage from './creator/pages/UploadPage';

import UserLayout from './user/layout/UserLayout'; 
import CreatorLayout from './creator/layout/CreatorLayout'; 
import AdminLayout from './admin/layout/AdminLayout';
import UsersPage from './admin/pages/UsersPage';
import VideosPage from './admin/pages/VIdeoPage';
import WatchPage from './user/pages/WatchPage';
import HistoryPage from './user/pages/HistoryPage';
import SubscriptionsPage from './user/pages/SubscriptionsPage';
import TrendingPage from './user/pages/TrendingPage';
import PlansPage from './user/pages/PlansPage';
import PaymentSuccess from './user/pages/PaymentSuccess';
import PaymentFailure from './user/pages/PaymentFailure';
import MyVideosPage from './creator/pages/MyVideosPage';
import VideoInfoPage from './creator/pages/VideoInfoPage';
import RevenuePage from './admin/pages/RevenuePage';
import EarningsPage from './creator/pages/EarningsPage';
import Report from './admin/pages/Report';
import ProfilePage from './user/pages/ProfilePage';
import AnalyticsPage from "./creator/pages/AnalyticsPage";
import ThumbnailEditor from './creator/pages/ThumbnailEditor';
import { SnackbarProvider } from 'notistack';
import { useSnackbar } from 'notistack';
import { X } from 'lucide-react';
import AllVideosPage from './user/pages/AllVideosPage';
import SearchPage from './user/pages/SearchPage';
import VideoEditor from './creator/pages/VideoEditor';
import NotFound from './user/pages/NotFound';
import { LanguageProvider } from './context/LanguageContext';
import { useLanguage } from './context/LanguageContext';
import { translateText } from './context/translationService';
import EditorSelectionPage from './creator/pages/EditorSelectionPage';
import ShortsFeed from './user/pages/ShortsFeed';
import MyShortsPage from './creator/pages/MyShortsPage';
import ShortsWatchPage from './user/pages/ShortsWatchPage';
import YouTubePage from './user/pages/YouTubePage';
import YouTubeWatchPage from './user/pages/YouTubeWatchPage';

const translatedTextCache = new Map();
const originalTextMap = new WeakMap();

const shouldSkipText = (text) => {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 2) return true;
  if (trimmed.includes('@')) return true;
  if (/^https?:\/\//i.test(trimmed) || /^www\./i.test(trimmed)) return true;
  if (/^[\d\s.,:;!?()[\]{}'"“”‘’\-+*/#%&|<>]+$/.test(trimmed)) return true;
  return false;
};

const PageTranslator = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const isAuthRoute = /^\/(signin|signup|login|forgot-password|otp|reset-password|oauth2\/redirect)(\/|$)/.test(location.pathname);

  useEffect(() => {
    if (isAuthRoute) {
      return undefined;
    }

    const root = document.getElementById('root');
    if (!root) return undefined;

    let cancelled = false;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest('[data-no-translate]')) return NodeFilter.FILTER_REJECT;
        if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT'].includes(parent.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        return shouldSkipText(node.nodeValue || '') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      },
    });

    const nodes = [];
    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }

    const runTranslation = async () => {
      const originals = new Set();
      const entries = [];

      for (const node of nodes) {
        const original = originalTextMap.get(node) ?? node.nodeValue ?? '';
        if (!originalTextMap.has(node)) {
          originalTextMap.set(node, original);
        }
        entries.push({ node, original });
        originals.add(original);
      }

      const translatedByOriginal = new Map();
      await Promise.all([...originals].map(async (original) => {
        const cacheKey = `${language}::${original}`;
        let translated = translatedTextCache.get(cacheKey);
        if (!translated) {
          translated = language === 'en' ? original : await translateText(original, language);
          translatedTextCache.set(cacheKey, translated);
        }
        translatedByOriginal.set(original, translated);
      }));

      if (cancelled) return;

      entries.forEach(({ node, original }) => {
        node.nodeValue = translatedByOriginal.get(original) || original;
      });
    };

    runTranslation();

    return () => {
      cancelled = true;
    };
  }, [language, location.pathname, isAuthRoute]);

  return null;
};

const AuthLanguageLock = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const isAuthRoute = /^\/(signin|signup|login|forgot-password|otp|reset-password|oauth2\/redirect)(\/|$)/.test(pathname);
    if (isAuthRoute && localStorage.getItem('app-language') !== 'en') {
      localStorage.setItem('app-language', 'en');
      window.dispatchEvent(new CustomEvent('app-language-change', { detail: 'en' }));
    }
  }, [pathname]);

  return null;
};

const getRoleHomePath = (role) => {
  switch ((role || '').toLowerCase()) {
    case 'admin':
      return '/admin';
    case 'creator':
      return '/creator';
    default:
      return '/';
  }
};

const PublicPortalRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (user?.role?.toLowerCase() === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

const PublicHomeRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (user?.role?.toLowerCase() === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Home />;
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/signin" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role?.toLowerCase())) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }
  return children;
};

const ProtectedFallbackRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  return <Navigate to={user ? getRoleHomePath(user.role) : '/'} replace />;
};

const SnackbarCloseButton = ({ snackbarKey }) => {
  const { closeSnackbar } = useSnackbar();

  return (
    <button
      type="button"
      onClick={() => closeSnackbar(snackbarKey)}
      className="ml-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-current/80 transition-colors hover:bg-white/15 hover:text-white"
      aria-label="Close notification"
    >
      <X size={16} />
    </button>
  );
};

function App() {
  return (
    <SnackbarProvider
      maxSnack={3}
      autoHideDuration={3000}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      action={(snackbarKey) => <SnackbarCloseButton snackbarKey={snackbarKey} />}
    >
      <AuthProvider>
        <LanguageProvider>
          <PageTranslator />
          <AuthLanguageLock />
          <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Navigate to="/signin?error=oauth_failed" replace />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

        {/* Public home routes with persistent UserLayout (header + footer) */}
        <Route
          element={
            <PublicPortalRoute>
              <UserLayout />
            </PublicPortalRoute>
          }
        >
          <Route path="/" element={<PublicHomeRoute />} />
          <Route path="/home" element={<PublicHomeRoute />} />
          <Route path="/watch/:id" element={<WatchPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failure" element={<PaymentFailure />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<NotFound />} />
          <Route path="/all-videos" element={<AllVideosPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/not-found" element={<NotFound />} />
          <Route path="/shorts" element={<ShortsFeed />} />
          <Route path="/shorts/watch/:id" element={<ShortsWatchPage />} />
          <Route path="/youtube" element={<YouTubePage />} />
          <Route path="/watch/youtube/:videoId" element={<YouTubeWatchPage />} />

          

        </Route>

        {/* Admin routes with AdminLayout (top nav + sidebar) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="videos" element={<VideosPage />} />
          <Route path="revenue" element={<RevenuePage />} />
          <Route path="reports" element={<Report />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<NotFound />} />
          
        </Route>

        {/* Creator nested layout (kept as is) */}
        <Route path="/creator" element={
          <ProtectedRoute allowedRoles={['creator']}>
            <CreatorLayout />
          </ProtectedRoute>
        }>
          <Route index element={<CreatorDashboard />} />
          <Route path="dashboard" element={<CreatorDashboard />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="videos" element={<MyVideosPage />} />
          <Route path="video/:id" element={<VideoInfoPage />} />  
          <Route path="editors" element={<EditorSelectionPage />} />
          <Route path="earnings" element={<EarningsPage />} />
          <Route path="shorts" element={<MyShortsPage />} />

        </Route>
        <Route path="creator/thumbnail-editor" element={<ThumbnailEditor />} />
        <Route path="creator/video-editor" element={<VideoEditor />} />
        {/* Fallback */}
        <Route path="*" element={<ProtectedFallbackRoute />} />
          </Routes>
        </LanguageProvider>
      </AuthProvider>
    </SnackbarProvider>
  );
}

export default App;