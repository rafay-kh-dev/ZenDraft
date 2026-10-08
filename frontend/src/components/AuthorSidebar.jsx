import React from "react";

export default function AuthorSidebar({
  currentView,
  setCurrentView,
  confirmSignOut,
}) {
  const navItems = [
    {
      id: "desk",
      label: "My Desk",
      icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    },
    {
      id: "projects",
      label: "Projects",
      icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
    },
    {
      id: "bible",
      label: "Story Bible",
      icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    },
    {
      id: "wastebasket",
      label: "Wastebasket",
      icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
    },
  ];

  return (
    <aside className="w-[260px] h-screen bg-[#F9F8F5] border-r border-[#EAE7E0] flex flex-col fixed left-0 top-0">
      {/* Brand */}
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

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        <span className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-[#B3ADA4] ml-4 mb-4 block">
          Workspace
        </span>

        {navItems.map((item) => (
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

      {/* Footer / Logout */}
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
          Leave Studio
        </button>
      </div>
    </aside>
  );
}
