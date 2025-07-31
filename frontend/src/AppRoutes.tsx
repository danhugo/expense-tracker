import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useUser } from './contexts/UserContext';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import PublicNotFound from "./pages/PublicNotFound";
import DashboardLoading from "./components/DashboardLoading";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useUser();
  const token = localStorage.getItem("accessToken");

  if (loading) return <DashboardLoading />;

  if (!user || !token) return <Navigate to="/login" replace />;

  return children;
};

const AppRoutes = () => {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/404" element={<PublicNotFound />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          }
        />
      </Routes>
    </TooltipProvider>
  );
};

export default AppRoutes;
