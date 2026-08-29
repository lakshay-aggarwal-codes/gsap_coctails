import React from "react";
import { gsap } from "gsap/gsap-core";
import { ScrollTrigger, SplitText } from "gsap/all";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import ProtectedRoute from "./components/admin/ProtectedRoute.jsx";
import Login from "./pages/admin/Login.jsx";
import DashboardLayout from "./pages/admin/DashboardLayout.jsx";
import DashboardHome from "./pages/admin/DashboardHome.jsx";

gsap.registerPlugin(ScrollTrigger, SplitText);

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/admin/login" element={<Login />} />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<DashboardHome />} />
                    <Route path="reservations" element={<div>Reservations — built in Task 5</div>} />
                    <Route path="contact" element={<div>Messages — built in Task 6</div>} />
                    <Route path="cocktails" element={<div>Cocktails — built in Task 7</div>} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
export default App;