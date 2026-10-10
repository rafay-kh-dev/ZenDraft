export default function StudioHeader({
  currentView,
  searchQuery,
  setSearchQuery,
  wordsToday,
  dailyGoal,
  goalProgress,
  newFolderName,
  setNewFolderName,
  createProject,
  createNewChapter,
  selectedStatusFilter,
  setSelectedStatusFilter,
  statuses,
  getStatusDotColor,
  setIsSidebarOpen,
  userName,
  userPicture,
}) {
  const displayFirstName = userName ? userName.split(" ")[0] : "Author";

  return (
    <div className="sticky top-0 z-30 bg-[#FDFCF8]/95 backdrop-blur-md w-full border-b border-[#F2EFE9]/60">
      <header className="h-[80px] sm:h-[90px] flex items-center justify-between px-6 sm:px-12 w-full">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 text-[#2D2824] hover:bg-[#F2EFE9] rounded-xl transition-colors cursor-pointer"
          >
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="w-[200px] sm:w-[300px] relative group flex items-center">
            <svg
              className="w-4 h-4 text-[#A39A8E] absolute left-3.5 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search manuscripts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F7F5F0] focus:bg-white focus:shadow-xs py-2.5 pl-10 pr-8 rounded-full text-[13px] sm:text-[14px] font-sans text-[#2D2824] placeholder-[#B3ADA4] transition-all outline-none border border-transparent focus:border-[#E8E4DB]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-[#A39A8E] hover:text-[#2D2824] text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-[9px] sm:text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-[#A39A8E]">
                Daily Goal
              </span>
              <span className="text-[11px] sm:text-[12px] font-sans font-medium text-[#7A746D] ml-3">
                {Math.round(goalProgress)}%
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[12px] sm:text-[13px] font-sans font-semibold text-[#2D2824]">
                {wordsToday}{" "}
                <span className="text-[#B3ADA4] font-normal">
                  / {dailyGoal}
                </span>
              </span>
              <div className="w-20 sm:w-28 h-2 bg-[#F2EFE9] rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-[#D4AF37] transition-all duration-1000 rounded-full"
                  style={{ width: `${goalProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 sm:px-12 pb-5 pt-1 w-full max-w-[1250px]">
        {currentView === "projects" ? (
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
            <div>
              <span className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-[#D4AF37] mb-1 block">
                Collections
              </span>
              <h2 className="text-[36px] sm:text-[46px] text-[#2D2824] tracking-tight leading-none font-serif font-medium">
                Book Series
              </h2>
            </div>
            <form
              onSubmit={createProject}
              className="flex gap-3 w-full sm:w-auto"
            >
              <input
                type="text"
                placeholder="New series title..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="flex-1 sm:flex-initial bg-white shadow-xs rounded-xl px-4 py-2 text-[14px] text-[#2D2824] outline-none font-sans border border-[#E8E4DB]"
              />
              <button
                type="submit"
                className="text-[11px] font-sans font-bold tracking-widest uppercase text-[#FDFCF8] bg-[#2D2824] px-6 py-2 rounded-xl hover:bg-black transition-all cursor-pointer shrink-0 shadow-sm"
              >
                Conceive
              </button>
            </form>
          </div>
        ) : currentView === "bible" ? (
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-[#D4AF37] mb-1 block">
                Mythos & Lore
              </span>
              <h2 className="text-[36px] sm:text-[46px] text-[#2D2824] tracking-tight leading-none font-serif font-medium">
                Story Codex
              </h2>
            </div>
          </div>
        ) : currentView === "library" ? (
          // 🔥 Naya Library Header Section 🔥
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-[#D4AF37] mb-1 block">
                Curated Collection
              </span>
              <h2 className="text-[36px] sm:text-[46px] text-[#2D2824] tracking-tight leading-none font-serif font-medium">
                Inspiration Library
              </h2>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-5">
            <div>
              {currentView === "desk" && (
                <div className="flex items-center gap-3 mb-2">
                  {userPicture && (
                    <img
                      src={userPicture}
                      alt="Author"
                      className="w-8 h-8 rounded-full object-cover border border-[#E8E4DB] shadow-sm"
                    />
                  )}
                  <span className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-[#D4AF37]">
                    Welcome Back, {displayFirstName}
                  </span>
                </div>
              )}
              {currentView === "settings" && (
                <span className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-[#D4AF37] mb-1 block">
                  Preferences
                </span>
              )}

              <h2 className="text-[36px] sm:text-[46px] text-[#2D2824] tracking-tight leading-none font-serif font-medium mb-3">
                {currentView === "wastebasket"
                  ? "Discarded Pages"
                  : currentView === "settings"
                    ? "Studio Settings"
                    : "Your Desk"}
              </h2>

              {currentView === "desk" && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setSelectedStatusFilter("all")}
                    className={`text-[10px] font-sans font-bold tracking-widest uppercase px-4 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap shadow-xs ${selectedStatusFilter === "all" ? "bg-[#2D2824] text-white" : "bg-[#F7F5F0] text-[#7A746D] hover:bg-[#F2EFE9]"}`}
                  >
                    All
                  </button>
                  {statuses.map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedStatusFilter(st)}
                      className={`text-[10px] font-sans font-bold tracking-widest uppercase px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shadow-xs ${selectedStatusFilter === st ? "bg-[#2D2824] text-white" : "bg-[#F7F5F0] text-[#7A746D] hover:bg-[#F2EFE9]"}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${selectedStatusFilter === st ? "bg-white" : getStatusDotColor(st)}`}
                      ></span>
                      {st}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {currentView === "desk" && (
              <button
                onClick={createNewChapter}
                className="text-[11px] font-sans font-bold tracking-widest uppercase text-[#FDFCF8] bg-[#2D2824] px-7 py-3.5 rounded-full hover:bg-black hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer shadow-md self-start sm:self-auto"
              >
                New Manuscript
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
