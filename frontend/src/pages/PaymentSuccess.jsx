import React, { useEffect, useState } from "react";
import axios from "axios";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

const PaymentSuccess = () => {
  const [status, setStatus] = useState("verifying"); // 'verifying' | 'success' | 'error'
  const [finalAmount, setFinalAmount] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const verify = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const data = urlParams.get("data");

      if (!data) {
        // Arrived without eSewa data param (e.g. redirected from /esewa/success without data)
        setStatus("success");
        return;
      }

      // Decode amount for display (optimistic, before backend confirms)
      try {
        const decoded = JSON.parse(atob(data));
        setFinalAmount(decoded?.total_amount);
      } catch { /* ignore decode error — backend will catch it */ }

      // FIXED: call backend to verify signature and update order status
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `${BACKEND}/esewa/verify`,
          { data },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStatus("success");
      } catch (err) {
        console.error("Verification failed:", err);
        setStatus("error");
        setErrorMsg(err.response?.data?.message || "Payment verification failed. Please contact support.");
      }
    };

    verify();
  }, []);

  if (status === "verifying") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-md w-full border-4 border-yellow-400">
          <div className="animate-spin w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-red-800">Verifying Payment...</h2>
          <p className="text-red-600 mt-2">Please wait while we confirm your payment with eSewa.</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-md w-full border-4 border-red-400 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-red-600 to-red-400"></div>
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-red-600 text-4xl font-bold">✗</div>
          </div>
          <h1 className="text-3xl font-bold text-red-800 mb-3">Verification Failed</h1>
          <p className="text-red-600 mb-6">{errorMsg}</p>
          <button onClick={() => window.location.href = "/order"}
            className="w-full bg-gradient-to-r from-red-600 to-yellow-500 text-white px-6 py-3 rounded-full font-bold hover:from-red-700 hover:to-yellow-600 transition-all shadow-lg">
            ← Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-md w-full border-4 border-yellow-400 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-red-600 to-yellow-500"></div>
        <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="text-white text-3xl">✓</div>
        </div>
        <div className="text-yellow-500 text-lg mb-2 font-bold">धन्यवाद • Thank You • शुभकामना</div>
        <h1 className="text-3xl font-bold text-red-800 mb-3">Payment Successful!</h1>
        <p className="text-red-600 mb-4 text-lg">Your authentic Newari feast is being prepared with love.</p>
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl mb-6 border-2 border-yellow-400">
          {finalAmount && <p className="text-red-800 font-bold text-xl">Total: Rs. {finalAmount}</p>}
          <p className="text-sm text-red-700 mt-1">Estimated delivery: 30-45 minutes</p>
        </div>
        <button onClick={() => window.location.href = "/"}
          className="w-full bg-gradient-to-r from-red-600 to-yellow-500 text-white px-6 py-3 rounded-full font-bold hover:from-red-700 hover:to-yellow-600 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg">
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
