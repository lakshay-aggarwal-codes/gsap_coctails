import React from "react";
import {gsap} from "gsap/gsap-core";
import {ScrollTrigger, SplitText} from "gsap/all";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Home from "./pages/Home.jsx";
import ProtectedRoute from "./components/admin/ProtectedRoute.jsx";
import Login from "./pages/admin/Login.jsx";
import DashboardLayout from "./pages/admin/DashboardLayout.jsx";
import DashboardHome from "./pages/admin/DashboardHome.jsx";
import Reservations from "./pages/admin/Reservations.jsx";
import Contacts from "./pages/admin/Contacts.jsx";
import CocktailsAdmin from "./pages/admin/Cocktails.jsx";
import CustomerRegister from "./pages/account/Register.jsx";
import CustomerLogin from "./pages/account/Login.jsx";
import ForgotPassword from "./pages/account/ForgotPassword.jsx";
import ResetPassword from "./pages/account/ResetPassword.jsx";
import VerifyEmail from "./pages/account/VerifyEmail.jsx";
import ProtectedCustomerRoute from "./components/account/ProtectedCustomerRoute.jsx";
import AccountLayout from "./pages/account/AccountLayout.jsx";
import Profile from "./pages/account/Profile.jsx";
import MyReservations from "./pages/account/MyReservations.jsx";
import MyFavorites from "./pages/account/MyFavorites.jsx";
import StatusUpdateBanner from "./components/StatusUpdateBanner.jsx";

gsap.registerPlugin(ScrollTrigger, SplitText);

const App = () => {
    return (
        <BrowserRouter>
            <StatusUpdateBanner/>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/account/register" element={<CustomerRegister/>}/>
                <Route path="/account/login" element={<CustomerLogin/>}/>
                <Route path="/account/forgot-password" element={<ForgotPassword/>}/>
                <Route path="/account/reset-password/:token" element={<ResetPassword/>}/>
                <Route path="/account/verify-email/:token" element={<VerifyEmail/>}/>
                <Route
                    path="/account"
                    element={
                        <ProtectedCustomerRoute>
                            <AccountLayout/>
                        </ProtectedCustomerRoute>
                    }
                >
                    <Route index element={<Profile/>}/>
                    <Route path="my-reservations" element={<MyReservations/>}/>
                    <Route path="favorites" element={<MyFavorites/>}/>
                </Route>
                <Route path="/admin/login" element={<Login/>}/>
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout/>
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<DashboardHome/>}/>
                    <Route path="reservations" element={<Reservations/>}/>
                    <Route path="contact" element={<Contacts/>}/>
                    <Route path="cocktails" element={<CocktailsAdmin />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
export default App;