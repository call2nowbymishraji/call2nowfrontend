import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import CreateProfile from './pages/CreateProfile.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SearchResults from './pages/SearchResults.jsx';
import NotFound from './pages/NotFound.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import TermsOfService from './pages/TermsOfService.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute.jsx';

// Business pages used to live under /b/. Shared links and Google's index still carry that
// form, so the prefix keeps answering by forwarding to the root URL.
function LegacyProfileUrl() {
  const { slug } = useParams();
  return <Navigate to={`/${slug}`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/b/:slug" element={<LegacyProfileUrl />} />
      <Route path="/:slug" element={<ProfilePage />} />
      <Route
        path="/create-profile"
        element={
          <ProtectedRoute>
            <CreateProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage ownerMode />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
