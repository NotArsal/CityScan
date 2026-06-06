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



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/report" element={<ReportIssue />} />
            <Route path="/track" element={<TrackComplaint />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/transparency" element={<TransparencyDashboard />} />
            <Route path="/confirmation/:complaintId" element={<ConfirmationPage />} />
            <Route path="/generate-qr" element={<GenerateQR />} />
            <Route path="/rewards" element={<Rewards />} />


            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <PWAInstallPrompt />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
