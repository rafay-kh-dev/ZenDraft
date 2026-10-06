import { useNavigate } from "react-router-dom";
import { FiEdit3, FiBook, FiLogOut, FiPlus } from "react-icons/fi";

function Dashboard() {
  const navigate = useNavigate();

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
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-medium transition-colors shadow-sm">
            <FiPlus />
            New Scene
          </button>
        </header>

        {/* Masonry Grid Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* We will map the actual database cards here next */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 min-h-[150px] flex items-center justify-center text-gray-400 border-dashed">
            Your scenes will appear here.
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
