import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Initialize react-query client
const queryClient = new QueryClient();

export default function App() {
  const [user, setUser] = useState(null);

  // Check token on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({ username: payload.username, role: payload.role });
    }
  }, []);

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Protected Index Page */}
          <Route
            path="/"
            element={user ? <Index onLogout={handleLogout} /> : <Navigate to="/login" />}
          />

          {/* Login Page */}
          <Route
            path="/login"
            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />}
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
