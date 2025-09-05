import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout";
import Index from "./pages/Index";
import Teams from "./pages/Teams";
import Students from "./pages/Students";
import Programs from "./pages/Programs";
import Participation from "./pages/Participation";
import Results from "./pages/Results";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./providers/AuthProvider";
import { ProtectedRoute } from "./providers/ProtectedRoute";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/teams" element={<Teams />} />
                      <Route path="/students" element={<Students />} />
                      <Route path="/programs" element={<Programs />} />
                      <Route path="/participation" element={<Participation />} />
                      <Route path="/results" element={<Results />} />
                      <Route path="/leaderboard" element={<Leaderboard />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
