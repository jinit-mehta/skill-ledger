import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "@/contexts/WalletContext";
import Index from "./pages/Index";
import LearnerDashboard from "./pages/LearnerDashboard";
import InstitutionDashboard from "./pages/InstitutionDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import NotFound from "./pages/NotFound";

import ComingSoon from "./pages/ComingSoon";
import InstitutionIssue from "./pages/InstitutionIssue";
import EmployerHistory from "./pages/EmployerHistory";
import CourseManagement from "./pages/CourseManagement";
import LearnerSettings from "./pages/LearnerSettings";
import InstitutionSettings from "./pages/InstitutionSettings";
import EmployerSettings from "./pages/EmployerSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />

            {/* Learner Routes */}
            <Route path="/learner" element={<LearnerDashboard />} />
            <Route path="/learner/settings" element={<LearnerSettings />} />
            <Route path="/learner/*" element={<LearnerDashboard />} />

            {/* Institution Routes */}
            <Route path="/institution" element={<InstitutionDashboard />} />
            <Route path="/institution/issue" element={<InstitutionIssue />} />
            <Route path="/institution/courses" element={<CourseManagement />} />
            <Route path="/institution/settings" element={<InstitutionSettings />} />
            <Route path="/institution/*" element={<InstitutionDashboard />} />

            {/* Employer Routes */}
            <Route path="/employer" element={<EmployerDashboard />} />
            <Route path="/employer/history" element={<EmployerHistory />} />
            <Route path="/employer/settings" element={<EmployerSettings />} />
            <Route path="/employer/*" element={<EmployerDashboard />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;