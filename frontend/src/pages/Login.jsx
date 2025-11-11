import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";


const Login = ({ setIsLoggedIn }) => {
  const [loginData, setLoginData] = useState({ phone: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/customers/login`, loginData);
      console.log("Login success:", response.data);
      setIsLoggedIn(true);
      localStorage.setItem("token", response.data.token);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
    }
  };


  return (
    <div className="min-h-screen bg-orange-50">



      <section className="py-20 px-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-red-600">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-red-800 mb-2">Welcome Back</h2>
              <p className="text-red-600">लग इन गर्नुहोस् • Sign in to your account</p>
            </div>


            <form onSubmit={handleSubmit} className="space-y-6">

              <div>
                <label className="block text-red-800 font-semibold mb-2">Phone number</label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={loginData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none transition-colors duration-300"
                    placeholder="Enter your phone number"
                    maxLength={10}
                    pattern="\d{10}"
                    title="Phone number must be 10 digits"
                  />

                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-4 top-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>


              <div>
                <label className="block text-red-800 font-semibold mb-2">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-12 pr-12 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none transition-colors duration-300"
                    placeholder="Enter your password"
                  />
                </div>
              </div>



              {/* Login Button */}
              <button type="submit" className="w-full py-3 rounded-lg text-lg font-bold bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                Sign In
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center pt-6">
              <p className="text-red-700">
                Don't have an account? <a href="/signup" className="text-red-600 hover:text-red-800 font-bold">Sign up here</a>
              </p>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default Login;
