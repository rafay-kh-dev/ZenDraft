import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Ensure your actual Render URL is correctly placed here
const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://zendraft-bau8.onrender.com";

export default function Dashboard() {
  const [drafts, setDrafts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDrafts = async () => {
      const token = localStorage.getItem("zenToken");
      // Kick them back to login if they aren't authenticated
      if (!token) return navigate("/");

      try {
        const res = await axios.get(`${API_BASE_URL}/api/drafts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDrafts(res.data);
      } catch (error) {
        console.error("Error fetching drafts:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("zenToken");
          navigate("/");
        }
      }
    };

    fetchDrafts();
  }, [navigate]);

  const createNewDraft = async () => {
    const token = localStorage.getItem("zenToken");
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/drafts`,
        { title: "", content: "" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // Instantly add the new draft to the top of the grid
      setDrafts([res.data, ...drafts]);
    } catch (error) {
      console.error("Error creating draft:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("zenToken");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Top Navbar */}
      <header className="flex justify-between items-center p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold tracking-wide">ZenDraft</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-gray-300">Your Drafts</h2>
          <button
            onClick={createNewDraft}
            className="bg-white text-gray-900 px-5 py-2 rounded-lg font-medium hover:bg-gray-200 transition shadow-md"
          >
            + New Draft
          </button>
        </div>

        {/* Google Keep Style Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {drafts.length === 0 ? (
            <p className="text-gray-500 col-span-full mt-10">
              No drafts yet. Start writing!
            </p>
          ) : (
            drafts.map((draft) => (
              <div
                key={draft._id}
                onClick={() => navigate(`/editor/${draft._id}`)}
                className="bg-gray-800 border border-gray-700 p-5 rounded-xl hover:border-gray-500 hover:shadow-lg transition cursor-pointer flex flex-col h-48"
              >
                <h3 className="font-semibold text-lg mb-2 truncate">
                  {draft.title || "Untitled Draft"}
                </h3>
                <p className="text-gray-400 text-sm flex-grow overflow-hidden text-ellipsis line-clamp-4">
                  {draft.content || "Empty canvas..."}
                </p>
                <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-700">
                  Edited {new Date(draft.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
