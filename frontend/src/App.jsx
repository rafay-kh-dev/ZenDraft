import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";

const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://zendraft-bau8.onrender.com";

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "PenDraft | Sign In";
    // 🔥 AUTO-REDIRECT LOGIC 🔥
    const existingToken = localStorage.getItem("zenToken");
    if (existingToken) {
      navigate("/desk");
    }
  }, [navigate]);

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/google`, {
        token: credentialResponse.credential,
      });

      localStorage.setItem("zenToken", res.data.token);
      navigate("/desk");
    } catch (error) {
      console.error("❌ Backend verification failed", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#FDFCF8] font-sans">
      <div className="text-center">
        <h1 className="text-5xl text-[#2D2824] mb-4 font-serif font-medium tracking-tight">
          PenDraft
        </h1>
        <p className="text-[#8C8781] mb-12 text-[15px] font-sans font-light">
          Your minimalist writing studio.
        </p>
        <div className="flex justify-center shadow-[0_8px_30px_rgba(0,0,0,0.06)] rounded-lg overflow-hidden">
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => console.error("❌ Login Failed")}
            theme="outline"
            shape="rectangular"
            size="large"
          />
        </div>
      </div>
    </div>
  );
}

// 🔥 PROTECTED ROUTE 🔥
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("zenToken");
  if (!token) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/desk"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/editor/:id"
        element={
          <ProtectedRoute>
            <Editor />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
