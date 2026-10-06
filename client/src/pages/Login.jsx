import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/google", {
        token: credentialResponse.credential,
      });

      // Save the JWT token to local storage for future API requests
      localStorage.setItem("token", res.data.token);

      // Redirect the author to their workspace
      navigate("/dashboard");
    } catch (error) {
      console.error("Login Failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center max-w-sm w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">ZenDraft</h1>
        <p className="text-gray-500 mb-8 text-center">
          Your distraction-free writing space.
        </p>

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => console.log("Login Failed")}
          useOneTap
        />
      </div>
    </div>
  );
}

export default Login;
