import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResidentDashBoard from "./pages/ResidentDashBoard";
import GuardDashboard from "./pages/GuardDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/resident" element={<ResidentDashBoard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/guard" element={<GuardDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;