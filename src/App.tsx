
// import { ToastContainer, Zoom } from 'react-toastify';
// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from 'sonner'
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MobileOnlyDesktopBlocking from "./components/MobileOnlyDesktopBlocking";

import Index from "./pages/Index";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

import "react-toastify/dist/ReactToastify.css";
import Detail from './pages/kendaraan/Detail';
import List from './pages/kendaraan/List';
import Re from './pages/kendaraan/Re';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster visibleToasts={3} richColors position="top-center" />
          <BrowserRouter>
            <MobileOnlyDesktopBlocking>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/kendaraan" element={
                  <ProtectedRoute>
                    <List />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/reservasi" element={
                  <ProtectedRoute>
                    <Re />
                  </ProtectedRoute>
                } />
                <Route path="/detail/:uuid" element={
                  <ProtectedRoute>
                    <Detail />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MobileOnlyDesktopBlocking>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
