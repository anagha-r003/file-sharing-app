import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { LayoutProvider } from "./context/LayoutContext";
import ProtectedLayout from "./layout/ProtectedLayout";

import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";
import DashboardPage from "./pages/private/DashboardPage";
import MyFilesPage from "./pages/private/MyFilesPage";
import SharedLinkPreviewPage from "./pages/public/SharedLinkPreviewPage";
import SharedLinksPage from "./pages/private/ShareLinksPage";
import SharedWithMePage from "./pages/private/SharedWithMePage";
import RecycleBinPage from "./pages/private/RecycleBinPage";
import StarredPage from "./pages/private/StarredPage";
import MyFoldersPage from "./pages/private/MyFoldersPage";
import FolderDetailPage from "./pages/private/FolderDetailPage";
import ForgotPasswordPage from "./pages/public/ForgotPasswordPage";
import ResetPasswordPage from "./pages/public/ResetPasswordPage";
import ProfilePage from "./pages/private/ProfilePage";
import SupportPage from "./pages/private/SupportPage";
import LinkExpired from "./components/sharedlink/LinkExpired";
import AccessRevoked from "./components/sharedlink/AccessRevoked";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/public/share/:token"
            element={<SharedLinkPreviewPage />}
          />
          <Route path="/share-expired" element={<LinkExpired />} />
          <Route path="/share-revoked" element={<AccessRevoked />} />

          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected routes */}
          <Route
            element={
              <LayoutProvider>
                <ProtectedRoute />
              </LayoutProvider>
            }
          >
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/my-files" element={<MyFilesPage />} />
              <Route path="/shared-links" element={<SharedLinksPage />} />
              <Route path="/shared-with-me" element={<SharedWithMePage />} />
              <Route path="/starred" element={<StarredPage />} />
              <Route path="/my-folders" element={<MyFoldersPage />} />
              <Route path="/my-folders/:id" element={<FolderDetailPage />} />
              <Route path="/recycle-bin" element={<RecycleBinPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/support" element={<SupportPage />} />
            </Route>
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
