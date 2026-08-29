import React from "react";
import NavBar from "../components/NavBar.jsx";
import Hero from "../components/Hero.jsx";
import Cocktails from "../components/Cocktails.jsx";
import About from "../components/About.jsx";
import Art from "../components/Art.jsx";
import Menu from "../components/Menu.jsx";
import Reservation from "../components/Reservation.jsx";
import Contact from "../components/Contact.jsx";

const Home = () => {
    return (
        <main>
            <NavBar/>
            <Hero/>
            <Cocktails/>
            <About/>
            <Art />
            <Menu />
            <Reservation/>
            <Contact/>
        </main>
    )
}
export default Home;