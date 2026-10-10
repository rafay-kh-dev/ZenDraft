import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [isLoginView, setIsLoginView] = useState(true);

  // Form States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [penName, setPenName] = useState(""); // 🔥 Nayi state Pen Name ke liye
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const API_BASE_URL = import.meta.env.DEV
    ? "http://localhost:5000"
    : "https://zendraft-bau8.onrender.com";

  useEffect(() => {
    document.title = isLoginView ? "PenDraft" : "PenDraft";
  }, [isLoginView]);

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);

    if (!isLoginView) {
      let strength = 0;
      if (val.length >= 8) strength += 1;
      if (/[A-Z]/.test(val)) strength += 1;
      if (/[a-z]/.test(val)) strength += 1;
      if (/[0-9]/.test(val)) strength += 1;
      if (/[^A-Za-z0-9]/.test(val)) strength += 1;
      setPasswordStrength(strength);
    }
  };

  const getStrengthConfig = (strength) => {
    switch (strength) {
      case 1:
        return { label: "Weak", color: "bg-[#C95C5C]", text: "text-[#C95C5C]" };
      case 2:
        return { label: "Fair", color: "bg-[#E09A55]", text: "text-[#E09A55]" };
      case 3:
        return { label: "Good", color: "bg-[#D4AF37]", text: "text-[#D4AF37]" };
      case 4:
        return {
          label: "Strong",
          color: "bg-[#8B9D83]",
          text: "text-[#8B9D83]",
        };
      case 5:
        return {
          label: "Excellent",
          color: "bg-[#5A7A5A]",
          text: "text-[#5A7A5A]",
        };
      default:
        return { label: "", color: "bg-[#E8E4DB]", text: "text-[#B3ADA4]" };
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/google`, {
        token: credentialResponse.credential,
      });
      localStorage.setItem("zenToken", res.data.token);
      window.location.href = "/";
    } catch (error) {
      console.error("Google authentication failed", error);
      setError("Google authentication failed. Please try again.");
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLoginView) {
      if (!firstName || !lastName) {
        setError("Please provide your full real name.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (passwordStrength < 3) {
        setError("Please choose a stronger password (at least 'Good').");
        return;
      }
    }

    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = isLoginView ? "/api/auth/login" : "/api/auth/signup";

      // Send penName along with other details during signup
      const payload = isLoginView
        ? { email, password }
        : {
            email,
            password,
            name: `${firstName} ${lastName}`.trim(),
            penName: penName.trim(),
          };

      const res = await axios.post(`${API_BASE_URL}${endpoint}`, payload);

      localStorage.setItem("zenToken", res.data.token);
      window.location.href = "/";
    } catch (err) {
      console.error("Authentication error:", err);
      setError(err.response?.data?.message || "Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-[#FDFCF8] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans selection:bg-[#F2EFE9]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');
        .font-serif { font-family: 'Lora', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { 0% { opacity: 0; transform: translateY(4px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[#F2EFE9] opacity-50 blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-[#E8E4DB] opacity-50 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-[1050px] h-full max-h-[650px] flex bg-white rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.04)] border border-[#F2EFE9] overflow-hidden z-10">
        {/* Left Side - Inspiration */}
        <div className="hidden md:flex w-[50%] p-8 lg:p-12 bg-[#F9F8F5] flex-col justify-between border-r border-[#EAE7E0]">
          <div>
            <div className="flex items-center mb-8 lg:mb-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                className="w-7 h-7"
              >
                <path
                  d="M4 3.5C4 2.67157 4.67157 2 5.5 2H19C19.5523 2 20 2.44772 20 3V20.5C20 21.3284 19.3284 22 18.5 22H5.5C4.67157 22 4 21.3284 4 20.5V3.5Z"
                  fill="#E5E0D5"
                />
                <path
                  d="M4 3.5C4 2.67157 4.67157 2 5.5 2H8V22H5.5C4.67157 22 4 21.3284 4 20.5V3.5Z"
                  fill="#2D2824"
                />
                <path d="M13 2H16.5V14L14.75 12L13 14V2Z" fill="#D4AF37" />
              </svg>
              <span className="font-serif italic text-[22px] ml-3 text-[#2D2824]">
                PenDraft
              </span>
            </div>

            <h2 className="text-[32px] lg:text-[40px] leading-[1.1] font-serif font-medium text-[#2D2824] mb-4 tracking-tight">
              Where your best stories take shape.
            </h2>
            <p className="text-[14px] lg:text-[15px] font-sans font-light text-[#7A746D] leading-relaxed max-w-[400px]">
              A distraction-free, world-class studio designed strictly for
              authors, novelists, and storytellers. Leave the noise behind and
              focus entirely on your narrative.
            </p>
          </div>

          <div className="mt-auto">
            <p className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-[#D4AF37] mb-2">
              Author Quote
            </p>
            <p className="font-serif italic text-[15px] lg:text-[16px] text-[#4A443D] leading-relaxed">
              "A blank piece of paper is God's way of telling us how hard it is
              to be God."
            </p>
          </div>
        </div>

        {/* Right Side - Authentication Form */}
        <div className="w-full md:w-[50%] p-6 sm:p-8 flex flex-col items-center justify-center bg-white relative overflow-y-auto custom-scrollbar">
          <div className="md:hidden flex items-center mb-6 absolute top-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              className="w-6 h-6"
            >
              <path
                d="M4 3.5C4 2.67157 4.67157 2 5.5 2H19C19.5523 2 20 2.44772 20 3V20.5C20 21.3284 19.3284 22 18.5 22H5.5C4.67157 22 4 21.3284 4 20.5V3.5Z"
                fill="#E5E0D5"
              />
              <path
                d="M4 3.5C4 2.67157 4.67157 2 5.5 2H8V22H5.5C4.67157 22 4 21.3284 4 20.5V3.5Z"
                fill="#2D2824"
              />
              <path d="M13 2H16.5V14L14.75 12L13 14V2Z" fill="#D4AF37" />
            </svg>
            <span className="font-serif italic text-[18px] ml-2 text-[#2D2824]">
              PenDraft
            </span>
          </div>

          <div
            className="w-full max-w-[340px] flex flex-col animate-fade-in mt-8 md:mt-0"
            key={isLoginView ? "login" : "signup"}
          >
            <div className="text-center mb-5 md:mb-6">
              <h2 className="text-[26px] sm:text-[28px] font-serif font-medium text-[#2D2824] mb-1.5 tracking-tight">
                {isLoginView ? "Enter Sanctuary" : "Begin Your Journey"}
              </h2>
              <p className="text-[#8C8781] text-[13px] font-sans font-light leading-relaxed">
                {isLoginView
                  ? "Welcome back to your writing desk."
                  : "Create an account to securely save your manuscripts."}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-2.5 bg-red-50 rounded-xl border border-red-100 text-center animate-fade-in">
                <p className="text-[12px] font-sans font-medium text-[#C95C5C]">
                  {error}
                </p>
              </div>
            )}

            <form
              onSubmit={handleEmailAuth}
              className="flex flex-col gap-3 mb-5"
            >
              {!isLoginView && (
                <>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-1/2 bg-[#FDFCF8] border border-[#E8E4DB] focus:border-[#2D2824] rounded-xl px-4 py-3 text-[13px] font-sans text-[#2D2824] placeholder-[#B3ADA4] outline-none transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-1/2 bg-[#FDFCF8] border border-[#E8E4DB] focus:border-[#2D2824] rounded-xl px-4 py-3 text-[13px] font-sans text-[#2D2824] placeholder-[#B3ADA4] outline-none transition-colors"
                    />
                  </div>
                  {/* Pen Name Field */}
                  <div>
                    <input
                      type="text"
                      placeholder="Author / Pen Name (Optional)"
                      value={penName}
                      onChange={(e) => setPenName(e.target.value)}
                      className="w-full bg-[#FDFCF8] border border-[#E8E4DB] focus:border-[#2D2824] rounded-xl px-4 py-3 text-[13px] font-sans text-[#2D2824] placeholder-[#B3ADA4] outline-none transition-colors"
                    />
                  </div>
                </>
              )}

              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#FDFCF8] border border-[#E8E4DB] focus:border-[#2D2824] rounded-xl px-4 py-3 text-[13px] font-sans text-[#2D2824] placeholder-[#B3ADA4] outline-none transition-colors"
                />
              </div>

              {/* Password Field with Text Show/Hide */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  className="w-full bg-[#FDFCF8] border border-[#E8E4DB] focus:border-[#2D2824] rounded-xl pl-4 pr-16 py-3 text-[13px] font-sans text-[#2D2824] placeholder-[#B3ADA4] outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-sans font-bold uppercase tracking-widest text-[#B3ADA4] hover:text-[#2D2824] transition-colors p-1"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {/* Password Strength Meter (Only in Signup) */}
              {!isLoginView && password.length > 0 && (
                <div className="flex flex-col gap-1.5 px-1 animate-fade-in">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength >= level
                            ? getStrengthConfig(passwordStrength).color
                            : "bg-[#EAE7E0]"
                        }`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-[10px] font-sans font-medium text-right transition-colors ${getStrengthConfig(passwordStrength).text}`}
                  >
                    {getStrengthConfig(passwordStrength).label}
                  </p>
                </div>
              )}

              {/* Confirm Password Field with Text Show/Hide (Only in Signup) */}
              {!isLoginView && (
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-[#FDFCF8] border border-[#E8E4DB] focus:border-[#2D2824] rounded-xl pl-4 pr-16 py-3 text-[13px] font-sans text-[#2D2824] placeholder-[#B3ADA4] outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-sans font-bold uppercase tracking-widest text-[#B3ADA4] hover:text-[#2D2824] transition-colors p-1"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#2D2824] text-[#FDFCF8] text-[11px] font-sans font-bold tracking-widest uppercase py-3.5 rounded-xl hover:bg-black transition-all cursor-pointer shadow-sm mt-1 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? "Authenticating..."
                  : isLoginView
                    ? "Sign In"
                    : "Create Account"}
              </button>
            </form>

            <div className="flex items-center w-full mb-5">
              <div className="flex-1 h-px bg-[#F2EFE9]"></div>
              <span className="px-3 text-[9px] font-sans font-bold text-[#B3ADA4] uppercase tracking-widest">
                Or
              </span>
              <div className="flex-1 h-px bg-[#F2EFE9]"></div>
            </div>

            <div className="w-full flex justify-center shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 border border-[#F2EFE9]">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google authentication failed.")}
                theme="outline"
                shape="rectangular"
                size="large"
                text={isLoginView ? "signin_with" : "signup_with"}
                width="340"
              />
            </div>

            <div className="mt-6 md:mt-8 text-center pb-6 md:pb-0">
              <button
                type="button"
                onClick={() => {
                  setIsLoginView(!isLoginView);
                  setError("");
                  setFirstName("");
                  setLastName("");
                  setPenName(""); // Nayi field ko bhi reset karein
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                  setPasswordStrength(0);
                }}
                className="text-[12px] font-sans font-medium text-[#7A746D] hover:text-[#2D2824] transition-colors cursor-pointer"
              >
                {isLoginView
                  ? "New to PenDraft? Create a free account"
                  : "Already have a sanctuary? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
