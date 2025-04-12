
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PublicSearch from "./pages/PublicSearch";
import Trash from "./pages/Trash";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./hooks/useAuth";
import { useEffect } from "react";
import { cleanupExpiredTrash } from "./lib/storage";

const queryClient = new QueryClient();

const App = () => {
  // Clean up expired trash items on app start and once per day
  useEffect(() => {
    cleanupExpiredTrash();
    
    // Set up daily cleanup
    const cleanupInterval = setInterval(() => {
      cleanupExpiredTrash();
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<PublicSearch />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<Index />} />
                <Route path="/trash" element={<Trash />} />
              </Route>
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
