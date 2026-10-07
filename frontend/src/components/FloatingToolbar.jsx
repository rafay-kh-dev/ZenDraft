import React from 'react';

const TEXT_COLORS = ["#1C1B1A","#6B7280","#EF4444","#F97316","#F59E0B","#10B981","#3B82F6","#6366F1","#8B5CF6","#EC4899"];
const HIGHLIGHT_COLORS = ["#FEF08A","#BBF7D0","#BFDBFE","#DDD6FE","#FBCFE8","#FECACA","#FED7AA","#E5E7EB","#000000"];

export default function FloatingToolbar({
  theme,
  isDarkMode,
  isTyping,
  inlineMenu,
  colorMenuObj,
  setColorMenuObj,
  formatText
}) {
  
  const handleClearHighlight = (e) => {
    e.preventDefault();
    formatText("backColor", "transparent"); 
    formatText("removeFormat"); 
  };

  return (
    <>
      {inlineMenu.visible && (
        <div className={`fixed z-50 flex items-center ${theme.glassBg} backdrop-blur-2xl rounded-xl px-1.5 py-1.5 border ${isDarkMode ? 'border-white/10' : 'border-black/5'} shadow-[0_8px_30px_rgba(0,0,0,0.12)] transform -translate-x-1/2 -translate-y-full`} style={{ top: `${inlineMenu.y - 14}px`, left: `${inlineMenu.x}px` }}>
          <button onMouseDown={(e) => { e.preventDefault(); formatText("bold"); }} className={`w-8 h-8 flex items-center justify-center rounded-md ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} font-serif font-bold text-[15px] transition-colors`}>B</button>
          <button onMouseDown={(e) => { e.preventDefault(); formatText("italic"); }} className={`w-8 h-8 flex items-center justify-center rounded-md ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} font-serif italic text-[15px] transition-colors`}>I</button>
          <button onMouseDown={(e) => { e.preventDefault(); formatText("underline"); }} className={`w-8 h-8 flex items-center justify-center rounded-md ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} font-serif underline text-[15px] transition-colors`}>U</button>
          <div className={`w-[1px] h-5 ${isDarkMode ? "bg-[#444]" : "bg-[#DDD]"} mx-1.5`}></div>
          <button onMouseDown={(e) => { e.preventDefault(); formatText("backColor", "#FEF08A"); }} className="w-6 h-6 m-1 rounded-full bg-[#FEF08A] hover:scale-110 transition-transform shadow-inner border border-yellow-300"></button>
          <button onMouseDown={(e) => { e.preventDefault(); formatText("backColor", "#BBF7D0"); }} className="w-6 h-6 m-1 rounded-full bg-[#BBF7D0] hover:scale-110 transition-transform shadow-inner border border-green-300"></button>
          <button onMouseDown={handleClearHighlight} title="Remove Highlight" className={`w-8 h-8 flex items-center justify-center rounded-md ${theme.textMuted} ${theme.hoverBg} hover:text-red-500 transition-colors`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* 🔥 UPGRADED SHADOW & GLASSMORPHISM 🔥 */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-40 transition-all duration-700 ${isTyping ? "opacity-0 translate-y-12 pointer-events-none" : "opacity-100 translate-y-0"}`}>
        
        {colorMenuObj && (
          <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-5 p-3.5 rounded-2xl ${theme.glassBg} backdrop-blur-2xl border ${isDarkMode ? 'border-white/10' : 'border-black/5'} shadow-[0_12px_40px_rgba(0,0,0,0.15)] flex flex-wrap gap-2 w-56 z-50`}>
            
            <button 
              onMouseDown={(e) => { 
                e.preventDefault(); 
                if(colorMenuObj === 'highlight') handleClearHighlight(e); 
                else formatText("foreColor", isDarkMode ? "#E8E6E1" : "#1C1B1A"); 
              }} 
              title={colorMenuObj === 'highlight' ? "Remove Highlight" : "Reset Text Color"} 
              className={`w-8 h-8 rounded-full transition-transform hover:scale-110 shadow-sm border ${isDarkMode ? "border-[#444] bg-[#222]" : "border-gray-200 bg-white"} flex items-center justify-center`}
            >
                <span className="text-[11px] text-red-500 font-bold">X</span>
            </button>

            {(colorMenuObj === "text" ? TEXT_COLORS : HIGHLIGHT_COLORS).map((color, i) => {
              if(color === 'transparent') return null;
              return (
                <button
                  key={i}
                  onMouseDown={(e) => { e.preventDefault(); formatText(colorMenuObj === "text" ? "foreColor" : "backColor", color); }}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 shadow-sm border ${isDarkMode ? "border-[#444]" : "border-gray-200"} flex items-center justify-center`}
                  style={{ backgroundColor: color }}
                />
              )
            })}
            
            <div className="relative w-8 h-8 rounded-full border border-gray-300 overflow-hidden cursor-pointer flex items-center justify-center bg-gradient-to-tr from-red-500 via-green-500 to-blue-500 hover:scale-110 transition-transform shadow-sm" title="Custom Color">
              <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onInput={(e) => { formatText(colorMenuObj === "text" ? "foreColor" : "backColor", e.target.value); }} />
            </div>
          </div>
        )}

        <div className={`flex items-center ${theme.glassBg} backdrop-blur-2xl rounded-full px-3 py-2.5 gap-1.5 border ${isDarkMode ? 'border-white/10' : 'border-black/5'} shadow-[0_8px_32px_rgba(0,0,0,0.1)]`}>
          <button onMouseDown={(e) => { e.preventDefault(); formatText("undo"); }} className={`w-10 h-10 flex items-center justify-center rounded-full ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} transition-colors`}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg></button>
          <button onMouseDown={(e) => { e.preventDefault(); formatText("redo"); }} className={`w-10 h-10 flex items-center justify-center rounded-full ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} transition-colors`}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg></button>
          <div className={`w-[1px] h-6 ${isDarkMode ? "bg-[#444]" : "bg-[#DDD]"} mx-2`}></div>
          <button onMouseDown={(e) => { e.preventDefault(); formatText("bold"); }} className={`w-10 h-10 flex items-center justify-center rounded-full ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} transition-colors font-serif font-bold text-[17px]`}>B</button>
          <button onMouseDown={(e) => { e.preventDefault(); formatText("italic"); }} className={`w-10 h-10 flex items-center justify-center rounded-full ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} transition-colors font-serif italic text-[17px]`}>I</button>
          <button onMouseDown={(e) => { e.preventDefault(); formatText("underline"); }} className={`w-10 h-10 flex items-center justify-center rounded-full ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} transition-colors font-serif underline text-[17px]`}>U</button>
          <div className={`w-[1px] h-6 ${isDarkMode ? "bg-[#444]" : "bg-[#DDD]"} mx-2`}></div>
          <button onMouseDown={(e) => { e.preventDefault(); setColorMenuObj(colorMenuObj === 'text' ? null : 'text'); }} className={`w-10 h-10 flex items-center justify-center rounded-full ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} transition-colors font-serif font-bold text-[16px] relative`}>
            A<span className="w-3.5 h-0.5 bg-[#EF4444] absolute bottom-2.5 rounded-full"></span>
          </button>
          <button onMouseDown={(e) => { e.preventDefault(); setColorMenuObj(colorMenuObj === 'highlight' ? null : 'highlight'); }} className={`w-10 h-10 flex items-center justify-center rounded-full ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} transition-colors`}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
          <div className={`w-[1px] h-6 ${isDarkMode ? "bg-[#444]" : "bg-[#DDD]"} mx-2`}></div>
          <button onMouseDown={(e) => { e.preventDefault(); formatText("justifyLeft"); }} className={`w-10 h-10 flex items-center justify-center rounded-full ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} transition-colors`}><svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h10M4 18h16" /></svg></button>
          <button onMouseDown={(e) => { e.preventDefault(); formatText("justifyCenter"); }} className={`w-10 h-10 flex items-center justify-center rounded-full ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} transition-colors`}><svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M7 12h10M4 18h16" /></svg></button>
          <button onMouseDown={(e) => { e.preventDefault(); formatText("justifyRight"); }} className={`w-10 h-10 flex items-center justify-center rounded-full ${theme.textMuted} ${theme.hoverBg} hover:${theme.textMain} transition-colors`}><svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M10 12h10M4 18h16" /></svg></button>
        </div>
      </div>
    </>
  );
}