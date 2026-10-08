export default function ManuscriptGrid({
  draftList,
  isTrashView = false,
  listType = "unpinned",
  navigate,
  updateDraftAttribute,
  confirmMoveToTrash,
  confirmRestore,
  confirmPermanentDelete,
  stripHtml,
  getWordCount,
  getReadingTime,
  handleDragStart,
  handleDragOver,
  handleDragEnter,
  handleDragLeave,
  handleDrop,
  draggedId,
  dragOverId,
  openStatusId,
  setOpenStatusId,
  getStatusDotColor,
  statuses,
  isLoading,
}) {
  if (draftList.length === 0 && !isLoading) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-20 text-[#A39A8E]">
        <p className="text-[17px] font-serif italic tracking-wide">
          {isTrashView
            ? "The discarded pages are completely clear."
            : "Your desk is quiet. Begin crafting your next chapter."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
      {draftList.map((draft) => (
        <div
          key={draft._id}
          onDragOver={(e) => handleDragOver(e, draft._id)}
          onDragEnter={(e) => handleDragEnter(e, draft._id, listType)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, draft._id, listType)}
          onClick={() =>
            !isTrashView ? navigate(`/editor/${draft._id}`) : null
          }
          className={`group relative flex flex-col justify-between p-7 h-[280px] transition-all duration-300 ease-out rounded-2xl bg-white shadow-[0_4px_25px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.07)] hover:-translate-y-1 cursor-pointer
            ${!isTrashView ? "" : "opacity-75 bg-[#F9F8F6] cursor-default"} 
            ${draggedId === draft._id ? "opacity-30 scale-95 border-2 border-dashed border-[#2D2824]" : ""}
            ${dragOverId === draft._id && draggedId !== draft._id ? "border-2 border-[#D4AF37] shadow-lg scale-[1.02]" : ""}
          `}
        >
          <div className="flex justify-between items-center mb-3">
            {!isTrashView ? (
              <div className="flex items-center gap-2">
                <div
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, draft._id)}
                  onClick={(e) => e.stopPropagation()}
                  title="Drag to reorder"
                  className="p-1.5 rounded-lg text-[#C4BCB0] hover:text-[#2D2824] hover:bg-[#F2EFE9] cursor-grab active:cursor-grabbing transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-2 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8-14a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-2 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm2 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
                  </svg>
                </div>

                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() =>
                      setOpenStatusId(
                        openStatusId === draft._id ? null : draft._id,
                      )
                    }
                    className="flex items-center gap-2 bg-[#F7F5F0] hover:bg-[#F2EFE9] px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${getStatusDotColor(draft.status || "Conception")}`}
                    ></span>
                    <span className="text-[10px] font-sans font-bold text-[#7A746D] uppercase tracking-widest">
                      {draft.status || "Conception"}
                    </span>
                    <svg
                      className="w-3 h-3 text-[#A39A8E]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {openStatusId === draft._id && (
                    <div className="absolute left-0 mt-2 w-36 bg-white rounded-xl shadow-xl py-1.5 z-50 animate-fade-in">
                      {statuses.map((st) => (
                        <button
                          key={st}
                          onClick={() => {
                            updateDraftAttribute(
                              draft._id,
                              { status: st },
                              null,
                            );
                            setOpenStatusId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-[11px] font-sans font-bold uppercase tracking-wider text-[#7A746D] hover:bg-[#F7F5F0] hover:text-[#2D2824] flex items-center gap-2.5 transition-colors"
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${getStatusDotColor(st)}`}
                          ></span>
                          {st}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-[10px] font-sans font-bold text-[#C95C5C] uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full">
                Discarded
              </span>
            )}

            {!isTrashView && (
              <button
                onClick={(e) =>
                  updateDraftAttribute(
                    draft._id,
                    { isPinned: !draft.isPinned },
                    e,
                  )
                }
                className={`p-1.5 rounded-full transition-all cursor-pointer ${draft.isPinned ? "text-[#D4AF37] bg-[#FDFCF8]" : "text-[#DCD8D0] hover:text-[#2D2824] opacity-0 group-hover:opacity-100"}`}
                title={draft.isPinned ? "Unpin" : "Pin Chapter"}
              >
                <svg
                  className="w-[16px] h-[16px]"
                  fill={draft.isPinned ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-hidden relative pr-2">
            <h2 className="text-[21px] text-[#2D2824] leading-snug mb-2.5 line-clamp-2 font-serif font-medium tracking-tight">
              {draft.title || "Untitled Chapter"}
            </h2>
            <p className="text-[13.5px] text-[#7A746D] leading-relaxed line-clamp-3 font-sans font-light">
              {stripHtml(draft.content)}
            </p>
            <div
              className={`absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t ${!isTrashView ? "from-white" : "from-[#F9F8F6]"} to-transparent`}
            ></div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-sans text-[#A39A8E] font-medium tracking-wider">
                {getWordCount(draft.content)} words
              </span>
              <span className="text-[10px] font-sans text-[#DCD8D0]">•</span>
              <span className="text-[10px] font-sans text-[#B3ADA4] font-medium tracking-wider">
                {getReadingTime(draft.content)}
              </span>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {!isTrashView ? (
                <button
                  onClick={(e) => confirmMoveToTrash(draft._id, e)}
                  className="text-[#A39A8E] hover:text-[#C95C5C] transition-colors cursor-pointer p-1.5 rounded-full hover:bg-red-50"
                  title="Discard"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              ) : (
                <>
                  <button
                    onClick={(e) => confirmRestore(draft._id, e)}
                    className="text-[#A39A8E] hover:text-[#2D2824] transition-colors cursor-pointer p-1.5"
                    title="Recover"
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
                        d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => confirmPermanentDelete(draft._id, e)}
                    className="text-[#A39A8E] hover:text-[#C95C5C] transition-colors cursor-pointer p-1.5"
                    title="Shred"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
