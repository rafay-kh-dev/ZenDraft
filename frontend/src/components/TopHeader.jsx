import React from "react";
import { useNavigate } from "react-router-dom";

export default function TopHeader({
  theme,
  isTyping,
  wordCount,
  DAILY_GOAL,
  readingTime,
  progressPercentage,
  saveStatus,
  isDarkMode,
  setIsDarkMode,
  exportManuscript,
  toggleFullscreen,
  isNotesOpen,
  setIsNotesOpen,
}) {
  const navigate = useNavigate();

  return (
    <header
      className={`sticky top-0 w-full px-8 py-5 flex justify-between items-center transition-all duration-700 z-30 ${isTyping ? "opacity-0 -translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"}`}
    >
      <button
        onClick={() => navigate("/library")}
        className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-full ${theme.textMuted} hover:${theme.textMain} ${isDarkMode ? "hover:bg-white/5" : "hover:bg-black/5"} transition-all`}
      >
        <svg
          className="w-[18px] h-[18px] transform group-hover:-translate-x-1 transition-transform"
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
        <span className="text-[11px] uppercase tracking-[0.2em] font-semibold">
          Library
        </span>
      </button>

      <div className="flex items-center gap-6">
        <div
          className={`flex items-center gap-4 text-[10px] uppercase tracking-[0.15em] font-semibold ${theme.textMuted} hidden md:flex`}
        >
          <div
            className="flex items-center gap-2 group cursor-default"
            title={`${wordCount} / ${DAILY_GOAL} words today`}
          >
            <div className="relative flex items-center justify-center w-[18px] h-[18px]">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  className={`${isDarkMode ? "text-[#333333]" : "text-[#E8E6E1]"}`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                />
                <path
                  className={`${isDarkMode ? "text-[#E8E6E1]" : "text-[#1C1B1A]"} transition-all duration-1000 ease-out`}
                  strokeDasharray={`${progressPercentage}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
              </svg>
            </div>
            <span className={`transition-colors group-hover:${theme.textMain}`}>
              {readingTime} min read
            </span>
          </div>

          <span
            className={`w-1 h-1 rounded-full ${isDarkMode ? "bg-[#333]" : "bg-[#DDD]"}`}
          ></span>

          <span
            className={`${saveStatus === "Saving..." ? `animate-pulse ${theme.textMain}` : ""}`}
          >
            {saveStatus}
          </span>
        </div>

        <div className={`flex items-center gap-1.5`}>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="Toggle Theme"
            className={`w-9 h-9 flex items-center justify-center rounded-full ${theme.textMuted} ${isDarkMode ? "hover:bg-white/10" : "hover:bg-black/5"} hover:${theme.textMain} transition-colors`}
          >
            {isDarkMode ? (
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
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
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
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          <button
            onClick={exportManuscript}
            title="Export to PDF"
            className={`w-9 h-9 flex items-center justify-center rounded-full ${theme.textMuted} ${isDarkMode ? "hover:bg-white/10" : "hover:bg-black/5"} hover:${theme.textMain} transition-colors`}
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button>

          <button
            onClick={toggleFullscreen}
            title="Zen Mode"
            className={`w-9 h-9 flex items-center justify-center rounded-full ${theme.textMuted} ${isDarkMode ? "hover:bg-white/10" : "hover:bg-black/5"} hover:${theme.textMain} transition-colors`}
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
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l5-5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>

          <button
            onClick={() => setIsNotesOpen(!isNotesOpen)}
            title="Story Bible"
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 ${isNotesOpen ? (isDarkMode ? "bg-[#E8E6E1] text-[#111111] shadow-[0_0_15px_rgba(255,255,255,0.1)]" : "bg-[#1C1B1A] text-[#FDFCF8] shadow-[0_0_15px_rgba(0,0,0,0.1)]") : `${theme.textMuted} ${isDarkMode ? "hover:bg-white/10" : "hover:bg-black/5"} hover:${theme.textMain}`}`}
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
