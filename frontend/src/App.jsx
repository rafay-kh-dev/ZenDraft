import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import Login from "./pages/Login";

function RootHandler() {
  const token = localStorage.getItem("zenToken");

  // Renders the writing desk if authenticated, otherwise shows the sign-in portal at root
  return token ? <Dashboard /> : <Login />;
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("zenToken");
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootHandler />} />
      <Route
        path="/editor/:id"
        element={
          <ProtectedRoute>
            <Editor />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
