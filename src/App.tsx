/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import NutritionDashboard from "./components/NutritionDashboard";
import Login from "./components/Login";
import SuccessPage from "./components/SuccessPage";
import CancelPage from "./components/CancelPage";
import UpgradePage from "./components/UpgradePage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Loader2 } from "lucide-react";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/dashboard" 
        element={user ? <NutritionDashboard /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/success" 
        element={user ? <SuccessPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/cancel" 
        element={user ? <CancelPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/upgrade" 
        element={user ? <UpgradePage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/" 
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
