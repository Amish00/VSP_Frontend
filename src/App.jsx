// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import AllVideosPage from './user/pages/AllVideosPage';
import SearchPage from './user/pages/SearchPage';
import VideoEditor from './creator/pages/VideoEditor';
import NotFound from './user/pages/NotFound';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/signin" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role?.toLowerCase())) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <SnackbarProvider maxSnack={3} autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
      <Routes>
        {/* Public routes */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

        {/* Public home routes with persistent UserLayout (header + footer) */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/watch/:id" element={<WatchPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failure" element={<PaymentFailure />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<div> Settings Pages </div>} />
          <Route path="/all-videos" element={<AllVideosPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/not-found" element={<NotFound />} />
          

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
          
          <Route path="earnings" element={<EarningsPage />} />

        </Route>
        <Route path="creator/editors" element={<ThumbnailEditor />} />
        <Route path="creator/video-editor" element={<VideoEditor />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;