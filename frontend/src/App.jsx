import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./componets/Layout";
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

        {/* Protected Dashboard Routes (Wrapped in Layout with Sidebar & Header) */}
        <Route element={<Layout />}>
          <Route path="/resident" element={<ResidentDashBoard />} />
          <Route path="/guard" element={<GuardDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/maintenance" element={<ResidentDashBoard />} />
          <Route path="/visitors" element={<ResidentDashBoard />} />
          <Route path="/announcements" element={<ResidentDashBoard />} />
          <Route path="/deliveries" element={<ResidentDashBoard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;