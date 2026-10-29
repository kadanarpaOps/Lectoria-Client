import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import Auth from "../pages/Auth/Login&Register";
import RegistrationVerification from "../pages/Auth/RegistrationVerification";
import ErrorPage from "../pages/errors/ErrorPage";
import LandingPage from "../pages/landing/LandingPage";
import MainLayout from "./MainLayout";
import ExploreStories from "../pages/Stories/ExploreStories";
import StoryDetails from "../pages/Stories/StoryDetails";
import Read from "../pages/Stories/Read";
import CreateStory from "../pages/Stories/CreateStory";
import EditStory from "../pages/Stories/EditStory";
import Library from "../pages/User/Library";
import Profile from "../pages/User/Profile";
import AccountSettings from "../pages/User/AccountSettings";
import AdminUsers from "../pages/Admin/AdminUsers";
import Users from "../pages/User/Users";
import Write from "../pages/User/Write";
import RecoveryPassword from "../pages/Auth/RecoveryPassword";
import { useAuth } from "../hooks/useAuth";
import type { ReactNode } from "react";

function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { authUser, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="loading-button" /></div>;
  if (!authUser) return <Navigate to="/auth" replace />;
  if (adminOnly && !authUser.userRoles.includes("LECTORIA_ADMIN")) return <Navigate to="/forbidden" replace />;
  return children;
}

function AuthenticatedRedirect({ children }: { children: ReactNode }) {
  const { authUser, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="loading-button" /></div>;
  return authUser ? <Navigate to="/profile" replace /> : children;
}

export default function AppLayout() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthenticatedRedirect><LandingPage /></AuthenticatedRedirect>} />
        <Route path="/auth" element={<AuthenticatedRedirect><Auth /></AuthenticatedRedirect>} />
        <Route path="/recovery-pass" element={<RecoveryPassword />} />
        <Route path="/auth/verify-registration" element={<RegistrationVerification />} />
        <Route element={<MainLayout />}>
          <Route path="/explore" element={<ExploreStories />} />
          <Route path="/explore/story/:storyId" element={<StoryDetails />} />
          <Route path="/read" element={<Read />} />
          <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
          <Route path="/write" element={<ProtectedRoute><Write /></ProtectedRoute>} />
          <Route path="/story/create" element={<ProtectedRoute><CreateStory /></ProtectedRoute>} />
          <Route path="/story/edit/:storyId" element={<ProtectedRoute><EditStory /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
          <Route path="/forbidden" element={<ErrorPage statusCode={403} messageError="No tienes permisos para acceder a esta sección." />} />
          <Route path="/unauthorized" element={<ErrorPage statusCode={401} messageError="Inicia sesión para continuar." />} />
          <Route path="/network-lost" element={<ErrorPage statusCode={500} messageError="La conexión no está disponible. Inténtalo más tarde." />} />
          <Route path="*" element={<ErrorPage statusCode={404} messageError="Página no encontrada." />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
