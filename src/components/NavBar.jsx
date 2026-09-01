import {navLinks} from "../constants/index.js";
import {useGSAP} from "@gsap/react";
import {gsap} from "gsap";
import {Link} from "react-router-dom";
import {useCustomerAuth} from "../context/CustomerAuthContext.jsx";

const NavBar = () => {
    const {isAuthenticated, customer} = useCustomerAuth();
    useGSAP(() => {
        const navTween = gsap.timeline({
            scrollTrigger: {
                trigger: "nav",
                start: "bottom top"
            }
        });
        navTween.fromTo('nav', { backgroundColor:'transparent'},{
            backgroundColor:'#00000050',
            backgroundFilter :"blur(10px)",
            duration:1,
            ease:"power1.inOut"
        });
    })
    return (
        <nav className="site-nav">
            <div>
                <a href='#home' className="flex items-center gap-2">
                    <img src="/images/logo.png" alt="logo"/>
                    <p>Velvet Pour</p>
                </a>

                <ul>
                    {navLinks.map(link => (
                        <li key={link.id}>
                            <a href={`#${link.id}`}>{link.title}</a>
                        </li>
                    ))}
                    <li>
                        {isAuthenticated ? (
                            <Link to="/account">{customer?.name ? `Hi, ${customer.name}` : "My Account"}</Link>
                        ) : (
                            <Link to="/account/login">Sign In</Link>
                        )}
                    </li>
                </ul>
            </div>
            <Link
                to="/admin/login"
                className="fixed bottom-3 right-3 z-40 text-[10px] uppercase tracking-wide text-white/25 hover:text-white/60 transition-colors"
            >
                Staff Login
            </Link>
        </nav>
    )
}
export default NavBar