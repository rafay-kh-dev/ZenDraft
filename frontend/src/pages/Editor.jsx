import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://zendraft-bau8.onrender.com"; // Apna Render URL yahan zaroor dalein

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saveStatus, setSaveStatus] = useState("All changes saved");

  // Yeh ref humein batayega ke component pehli dafa load ho raha hai
  const isInitialRender = useRef(true);

  // 1. Data Fetch karne ka logic (Sirf ek dafa chalega jab draft open hoga)
  useEffect(() => {
    const fetchSingleDraft = async () => {
      const token = localStorage.getItem("zenToken");
      try {
        const res = await axios.get(`${API_BASE_URL}/api/drafts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTitle(res.data.title);
        setContent(res.data.content);
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
    };
    fetchSingleDraft();
  }, [id]);

  // 2. Auto-Save Debounce Logic
  useEffect(() => {
    // Pehli dafa page load hote hi save trigger hone se rokna
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    setSaveStatus("Saving...");

    // Jab user type karna rokta hai, uske 1 second baad save hit hoga
    const saveDebounce = setTimeout(async () => {
      const token = localStorage.getItem("zenToken");
      try {
        await axios.put(
          `${API_BASE_URL}/api/drafts/${id}`,
          { title, content },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setSaveStatus("Saved to cloud");
      } catch (error) {
        setSaveStatus("Error saving");
      }
    }, 1000);

    // Agar 1 second se pehle user dobara type kare, toh purana timer cancel kar do
    return () => clearTimeout(saveDebounce);
  }, [title, content, id]);

  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-100 font-sans flex flex-col">
      {/* Sleek Minimal Header */}
      <header className="flex justify-between items-center px-8 py-6 max-w-5xl w-full mx-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="group flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">
            ←
          </span>
          Dashboard
        </button>

        {/* Live Save Indicator */}
        <div className="flex items-center text-sm font-medium text-gray-500">
          {saveStatus === "Saving..." ? (
            <span className="animate-pulse text-gray-400">Saving...</span>
          ) : saveStatus === "Error saving" ? (
            <span className="text-red-400">Offline / Error</span>
          ) : (
            <span className="text-gray-500">✓ {saveStatus}</span>
          )}
        </div>
      </header>

      {/* Distraction-Free Writing Canvas */}
      <main className="flex-grow px-8 py-10 max-w-3xl w-full mx-auto flex flex-col">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Draft Title"
          className="w-full bg-transparent text-5xl font-extrabold text-white mb-8 focus:outline-none placeholder-gray-700 tracking-tight"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          className="w-full flex-grow bg-transparent text-xl text-gray-300 leading-loose focus:outline-none resize-none placeholder-gray-700/50"
        />
      </main>
    </div>
  );
}
