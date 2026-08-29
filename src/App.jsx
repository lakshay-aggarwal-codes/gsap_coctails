import React from "react";
import { gsap } from "gsap/gsap-core";
import { ScrollTrigger, SplitText } from "gsap/all";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import ProtectedRoute from "./components/admin/ProtectedRoute.jsx";
import Login from "./pages/admin/Login.jsx";
import DashboardLayout from "./pages/admin/DashboardLayout.jsx";
import DashboardHome from "./pages/admin/DashboardHome.jsx";
import Reservations from "./pages/admin/Reservations.jsx";
import Contacts from "./pages/admin/Contacts.jsx";

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
                    <Route path="reservations" element={<Reservations />} />
                    <Route path="contact" element={<Contacts />} />
                    <Route path="cocktails" element={<div>Cocktails — built in Task 7</div>} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
export default App;