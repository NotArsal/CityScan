import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import Home from "./pages/Home";
import ReportIssue from "./pages/ReportIssue";
import TrackComplaint from "./pages/TrackComplaint";
import AdminDashboard from "./pages/AdminDashboard";
import TransparencyDashboard from "./pages/TransparencyDashboard";
import ConfirmationPage from "./pages/ConfirmationPage";
import NotFound from "./pages/NotFound";
import GenerateQR from "./pages/GenerateQR";
import Rewards from "./pages/Rewards";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ScanQR } from "./pages/ScanQR";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthGuard } from "./components/AuthGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/track" element={<TrackComplaint />} />
              <Route path="/transparency" element={<TransparencyDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Citizen authenticated routes */}
              <Route 
                path="/report" 
                element={
                  <AuthGuard>
                    <ReportIssue />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/scan" 
                element={
                  <AuthGuard>
                    <ScanQR />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/rewards" 
                element={
                  <AuthGuard>
                    <Rewards />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/confirmation/:complaintId" 
                element={
                  <AuthGuard>
                    <ConfirmationPage />
                  </AuthGuard>
                } 
              />

              {/* Admin authenticated routes */}
              <Route 
                path="/admin" 
                element={
                  <AuthGuard requireAdmin>
                    <AdminDashboard />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/generate-qr" 
                element={
                  <AuthGuard requireAdmin>
                    <GenerateQR />
                  </AuthGuard>
                } 
              />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <PWAInstallPrompt />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
