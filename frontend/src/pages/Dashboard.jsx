import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://zendraft-bau8.onrender.com";

export default function Dashboard() {
  const [allDrafts, setAllDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState("library"); // 'library' or 'trash'
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // 🔥 Updated tab title to show website name properly
    document.title = "My Library | PenDraft";
    fetchDrafts();
  }, [navigate]);

  const fetchDrafts = async () => {
    const token = localStorage.getItem("zenToken");
    if (!token) return navigate("/");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/drafts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedDrafts = res.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setAllDrafts(sortedDrafts);
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
    if(e) e.stopPropagation();
    const token = localStorage.getItem("zenToken");
    setAllDrafts(allDrafts.map(draft => draft._id === id ? { ...draft, ...attributesObj } : draft));
    try {
      await axios.put(`${API_BASE_URL}/api/drafts/${id}`, attributesObj, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Error updating draft:", error);
    }
  };

  const createNewChapter = async () => {
    const token = localStorage.getItem("zenToken");
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/drafts`,
        { title: "", content: "" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      navigate(`/editor/${res.data._id}`);
    } catch (error) {
      console.error("Error creating chapter:", error);
    }
  };

  const permanentDelete = async (id, e) => {
    e.stopPropagation();
    const confirmDelete = window.confirm("Are you sure you want to PERMANENTLY delete this chapter? This cannot be undone.");
    if (!confirmDelete) return;

    const token = localStorage.getItem("zenToken");
    try {
      await axios.delete(`${API_BASE_URL}/api/drafts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllDrafts(allDrafts.filter((draft) => draft._id !== id));
    } catch (error) {
      console.error("Error permanently deleting:", error);
    }
  };

  const handleAddTag = (id, currentTags, e) => {
    e.stopPropagation();
    const newTag = window.prompt("Enter a new tag (e.g., 'Draft', 'Character', 'Ideas'):");
    if (newTag && newTag.trim() !== "") {
      const updatedTags = [...(currentTags || []), newTag.trim()];
      updateDraftAttribute(id, { tags: updatedTags }, null);
    }
  };

  const handleRemoveTag = (id, currentTags, tagToRemove, e) => {
    e.stopPropagation();
    const updatedTags = currentTags.filter(t => t !== tagToRemove);
    updateDraftAttribute(id, { tags: updatedTags }, null);
  };

  const handleLogout = () => {
    localStorage.removeItem("zenToken");
    navigate("/");
  };

  const stripHtml = (html) => {
    if (!html) return "No content written yet...";
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const text = doc.body.textContent || "";
    return text.trim() ? text.substring(0, 120) + "..." : "No content written yet...";
  };

  const filteredDrafts = allDrafts.filter(draft => {
    const searchLower = searchQuery.toLowerCase();
    const titleMatch = (draft.title || "").toLowerCase().includes(searchLower);
    const contentMatch = (draft.content || "").toLowerCase().includes(searchLower);
    const tagMatch = (draft.tags || []).some(t => t.toLowerCase().includes(searchLower));
    return titleMatch || contentMatch || tagMatch;
  });

  const trashedDrafts = filteredDrafts.filter(draft => draft.isTrashed);
  const activeDrafts = filteredDrafts.filter(draft => !draft.isTrashed);
  const pinnedDrafts = activeDrafts.filter(draft => draft.isPinned);
  const unpinnedDrafts = activeDrafts.filter(draft => !draft.isPinned);

  const renderDraftList = (draftList, isTrashView = false, isPinnedSection = false) => {
    if (draftList.length === 0 && !isLoading && !isPinnedSection) {
       return (
         <div className="text-center py-16 border border-dashed border-[#D4D0C8] rounded-xl bg-[#F4F3EE]">
           <p className="text-[#8C8781] text-[18px] font-serif italic">
             {searchQuery ? "No matching manuscripts found." : isTrashView ? "Your recycle bin is empty." : "Your library is waiting for its first words."}
           </p>
         </div>
       );
    }

    return draftList.map((draft, index) => (
      <div
        key={draft._id}
        onClick={() => !isTrashView ? navigate(`/editor/${draft._id}`) : null}
        className={`group flex items-center justify-between py-5 border-b border-[#E8E5DF] last:border-none transition-all duration-300 ${!isTrashView ? 'cursor-pointer hover:bg-white hover:-mx-4 hover:px-4 rounded-xl hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)]' : 'opacity-80'}`}
      >
        <div className="flex items-start gap-5 flex-1 min-w-0 pr-6">
          <span className={`text-[16px] font-serif italic mt-1 w-6 text-right shrink-0 ${isTrashView ? 'text-[#D4D0C8]' : 'text-[#A39E98]'}`}>
            {draftList.length - index}.
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1.5">
              <h2 className={`text-[20px] transition-colors leading-snug truncate ${isTrashView ? 'text-[#8C8781]' : 'text-[#1A1A1A] group-hover:text-[#4A4742]'}`} style={{ fontFamily: "'Newsreader', serif" }}>
                {draft.title || "Untitled Chapter"}
              </h2>
              <div className="flex items-center gap-1.5 hidden sm:flex">
                {(draft.tags || []).map((tag, i) => (
                  <span key={i} className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#F0EFEA] border border-[#E8E5DF] text-[#5C5954] text-[11px] font-medium tracking-wide uppercase">
                    {tag}
                    {!isTrashView && (
                      <button onClick={(e) => handleRemoveTag(draft._id, draft.tags, tag, e)} className="hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1">×</button>
                    )}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-[14px] font-sans text-[#A39E98] truncate opacity-90">
              {stripHtml(draft.content)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] font-sans font-medium text-[#A39E98] uppercase tracking-wider hidden md:block mr-2">
            {new Date(draft.updatedAt).toLocaleDateString("en-AU", { month: "short", day: "numeric" })}
          </span>

          {!isTrashView ? (
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button onClick={(e) => handleAddTag(draft._id, draft.tags, e)} className="p-2 text-[#A39E98] hover:text-[#4A4742] hover:bg-[#F4F3EE] rounded-md transition-all" title="Add Tag">
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              </button>
              <button onClick={(e) => updateDraftAttribute(draft._id, { isPinned: !draft.isPinned }, e)} className={`p-2 rounded-md transition-all ${draft.isPinned ? 'text-[#EAB308] bg-[#FEF9C3]' : 'text-[#A39E98] hover:text-[#EAB308] hover:bg-[#FEF9C3]'}`} title={draft.isPinned ? "Unpin" : "Pin Chapter"}>
                <svg className="w-[18px] h-[18px]" fill={draft.isPinned ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
              </button>
              <button onClick={(e) => updateDraftAttribute(draft._id, { isTrashed: true, isPinned: false }, e)} className="p-2 text-[#A39E98] hover:text-[#C95C5C] hover:bg-[#FFF5F5] rounded-md transition-all ml-1" title="Move to trash">
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button onClick={(e) => updateDraftAttribute(draft._id, { isTrashed: false }, e)} className="p-2 text-[#8C8781] hover:text-[#10B981] hover:bg-[#ECFDF5] rounded-md transition-all" title="Restore chapter">
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
              </button>
              <button onClick={(e) => permanentDelete(draft._id, e)} className="p-2 text-[#8C8781] hover:text-white hover:bg-[#C95C5C] rounded-md transition-all" title="Delete permanently">
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1A1A1A] selection:bg-[#E5E0D5]">
      
      <header className="w-full border-b border-[#E8E5DF] bg-[#FAF9F5]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 w-1/4">
            <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l4 4-7 14-4-4 7-14z" fill="#1A1A1A" />
              <path d="M16 6l4 4-2 2-4-4 2-2z" fill="#C9BAA3" />
            </svg>
            <span className="font-serif italic text-[19px] text-[#2C2B29] font-medium tracking-tight">PenDraft</span>
          </div>

          <div className="flex-1 flex justify-center max-w-lg">
             <div className="relative w-full">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A39E98]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                  type="text" 
                  placeholder="Search by title, content, or tags..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#F4F3EE] hover:bg-[#EAE8E3] focus:bg-white border border-transparent focus:border-[#D4D0C8] rounded-full py-2 pl-11 pr-4 text-[13px] text-[#1A1A1A] placeholder-[#A39E98] transition-all outline-none shadow-inner"
                />
             </div>
          </div>

          <div className="w-1/4 flex justify-end">
            <button onClick={handleLogout} className="text-[11px] font-sans uppercase tracking-[0.15em] font-medium text-[#8C8781] hover:text-[#1A1A1A] transition-colors bg-white px-4 py-1.5 rounded-full border border-[#E8E5DF] shadow-sm">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-16 pb-32 w-full">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl text-[#1A1A1A] tracking-tight leading-tight transition-all" style={{ fontFamily: "'Newsreader', serif" }}>
              {currentView === 'trash' ? 'Trashed Entries' : 'Library'}
            </h1>
          </div>
          
          {currentView === 'library' && (
            <button onClick={createNewChapter} className="group flex items-center gap-2.5 text-white bg-[#1A1A1A] px-6 py-2.5 rounded-full hover:bg-[#333333] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="font-sans text-[13px] font-medium tracking-wide">Write</span>
            </button>
          )}
        </div>

        <div className="flex justify-between items-center mb-6 border-b border-[#E8E5DF] pb-4">
          <div className="flex gap-6">
            <button onClick={() => setCurrentView('library')} className={`text-[12px] font-semibold uppercase tracking-wider transition-colors ${currentView === 'library' ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A] pb-1' : 'text-[#A39E98] hover:text-[#5C5954]'}`}>
              Active Drafts ({activeDrafts.length})
            </button>
            <button onClick={() => setCurrentView('trash')} className={`text-[12px] font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${currentView === 'trash' ? 'text-[#C95C5C] border-b-2 border-[#C95C5C] pb-1' : 'text-[#A39E98] hover:text-[#C95C5C]'}`}>
              Trash ({trashedDrafts.length})
            </button>
          </div>
        </div>

        <div className="flex flex-col">
          {isLoading ? (
            <div className="text-center py-16">
               <div className="animate-pulse flex flex-col items-center gap-4">
                  <div className="h-3 bg-[#E8E5DF] rounded w-1/6"></div>
                  <div className="h-3 bg-[#E8E5DF] rounded w-1/3"></div>
               </div>
            </div>
          ) : currentView === 'trash' ? (
            renderDraftList(trashedDrafts, true)
          ) : (
            <>
              {pinnedDrafts.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2 px-2 text-[#EAB308]">
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                     <span className="text-[11px] font-bold uppercase tracking-widest">Pinned</span>
                  </div>
                  <div className="bg-white rounded-2xl p-2 shadow-sm border border-[#E8E5DF]">
                    {renderDraftList(pinnedDrafts, false, true)}
                  </div>
                </div>
              )}
              
              <div className="px-2">
                 {pinnedDrafts.length > 0 && unpinnedDrafts.length > 0 && (
                   <span className="text-[11px] font-bold uppercase tracking-widest text-[#A39E98] mb-4 block">Recent Drafts</span>
                 )}
                 {renderDraftList(unpinnedDrafts, false)}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}