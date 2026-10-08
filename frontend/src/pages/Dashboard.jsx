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
  const [allDrafts, setAllDrafts] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loreEntries, setLoreEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState("desk");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");

  const [newFolderName, setNewFolderName] = useState("");
  const [newLoreTitle, setNewLoreTitle] = useState("");
  const [newLoreCategory, setNewLoreCategory] = useState("Character");
  const [newLoreContent, setNewLoreContent] = useState("");

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

  // 🔥 REAL-TIME LIVE REORDERING WHILE DRAGGING 🔥
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
        />

        <main className="px-6 sm:px-12 pt-6 pb-32 max-w-[1250px]">
          {currentView === "projects" ? (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
                {folders.map((folder) => (
                  <div
                    key={folder._id}
                    className="bg-white p-7 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] flex justify-between items-start transition-all hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
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
                      className="text-[#A39A8E] hover:text-[#C95C5C] transition-colors cursor-pointer text-base p-1"
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
            <div className="animate-fade-in">
              <form
                onSubmit={createLore}
                className="bg-white p-7 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] mb-12 flex flex-col gap-4"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Character, Realm, or Lore title..."
                    value={newLoreTitle}
                    onChange={(e) => setNewLoreTitle(e.target.value)}
                    className="flex-1 bg-[#FDFCF8] rounded-xl px-4 py-3 text-[14px] text-[#2D2824] outline-none font-sans"
                  />
                  <select
                    value={newLoreCategory}
                    onChange={(e) => setNewLoreCategory(e.target.value)}
                    className="bg-[#FDFCF8] rounded-xl px-4 py-3 text-[12px] font-bold uppercase text-[#2D2824] outline-none cursor-pointer font-sans"
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
                  className="w-full bg-[#FDFCF8] rounded-xl px-4 py-3 text-[14px] text-[#2D2824] outline-none resize-none font-sans"
                ></textarea>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="text-[11px] font-sans font-bold tracking-widest uppercase text-[#FDFCF8] bg-[#2D2824] px-6 py-3 rounded-xl hover:bg-black transition-all cursor-pointer shadow-sm"
                  >
                    Record in Codex
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                {loreEntries.map((lore) => (
                  <div
                    key={lore._id}
                    className="bg-white p-7 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-all hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-sans font-bold text-[#D4AF37] uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full">
                          {lore.category}
                        </span>
                        <button
                          onClick={() => deleteLore(lore._id)}
                          className="text-[#A39A8E] hover:text-[#C95C5C] transition-colors cursor-pointer text-lg p-1"
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
