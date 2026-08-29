import React from "react";
import { gsap } from "gsap/gsap-core";
import { ScrollTrigger, SplitText } from "gsap/all";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";

gsap.registerPlugin(ScrollTrigger, SplitText);

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
            </Routes>
        </BrowserRouter>
    )
}
export default App;