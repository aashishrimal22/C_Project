const crypto     = require('crypto');
const axios      = require('axios');
const orderModel = require('../models/order.model');

const ESEWA_SECRET       = process.env.ESEWA_SECRET       || '8gBm/:&EnhH.1/q';
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';
const ESEWA_PAYMENT_URL  = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
const ESEWA_STATUS_URL   = 'https://rc.esewa.com.np/api/epay/transaction/status/';

function hmac(message) {
  return crypto.createHmac('sha256', ESEWA_SECRET).update(message).digest('base64');
}

// Build message from decoded eSewa response using its own signed_field_names list
function responseMessage(decoded) {
  return decoded.signed_field_names.split(',')
    .map(f => `${f}=${decoded[f]}`).join(',');
}

// ─── POST /esewa/pay ──────────────────────────────────────────────────────────
// Returns JSON so the frontend creates and submits a real <form> to eSewa.
// Matches the exact form data format from working real-world integrations.
module.exports.esewaPay = async (req, res) => {
  try {
    const { orderId, total_amount, product_code = ESEWA_PRODUCT_CODE } = req.body;

    if (!orderId || !total_amount) {
      return res.status(400).json({ message: 'orderId and total_amount are required' });
    }

    // Use the orderId directly as transaction_uuid.
    // MongoDB ObjectId = 24 hex chars (alphanumeric only) — confirmed working in real integrations.
    const transaction_uuid = orderId.toString();

    // Signature: total_amount, transaction_uuid, product_code — in this exact order
    const signature = hmac(
      `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`
    );

    // success/failure URLs go through the backend so we can:
    //   1. Verify signature server-side
    //   2. Update order status in the DB
    //   3. Then redirect browser to frontend
    const backendUrl = process.env.BACKEND_URL || `https://aashish-backend.onrender.com`;

    return res.json({
      paymentUrl: ESEWA_PAYMENT_URL,
      formData: {
        amount:                   total_amount, // amount == total when tax/service/delivery are 0
        tax_amount:               0,
        product_service_charge:   0,
        product_delivery_charge:  0,
        total_amount:             total_amount,
        transaction_uuid:         transaction_uuid,
        product_code:             product_code,
        success_url:              `${backendUrl}/esewa/success`,
        failure_url:              `${backendUrl}/esewa/fail`,
        signed_field_names:       'total_amount,transaction_uuid,product_code',
        signature:                signature,
      }
    });
  } catch (e) {
    console.error('esewaPay error:', e);
    return res.status(500).json({ message: e.message });
  }
};

// ─── GET /esewa/success ───────────────────────────────────────────────────────
// eSewa redirects HERE (backend) on success, with ?data=<base64>
// We verify the signature, update the order, then redirect browser to frontend.
module.exports.esewaSuccess = async (req, res) => {
  try {
    const { data } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'https://aashish-frontend.vercel.app';

    if (!data) {
      console.error('esewaSuccess: no data param received');
      return res.redirect(`${frontendUrl}/payment-failed`);
    }

    // Decode base64 JSON from eSewa
    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    } catch {
      console.error('esewaSuccess: failed to decode data param');
      return res.redirect(`${frontendUrl}/payment-failed`);
    }

    console.log('eSewa success data:', decoded);

    const { transaction_code, status, total_amount, transaction_uuid, signature: receivedSig } = decoded;

    // Verify HMAC using the response's own signed_field_names
    const expectedSig = hmac(responseMessage(decoded));
    if (expectedSig !== receivedSig) {
      console.error('esewaSuccess: signature mismatch');
      return res.redirect(`${frontendUrl}/payment-failed`);
    }

    // Cross-check with eSewa Status API
    let confirmedStatus = status;
    try {
      const statusRes = await axios.get(ESEWA_STATUS_URL, {
        params: { product_code: ESEWA_PRODUCT_CODE, total_amount, transaction_uuid },
        timeout: 5000,
      });
      confirmedStatus = statusRes.data?.status || status;
      console.log('eSewa status check:', statusRes.data);
    } catch (e) {
      console.warn('Status API unreachable, using response status:', e.message);
    }

    if (confirmedStatus !== 'COMPLETE') {
      console.error('esewaSuccess: status not COMPLETE:', confirmedStatus);
      return res.redirect(`${frontendUrl}/payment-failed`);
    }

    // Update order — transaction_uuid IS the orderId (MongoDB ObjectId string)
    await orderModel.findByIdAndUpdate(transaction_uuid, { paymentStatus: 'completed' });

    // Redirect browser to frontend success page (pass data for display)
    return res.redirect(`${frontendUrl}/payment-success?data=${encodeURIComponent(data)}`);
  } catch (err) {
    console.error('esewaSuccess error:', err);
    const frontendUrl = process.env.FRONTEND_URL || 'https://aashish-frontend.vercel.app';
    return res.redirect(`${frontendUrl}/payment-failed`);
  }
};

// ─── GET /esewa/fail ──────────────────────────────────────────────────────────
// eSewa redirects HERE on failure/cancellation.
module.exports.esewaFail = async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://aashish-frontend.vercel.app';
  const { transaction_uuid } = req.query;
  console.log('eSewa payment failed/cancelled. transaction_uuid:', transaction_uuid);

  if (transaction_uuid) {
    // transaction_uuid IS the orderId
    await orderModel.findByIdAndUpdate(transaction_uuid, { paymentStatus: 'failed' }).catch(e =>
      console.error('Failed to update order status:', e.message)
    );
  }
  return res.redirect(`${frontendUrl}/payment-failed`);
};

// ─── POST /esewa/verify ───────────────────────────────────────────────────────
// Optional: frontend can also call this if success redirect was direct to frontend
module.exports.esewaVerify = async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ message: 'Missing data param' });

    let decoded;
    try { decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8')); }
    catch { return res.status(400).json({ message: 'Invalid base64 data' }); }

    const expectedSig = hmac(responseMessage(decoded));
    if (expectedSig !== decoded.signature) {
      return res.status(400).json({ message: 'Signature mismatch' });
    }

    if (decoded.status !== 'COMPLETE') {
      return res.status(400).json({ message: `Payment status: ${decoded.status}` });
    }

    const order = await orderModel.findByIdAndUpdate(
      decoded.transaction_uuid,
      { paymentStatus: 'completed' },
      { new: true }
    );

    return res.json({
      message: 'Payment verified',
      order: order ? { _id: order._id, paymentStatus: order.paymentStatus } : null
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
