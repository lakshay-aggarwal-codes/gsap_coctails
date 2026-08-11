import React from "react";
import {gsap} from "gsap/gsap-core";
import {ScrollTrigger, SplitText} from "gsap/all";
import NavBar from "./components/NavBar.jsx";
import Hero from "./components/Hero.jsx";

gsap.registerPlugin(ScrollTrigger, SplitText);
const App = () => {
    return (
       <main>
           <NavBar />
           <Hero/>
           <div className="h-dvh bg-black"/>
       </main>
    )
}
export default App;