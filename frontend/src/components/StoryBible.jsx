import React from "react";

export default function StoryBible({
  theme,
  isNotesOpen,
  storyNotes,
  setStoryNotes,
}) {
  return (
    <aside
      className={`fixed right-0 top-0 h-full w-80 ${theme.bgDrawer} border-l ${
        theme.border
      } shadow-xl z-40 flex flex-col transition-transform duration-500 ease-in-out ${
        isNotesOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <textarea
        dir="auto"
        value={storyNotes}
        onChange={(e) => setStoryNotes(e.target.value)}
        placeholder="Jot down character details..."
        className={`flex-1 w-full bg-transparent resize-none p-6 mt-16 text-[16px] leading-relaxed ${theme.textMuted} focus:outline-none custom-scrollbar`}
        style={{ fontFamily: "'Newsreader', serif" }}
      />
    </aside>
  );
}
