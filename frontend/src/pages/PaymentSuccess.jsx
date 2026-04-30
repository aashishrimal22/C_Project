import React from "react";

const PaymentSuccess = () => {

    // read esewa ?data=... param
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get("data");
    let decoded = dataParam ? JSON.parse(atob(dataParam)) : null;

    const finalAmount = decoded?.total_amount;

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
                    <p className="text-red-800 font-bold text-xl">Total: Rs. {finalAmount}</p>
                    <p className="text-sm text-red-700 mt-1">Estimated delivery: 30-45 minutes</p>
                </div>
                <button
                    onClick={() => window.location.href = '/'}
                    className="w-full bg-gradient-to-r from-red-600 to-yellow-500 text-white px-6 py-3 rounded-full font-bold hover:from-red-700 hover:to-yellow-600 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                >
                    ← Back to Home
                </button>
            </div>
        </div>
    );
};

export default PaymentSuccess;
