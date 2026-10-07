import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://zendraft-bau8.onrender.com";

export default function Dashboard() {
  const [drafts, setDrafts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDrafts = async () => {
      const token = localStorage.getItem("zenToken");
      if (!token) return navigate("/");
      try {
        const res = await axios.get(`${API_BASE_URL}/api/drafts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDrafts(res.data);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("zenToken");
          navigate("/");
        }
      }
    };
    fetchDrafts();
  }, [navigate]);

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

  const deleteChapter = async (id, e) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this chapter?",
    );
    if (!confirmDelete) return;

    const token = localStorage.getItem("zenToken");
    try {
      await axios.delete(`${API_BASE_URL}/api/drafts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDrafts(drafts.filter((draft) => draft._id !== id));
    } catch (error) {
      console.error("Error deleting chapter:", error);
      alert("Error: Backend server ko restart karein.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("zenToken");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1A1A1A] selection:bg-[#E5E0D5]">
      {/* Premium Structured Header */}
      <header className="w-full border-b border-[#E8E5DF] bg-[#FAF9F5]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Elegant Icon */}
            <div className="w-6 h-6 bg-[#2C2B29] rounded flex items-center justify-center">
              <span className="text-[#FAF9F5] font-serif italic text-xs font-bold leading-none mt-[2px]">
                Z
              </span>
            </div>
            <span className="font-serif italic text-[18px] text-[#2C2B29] font-medium">
              ZenDraft
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="text-[12px] font-sans uppercase tracking-[0.15em] font-medium text-[#8C8781] hover:text-[#1A1A1A] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Manuscript Workspace */}
      <main className="max-w-3xl mx-auto px-6 pt-16 pb-32 w-full">
        {/* Title Page Aesthetic */}
        <div className="text-center mb-16">
          <p className="text-[11px] font-sans uppercase tracking-[0.3em] text-[#A39E98] mb-4">
            Current Project
          </p>
          <h1
            className="text-5xl md:text-6xl text-[#1A1A1A] tracking-tight leading-tight mb-6"
            style={{ fontFamily: "'Newsreader', serif" }}
          >
            The Manuscript
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-[1px] bg-[#D4D0C8]"></div>
            <p className="text-[#8C8781] font-serif italic text-[15px]">
              {drafts.length} {drafts.length === 1 ? "Entry" : "Entries"}
            </p>
            <div className="w-12 h-[1px] bg-[#D4D0C8]"></div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end mb-8">
          <button
            onClick={createNewChapter}
            className="group flex items-center gap-2 text-[#1A1A1A] bg-white border border-[#E8E5DF] px-5 py-2.5 rounded-full hover:shadow-[0_2px_10px_rgb(0,0,0,0.04)] hover:border-[#D4D0C8] transition-all duration-300"
          >
            <svg
              className="w-4 h-4 text-[#8C8781] group-hover:text-[#1A1A1A] transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="font-sans text-[13px] font-medium">
              Write New Chapter
            </span>
          </button>
        </div>

        {/* Refined Chapter List */}
        <div className="flex flex-col">
          {drafts.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[#D4D0C8] rounded-xl bg-[#F4F3EE]">
              <p className="text-[#8C8781] text-[18px] font-serif italic">
                Your manuscript is waiting for its first words.
              </p>
            </div>
          ) : (
            drafts.map((draft, index) => (
              <div
                key={draft._id}
                onClick={() => navigate(`/editor/${draft._id}`)}
                className="group flex items-center justify-between py-6 border-b border-[#E8E5DF] last:border-none cursor-pointer hover:bg-white hover:-mx-4 hover:px-4 rounded-xl transition-all duration-300"
              >
                {/* Number & Text Content */}
                <div className="flex items-start gap-6 flex-1 min-w-0 pr-8">
                  <span className="text-[18px] text-[#C4BEB5] font-serif italic mt-1 w-6 text-right shrink-0">
                    {drafts.length - index}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-[22px] text-[#1A1A1A] group-hover:text-[#5C5954] transition-colors leading-snug truncate mb-1"
                      style={{ fontFamily: "'Newsreader', serif" }}
                    >
                      {draft.title || "Untitled Chapter"}
                    </h3>
                    {/* Content Preview / Excerpt */}
                    <p className="text-[14px] font-sans text-[#A39E98] truncate opacity-80">
                      {draft.content
                        ? draft.content.replace(/\n/g, " ")
                        : "No content written yet..."}
                    </p>
                  </div>
                </div>

                {/* Right Side: Date & Actions */}
                <div className="flex items-center gap-6 shrink-0">
                  <span className="text-[12px] font-sans font-medium text-[#A39E98] uppercase tracking-wider hidden sm:block">
                    {new Date(draft.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>

                  {/* Subtle Trash Icon */}
                  <button
                    onClick={(e) => deleteChapter(draft._id, e)}
                    className="p-2 opacity-0 group-hover:opacity-100 text-[#C9BAA3] hover:text-[#C95C5C] hover:bg-[#FFF5F5] rounded-md transition-all duration-300"
                    title="Delete chapter"
                  >
                    <svg
                      className="w-[18px] h-[18px]"
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
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
