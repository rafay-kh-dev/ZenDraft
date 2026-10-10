import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import TopHeader from "../components/TopHeader";
import FloatingToolbar from "../components/FloatingToolbar";
import StoryBible from "../components/StoryBible";

const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://zendraft-bau8.onrender.com";

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [isTyping, setIsTyping] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [storyNotes, setStoryNotes] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [colorMenuObj, setColorMenuObj] = useState(null);
  const [inlineMenu, setInlineMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
  });

  // 🔥 Nayi state auto-save trigger karne ke liye
  const [contentTrigger, setContentTrigger] = useState(0);

  const editorRef = useRef(null);
  const contentRef = useRef("");
  const typingTimeoutRef = useRef(null);
  const isInitialRender = useRef(true);

  const DAILY_GOAL = 1000;

  // 🔥 Updated Word Count Logic for extreme accuracy
  const wordCount = contentRef.current
    ? contentRef.current
        .replace(/<[^>]*>?/gm, " ") // Tags ko space se replace karega taake words na jurein
        .replace(/&nbsp;/g, " ") // HTML empty spaces ko real space banayega
        .trim()
        .split(/\s+/) // Safely kisi bhi space se split karega
        .filter(Boolean).length
    : 0;

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const progressPercentage = Math.min((wordCount / DAILY_GOAL) * 100, 100);

  const theme = {
    bgApp: isDarkMode ? "bg-[#111111]" : "bg-[#FDFCF8]",
    bgDrawer: isDarkMode ? "bg-[#1A1A1A]" : "bg-[#F5F4EF]",
    textMain: isDarkMode ? "text-[#E8E6E1]" : "text-[#1C1B1A]",
    textMuted: isDarkMode ? "text-[#8A8782]" : "text-[#7A7772]",
    border: isDarkMode ? "border-[#2A2A2A]" : "border-[#E8E6E1]",
    glassBg: isDarkMode ? "bg-[#111111]/80" : "bg-[#FDFCF8]/80",
    hoverBg: isDarkMode ? "hover:bg-[#222222]" : "hover:bg-[#F0EFEA]",
    placeholder: isDarkMode ? "placeholder-[#555555]" : "placeholder-[#D0CCC5]",
    selectionBg: isDarkMode ? "#333333" : "#E5E2D9",
    selectionText: isDarkMode ? "#FFFFFF" : "#000000",
  };

  // 🔥 DYNAMIC TAB TITLE & URL SLUG LOGIC 🔥
  useEffect(() => {
    // 1. Update browser tab title dynamically
    document.title = title ? `${title}` : "Untitled Draft";

    // 2. Generate and update URL slug dynamically
    if (title) {
      const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
        .replace(/[\s-]+/g, "-"); // Replace spaces with hyphens

      // Safely update browser URL without refreshing the page
      window.history.replaceState(null, "", `/editor/${id}?draft=${slug}`);
    } else {
      window.history.replaceState(null, "", `/editor/${id}`);
    }
  }, [title, id]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("zenToken");

      if (!token) return navigate("/");

      try {
        const currRes = await axios.get(`${API_BASE_URL}/api/drafts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTitle(currRes.data.title || "");

        contentRef.current = currRes.data.content || "";

        if (editorRef.current) {
          editorRef.current.innerHTML = contentRef.current;
        }

        setStoryNotes(currRes.data.notes || "");
      } catch (error) {
        console.error("Fetch Data Error:", error);
      }
    };

    fetchData();
  }, [id, navigate]);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    if (!title && !contentRef.current && !storyNotes) return;

    setSaveStatus("Saving...");

    const saveDebounce = setTimeout(async () => {
      const token = localStorage.getItem("zenToken");

      try {
        await axios.put(
          `${API_BASE_URL}/api/drafts/${id}`,
          {
            title,
            content: contentRef.current,
            notes: storyNotes,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setSaveStatus("Saved");
      } catch (error) {
        setSaveStatus("Offline");
      }
    }, 1500);

    return () => clearTimeout(saveDebounce);
  }, [title, contentTrigger, storyNotes, id]); // 🔥 Updated dependency to contentTrigger

  const handleInput = (e) => {
    contentRef.current = e.currentTarget.innerHTML;
    setContentTrigger((prev) => prev + 1); // 🔥 Forces the auto-save effect to register the change

    triggerFocusMode();
    checkSelection();
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    triggerFocusMode();
  };

  const triggerFocusMode = () => {
    setIsTyping(true);
    setColorMenuObj(null);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2500);
  };

  const formatText = (command, val = null) => {
    document.execCommand(command, false, val);

    if (editorRef.current) {
      contentRef.current = editorRef.current.innerHTML;
      setContentTrigger((prev) => prev + 1); // Force save on formatting change too
      editorRef.current.focus();
      checkSelection();
    }

    if (
      command === "foreColor" ||
      command === "backColor" ||
      command === "removeFormat"
    ) {
      window.getSelection().removeAllRanges();

      setInlineMenu({
        visible: false,
        x: 0,
        y: 0,
      });

      setColorMenuObj(null);
    }
  };

  const checkSelection = () => {
    const selection = window.getSelection();

    if (
      selection &&
      selection.toString().trim().length > 0 &&
      !selection.isCollapsed
    ) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (
        editorRef.current &&
        editorRef.current.contains(range.commonAncestorContainer)
      ) {
        setInlineMenu({
          visible: true,
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        });

        return;
      }
    }

    setInlineMenu({
      visible: false,
      x: 0,
      y: 0,
    });

    setColorMenuObj(null);
  };

  const exportManuscript = () => {
    const printWindow = window.open("", "", "height=800,width=800");

    const docTitle = title || "Untitled Chapter";

    printWindow.document.write("<html><head><title>" + docTitle + "</title>");

    printWindow.document.write(`
      <style>
        body {
          font-family: 'Georgia', serif;
          max-width: 700px;
          margin: 0 auto;
          padding: 60px 40px;
          line-height: 2.2;
          color: #111;
          font-size: 18px;
        }

        h1 {
          text-align: center;
          font-size: 42px;
          font-weight: normal;
          margin-bottom: 60px;
          letter-spacing: -0.5px;
        }

        div {
          text-indent: 1.5em;
          margin-bottom: 0;
        }

        div:first-child {
          text-indent: 0;
        }

        hr {
          border: none;
          border-top: 1px solid #ccc;
          width: 50px;
          margin: 40px auto;
        }
      </style>
    `);

    printWindow.document.write("</head><body>");
    printWindow.document.write("<h1>" + docTitle + "</h1>");
    printWindow.document.write("<hr/>");
    printWindow.document.write("<div>" + contentRef.current + "</div>");
    printWindow.document.write("</body></html>");

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div
      className={`min-h-screen ${theme.bgApp} ${theme.textMain} font-sans flex flex-col overflow-hidden transition-colors duration-500`}
      onMouseUp={checkSelection}
      onKeyUp={checkSelection}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            ::selection {
              background: ${theme.selectionBg};
              color: ${theme.selectionText};
            }

            ::-webkit-scrollbar {
              width: 6px;
            }

            ::-webkit-scrollbar-track {
              background: transparent;
            }

            ::-webkit-scrollbar-thumb {
              background-color: ${isDarkMode ? "#333" : "#D0CCC5"};
              border-radius: 10px;
            }

            ::-webkit-scrollbar-thumb:hover {
              background-color: ${isDarkMode ? "#555" : "#A09D98"};
            }

            .editor-content:empty:before {
              content: attr(data-placeholder);
              color: ${isDarkMode ? "#555" : "#D0CCC5"};
              font-style: italic;
            }

            .editor-content div {
              text-indent: 1.5em;
              margin-bottom: 0;
              line-height: 2.2;
            }

            .editor-content div:first-child {
              text-indent: 0;
            }

            .editor-content h2 {
              text-indent: 0;
              text-align: center;
              margin-top: 2.5rem;
              margin-bottom: 1.5rem;
              font-weight: normal;
              font-size: 1.6em;
            }

            .editor-content[dir="rtl"] {
              text-align: right;
            }

            .editor-content[dir="ltr"] {
              text-align: left;
            }
          `,
        }}
      />

      <TopHeader
        theme={theme}
        isTyping={isTyping}
        wordCount={wordCount}
        DAILY_GOAL={DAILY_GOAL}
        readingTime={readingTime}
        progressPercentage={progressPercentage}
        saveStatus={saveStatus}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        exportManuscript={exportManuscript}
        toggleFullscreen={toggleFullscreen}
        isNotesOpen={isNotesOpen}
        setIsNotesOpen={setIsNotesOpen}
      />

      <StoryBible
        theme={theme}
        isNotesOpen={isNotesOpen}
        storyNotes={storyNotes}
        setStoryNotes={setStoryNotes}
      />

      <div
        className={`flex-1 flex flex-col w-full h-full overflow-y-auto transition-all duration-700 ${
          isNotesOpen ? "pr-80" : "pr-0"
        }`}
      >
        <main className="flex-1 w-full max-w-[720px] mx-auto px-8 pt-4 pb-48 flex flex-col z-10 relative">
          <input
            dir="auto"
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Chapter Title"
            className={`w-full bg-transparent text-center text-[48px] sm:text-[56px] font-normal ${theme.textMain} focus:outline-none tracking-tight leading-tight mt-8`}
            style={{
              fontFamily: "'Newsreader', serif",
            }}
          />

          <div
            className={`w-24 h-[2px] rounded-full mx-auto mt-10 mb-14 transition-colors ${
              isDarkMode ? "bg-[#333333]" : "bg-[#D4D0C8]"
            }`}
          ></div>

          <div
            ref={editorRef}
            dir="auto"
            contentEditable={true}
            suppressContentEditableWarning={true}
            onInput={handleInput}
            className={`editor-content w-full bg-transparent text-[20px] sm:text-[22px] ${theme.textMain} focus:outline-none outline-none min-h-[50vh] pb-32`}
            style={{
              fontFamily: "'Newsreader', serif",
            }}
            data-placeholder="Start writing your story..."
          />
        </main>
      </div>

      <FloatingToolbar
        theme={theme}
        isDarkMode={isDarkMode}
        isTyping={isTyping}
        inlineMenu={inlineMenu}
        colorMenuObj={colorMenuObj}
        setColorMenuObj={setColorMenuObj}
        formatText={formatText}
      />
    </div>
  );
}
