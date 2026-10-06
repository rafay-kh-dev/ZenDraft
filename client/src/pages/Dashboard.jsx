import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiEdit3, FiBook, FiLogOut, FiPlus } from "react-icons/fi";

function Dashboard() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchCards();
  }, [token, navigate]);

  const fetchCards = async () => {
    try {
      const res = await axios.get(
        "https://zendraft-bau8.onrender.com/api/cards",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setCards(res.data);
    } catch (error) {
      console.error("Error fetching cards:", error);
    }
  };

  const handleNewScene = async () => {
    try {
      const res = await axios.post(
        "https://zendraft-bau8.onrender.com/api/cards",
        { orderIndex: cards.length },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setCards([...cards, res.data]);
    } catch (error) {
      console.error("Error creating new scene:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiEdit3 className="text-blue-600" />
            ZenDraft
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-medium transition-colors">
            <FiBook />
            My Book
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
            <FiLogOut />
            Archived
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
          >
            <FiLogOut />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Untitled Book</h2>
            <p className="text-gray-500 mt-1">0 / 50,000 words</p>
          </div>
          <button
            onClick={handleNewScene}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-medium transition-colors shadow-sm"
          >
            <FiPlus />
            New Scene
          </button>
        </header>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cards.length === 0 ? (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 min-h-[150px] flex items-center justify-center text-gray-400 border-dashed col-span-full">
              Your scenes will appear here. Click 'New Scene' to start writing.
            </div>
          ) : (
            cards.map((card) => (
              <div
                key={card._id}
                className="p-5 rounded-2xl shadow-sm border border-gray-200 min-h-[150px] flex flex-col transition-transform hover:-translate-y-1 cursor-pointer"
                style={{ backgroundColor: card.color || "#ffffff" }}
              >
                <h3 className="font-bold text-gray-800 mb-2 truncate">
                  {card.title}
                </h3>
                <p className="text-gray-500 text-sm flex-1 overflow-hidden">
                  {card.content
                    ? card.content.replace(/<[^>]+>/g, "").substring(0, 100) +
                      "..."
                    : "Empty scene..."}
                </p>
                <div className="mt-4 flex justify-between items-center text-xs text-gray-400 font-medium">
                  <span>{card.label}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
