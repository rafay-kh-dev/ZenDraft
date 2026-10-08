import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthorSidebar from "../components/AuthorSidebar";

const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://zendraft-bau8.onrender.com";

export default function Dashboard() {
  const [allDrafts, setAllDrafts] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loreEntries, setLoreEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState("desk"); // 'desk', 'projects', 'bible', 'wastebasket'
  const [searchQuery, setSearchQuery] = useState("");

  const [newFolderName, setNewFolderName] = useState("");
  const [newLoreTitle, setNewLoreTitle] = useState("");
  const [newLoreCategory, setNewLoreCategory] = useState("Character");
  const [newLoreContent, setNewLoreContent] = useState("");

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
    document.title = "Studio | PenDraft";
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

      setAllDrafts(
        draftsRes.data.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
        ),
      );
      setFolders(foldersRes.data);
      setLoreEntries(loreRes.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("zenToken");
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
        { title: "", content: "", status: "Conception" },
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
        { name: newFolderName },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setFolders([res.data, ...folders]);
      setNewFolderName("");
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
    return (
      (draft.title || "").toLowerCase().includes(searchLower) ||
      (draft.content || "").toLowerCase().includes(searchLower)
    );
  });

  const trashedDrafts = filteredDrafts.filter((draft) => draft.isTrashed);
  const activeDrafts = filteredDrafts.filter((draft) => !draft.isTrashed);
  const pinnedDrafts = activeDrafts.filter((draft) => draft.isPinned);
  const unpinnedDrafts = activeDrafts.filter((draft) => !draft.isPinned);

  const renderGrid = (draftList, isTrashView = false) => {
    if (draftList.length === 0 && !isLoading) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center py-20 text-[#A39A8E]">
          <p className="text-[18px] font-serif italic tracking-wide">
            {isTrashView
              ? "The discarded pages are empty."
              : "Your desk is clear. Time to weave your narrative."}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {draftList.map((draft) => (
          <div
            key={draft._id}
            onClick={() =>
              !isTrashView ? navigate(`/editor/${draft._id}`) : null
            }
            className={`group relative flex flex-col justify-between p-7 h-[250px] transition-all duration-500 ease-out rounded-xl ${!isTrashView ? "bg-[#FFFFFF] cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-[#F2EFE9] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:border-[#E8E4DB]" : "bg-[#F9F8F6] border-2 border-dashed border-[#E8E4DB] cursor-default"}`}
          >
            <div className="flex justify-between items-start mb-4">
              {!isTrashView ? (
                <div onClick={(e) => e.stopPropagation()} className="relative">
                  <select
                    value={draft.status || "Conception"}
                    onChange={(e) =>
                      updateDraftAttribute(
                        draft._id,
                        { status: e.target.value },
                        e,
                      )
                    }
                    className="appearance-none outline-none cursor-pointer text-[10px] font-sans font-bold text-[#A39E98] hover:text-[#2D2824] uppercase tracking-widest bg-transparent transition-colors"
                  >
                    <option value="Conception">Conception</option>
                    <option value="Inscribing">Inscribing</option>
                    <option value="Polishing">Polishing</option>
                    <option value="Finished">Finished</option>
                  </select>
                </div>
              ) : (
                <span className="text-[10px] font-sans font-bold text-[#C95C5C] uppercase tracking-widest bg-red-50 px-2 py-1 rounded-sm">
                  Discarded
                </span>
              )}

              {!isTrashView && (
                <button
                  onClick={(e) =>
                    updateDraftAttribute(
                      draft._id,
                      { isPinned: !draft.isPinned },
                      e,
                    )
                  }
                  className={`p-1 transition-all cursor-pointer ${draft.isPinned ? "text-[#D4AF37]" : "text-[#DCD8D0] hover:text-[#2D2824] opacity-0 group-hover:opacity-100"}`}
                  title={draft.isPinned ? "Unpin" : "Pin Chapter"}
                >
                  <svg
                    className="w-[18px] h-[18px]"
                    fill={draft.isPinned ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-hidden relative pr-2">
              <h2 className="text-[22px] text-[#2D2824] leading-snug mb-3 line-clamp-2 font-serif font-medium tracking-tight">
                {draft.title || "Untitled Chapter"}
              </h2>
              <p className="text-[14px] text-[#7A746D] leading-relaxed line-clamp-3 font-sans font-light">
                {stripHtml(draft.content)}
              </p>
              <div
                className={`absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t ${!isTrashView ? "from-white" : "from-[#F9F8F6]"} to-transparent`}
              ></div>
            </div>

            <div className="flex items-center justify-between mt-5 pt-3 border-t border-[#F9F8F5]">
              <span className="text-[10px] font-sans text-[#B3ADA4] uppercase tracking-widest font-medium">
                {new Date(draft.updatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {!isTrashView ? (
                  <button
                    onClick={(e) => confirmMoveToTrash(draft._id, e)}
                    className="text-[#A39A8E] hover:text-[#C95C5C] transition-colors cursor-pointer ml-1"
                    title="Discard"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={(e) => confirmRestore(draft._id, e)}
                      className="text-[#A39A8E] hover:text-[#2D2824] transition-colors cursor-pointer"
                      title="Recover"
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
                          d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => confirmPermanentDelete(draft._id, e)}
                      className="text-[#A39A8E] hover:text-[#C95C5C] transition-colors cursor-pointer ml-1"
                      title="Shred"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

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

      {/* Author Sidebar with refined terminology */}
      <aside className="w-[260px] h-screen bg-[#F9F8F5] border-r border-[#EAE7E0] flex flex-col fixed left-0 top-0">
        <div className="h-[90px] flex items-center px-8">
          <svg
            className="w-[18px] h-[18px]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#2D2824"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 2l4 4-7 14-4-4 7-14z"
              fill="#2D2824"
            />
            <path d="M16 6l4 4-2 2-4-4 2-2z" fill="#D4AF37" />
          </svg>
          <span className="font-serif italic text-[19px] ml-2 text-[#2D2824]">
            PenDraft
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <span className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-[#B3ADA4] ml-4 mb-4 block">
            Workspace
          </span>

          {[
            {
              id: "desk",
              label: "My Desk",
              icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
            },
            {
              id: "projects",
              label: "Book Series",
              icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
            },
            {
              id: "bible",
              label: "Story Codex",
              icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
            },
            {
              id: "wastebasket",
              label: "Discarded Pages",
              icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-sans text-[13px] font-medium cursor-pointer
                ${currentView === item.id ? "bg-white text-[#2D2824] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#E8E4DB]" : "text-[#8C8781] hover:bg-[#F2EFE9] hover:text-[#2D2824] border border-transparent"}`}
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
                  d={item.icon}
                />
              </svg>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-[#EAE7E0]">
          <button
            onClick={confirmSignOut}
            className="w-full flex items-center gap-3 px-4 py-2 text-[#A39A8E] hover:text-[#2D2824] transition-colors cursor-pointer font-sans text-[13px] font-medium"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Leave Sanctuary
          </button>
        </div>
      </aside>

      {modal.isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FDFCF8]/90 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-[#F2EFE9] w-full max-w-[420px] p-10 text-center"
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

      <div className="flex-1 ml-[260px]">
        <header className="h-[90px] flex items-center justify-between px-12 border-b border-transparent">
          <div className="w-[300px] relative group">
            <input
              type="text"
              placeholder="Search manuscripts or codex..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent focus:bg-white focus:shadow-sm border border-transparent focus:border-[#E8E4DB] rounded-full py-2 px-4 text-[14px] font-sans text-[#2D2824] placeholder-[#B3ADA4] transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-[#A39A8E] mb-1">
                Daily Goal
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-sans font-semibold text-[#2D2824]">
                  {wordsToday}{" "}
                  <span className="text-[#B3ADA4] font-normal">
                    / {dailyGoal}
                  </span>
                </span>
                <div className="w-24 h-1.5 bg-[#F2EFE9] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#D4AF37] transition-all duration-1000"
                    style={{ width: `${goalProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-12 pt-8 pb-32 max-w-[1200px]">
          {/* BOOK SERIES VIEW */}
          {currentView === "projects" ? (
            <div className="animate-fade-in">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <span className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-[#D4AF37] mb-2 block">
                    Collections
                  </span>
                  <h2 className="text-[46px] text-[#2D2824] tracking-tight leading-none font-serif font-medium">
                    Book Series
                  </h2>
                </div>
                <form onSubmit={createProject} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="New series title..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="bg-white border border-[#E8E4DB] rounded-xl px-4 py-2.5 text-[14px] text-[#2D2824] outline-none"
                  />
                  <button
                    type="submit"
                    className="text-[11px] font-sans font-bold tracking-widest uppercase text-[#FDFCF8] bg-[#2D2824] px-6 py-2.5 rounded-xl hover:bg-black transition-all cursor-pointer"
                  >
                    Conceive
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {folders.map((folder) => (
                  <div
                    key={folder._id}
                    className="bg-white p-6 rounded-xl border border-[#F2EFE9] shadow-sm flex justify-between items-start"
                  >
                    <div>
                      <h3 className="text-[20px] font-serif text-[#2D2824] mb-1">
                        {folder.name}
                      </h3>
                      <span className="text-[11px] text-[#A39A8E] uppercase tracking-wider font-sans font-medium">
                        Series Volume
                      </span>
                    </div>
                    <button
                      onClick={() => deleteProject(folder._id)}
                      className="text-[#A39A8E] hover:text-[#C95C5C] transition-colors cursor-pointer text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {folders.length === 0 && (
                  <p className="text-[#A39A8E] font-serif italic">
                    No book series catalogued yet.
                  </p>
                )}
              </div>
            </div>
          ) : currentView === "bible" ? (
            /* STORY CODEX VIEW */
            <div className="animate-fade-in">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <span className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-[#D4AF37] mb-2 block">
                    Mythos & Lore
                  </span>
                  <h2 className="text-[46px] text-[#2D2824] tracking-tight leading-none font-serif font-medium">
                    Story Codex
                  </h2>
                </div>
              </div>

              <form
                onSubmit={createLore}
                className="bg-white p-6 rounded-2xl border border-[#F2EFE9] shadow-sm mb-12 flex flex-col gap-4"
              >
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Character, Realm, or Lore title..."
                    value={newLoreTitle}
                    onChange={(e) => setNewLoreTitle(e.target.value)}
                    className="flex-1 bg-[#FDFCF8] border border-[#E8E4DB] rounded-xl px-4 py-2.5 text-[14px] text-[#2D2824] outline-none font-sans"
                  />
                  <select
                    value={newLoreCategory}
                    onChange={(e) => setNewLoreCategory(e.target.value)}
                    className="bg-[#FDFCF8] border border-[#E8E4DB] rounded-xl px-4 py-2.5 text-[12px] font-bold uppercase text-[#2D2824] outline-none cursor-pointer font-sans"
                  >
                    <option value="Character">Character</option>
                    <option value="Setting">Setting</option>
                    <option value="Plot">Plot</option>
                    <option value="Rule">Rule</option>
                  </select>
                </div>
                <textarea
                  placeholder="Record details, backstories, or world rules..."
                  value={newLoreContent}
                  onChange={(e) => setNewLoreContent(e.target.value)}
                  rows="3"
                  className="w-full bg-[#FDFCF8] border border-[#E8E4DB] rounded-xl px-4 py-2.5 text-[14px] text-[#2D2824] outline-none resize-none font-sans"
                ></textarea>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="text-[11px] font-sans font-bold tracking-widest uppercase text-[#FDFCF8] bg-[#2D2824] px-6 py-2.5 rounded-xl hover:bg-black transition-all cursor-pointer"
                  >
                    Record in Codex
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loreEntries.map((lore) => (
                  <div
                    key={lore._id}
                    className="bg-white p-6 rounded-xl border border-[#F2EFE9] shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-sans font-bold text-[#D4AF37] uppercase tracking-widest">
                          {lore.category}
                        </span>
                        <button
                          onClick={() => deleteLore(lore._id)}
                          className="text-[#A39A8E] hover:text-[#C95C5C] transition-colors cursor-pointer text-sm"
                        >
                          ×
                        </button>
                      </div>
                      <h3 className="text-[20px] font-serif text-[#2D2824] mb-2">
                        {lore.title}
                      </h3>
                      <p className="text-[14px] text-[#7A746D] font-sans font-light leading-relaxed">
                        {lore.content}
                      </p>
                    </div>
                  </div>
                ))}
                {loreEntries.length === 0 && (
                  <p className="text-[#A39A8E] font-serif italic">
                    Your story codex is currently unwritten.
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* DESK & WASTEBASKET VIEWS */
            <div className="animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                  <h2 className="text-[46px] text-[#2D2824] tracking-tight leading-none font-serif font-medium">
                    {currentView === "wastebasket"
                      ? "Discarded Pages"
                      : "My Desk"}
                  </h2>
                </div>
                {currentView === "desk" && (
                  <button
                    onClick={createNewChapter}
                    className="text-[11px] font-sans font-bold tracking-widest uppercase text-[#FDFCF8] bg-[#2D2824] px-7 py-3.5 rounded-full hover:bg-black hover:shadow-xl hover:-translate-y-1 transition-all duration-400 cursor-pointer"
                  >
                    New Manuscript
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl h-[250px] animate-pulse border border-[#F2EFE9]"
                    ></div>
                  ))}
                </div>
              ) : currentView === "wastebasket" ? (
                renderGrid(trashedDrafts, true)
              ) : (
                <>
                  {pinnedDrafts.length > 0 && (
                    <div className="mb-16">
                      <span className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-[#D4AF37] mb-6 block ml-1">
                        Pinned
                      </span>
                      {renderGrid(pinnedDrafts, false, true)}
                    </div>
                  )}
                  <div>
                    {pinnedDrafts.length > 0 && unpinnedDrafts.length > 0 && (
                      <span className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-[#A39A8E] mb-6 block ml-1">
                        Everything Else
                      </span>
                    )}
                    {renderGrid(unpinnedDrafts, false)}
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
