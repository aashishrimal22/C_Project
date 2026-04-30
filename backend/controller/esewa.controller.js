const crypto     = require('crypto');
const axios      = require('axios');
const orderModel = require('../models/order.model');

const ESEWA_SECRET       = process.env.ESEWA_SECRET       || '8gBm/:&EnhH.1/q';
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';
const ESEWA_PAYMENT_URL  = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
const ESEWA_STATUS_URL   = 'https://rc.esewa.com.np/api/epay/transaction/status/';

// Fallback frontend URL only used if something goes wrong before frontend_url is received
const DEFAULT_FRONTEND   = process.env.FRONTEND_URL || 'https://aashish-frontend.vercel.app';

function hmac(message) {
  return crypto.createHmac('sha256', ESEWA_SECRET).update(message).digest('base64');
}
function responseMessage(decoded) {
  return decoded.signed_field_names.split(',').map(f => `${f}=${decoded[f]}`).join(',');
}

// ─── POST /esewa/pay ──────────────────────────────────────────────────────────
module.exports.esewaPay = async (req, res) => {
  try {
    const {
      orderId,
      total_amount,
      product_code  = ESEWA_PRODUCT_CODE,
      success_url,      // passed from frontend — no env var dependency
      failure_url,      // passed from frontend — no env var dependency
      frontend_url,     // used by esewaSuccess to redirect back
    } = req.body;

    if (!orderId || !total_amount) {
      return res.status(400).json({ message: 'orderId and total_amount are required' });
    }

    const transaction_uuid = orderId.toString();
    const signature = hmac(
      `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`
    );

    return res.json({
      paymentUrl: ESEWA_PAYMENT_URL,
      formData: {
        amount:                   total_amount,
        tax_amount:               0,
        product_service_charge:   0,
        product_delivery_charge:  0,
        total_amount:             total_amount,
        transaction_uuid:         transaction_uuid,
        product_code:             product_code,
        // eSewa will redirect to these exact URLs — we pass them directly from the frontend
        success_url:              success_url,
        failure_url:              failure_url,
        signed_field_names:       'total_amount,transaction_uuid,product_code',
        signature:                signature,
      },
      frontend_url, // echoed back so the success handler can redirect correctly
    });
  } catch (e) {
    console.error('esewaPay error:', e);
    return res.status(500).json({ message: e.message });
  }
};

// ─── GET /esewa/success ───────────────────────────────────────────────────────
// eSewa → backend → verifies payment → updates DB → redirects browser to frontend
module.exports.esewaSuccess = async (req, res) => {
  // frontend_url is stored in the query string we added when building the success_url
  // OR fall back to the env var / hardcoded default
  const frontendUrl = req.query.frontend_url || DEFAULT_FRONTEND;

  try {
    const { data } = req.query;
    if (!data) {
      console.error('esewaSuccess: missing data param');
      return res.redirect(`${frontendUrl}/payment-failed`);
    }

    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    } catch {
      console.error('esewaSuccess: bad base64');
      return res.redirect(`${frontendUrl}/payment-failed`);
    }

    console.log('eSewa success callback:', decoded);

    // Verify HMAC
    const expectedSig = hmac(responseMessage(decoded));
    if (expectedSig !== decoded.signature) {
      console.error('esewaSuccess: signature mismatch');
      return res.redirect(`${frontendUrl}/payment-failed`);
    }

    // Cross-check with status API
    let confirmedStatus = decoded.status;
    try {
      const sr = await axios.get(ESEWA_STATUS_URL, {
        params: { product_code: ESEWA_PRODUCT_CODE, total_amount: decoded.total_amount, transaction_uuid: decoded.transaction_uuid },
        timeout: 5000,
      });
      confirmedStatus = sr.data?.status || decoded.status;
      console.log('eSewa status check result:', sr.data);
    } catch (e) {
      console.warn('Status API unavailable:', e.message);
    }

    if (confirmedStatus !== 'COMPLETE') {
      console.error('esewaSuccess: not COMPLETE, status =', confirmedStatus);
      return res.redirect(`${frontendUrl}/payment-failed`);
    }

    // Update order
    await orderModel.findByIdAndUpdate(decoded.transaction_uuid, { paymentStatus: 'completed' });

    return res.redirect(`${frontendUrl}/payment-success?data=${encodeURIComponent(data)}`);
  } catch (err) {
    console.error('esewaSuccess error:', err);
    return res.redirect(`${frontendUrl}/payment-failed`);
  }
};

// ─── GET /esewa/fail ──────────────────────────────────────────────────────────
// NOTE: In v5 the failure_url points DIRECTLY to the frontend, so this route
// is only hit if someone navigates here manually. Kept for safety.
module.exports.esewaFail = async (req, res) => {
  const frontendUrl = req.query.frontend_url || DEFAULT_FRONTEND;
  const { transaction_uuid } = req.query;
  console.log('esewaFail called. transaction_uuid:', transaction_uuid);
  if (transaction_uuid) {
    await orderModel.findByIdAndUpdate(transaction_uuid, { paymentStatus: 'failed' }).catch(() => {});
  }
  return res.redirect(`${frontendUrl}/payment-failed`);
};

// ─── POST /esewa/verify ───────────────────────────────────────────────────────
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
