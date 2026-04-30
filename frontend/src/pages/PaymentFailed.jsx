import React from 'react';

const PaymentFailed = () => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
    <div className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-md w-full border-4 border-red-400 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-red-700 to-red-400"></div>

      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-red-600 text-4xl font-bold">✗</span>
      </div>

      <div className="text-red-500 text-lg mb-2 font-bold">भुक्तानी असफल • Payment Failed</div>
      <h1 className="text-3xl font-bold text-red-800 mb-3">Payment Was Not Completed</h1>
      <p className="text-red-600 mb-4 text-lg">
        Your eSewa payment was cancelled or failed.<br />
        You have <span className="font-bold">not</span> been charged.
      </p>

      {/* Test credentials reminder */}
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-4 text-left">
        <p className="text-sm font-bold text-yellow-800 mb-2">🧪 Using eSewa Test Environment?</p>
        <p className="text-xs text-yellow-700 mb-1">Use these test credentials only:</p>
        <ul className="text-xs text-yellow-800 font-mono space-y-0.5">
          <li>eSewa ID: <strong>9806800001</strong></li>
          <li>Password: <strong>Nepal@123</strong></li>
          <li>Token: <strong>123456</strong></li>
        </ul>
      </div>

      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 text-left">
        <p className="text-sm font-semibold text-red-700 mb-2">Common reasons:</p>
        <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
          <li>Wrong eSewa ID or password</li>
          <li>Wrong token (use 123456 for test)</li>
          <li>Insufficient test account balance</li>
          <li>Session timed out (5 min limit)</li>
        </ul>
      </div>

      <div className="space-y-3">
        <button onClick={() => window.location.href = '/order'}
          className="w-full bg-gradient-to-r from-red-600 to-yellow-500 text-white px-6 py-3 rounded-full font-bold hover:from-red-700 hover:to-yellow-600 transition-all transform hover:scale-105 shadow-lg">
          🔄 Try Again
        </button>
        <button onClick={() => window.location.href = '/'}
          className="w-full bg-white text-red-700 px-6 py-3 rounded-full font-bold border-2 border-red-300 hover:border-red-500 hover:bg-red-50 transition-all">
          ← Back to Home
        </button>
      </div>
    </div>
  </div>
);

export default PaymentFailed;
