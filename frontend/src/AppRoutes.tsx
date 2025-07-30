import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from './contexts/UserContext';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import DashboardLoading from "./components/DashboardLoading";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useUser();
  const token = localStorage.getItem("token");

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
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          }
        />

        {/* Top-level catch-all */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </TooltipProvider>
  );
};

export default AppRoutes;
