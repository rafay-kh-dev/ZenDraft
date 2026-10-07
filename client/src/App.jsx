import { Routes, Route, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import Dashboard from "./pages/Dashboard";

const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://api.zendraft.codelume.online";

function Login() {
  const navigate = useNavigate();

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/google`, {
        token: credentialResponse.credential,
      });

      localStorage.setItem("zenToken", res.data.token);
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Backend verification failed", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 font-sans">
      <div className="bg-gray-800 p-10 rounded-2xl shadow-xl text-center border border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-2">ZenDraft</h1>
        <p className="text-gray-400 mb-8">
          Your distraction-free writing space.
        </p>

        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={() => console.error("❌ Login Failed")}
          theme="filled_black"
          shape="rectangular"
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
