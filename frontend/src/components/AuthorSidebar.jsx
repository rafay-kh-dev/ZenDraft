export default function AuthorSidebar({
  currentView,
  setCurrentView,
  isOpen,
  setIsOpen,
}) {
  const navItems = [
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
  ];

  const handleSignOut = () => {
    localStorage.removeItem("zenToken");
    window.location.href = "/";
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#FDFCF8]/80 backdrop-blur-xs md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`w-[260px] h-screen bg-[#F9F8F5] flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 select-none ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="h-[80px] sm:h-[90px] flex items-center justify-between px-8">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              className="w-6 h-6"
            >
              <path
                d="M4 3.5C4 2.67157 4.67157 2 5.5 2H19C19.5523 2 20 2.44772 20 3V20.5C20 21.3284 19.3284 22 18.5 22H5.5C4.67157 22 4 21.3284 4 20.5V3.5Z"
                fill="#E5E0D5"
              />
              <path
                d="M4 3.5C4 2.67157 4.67157 2 5.5 2H8V22H5.5C4.67157 22 4 21.3284 4 20.5V3.5Z"
                fill="#2D2824"
              />
              <path d="M13 2H16.5V14L14.75 12L13 14V2Z" fill="#D4AF37" />
              <rect
                x="10"
                y="7"
                width="6"
                height="2"
                rx="1"
                fill="#2D2824"
                opacity="0.85"
              />
              <rect
                x="10"
                y="11"
                width="4"
                height="2"
                rx="1"
                fill="#2D2824"
                opacity="0.85"
              />
            </svg>
            <span className="font-serif italic text-[19px] ml-3 text-[#2D2824]">
              PenDraft
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-[#A39A8E] hover:text-[#2D2824] p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <span className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-[#B3ADA4] ml-4 mb-3 block">
            Workspace
          </span>

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-sans text-[13px] font-medium cursor-pointer relative group
                ${
                  currentView === item.id
                    ? "bg-white text-[#2D2824] shadow-[0_4px_20px_rgba(0,0,0,0.03)] font-semibold"
                    : "text-[#8C8781] hover:bg-[#F2EFE9] hover:text-[#2D2824]"
                }`}
            >
              {currentView === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#D4AF37] rounded-r-full"></div>
              )}
              <svg
                className={`w-[16px] h-[16px] transition-colors ${currentView === item.id ? "text-[#2D2824]" : "text-[#A39A8E] group-hover:text-[#2D2824]"}`}
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

        <div className="p-6">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#A39A8E] hover:text-[#C95C5C] hover:bg-red-50/50 transition-all cursor-pointer font-sans text-[13px] font-medium rounded-xl"
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
    </>
  );
}
