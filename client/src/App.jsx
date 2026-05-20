import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";
import DashboardPage from "./pages/private/DashboardPage";
import MyFilesPage from "./pages/private/MyFilesPage";
import SharedLinkPreviewPage from "./pages/public/SharedLinkPreviewPage";
import SharedLinksPage from "./pages/private/ShareLinksPage";
import RecycleBinPage from "./pages/private/RecycleBinPage";
import StarredPage from "./pages/private/StarredPage";
import MyFoldersPage from "./pages/private/MyFoldersPage";
import FolderDetailPage from "./pages/private/FolderDetailPage";
import ForgotPasswordPage from "./pages/public/ForgotPasswordPage";
import ResetPasswordPage from "./pages/public/ResetPasswordPage";

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

          <Route 
             path="/forgot-password" 
             element={<ForgotPasswordPage />} />

          <Route 
             path="/reset-password" 
             element={<ResetPasswordPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-files"
            element={
              <ProtectedRoute>
                <MyFilesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/shared-links"
            element={
              <ProtectedRoute>
                <SharedLinksPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/starred"
            element={
              <ProtectedRoute>
                <StarredPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-folders"
            element={
              <ProtectedRoute>
                <MyFoldersPage />
              </ProtectedRoute>
            }
          />

          { <Route
            path="/my-folders/:id"
            element={
              <ProtectedRoute>
                <FolderDetailPage />
              </ProtectedRoute>
            }
          /> }

          <Route
            path="/recycle-bin"
            element={
              <ProtectedRoute>
                <RecycleBinPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
