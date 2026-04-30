import React, { useState, useRef } from 'react'
import Home from './pages/Home'
import About from './pages/About'
import Order from './pages/Order'
import Menu from './pages/Menu'
import Login from './pages/Login'
import { Routes, Route, Link } from 'react-router-dom';
import Signup from './pages/Signup'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { CartContext, CartProvider } from './context/CartContext'
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import Admin from './pages/Admin'
import Adminlogin from './pages/Adminlogin'
import PaymentSuccess from "./pages/PaymentSuccess";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  gsap.registerPlugin(ScrollToPlugin);

  const footerRef = useRef(null);

  const scrollToFooter = () => {
    gsap.to(window, { duration: 1.5, scrollTo: footerRef.current, ease: "power2.out" });
  };



  return (
    <>
      <React.StrictMode>
        <CartProvider>

          <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} scrollToFooter={scrollToFooter} />
          <Routes>
            <Route path="/adminlogin" element={<Adminlogin />} />
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/about" element={<About />} />
            <Route path="/order" element={<Order />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path='/signup' element={<Signup setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />

          </Routes>
        </CartProvider>
        <Footer footerRef={footerRef} />
      </React.StrictMode>
    </>

  )
}

export default App