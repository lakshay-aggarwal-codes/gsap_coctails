import React from "react";
import { gsap } from "gsap/gsap-core";
import { ScrollTrigger, SplitText } from "gsap/all";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import ProtectedRoute from "./components/admin/ProtectedRoute.jsx";

gsap.registerPlugin(ScrollTrigger, SplitText);

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/admin/login" element={<div>Admin login — built in Task 3</div>} />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <div>Admin dashboard — built in Task 4</div>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    )
}
export default App;