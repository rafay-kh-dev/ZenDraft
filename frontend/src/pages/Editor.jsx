import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://zendraft-bau8.onrender.com";

const TEXT_COLORS = [
  "#1C1B1A",
  "#6B7280",
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
];
const HIGHLIGHT_COLORS = [
  "transparent",
  "#FEF08A",
  "#BBF7D0",
  "#BFDBFE",
  "#DDD6FE",
  "#FBCFE8",
  "#FECACA",
  "#FED7AA",
  "#E5E7EB",
  "#000000",
];

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Access Control State
  const [hasAccess, setHasAccess] = useState(true); // Isko 'false' kar ke aap "Request Access" screen test kar sakte hain
  const [requestEmail, setRequestEmail] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [isRequestSent, setIsRequestSent] = useState(false);

  const [title, setTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [isTyping, setIsTyping] = useState(false);

  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [storyNotes, setStoryNotes] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [colorMenuObj, setColorMenuObj] = useState(null);
  const [inlineMenu, setInlineMenu] = useState({ visible: false, x: 0, y: 0 });

  // Share Modal & Real User States
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [accessMode, setAccessMode] = useState("Private");
  const [shareEmail, setShareEmail] = useState("");
  const [sharedUsers, setSharedUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState({ email: "", avatar: null });

  const editorRef = useRef(null);
  const contentRef = useRef("");
  const typingTimeoutRef = useRef(null);
  const isInitialRender = useRef(true);

  const DAILY_GOAL = 1000;
  const wordCount = contentRef.current
    ? contentRef.current
        .replace(/<[^>]*>?/gm, "")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length
    : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const progressPercentage = Math.min((wordCount / DAILY_GOAL) * 100, 100);

  const theme = {
    bgApp: isDarkMode ? "bg-[#111111]" : "bg-[#FDFCF8]",
    bgDrawer: isDarkMode ? "bg-[#1A1A1A]" : "bg-[#F5F4EF]",
    textMain: isDarkMode ? "text-[#E8E6E1]" : "text-[#1C1B1A]",
    textMuted: isDarkMode ? "text-[#8A8782]" : "text-[#7A7772]",
    border: isDarkMode ? "border-[#2A2A2A]" : "border-[#E8E6E1]",
    glassBg: isDarkMode ? "bg-[#111111]/80" : "bg-[#FDFCF8]/80",
    hoverBg: isDarkMode ? "hover:bg-[#222222]" : "hover:bg-[#F0EFEA]",
    placeholder: isDarkMode ? "placeholder-[#555555]" : "placeholder-[#D0CCC5]",
    selectionBg: isDarkMode ? "#333333" : "#E5E2D9",
    selectionText: isDarkMode ? "#FFFFFF" : "#000000",
    modalBg: isDarkMode ? "bg-[#1C1C1C]" : "bg-[#FFFFFF]",
    btnPrimaryBg: isDarkMode ? "bg-[#E8E6E1]" : "bg-[#1C1B1A]",
    btnPrimaryText: isDarkMode ? "text-[#111111]" : "text-[#FDFCF8]",
    btnPrimaryHover: isDarkMode ? "hover:bg-white" : "hover:bg-[#333333]",
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("zenToken");
      if (!token) return navigate("/");

      // Decode JWT Token for REAL User Info
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join(""),
        );
        const decodedToken = JSON.parse(jsonPayload);

        const realEmail = decodedToken.email;
        const realAvatar = decodedToken.picture || decodedToken.avatar || null;

        setCurrentUser({ email: realEmail, avatar: realAvatar });
        // Set Owner as the real user initially
        setSharedUsers([
          { email: realEmail, role: "Owner", avatar: realAvatar },
        ]);
      } catch (e) {
        console.error("Could not parse user info from token", e);
      }

      try {
        const currRes = await axios.get(`${API_BASE_URL}/api/drafts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTitle(currRes.data.title || "");
        contentRef.current = currRes.data.content || "";
        if (editorRef.current) editorRef.current.innerHTML = contentRef.current;
        setStoryNotes(currRes.data.notes || "");
        // Yahan backend se hum actual access check kar sakte hain. For now, assuming user has access.
      } catch (error) {
        console.error("Error fetching data:", error);
        // Agar backend error de ke "Unauthorized" (403), toh hasAccess false kar denge
        if (error.response && error.response.status === 403) {
          setHasAccess(false);
        }
      }
    };
    fetchData();
  }, [id, navigate]);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    if (!hasAccess || (!title && !contentRef.current && !storyNotes)) return;

    setSaveStatus("Saving...");
    const saveDebounce = setTimeout(async () => {
      const token = localStorage.getItem("zenToken");
      try {
        await axios.put(
          `${API_BASE_URL}/api/drafts/${id}`,
          { title, content: contentRef.current, notes: storyNotes },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setSaveStatus("Saved");
      } catch (error) {
        setSaveStatus("Offline");
      }
    }, 1500);
    return () => clearTimeout(saveDebounce);
  }, [title, contentRef.current, storyNotes, id, hasAccess]);

  const handleInput = (e) => {
    contentRef.current = e.currentTarget.innerHTML;
    triggerFocusMode();
    checkSelection();
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    triggerFocusMode();
  };

  const triggerFocusMode = () => {
    setIsTyping(true);
    setColorMenuObj(null);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2500);
  };

  const formatText = (command, val = null) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      contentRef.current = editorRef.current.innerHTML;
      editorRef.current.focus();
      checkSelection();
    }
    if (command === "foreColor" || command === "backColor") {
      window.getSelection().removeAllRanges();
      setInlineMenu({ visible: false, x: 0, y: 0 });
      setColorMenuObj(null);
    }
  };

  const checkSelection = () => {
    const selection = window.getSelection();
    if (
      selection &&
      selection.toString().trim().length > 0 &&
      !selection.isCollapsed
    ) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (
        editorRef.current &&
        editorRef.current.contains(range.commonAncestorContainer)
      ) {
        setInlineMenu({
          visible: true,
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        });
        return;
      }
    }
    setInlineMenu({ visible: false, x: 0, y: 0 });
    setColorMenuObj(null);
  };

  // 🔥 Invite User Logic 🔥
  const handleShareInvite = (e) => {
    e.preventDefault();
    if (shareEmail.trim()) {
      // Check if user already exists
      if (!sharedUsers.some((u) => u.email === shareEmail)) {
        setSharedUsers([
          ...sharedUsers,
          { email: shareEmail, role: "Editor", avatar: null },
        ]);
      }
      setShareEmail("");
    }
  };

  // 🔥 Remove User Logic 🔥
  const handleRemoveUser = (emailToRemove) => {
    setSharedUsers(sharedUsers.filter((user) => user.email !== emailToRemove));
  };

  // 🔥 Request Access Form Handler 🔥
  const handleRequestAccess = (e) => {
    e.preventDefault();
    setIsRequestSent(true);
    // Yahan backend API call aayegi owner ko email bhejne ke liye
  };

  const exportManuscript = () => {
    const textContent = contentRef.current
      .replace(/<br\s*[\/]?>/gi, "\n")
      .replace(/<[^>]+>/gi, "");
    const blob = new Blob([`${title}\n\n${textContent}`], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title || "Untitled_Draft"}.txt`;
    link.click();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .catch((err) => console.log(err));
    } else {
      document.exitFullscreen();
    }
  };

  // 🌟 GOOGLE DOCS STYLE "NO ACCESS" SCREEN 🌟
  if (!hasAccess) {
    return (
      <div
        className={`min-h-screen ${theme.bgApp} flex flex-col items-center justify-center font-sans p-6`}
      >
        <div
          className={`max-w-md w-full ${theme.modalBg} border ${theme.border} rounded-2xl shadow-xl p-8`}
        >
          <div className="flex justify-center mb-6">
            <div
              className={`w-16 h-16 rounded-full ${isDarkMode ? "bg-[#2A2A2A]" : "bg-[#F0EFEA]"} flex items-center justify-center`}
            >
              <svg
                className={`w-8 h-8 ${theme.textMain}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          {isRequestSent ? (
            <div className="text-center">
              <h2 className={`text-2xl font-medium mb-3 ${theme.textMain}`}>
                Request sent
              </h2>
              <p className={`text-sm mb-6 ${theme.textMuted}`}>
                You'll get an email if the owner grants you access.
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                className={`w-full ${theme.btnPrimaryBg} ${theme.btnPrimaryText} ${theme.btnPrimaryHover} py-3 rounded-xl font-medium transition-colors`}
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <div>
              <h2
                className={`text-2xl font-medium text-center mb-2 ${theme.textMain}`}
              >
                You need access
              </h2>
              <p className={`text-sm text-center mb-6 ${theme.textMuted}`}>
                Ask for access, or switch to an account with permission.
              </p>

              <form onSubmit={handleRequestAccess} className="space-y-4">
                <div>
                  <label
                    className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${theme.textMuted}`}
                  >
                    Your Email
                  </label>
                  <input
                    type="email"
                    required
                    value={requestEmail}
                    onChange={(e) => setRequestEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className={`w-full px-4 py-3 rounded-xl border ${theme.border} bg-transparent focus:outline-none ${theme.textMain} ${theme.placeholder}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${theme.textMuted}`}
                  >
                    Message (Optional)
                  </label>
                  <textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Hi, please give me access to this manuscript..."
                    className={`w-full px-4 py-3 rounded-xl border ${theme.border} bg-transparent focus:outline-none ${theme.textMain} ${theme.placeholder} resize-none h-24`}
                  />
                </div>
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className={`flex-1 py-3 rounded-xl font-medium border ${theme.border} ${theme.textMain} ${theme.hoverBg} transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 ${theme.btnPrimaryBg} ${theme.btnPrimaryText} ${theme.btnPrimaryHover} py-3 rounded-xl font-medium transition-colors shadow-sm`}
                  >
                    Request Access
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${theme.bgApp} ${theme.textMain} font-sans relative flex overflow-hidden transition-colors duration-500`}
      onMouseUp={checkSelection}
      onKeyUp={checkSelection}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        ::selection { background: ${theme.selectionBg}; color: ${theme.selectionText}; }
        ::-moz-selection { background: ${theme.selectionBg}; color: ${theme.selectionText}; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .editor-content:empty:before { content: attr(data-placeholder); color: ${isDarkMode ? "#555" : "#D0CCC5"}; font-style: italic; }
        .editor-content div { text-indent: 1.5em; margin-bottom: 0; line-height: 1.85; }
        .editor-content div:first-child { text-indent: 0; }
        .editor-content h2 { text-indent: 0; text-align: center; margin-top: 2.5rem; margin-bottom: 1.5rem; font-weight: normal; font-size: 1.6em; }
        .editor-content ul, .editor-content ol { text-indent: 0; padding-left: 2rem; margin-bottom: 1.5rem; margin-top: 1.5rem; }
        blockquote { border-left: 2px solid ${isDarkMode ? "#4A4A4A" : "#D4D0C8"}; padding-left: 1.5rem; font-style: italic; margin: 2rem 0; text-indent: 0; color: ${isDarkMode ? "#A09D98" : "#6A6762"}; }
        
        .editor-content[dir="rtl"] { text-align: right; }
        .editor-content[dir="ltr"] { text-align: left; }
        .editor-content[dir="rtl"] div { text-indent: 1.5em; }
      `,
        }}
      />

      {/* 🌟 PREMIUM SHARE MODAL WITH REMOVE USER OPTION 🌟 */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            className={`${theme.modalBg} ${theme.border} border shadow-2xl rounded-2xl w-full max-w-lg p-8 transform transition-all`}
          >
            <div className="flex justify-between items-center mb-8">
              <h2
                className={`font-sans text-xl font-normal tracking-tight ${theme.textMain}`}
              >
                Share{" "}
                <span className="font-serif italic">
                  "{title || "Untitled"}"
                </span>
              </h2>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className={`p-2 rounded-full ${theme.hoverBg} transition-colors ${theme.textMuted}`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleShareInvite} className="flex gap-3 mb-8">
              <input
                type="email"
                required
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="Add people by email..."
                className={`flex-1 px-4 py-3 rounded-xl border ${theme.border} bg-transparent focus:outline-none focus:border-[${isDarkMode ? "#E8E6E1" : "#1C1B1A"}] ${theme.textMain} ${theme.placeholder} transition-colors`}
              />
              <button
                type="submit"
                className={`${theme.btnPrimaryBg} ${theme.btnPrimaryText} ${theme.btnPrimaryHover} px-6 py-3 rounded-xl font-medium tracking-wide transition-all shadow-sm`}
              >
                Invite
              </button>
            </form>

            <div className="mb-8">
              <p
                className={`text-xs uppercase tracking-widest font-semibold mb-4 ${theme.textMuted}`}
              >
                People with access
              </p>
              <div className="space-y-4 max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                {sharedUsers.map((user, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center group"
                  >
                    <div className="flex items-center gap-4">
                      {/* REAL GOOGLE AVATAR */}
                      <div
                        className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center border ${theme.border} ${isDarkMode ? "bg-[#2A2A2A]" : "bg-[#EAE8E1]"}`}
                      >
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt="User Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span
                            className={`font-serif italic font-bold text-sm ${theme.textMain}`}
                          >
                            {user.email.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className={`text-sm font-medium ${theme.textMain}`}>
                        {user.email}
                      </span>
                    </div>

                    {/* Role & Remove Option */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs tracking-wider ${theme.textMuted}`}
                      >
                        {user.role}
                      </span>
                      {user.role !== "Owner" && (
                        <button
                          onClick={() => handleRemoveUser(user.email)}
                          title="Remove Access"
                          className={`opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-red-100 hover:text-red-600 text-gray-400`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`p-5 rounded-2xl border ${theme.border} flex justify-between items-center ${isDarkMode ? "bg-[#181818]" : "bg-[#F9F8F5]"}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-2.5 rounded-full ${isDarkMode ? "bg-[#2A2A2A]" : "bg-[#EAE8E1]"}`}
                >
                  <svg
                    className={`w-5 h-5 ${theme.textMain}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </div>
                <div>
                  <select
                    value={accessMode}
                    onChange={(e) => setAccessMode(e.target.value)}
                    className={`bg-transparent font-medium text-sm focus:outline-none ${theme.textMain} cursor-pointer`}
                  >
                    <option
                      value="Private"
                      className={isDarkMode ? "bg-[#111]" : "bg-white"}
                    >
                      Restricted (Private)
                    </option>
                    <option
                      value="Public"
                      className={isDarkMode ? "bg-[#111]" : "bg-white"}
                    >
                      Anyone with the link
                    </option>
                  </select>
                  <p
                    className={`text-[11px] mt-1 tracking-wide ${theme.textMuted}`}
                  >
                    {accessMode === "Private"
                      ? "Only people added can open"
                      : "Anyone on the internet can view"}
                  </p>
                </div>
              </div>
              <button
                className={`px-5 py-2.5 rounded-xl text-sm font-medium border ${theme.border} ${theme.hoverBg} transition-colors ${theme.textMain}`}
              >
                Copy link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STORY BIBLE DRAWER */}
      <aside
        className={`fixed right-0 top-0 h-full w-80 ${theme.bgDrawer} border-l ${theme.border} shadow-xl z-40 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isNotesOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div
          className={`p-6 border-b ${theme.border} flex justify-between items-center`}
        >
          <h2
            className={`font-sans font-medium text-[12px] uppercase tracking-[0.2em] ${theme.textMuted}`}
          >
            Story Bible
          </h2>
          <button
            onClick={() => setIsNotesOpen(false)}
            className={`${theme.textMuted} hover:${theme.textMain} transition-colors p-2`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <textarea
          dir="auto"
          value={storyNotes}
          onChange={(e) => setStoryNotes(e.target.value)}
          placeholder="Jot down character details..."
          className={`flex-1 w-full bg-transparent resize-none p-6 text-[16px] leading-relaxed ${theme.textMuted} focus:outline-none no-scrollbar`}
          style={{ fontFamily: "'Newsreader', serif" }}
        />
      </aside>

      {/* MAIN CANVAS */}
      <div
        className={`flex-1 flex flex-col relative w-full h-screen overflow-y-auto no-scrollbar transition-all duration-700 ${isNotesOpen ? "pr-80" : "pr-0"}`}
        onScroll={() => {
          setInlineMenu({ visible: false, x: 0, y: 0 });
          setColorMenuObj(null);
        }}
      >
        {/* HEADER */}
        <header
          className={`sticky top-0 w-full px-8 py-6 flex justify-between items-center transition-all duration-700 z-30 ${isTyping ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"}`}
        >
          <button
            onClick={() => navigate("/dashboard")}
            className={`group flex items-center gap-2 ${theme.textMuted} hover:${theme.textMain} transition-colors`}
          >
            <svg
              className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="text-[12px] uppercase tracking-[0.15em] font-medium">
              Library
            </span>
          </button>

          <div className="flex items-center gap-6">
            <div
              className={`flex items-center gap-4 text-[11px] uppercase tracking-[0.2em] font-medium ${theme.textMuted} mr-2 hidden sm:flex`}
            >
              <div
                className="relative flex items-center justify-center w-5 h-5"
                title={`${wordCount} / ${DAILY_GOAL} words today`}
              >
                <svg
                  className="w-5 h-5 transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    className={`${isDarkMode ? "text-[#2A2A2A]" : "text-[#E8E6E1]"}`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    className={`${isDarkMode ? "text-[#7A7772]" : "text-[#1C1B1A]"} transition-all duration-1000 ease-out`}
                    strokeDasharray={`${progressPercentage}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
              <span>{readingTime} min read</span>
              <span
                className={
                  saveStatus === "Saving..."
                    ? `animate-pulse ${theme.textMain}`
                    : ""
                }
              >
                {saveStatus}
              </span>
            </div>

            <div className={`flex items-center gap-2`}>
              {/* THEMED SHARE BUTTON */}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className={`hidden sm:flex items-center gap-2 px-5 py-1.5 rounded-full font-medium text-[11px] tracking-widest uppercase transition-all shadow-sm ${theme.btnPrimaryBg} ${theme.btnPrimaryText} ${theme.btnPrimaryHover} mr-2`}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                Share
              </button>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                title="Night Mode"
                className={`w-8 h-8 flex items-center justify-center rounded-full ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} transition-colors`}
              >
                <svg
                  className="w-[16px] h-[16px]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={
                      isDarkMode
                        ? "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        : "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    }
                  />
                </svg>
              </button>
              <button
                onClick={exportManuscript}
                title="Export Chapter"
                className={`w-8 h-8 flex items-center justify-center rounded-full ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} transition-colors`}
              >
                <svg
                  className="w-[16px] h-[16px]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
              <button
                onClick={toggleFullscreen}
                title="Zen Mode"
                className={`w-8 h-8 flex items-center justify-center rounded-full ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} transition-colors`}
              >
                <svg
                  className="w-[16px] h-[16px]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l5-5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              </button>
              <button
                onClick={() => setIsNotesOpen(!isNotesOpen)}
                title="Story Bible"
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isNotesOpen ? (isDarkMode ? "bg-[#E8E6E1] text-[#111111]" : "bg-[#1C1B1A] text-[#FDFCF8]") : `${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain}`}`}
              >
                <svg
                  className="w-[16px] h-[16px]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-[680px] mx-auto px-8 pt-16 pb-48 flex flex-col justify-start z-10 relative">
          <input
            dir="auto"
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Chapter Title"
            className={`w-full bg-transparent text-center text-[44px] sm:text-[52px] font-normal ${theme.textMain} focus:outline-none ${theme.placeholder} tracking-tight leading-tight`}
            style={{ fontFamily: "'Newsreader', serif" }}
          />
          <div
            className={`w-12 h-[1px] ${isDarkMode ? "bg-[#333333]" : "bg-[#E8E6E1]"} mx-auto mt-12 mb-16`}
          ></div>
          <div
            ref={editorRef}
            dir="auto"
            contentEditable={true}
            suppressContentEditableWarning={true}
            onInput={handleInput}
            className={`editor-content w-full bg-transparent text-[20px] ${theme.textMain} focus:outline-none outline-none min-h-[50vh] pb-32`}
            style={{ fontFamily: "'Newsreader', serif" }}
            data-placeholder="Start writing your story..."
          />
        </main>
      </div>

      {/* 🔥 INLINE FLOATING MENU 🔥 */}
      {inlineMenu.visible && (
        <div
          className={`fixed z-50 flex items-center ${theme.glassBg} backdrop-blur-xl rounded-lg px-1 py-1 border ${theme.border} shadow-[0_10px_25px_rgb(0,0,0,0.1)] transform -translate-x-1/2 -translate-y-full`}
          style={{ top: `${inlineMenu.y - 12}px`, left: `${inlineMenu.x}px` }}
        >
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText("bold");
            }}
            className={`w-8 h-8 flex items-center justify-center rounded-md ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} font-serif font-bold text-[15px]`}
          >
            B
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText("italic");
            }}
            className={`w-8 h-8 flex items-center justify-center rounded-md ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} font-serif italic text-[15px]`}
          >
            I
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText("underline");
            }}
            className={`w-8 h-8 flex items-center justify-center rounded-md ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} font-serif underline text-[15px]`}
          >
            U
          </button>
          <div
            className={`w-[1px] h-4 ${isDarkMode ? "bg-[#444]" : "bg-[#DDD]"} mx-1`}
          ></div>

          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText("backColor", "#FEF08A");
            }}
            className={`w-6 h-6 m-1 rounded-full bg-[#FEF08A] hover:scale-110 transition-transform shadow-inner border border-yellow-300`}
          ></button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText("backColor", "#BBF7D0");
            }}
            className={`w-6 h-6 m-1 rounded-full bg-[#BBF7D0] hover:scale-110 transition-transform shadow-inner border border-green-300`}
          ></button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText("backColor", "transparent");
            }}
            title="Remove Highlight"
            className={`w-8 h-8 flex items-center justify-center rounded-md ${theme.textMuted} ${theme.hoverBg} hover:text-red-500`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* MAIN BOTTOM TOOLBAR */}
      <div
        className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-40 transition-all duration-700 ${isTyping ? "opacity-0 translate-y-8 pointer-events-none" : "opacity-100 translate-y-0"}`}
      >
        {/* Color Popovers */}
        {colorMenuObj && (
          <div
            className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 p-3 rounded-2xl ${theme.glassBg} backdrop-blur-xl border ${theme.border} shadow-2xl flex flex-wrap gap-2 w-52 z-50`}
          >
            {(colorMenuObj === "text" ? TEXT_COLORS : HIGHLIGHT_COLORS).map(
              (color, i) => (
                <button
                  key={i}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    formatText(
                      colorMenuObj === "text" ? "foreColor" : "backColor",
                      color,
                    );
                  }}
                  className={`w-7 h-7 rounded-full transition-transform hover:scale-110 shadow-sm border ${isDarkMode ? "border-[#333]" : "border-gray-200"} flex items-center justify-center`}
                  style={{
                    backgroundColor:
                      color === "transparent"
                        ? isDarkMode
                          ? "#222"
                          : "#FFF"
                        : color,
                  }}
                >
                  {color === "transparent" && (
                    <span className="text-[10px] text-red-500 font-bold">
                      X
                    </span>
                  )}
                </button>
              ),
            )}

            <div
              className="relative w-7 h-7 rounded-full border border-gray-300 overflow-hidden cursor-pointer flex items-center justify-center bg-gradient-to-tr from-red-500 via-green-500 to-blue-500 hover:scale-110 transition-transform shadow-sm"
              title="Custom Color"
            >
              <input
                type="color"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onInput={(e) => {
                  formatText(
                    colorMenuObj === "text" ? "foreColor" : "backColor",
                    e.target.value,
                  );
                }}
              />
            </div>
          </div>
        )}

        <div
          className={`flex items-center ${theme.glassBg} backdrop-blur-md rounded-full px-2 py-2 gap-1 border ${theme.border} shadow-[0_4px_20px_rgb(0,0,0,0.04)]`}
        >
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText("undo");
            }}
            className={`w-9 h-9 flex items-center justify-center rounded-full ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} transition-colors`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText("redo");
            }}
            className={`w-9 h-9 flex items-center justify-center rounded-full ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} transition-colors`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
              />
            </svg>
          </button>
          <div
            className={`w-[1px] h-5 ${isDarkMode ? "bg-[#333333]" : "bg-[#E8E6E1]"} mx-1.5`}
          ></div>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText("bold");
            }}
            className={`w-9 h-9 flex items-center justify-center rounded-full ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} transition-colors font-serif font-bold text-[16px]`}
          >
            B
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText("italic");
            }}
            className={`w-9 h-9 flex items-center justify-center rounded-full ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} transition-colors font-serif italic text-[16px]`}
          >
            I
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText("underline");
            }}
            className={`w-9 h-9 flex items-center justify-center rounded-full ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} transition-colors font-serif underline text-[16px]`}
          >
            U
          </button>
          <div
            className={`w-[1px] h-5 ${isDarkMode ? "bg-[#333333]" : "bg-[#E8E6E1]"} mx-1.5`}
          ></div>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              setColorMenuObj(colorMenuObj === "text" ? null : "text");
            }}
            className={`w-9 h-9 flex items-center justify-center rounded-full ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} transition-colors font-serif font-bold text-[15px]`}
          >
            A
            <span className="w-3 h-0.5 bg-[#EF4444] absolute bottom-2 rounded-full"></span>
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              setColorMenuObj(
                colorMenuObj === "highlight" ? null : "highlight",
              );
            }}
            className={`w-9 h-9 flex items-center justify-center rounded-full ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} transition-colors`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
          <div
            className={`w-[1px] h-5 ${isDarkMode ? "bg-[#333333]" : "bg-[#E8E6E1]"} mx-1.5`}
          ></div>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText("justifyLeft");
            }}
            className={`w-9 h-9 flex items-center justify-center rounded-full ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} transition-colors`}
          >
            <svg
              className="w-[18px] h-[18px]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4 6h16M4 12h10M4 18h16"
              />
            </svg>
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText("justifyCenter");
            }}
            className={`w-9 h-9 flex items-center justify-center rounded-full ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} transition-colors`}
          >
            <svg
              className="w-[18px] h-[18px]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4 6h16M7 12h10M4 18h16"
              />
            </svg>
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText("justifyRight");
            }}
            className={`w-9 h-9 flex items-center justify-center rounded-full ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} transition-colors`}
          >
            <svg
              className="w-[18px] h-[18px]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4 6h16M10 12h10M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
