import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthorSidebar from "../components/AuthorSidebar";
import StudioHeader from "../components/StudioHeader";
import ManuscriptGrid from "../components/ManuscriptGrid";

const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://zendraft-bau8.onrender.com";

export default function Dashboard() {
  const [settingsData, setSettingsData] = useState({
    name: "",
    penName: "",
    email: "",
    picture: "",
    currentPassword: "",
    newPassword: "",
  });
  const [settingsMessage, setSettingsMessage] = useState({
    text: "",
    type: "",
  });
  const [allDrafts, setAllDrafts] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loreEntries, setLoreEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState("desk");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");

  const [authorName, setAuthorName] = useState("Author");

  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#D4AF37");
  const [newLoreTitle, setNewLoreTitle] = useState("");
  const [newLoreCategory, setNewLoreCategory] = useState("Character");
  const [newLoreContent, setNewLoreContent] = useState("");
  const [activeLoreTab, setActiveLoreTab] = useState("All");
  const folderColors = [
    "#D4AF37",
    "#8B9D83",
    "#C95C5C",
    "#6B8EAD",
    "#8D7B9A",
    "#2D2824",
  ];

  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [openStatusId, setOpenStatusId] = useState(null);

  const navigate = useNavigate();
  const [modal, setModal] = useState({
    isOpen: false,
    type: "confirm",
    title: "",
    message: "",
    inputValue: "",
    onConfirm: null,
  });

  useEffect(() => {
    document.title = "PenDraft";

    const storedUser = localStorage.getItem("zenUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setAuthorName(parsedUser.penName || parsedUser.name || "Author");
      } catch (e) {
        console.error("Error parsing user data");
      }
    }

    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    const token = localStorage.getItem("zenToken");
    if (!token) return navigate("/");
    try {
      const [draftsRes, foldersRes, loreRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/drafts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/api/folders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/api/lore`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const sortedDrafts = draftsRes.data.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });

      setAllDrafts(sortedDrafts);
      setFolders(foldersRes.data);
      setLoreEntries(loreRes.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("zenToken");
        localStorage.removeItem("zenUser");
        navigate("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateDraftAttribute = async (id, attributesObj, e) => {
    if (e) e.stopPropagation();
    const token = localStorage.getItem("zenToken");
    setAllDrafts(
      allDrafts.map((draft) =>
        draft._id === id ? { ...draft, ...attributesObj } : draft,
      ),
    );
    try {
      await axios.put(`${API_BASE_URL}/api/drafts/${id}`, attributesObj, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Error updating manuscript:", error);
    }
  };

  const createNewChapter = async () => {
    const token = localStorage.getItem("zenToken");
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/drafts`,
        {
          title: "",
          content: "",
          status: "Conception",
          order: allDrafts.length,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      navigate(`/editor/${res.data._id}`);
    } catch (error) {
      console.error("Error creating manuscript:", error);
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const token = localStorage.getItem("zenToken");
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/folders`,
        {
          name: newFolderName,
          description: newFolderDescription,
          color: newFolderColor,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setFolders([res.data, ...folders]);
      setNewFolderName("");
      setNewFolderDescription("");
      setNewFolderColor("#D4AF37");
    } catch (error) {
      console.error("Error creating volume:", error);
    }
  };

  const createLore = async (e) => {
    e.preventDefault();
    if (!newLoreTitle.trim()) return;
    const token = localStorage.getItem("zenToken");
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/lore`,
        {
          title: newLoreTitle,
          category: newLoreCategory,
          content: newLoreContent,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setLoreEntries([res.data, ...loreEntries]);
      setNewLoreTitle("");
      setNewLoreContent("");
    } catch (error) {
      console.error("Error creating codex entry:", error);
    }
  };

  const deleteProject = async (id) => {
    const token = localStorage.getItem("zenToken");
    try {
      await axios.delete(`${API_BASE_URL}/api/folders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFolders(folders.filter((f) => f._id !== id));
    } catch (error) {
      console.error("Error deleting volume:", error);
    }
  };

  const deleteLore = async (id) => {
    const token = localStorage.getItem("zenToken");
    try {
      await axios.delete(`${API_BASE_URL}/api/lore/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoreEntries(loreEntries.filter((l) => l._id !== id));
    } catch (error) {
      console.error("Error deleting codex entry:", error);
    }
  };

  const closeModal = () => setModal({ ...modal, isOpen: false });

  const confirmSignOut = () => {
    setModal({
      isOpen: true,
      type: "confirm",
      title: "Leave Sanctuary",
      message: "Are you ready to step away from your writing desk?",
      onConfirm: () => {
        localStorage.removeItem("zenToken");
        localStorage.removeItem("zenUser");
        navigate("/");
      },
    });
  };

  const confirmMoveToTrash = (id, e) => {
    e.stopPropagation();
    setModal({
      isOpen: true,
      type: "danger",
      title: "Discard Page",
      message:
        "Toss this manuscript into the discarded pages? You can recover it anytime.",
      onConfirm: () => {
        updateDraftAttribute(id, { isTrashed: true, isPinned: false }, null);
        closeModal();
      },
    });
  };

  const confirmRestore = (id, e) => {
    e.stopPropagation();
    setModal({
      isOpen: true,
      type: "confirm",
      title: "Restore Manuscript",
      message: "Bring this chapter back to your active desk?",
      onConfirm: () => {
        updateDraftAttribute(id, { isTrashed: false }, null);
        closeModal();
      },
    });
  };

  const confirmPermanentDelete = (id, e) => {
    e.stopPropagation();
    setModal({
      isOpen: true,
      type: "danger",
      title: "Shred Manuscript",
      message: "This piece of writing will be erased permanently. Proceed?",
      onConfirm: async () => {
        const token = localStorage.getItem("zenToken");
        try {
          await axios.delete(`${API_BASE_URL}/api/drafts/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAllDrafts(allDrafts.filter((draft) => draft._id !== id));
          closeModal();
        } catch (error) {
          console.error("Deletion failed:", error);
        }
      },
    });
  };

  const stripHtml = (html) => {
    if (!html) return "Blank parchment...";
    const doc = new DOMParser().parseFromString(html, "text/html");
    return (doc.body.textContent || "").trim() || "Blank parchment...";
  };

  const getWordCount = (html) => {
    if (!html) return 0;
    const doc = new DOMParser().parseFromString(html, "text/html");
    return (doc.body.textContent || "")
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const getReadingTime = (html) => {
    const words = getWordCount(html);
    const minutes = Math.ceil(words / 200);
    return minutes <= 1 ? "1 min read" : `${minutes} min read`;
  };

  const today = new Date().setHours(0, 0, 0, 0);
  const todayDrafts = allDrafts.filter(
    (d) => new Date(d.updatedAt).setHours(0, 0, 0, 0) === today,
  );
  const wordsToday = todayDrafts.reduce(
    (sum, draft) => sum + getWordCount(draft.content),
    0,
  );
  const dailyGoal = 1000;
  const goalProgress = Math.min((wordsToday / dailyGoal) * 100, 100);

  const filteredDrafts = allDrafts.filter((draft) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      (draft.title || "").toLowerCase().includes(searchLower) ||
      (draft.content || "").toLowerCase().includes(searchLower);
    const matchesStatus =
      selectedStatusFilter === "all" || draft.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const trashedDrafts = filteredDrafts.filter((draft) => draft.isTrashed);
  const activeDrafts = filteredDrafts.filter((draft) => !draft.isTrashed);
  const pinnedDrafts = activeDrafts.filter((draft) => draft.isPinned);
  const unpinnedDrafts = activeDrafts.filter((draft) => !draft.isPinned);

  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    setDragOverId(id);
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e, targetId, listType) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    let targetList =
      listType === "pinned" ? [...pinnedDrafts] : [...unpinnedDrafts];
    const draggedIdx = targetList.findIndex((d) => d._id === draggedId);
    const targetIdx = targetList.findIndex((d) => d._id === targetId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    const [movedItem] = targetList.splice(draggedIdx, 1);
    targetList.splice(targetIdx, 0, movedItem);

    const updatedUnpinned =
      listType === "unpinned" ? targetList : unpinnedDrafts;
    const updatedPinned = listType === "pinned" ? targetList : pinnedDrafts;

    const newAllDrafts = [
      ...updatedPinned,
      ...updatedUnpinned,
      ...trashedDrafts,
    ];
    setAllDrafts(newAllDrafts);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = async (e, targetId, listType) => {
    e.preventDefault();
    setDragOverId(null);
    setDraggedId(null);

    const token = localStorage.getItem("zenToken");
    const orderedIds = [
      ...pinnedDrafts,
      ...unpinnedDrafts,
      ...trashedDrafts,
    ].map((d) => d._id);
    try {
      await axios.put(
        `${API_BASE_URL}/api/drafts/reorder`,
        { orderedIds },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (error) {
      console.error("Failed to save card position:", error);
    }
  };

  const getStatusDotColor = (status) => {
    switch (status) {
      case "Conception":
        return "bg-amber-400";
      case "Outline":
        return "bg-purple-400";
      case "Inscribing":
        return "bg-sky-500";
      case "Polishing":
        return "bg-indigo-400";
      case "Finished":
        return "bg-emerald-500";
      default:
        return "bg-gray-400";
    }
  };

  const statuses = [
    "Conception",
    "Outline",
    "Inscribing",
    "Polishing",
    "Finished",
  ];

  // 🔥 REUSABLE AUTO-SAVE FUNCTION
  const saveProfileData = async (payload, successMsg) => {
    setSettingsMessage({ text: "Saving...", type: "loading" });
    const token = localStorage.getItem("zenToken");

    try {
      const res = await axios.put(`${API_BASE_URL}/api/auth/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.setItem("zenUser", JSON.stringify(res.data.user));
      setAuthorName(res.data.user.penName || res.data.user.name);

      setSettingsMessage({ text: successMsg, type: "success" });
      setTimeout(() => setSettingsMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      setSettingsMessage({
        text: error.response?.data?.error || "Failed to save changes.",
        type: "error",
      });
    }
  };

  // 🔥 1. IMAGE UPLOAD HANDLER (AUTO-SAVE)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setSettingsMessage({
          text: "Image size must be less than 2MB.",
          type: "error",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        setSettingsData({ ...settingsData, picture: base64Image });
        // Immediately save image to database
        await saveProfileData(
          { picture: base64Image },
          "Author portrait updated!",
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // 🔥 2. NAMES BLUR HANDLER (AUTO-SAVE JAB INPUT SE BAHAR CLICK KAREIN)
  const handleNameBlur = async () => {
    const storedUser = JSON.parse(localStorage.getItem("zenUser") || "{}");

    // Sirf tab save karein jab actually naam change kiya ho
    if (
      settingsData.name !== storedUser.name ||
      settingsData.penName !== storedUser.penName
    ) {
      await saveProfileData(
        {
          name: settingsData.name,
          penName: settingsData.penName,
        },
        "Profile identity automatically saved.",
      );
    }
  };

  // 🔥 3. PASSWORD SUBMIT HANDLER (ONLY MANUAL SAVE)
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!settingsData.currentPassword || !settingsData.newPassword) {
      setSettingsMessage({
        text: "Please provide both current and new passwords.",
        type: "error",
      });
      return;
    }

    await saveProfileData(
      {
        currentPassword: settingsData.currentPassword,
        newPassword: settingsData.newPassword,
      },
      "Password successfully updated.",
    );

    // Clear password fields upon success
    setSettingsData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
    }));
  };

  useEffect(() => {
    if (currentView === "settings") {
      const storedUser = JSON.parse(localStorage.getItem("zenUser") || "{}");
      setSettingsData({
        name: storedUser.name || "",
        penName: storedUser.penName || "",
        email: storedUser.email || "",
        picture: storedUser.picture || "",
        currentPassword: "",
        newPassword: "",
      });
    }
  }, [currentView]);

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#2D2824] selection:bg-[#F2EFE9] flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');
        .font-serif { font-family: 'Lora', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { display: none; }
        .animate-fade-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Author Sidebar */}
      <AuthorSidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        confirmSignOut={confirmSignOut}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {modal.isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FDFCF8]/90 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.04)] w-full max-w-[420px] p-10 text-center animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[26px] text-[#2D2824] mb-3 font-serif font-medium">
              {modal.title}
            </h2>
            <p className="text-[#7A746D] text-[15px] leading-relaxed mb-8 font-sans font-light">
              {modal.message}
            </p>
            <div className="flex items-center justify-center gap-6 mt-8">
              <button
                onClick={closeModal}
                className="text-[11px] font-sans font-bold tracking-widest uppercase text-[#A39A8E] hover:text-[#2D2824] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => modal.onConfirm()}
                className={`text-[11px] font-sans font-bold tracking-widest uppercase transition-colors cursor-pointer ${modal.type === "danger" ? "text-[#C95C5C] hover:text-red-800" : "text-[#2D2824] hover:text-black"}`}
              >
                {modal.type === "danger" ? "Proceed" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="w-full md:pl-[260px] min-h-screen flex flex-col">
        <StudioHeader
          currentView={currentView}
          userName={authorName}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          wordsToday={wordsToday}
          dailyGoal={dailyGoal}
          goalProgress={goalProgress}
          newFolderName={newFolderName}
          setNewFolderName={setNewFolderName}
          createProject={createProject}
          createNewChapter={createNewChapter}
          selectedStatusFilter={selectedStatusFilter}
          setSelectedStatusFilter={setSelectedStatusFilter}
          statuses={statuses}
          getStatusDotColor={getStatusDotColor}
          setIsSidebarOpen={setIsSidebarOpen}
          userPicture={
            JSON.parse(localStorage.getItem("zenUser") || "{}").picture
          }
        />

        <main className="px-6 sm:px-12 pt-6 pb-32 max-w-[1250px]">
          {/* PROFESSIONAL SETTINGS LAYOUT */}
          {currentView === "settings" ? (
            <div className="animate-fade-in w-full pb-10 mt-4">
              {settingsMessage.text && (
                <div
                  className={`mb-8 p-4 rounded-xl text-[13px] font-sans font-medium flex items-center justify-between shadow-sm ${
                    settingsMessage.type === "success"
                      ? "bg-[#F0F5F0] text-[#5A7A5A] border border-[#DCE8DC]"
                      : settingsMessage.type === "error"
                        ? "bg-[#FDF2F2] text-[#C95C5C] border border-[#FADEDE]"
                        : "bg-[#F7F5F0] text-[#7A746D] border border-[#E8E4DB]"
                  }`}
                >
                  <span>{settingsMessage.text}</span>
                  <button
                    onClick={() => setSettingsMessage({ text: "", type: "" })}
                    className="opacity-70 hover:opacity-100 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-12">
                {/* 🟢 Profile Identity Section (Auto-Saving) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 pb-12 border-b border-[#E8E4DB]">
                  <div className="col-span-1">
                    <h3 className="text-[18px] font-serif font-medium text-[#2D2824] mb-2">
                      Profile Identity
                    </h3>
                    <p className="text-[13px] font-sans font-light text-[#7A746D] leading-relaxed mb-4">
                      Update your primary account name and your publishing
                      alias.
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-sans font-bold tracking-widest uppercase text-[#8B9D83] bg-[#F0F5F0] px-3 py-1.5 rounded-full border border-[#DCE8DC]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-3 h-3"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Auto-Saving
                    </span>
                  </div>

                  <div className="col-span-1 md:col-span-2 bg-white p-7 md:p-8 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] flex flex-col gap-6">
                    <div className="flex items-center gap-6 mb-4">
                      <div className="w-20 h-20 rounded-full bg-[#F2EFE9] border border-[#E8E4DB] relative group overflow-hidden flex-shrink-0 shadow-sm">
                        {settingsData.picture ? (
                          <img
                            src={settingsData.picture}
                            alt="Author"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#A39A8E]">
                            <svg
                              className="w-8 h-8"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                              />
                            </svg>
                          </div>
                        )}
                        <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-300">
                          <span className="text-[9px] text-white font-bold tracking-widest uppercase mt-1">
                            Upload
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div>
                        <h4 className="text-[12px] font-sans font-bold text-[#2D2824] uppercase tracking-widest mb-1">
                          Author Portrait
                        </h4>
                        <p className="text-[12px] font-sans font-light text-[#7A746D]">
                          Recommended size: 256x256px. Max 2MB.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-[#A39A8E] mb-2 block">
                        Account Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={settingsData.email}
                          disabled
                          className="w-full bg-[#F7F5F0] border border-[#E8E4DB] rounded-xl px-4 py-3.5 text-[14px] font-sans text-[#7A746D] outline-none transition-colors cursor-not-allowed"
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          className="w-[16px] h-[16px] text-[#B3ADA4] absolute right-4 top-1/2 -translate-y-1/2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                          />
                        </svg>
                      </div>
                      <p className="text-[11px] text-[#A39A8E] mt-1.5 font-sans">
                        Email address cannot be changed.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="flex-1">
                        <label className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-[#A39A8E] mb-2 block">
                          Real Name
                        </label>
                        <input
                          type="text"
                          value={settingsData.name}
                          onChange={(e) =>
                            setSettingsData({
                              ...settingsData,
                              name: e.target.value,
                            })
                          }
                          onBlur={handleNameBlur} // 🔥 Auto-save on blur
                          className="w-full bg-[#FDFCF8] border border-[#E8E4DB] focus:border-[#2D2824] rounded-xl px-4 py-3.5 text-[14px] font-sans text-[#2D2824] outline-none transition-colors"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-[#A39A8E] mb-2 block">
                          Author / Pen Name
                        </label>
                        <input
                          type="text"
                          value={settingsData.penName}
                          onChange={(e) =>
                            setSettingsData({
                              ...settingsData,
                              penName: e.target.value,
                            })
                          }
                          onBlur={handleNameBlur} // 🔥 Auto-save on blur
                          className="w-full bg-[#FDFCF8] border border-[#E8E4DB] focus:border-[#2D2824] rounded-xl px-4 py-3.5 text-[14px] font-sans text-[#2D2824] outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 🔴 Account Security Section (Manual Form Submission) */}
                <form
                  onSubmit={handlePasswordUpdate}
                  autoComplete="off"
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 pb-12"
                >
                  <div className="col-span-1">
                    <h3 className="text-[18px] font-serif font-medium text-[#2D2824] mb-2">
                      Account Security
                    </h3>
                    <p className="text-[13px] font-sans font-light text-[#7A746D] leading-relaxed">
                      Update your password to keep your studio secure.
                    </p>
                  </div>

                  <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
                    <div className="bg-white p-7 md:p-8 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] flex flex-col gap-6">
                      <div>
                        <label className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-[#A39A8E] mb-2 block">
                          Current Password
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={settingsData.currentPassword}
                          onChange={(e) =>
                            setSettingsData({
                              ...settingsData,
                              currentPassword: e.target.value,
                            })
                          }
                          autoComplete="new-password"
                          className="w-full md:w-[60%] bg-[#FDFCF8] border border-[#E8E4DB] focus:border-[#2D2824] rounded-xl px-4 py-3.5 text-[14px] font-sans text-[#2D2824] outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-[#A39A8E] mb-2 block">
                          New Password
                        </label>
                        <input
                          type="password"
                          placeholder="Provide a new password"
                          value={settingsData.newPassword}
                          onChange={(e) =>
                            setSettingsData({
                              ...settingsData,
                              newPassword: e.target.value,
                            })
                          }
                          autoComplete="new-password"
                          className="w-full md:w-[60%] bg-[#FDFCF8] border border-[#E8E4DB] focus:border-[#2D2824] rounded-xl px-4 py-3.5 text-[14px] font-sans text-[#2D2824] outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={
                          settingsMessage.type === "loading" ||
                          (!settingsData.currentPassword &&
                            !settingsData.newPassword)
                        }
                        className="text-[12px] font-sans font-bold tracking-widest uppercase text-[#FDFCF8] bg-[#2D2824] px-8 py-4 rounded-xl hover:bg-black transition-all cursor-pointer shadow-md disabled:opacity-50"
                      >
                        {settingsMessage.type === "loading"
                          ? "Saving..."
                          : "Update Password"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          ) : currentView === "projects" ? (
            <div className="animate-fade-in w-full pb-10">
              {/* Add New Series Form */}
              <div className="bg-white p-8 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] mb-12 border border-[#F2EFE9]">
                <h3 className="text-[18px] font-serif font-medium text-[#2D2824] mb-6">
                  Conceive a New Series
                </h3>
                <form onSubmit={createProject} className="flex flex-col gap-5">
                  <div className="flex flex-col md:flex-row gap-5">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Series Title (e.g., The Lunar Chronicles)"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        className="w-full bg-[#FDFCF8] border border-[#E8E4DB] focus:border-[#2D2824] rounded-xl px-4 py-3.5 text-[14px] font-sans text-[#2D2824] outline-none transition-colors"
                      />
                    </div>
                    <div className="flex flex-col justify-center bg-[#FDFCF8] border border-[#E8E4DB] rounded-xl px-4 py-2">
                      <span className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-[#A39A8E] mb-1.5 block">
                        Theme Color
                      </span>
                      <div className="flex gap-2">
                        {folderColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setNewFolderColor(color)}
                            className={`w-6 h-6 rounded-full transition-all cursor-pointer ${newFolderColor === color ? "ring-2 ring-offset-2 ring-[#2D2824]" : "opacity-70 hover:opacity-100"}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <textarea
                    placeholder="Brief synopsis or logline of this universe..."
                    value={newFolderDescription}
                    onChange={(e) => setNewFolderDescription(e.target.value)}
                    rows="2"
                    className="w-full bg-[#FDFCF8] border border-[#E8E4DB] focus:border-[#2D2824] rounded-xl px-4 py-3.5 text-[14px] font-sans text-[#2D2824] outline-none transition-colors resize-none"
                  ></textarea>
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      className="text-[11px] font-sans font-bold tracking-widest uppercase text-[#FDFCF8] bg-[#2D2824] px-8 py-3.5 rounded-xl hover:bg-black transition-all cursor-pointer shadow-md"
                    >
                      Establish Series
                    </button>
                  </div>
                </form>
              </div>

              {/* Series Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
                {folders.map((folder) => (
                  <div
                    key={folder._id}
                    className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-[#E8E4DB] overflow-hidden flex flex-col transition-all hover:shadow-lg hover:-translate-y-1 group"
                  >
                    {/* Color Banner */}
                    <div
                      className="h-2 w-full"
                      style={{ backgroundColor: folder.color || "#D4AF37" }}
                    ></div>
                    <div className="p-7 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <span
                          className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase"
                          style={{ color: folder.color || "#D4AF37" }}
                        >
                          Series Volume
                        </span>
                        <button
                          onClick={() => deleteProject(folder._id)}
                          className="text-[#A39A8E] hover:text-[#C95C5C] opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-lg"
                        >
                          ×
                        </button>
                      </div>
                      <h3 className="text-[22px] font-serif text-[#2D2824] mb-3 leading-tight">
                        {folder.name}
                      </h3>
                      <p className="text-[13px] font-sans font-light text-[#7A746D] leading-relaxed mb-6 flex-1 line-clamp-3">
                        {folder.description ||
                          "No synopsis provided for this series yet."}
                      </p>

                      <div className="pt-4 border-t border-[#F2EFE9] flex items-center justify-between">
                        <span className="text-[11px] font-sans font-medium text-[#A39A8E]">
                          {
                            allDrafts.filter((d) => d.folder === folder._id)
                              .length
                          }{" "}
                          Manuscripts
                        </span>
                        <button className="text-[11px] font-sans font-bold tracking-widest uppercase text-[#2D2824] hover:text-black transition-colors cursor-pointer flex items-center gap-1">
                          Open Desk
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {folders.length === 0 && (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-[#E8E4DB] rounded-2xl">
                    <p className="text-[#A39A8E] font-serif text-[18px] italic mb-2">
                      No book series catalogued yet.
                    </p>
                    <p className="text-[#B3ADA4] font-sans text-[13px]">
                      Create your first universe above to start organizing.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : currentView === "bible" ? (
            /* 🔥 2. STORY CODEX (WIKI) PREMIUM UI */
            <div className="animate-fade-in w-full pb-10">
              {/* Lore Creation Form */}
              <div className="bg-white p-8 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] mb-8 border border-[#F2EFE9]">
                <h3 className="text-[18px] font-serif font-medium text-[#2D2824] mb-6">
                  Expand Your Universe
                </h3>
                <form onSubmit={createLore} className="flex flex-col gap-5">
                  <div className="flex flex-col sm:flex-row gap-5">
                    <input
                      type="text"
                      placeholder="Entry Name (e.g., Elara Vance, The Obsidian Citadel)"
                      value={newLoreTitle}
                      onChange={(e) => setNewLoreTitle(e.target.value)}
                      className="flex-[2] bg-[#FDFCF8] border border-[#E8E4DB] focus:border-[#2D2824] rounded-xl px-4 py-3.5 text-[14px] text-[#2D2824] outline-none font-sans transition-colors"
                    />
                    <select
                      value={newLoreCategory}
                      onChange={(e) => setNewLoreCategory(e.target.value)}
                      className="flex-1 bg-[#FDFCF8] border border-[#E8E4DB] focus:border-[#2D2824] rounded-xl px-4 py-3.5 text-[12px] font-bold uppercase tracking-widest text-[#2D2824] outline-none cursor-pointer font-sans transition-colors"
                    >
                      <option value="Character">Character</option>
                      <option value="Setting">Setting</option>
                      <option value="Plot">Plot</option>
                      <option value="Rule">Magic / Rule</option>
                      <option value="Item">Item / Relic</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="Record detailed backstories, traits, or world-building rules..."
                    value={newLoreContent}
                    onChange={(e) => setNewLoreContent(e.target.value)}
                    rows="3"
                    className="w-full bg-[#FDFCF8] border border-[#E8E4DB] focus:border-[#2D2824] rounded-xl px-4 py-3.5 text-[14px] text-[#2D2824] outline-none resize-none font-sans transition-colors"
                  ></textarea>
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      className="text-[11px] font-sans font-bold tracking-widest uppercase text-[#FDFCF8] bg-[#2D2824] px-8 py-3.5 rounded-xl hover:bg-black transition-all cursor-pointer shadow-md"
                    >
                      Add to Codex
                    </button>
                  </div>
                </form>
              </div>

              {/* Wiki Navigation Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-6 mb-2 border-b border-[#E8E4DB]">
                {["All", "Character", "Setting", "Plot", "Rule", "Item"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveLoreTab(tab)}
                      className={`px-5 py-2.5 rounded-full text-[11px] font-sans font-bold tracking-widest uppercase whitespace-nowrap transition-all cursor-pointer ${activeLoreTab === tab ? "bg-[#2D2824] text-white shadow-md" : "bg-transparent text-[#7A746D] hover:bg-[#F2EFE9] hover:text-[#2D2824]"}`}
                    >
                      {tab}
                    </button>
                  ),
                )}
              </div>

              {/* Dossier Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loreEntries
                  .filter(
                    (lore) =>
                      activeLoreTab === "All" ||
                      lore.category === activeLoreTab,
                  )
                  .map((lore) => (
                    <div
                      key={lore._id}
                      className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-[#E8E4DB] flex flex-col transition-all hover:shadow-lg group relative"
                    >
                      <button
                        onClick={() => deleteLore(lore._id)}
                        className="absolute top-5 right-5 text-[#A39A8E] hover:text-[#C95C5C] opacity-0 group-hover:opacity-100 transition-all cursor-pointer w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50"
                      >
                        ✕
                      </button>

                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${
                            lore.category === "Character"
                              ? "bg-amber-100 text-amber-700"
                              : lore.category === "Setting"
                                ? "bg-emerald-100 text-emerald-700"
                                : lore.category === "Rule"
                                  ? "bg-purple-100 text-purple-700"
                                  : lore.category === "Item"
                                    ? "bg-sky-100 text-sky-700"
                                    : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {/* Dynamic Icons based on category */}
                          {lore.category === "Character" && (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                              />
                            </svg>
                          )}
                          {lore.category === "Setting" && (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                              />
                            </svg>
                          )}
                          {lore.category === "Rule" && (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                              />
                            </svg>
                          )}
                          {lore.category === "Item" && (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
                              />
                            </svg>
                          )}
                          {lore.category === "Plot" && (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.671zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59"
                              />
                            </svg>
                          )}
                        </div>
                        <div>
                          <span className="text-[9px] font-sans font-bold text-[#A39A8E] uppercase tracking-[0.2em]">
                            {lore.category}
                          </span>
                          <h3 className="text-[18px] font-serif text-[#2D2824] leading-tight mt-0.5 pr-6">
                            {lore.title}
                          </h3>
                        </div>
                      </div>

                      <div className="bg-[#FDFCF8] p-4 rounded-xl border border-[#F2EFE9] flex-1">
                        <p className="text-[13px] text-[#4A443D] font-sans font-light leading-relaxed whitespace-pre-wrap">
                          {lore.content}
                        </p>
                      </div>
                    </div>
                  ))}

                {loreEntries.filter(
                  (lore) =>
                    activeLoreTab === "All" || lore.category === activeLoreTab,
                ).length === 0 && (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
                    <p className="text-[#A39A8E] font-serif text-[18px] italic">
                      The records for this category are empty.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl h-[270px] animate-pulse shadow-xs"
                    ></div>
                  ))}
                </div>
              ) : currentView === "wastebasket" ? (
                <ManuscriptGrid
                  draftList={trashedDrafts}
                  isTrashView={true}
                  navigate={navigate}
                  updateDraftAttribute={updateDraftAttribute}
                  confirmMoveToTrash={confirmMoveToTrash}
                  confirmRestore={confirmRestore}
                  confirmPermanentDelete={confirmPermanentDelete}
                  stripHtml={stripHtml}
                  getWordCount={getWordCount}
                  getReadingTime={getReadingTime}
                  handleDragStart={handleDragStart}
                  handleDragOver={handleDragOver}
                  handleDragEnter={handleDragEnter}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                  draggedId={draggedId}
                  dragOverId={dragOverId}
                  openStatusId={openStatusId}
                  setOpenStatusId={setOpenStatusId}
                  getStatusDotColor={getStatusDotColor}
                  statuses={statuses}
                  isLoading={isLoading}
                />
              ) : (
                <>
                  {pinnedDrafts.length > 0 && (
                    <div className="mb-16">
                      <span className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-[#D4AF37] mb-6 block ml-1">
                        Pinned Chapters
                      </span>
                      <ManuscriptGrid
                        draftList={pinnedDrafts}
                        isTrashView={false}
                        listType="pinned"
                        navigate={navigate}
                        updateDraftAttribute={updateDraftAttribute}
                        confirmMoveToTrash={confirmMoveToTrash}
                        confirmRestore={confirmRestore}
                        confirmPermanentDelete={confirmPermanentDelete}
                        stripHtml={stripHtml}
                        getWordCount={getWordCount}
                        getReadingTime={getReadingTime}
                        handleDragStart={handleDragStart}
                        handleDragOver={handleDragOver}
                        handleDragEnter={handleDragEnter}
                        handleDragLeave={handleDragLeave}
                        handleDrop={handleDrop}
                        draggedId={draggedId}
                        dragOverId={dragOverId}
                        openStatusId={openStatusId}
                        setOpenStatusId={setOpenStatusId}
                        getStatusDotColor={getStatusDotColor}
                        statuses={statuses}
                        isLoading={isLoading}
                      />
                    </div>
                  )}
                  <div>
                    {pinnedDrafts.length > 0 && unpinnedDrafts.length > 0 && (
                      <span className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-[#A39A8E] mb-6 block ml-1">
                        All Manuscripts
                      </span>
                    )}
                    <ManuscriptGrid
                      draftList={unpinnedDrafts}
                      isTrashView={false}
                      listType="unpinned"
                      navigate={navigate}
                      updateDraftAttribute={updateDraftAttribute}
                      confirmMoveToTrash={confirmMoveToTrash}
                      confirmRestore={confirmRestore}
                      confirmPermanentDelete={confirmPermanentDelete}
                      stripHtml={stripHtml}
                      getWordCount={getWordCount}
                      getReadingTime={getReadingTime}
                      handleDragStart={handleDragStart}
                      handleDragOver={handleDragOver}
                      handleDragEnter={handleDragEnter}
                      handleDragLeave={handleDragLeave}
                      handleDrop={handleDrop}
                      draggedId={draggedId}
                      dragOverId={dragOverId}
                      openStatusId={openStatusId}
                      setOpenStatusId={setOpenStatusId}
                      getStatusDotColor={getStatusDotColor}
                      statuses={statuses}
                      isLoading={isLoading}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
