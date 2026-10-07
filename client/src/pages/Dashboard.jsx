import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('zenToken');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-sans">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white">ZenDraft</h1>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
        >
          Logout
        </button>
      </header>

      {/* Google Keep Style Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        
        {/* Placeholder Card 1 */}
        <div className="p-5 bg-gray-800 border border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <h3 className="font-semibold text-lg mb-2">Chapter 1: The Hook</h3>
          <p className="text-gray-400 text-sm">The protagonist wakes up to find the sky has turned completely green...</p>
        </div>

        {/* Placeholder Card 2 */}
        <div className="p-5 bg-gray-800 border border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <h3 className="font-semibold text-lg mb-2">Character Notes</h3>
          <p className="text-gray-400 text-sm">Elias needs to be more cynical in the opening dialogue. Mention the scar on his left hand.</p>
        </div>

        {/* Add New Card Button */}
        <div className="p-5 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-xl hover:border-gray-400 hover:bg-gray-800 transition-all cursor-pointer">
          <span className="text-gray-400 font-medium">+ New Draft</span>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;