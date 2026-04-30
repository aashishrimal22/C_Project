import React, { useState, useContext, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import axios from 'axios';

const BACKEND = import.meta.env.VITE_BACKEND_URL;

const Order = () => {
  const { cart, getCartTotal } = useContext(CartContext);

  const [customerInfo, setCustomerInfo] = useState({
    name: '', phone: '', email: '', address: '', deliveryNotes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading]             = useState(false);
  const [orderPlaced, setOrderPlaced]     = useState(false);

  const deliveryFee = 50;
  const subtotal    = getCartTotal();
  const total       = subtotal + deliveryFee;

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get(`${BACKEND}/customers/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const c = res.data.customer;
        setCustomerInfo(prev => ({
          ...prev,
          name:  c.firstname + ' ' + c.lastname,
          phone: c.phone,
          email: c.email,
        }));
      } catch (err) {
        console.error('Profile load failed:', err);
      }
    };
    fetchProfile();
  }, []);

  // ── Builds a real <form> in the DOM and submits it to eSewa ──────────────
  // Using document.write() was the root cause of payment not working in React —
  // it destroys the React DOM and inline scripts inside it are blocked by CSP.
  // Creating a native form element and calling .submit() is the correct approach.
  const submitEsewaForm = (paymentUrl, formData) => {
    const form   = document.createElement('form');
    form.method  = 'POST';
    form.action  = paymentUrl;

    Object.entries(formData).forEach(([key, value]) => {
      const input   = document.createElement('input');
      input.type    = 'hidden';
      input.name    = key;
      input.value   = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit(); // browser navigates to eSewa — React is no longer involved
  };

  const handlePlaceOrder = async () => {
    if (!cart.length) {
      alert('Your cart is empty!');
      return;
    }
    if (!customerInfo.address.trim()) {
      alert('Please enter your delivery address!');
      return;
    }

    setLoading(true);
    try {
      const token   = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // 1 — Create order in DB
      const orderRes = await axios.post(`${BACKEND}/orders/place`, {
        items: cart.map(item => ({
          foodid:   item.foodid,
          name:     item.name,
          price:    item.price,
          quantity: item.quantity,
        })),
        address:       customerInfo.address,
        deliveryNotes: customerInfo.deliveryNotes,
        paymentMethod,
        totalAmount:   total,
      }, { headers });

      const createdOrder = orderRes.data.order;

      // 2 — eSewa: get signed params from backend, then submit real form
      if (paymentMethod === 'esewa') {
        const esewaRes = await axios.post(`${BACKEND}/esewa/pay`, {
          orderId:     createdOrder._id,
          total_amount: total,
          product_code: 'EPAYTEST',
          success_url: `${window.location.origin}/payment-success`,
          failure_url: `${window.location.origin}/payment-failed`,
        }, { headers });

        submitEsewaForm(esewaRes.data.paymentUrl, esewaRes.data.formData);
        return; // browser is navigating away
      }

      // 3 — Cash on delivery: show success screen
      setOrderPlaced(true);
    } catch (error) {
      console.error('Order error:', error);
      alert(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── COD success screen ───────────────────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-md w-full border-4 border-yellow-400 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-red-600 to-yellow-500"></div>
          <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-3xl">✓</span>
          </div>
          <div className="text-yellow-500 text-lg mb-2 font-bold">धन्यवाद • Thank You • शुभकामना</div>
          <h1 className="text-3xl font-bold text-red-800 mb-3">Order Confirmed!</h1>
          <p className="text-red-600 mb-4 text-lg">Your authentic Newari feast is being prepared with love.</p>
          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl mb-6 border-2 border-yellow-400">
            <p className="text-red-800 font-bold text-xl">Total: Rs. {total}</p>
            <p className="text-sm text-red-700 mt-1">Estimated delivery: 30-45 minutes</p>
          </div>
          <button onClick={() => window.location.href = '/'}
            className="w-full bg-gradient-to-r from-red-600 to-yellow-500 text-white px-6 py-3 rounded-full font-bold hover:from-red-700 hover:to-yellow-600 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg">
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ── Main checkout form ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-red-50">
      <div className="relative max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="text-red-600 text-xl mb-4 font-semibold">अन्तिम चरण • Final Step • अर्डर पूरा गर्नुहोस्</div>
          <h1 className="text-5xl font-bold text-red-800 mb-4">
            Complete Your <span className="text-yellow-500">Traditional</span> Order
          </h1>
          <p className="text-xl text-red-700 max-w-3xl mx-auto">
            Almost ready to enjoy authentic Newari cuisine delivered to your doorstep
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">

            {/* Customer Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-4 border-yellow-400 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-red-600 to-yellow-500"></div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">👤</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-red-800">Customer Information</h2>
                  <p className="text-red-600">Your registered details</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border-2 border-orange-200">
                  <label className="text-sm font-semibold text-red-700 mb-2 block">👤 Name</label>
                  <p className="text-red-800 font-bold text-lg">{customerInfo.name || 'Guest'}</p>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border-2 border-orange-200">
                  <label className="text-sm font-semibold text-red-700 mb-2 block">📱 Phone</label>
                  <p className="text-red-800 font-bold text-lg">{customerInfo.phone || 'N/A'}</p>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-red-700">📍 Delivery Address</label>
                    <textarea value={customerInfo.address}
                      onChange={e => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-red-500 bg-orange-50 resize-none"
                      rows={3} placeholder="Enter your delivery address" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-red-700">🚚 Delivery Notes (Optional)</label>
                    <textarea value={customerInfo.deliveryNotes}
                      onChange={e => setCustomerInfo({ ...customerInfo, deliveryNotes: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-red-500 bg-orange-50 resize-none"
                      rows={2} placeholder="Any special instructions?" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-4 border-yellow-400">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">💳</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-red-800">Payment Method</h2>
                  <p className="text-red-600">Choose your preferred payment option</p>
                </div>
              </div>
              <div className="space-y-4">
                <label className="flex items-center p-6 border-2 border-orange-200 rounded-xl cursor-pointer bg-gradient-to-r from-orange-50 to-red-50 hover:shadow-lg hover:border-red-400 transition-all">
                  <input type="radio" value="cash" checked={paymentMethod === 'cash'}
                    onChange={e => setPaymentMethod(e.target.value)} className="w-5 h-5 text-red-600" />
                  <div className="ml-6">
                    <div className="font-bold text-red-800 text-lg">💰 Cash on Delivery</div>
                    <div className="text-red-600">Pay when your meal arrives</div>
                  </div>
                </label>
                <label className="flex items-center p-6 border-2 border-orange-200 rounded-xl cursor-pointer bg-gradient-to-r from-orange-50 to-red-50 hover:shadow-lg hover:border-red-400 transition-all">
                  <input type="radio" value="esewa" checked={paymentMethod === 'esewa'}
                    onChange={e => setPaymentMethod(e.target.value)} className="w-5 h-5 text-red-600" />
                  <div className="ml-6">
                    <div className="font-bold text-red-800 text-lg">📱 eSewa Online Payment</div>
                    <div className="text-red-600">Pay securely — you will be redirected to eSewa</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 border-4 border-yellow-400 sticky top-8">
              <h2 className="text-2xl font-bold text-red-800 mb-4">Order Summary</h2>
              {cart.length === 0 ? (
                <p className="text-red-600 text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {cart.map(item => (
                      <div key={item.foodid} className="flex justify-between items-center py-2 border-b border-orange-200">
                        <span className="text-red-800">{item.name} × {item.quantity}</span>
                        <span className="font-semibold text-red-700">Rs. {item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 border-t-2 border-yellow-400 pt-4">
                    <div className="flex justify-between text-red-700"><span>Subtotal:</span><span>Rs. {subtotal}</span></div>
                    <div className="flex justify-between text-red-700"><span>Delivery:</span><span>Rs. {deliveryFee}</span></div>
                    <div className="flex justify-between font-bold text-2xl text-red-800 border-t pt-2">
                      <span>Total:</span><span className="text-red-600">Rs. {total}</span>
                    </div>
                  </div>
                  <button onClick={handlePlaceOrder} disabled={loading}
                    className="w-full mt-6 bg-gradient-to-r from-red-600 to-yellow-500 text-white py-4 rounded-full font-bold text-lg hover:from-red-700 hover:to-yellow-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2">
                    {loading ? (
                      <><div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        {paymentMethod === 'esewa' ? 'Redirecting to eSewa...' : 'Placing Order...'}</>
                    ) : (
                      <>💳 Place Order (Rs. {total})</>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
