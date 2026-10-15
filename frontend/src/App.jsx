import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./componets/Layout";
import ResidentDashBoard from "./pages/ResidentDashBoard";
import GuardDashboard from "./pages/GuardDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Visitors from "./pages/Visitors";
import Maintenance from "./pages/Maintenance";
import Announcements from "./pages/Announcement";
import Users from "./pages/Users";
import Delivery from "./pages/Delivery";
import Profile from "./pages/Profile";
import Home from "./pages/Home";


function App() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

console.log("Saved user:", user);
console.log("Unit:", user?.unit);
console.log("Unit number:", user?.unit_number);
console.log("Role:", user?.role);
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
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/visitors" element={<Visitors />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/deliveries" element={<Delivery/>} />
          <Route path="/users" element={<Users />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/home" element={<Home />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;