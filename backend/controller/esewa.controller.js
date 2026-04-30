const crypto     = require('crypto');
const axios      = require('axios');
const orderModel = require('../models/order.model');

// eSewa test credentials (from official docs)
const ESEWA_SECRET       = process.env.ESEWA_SECRET      || '8gBm/:&EnhH.1/q';
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';

// Official test URL from eSewa developer docs
const ESEWA_PAYMENT_URL   = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
// Status-check API (to confirm payment even if success_url callback is missed)
const ESEWA_STATUS_URL    = 'https://rc.esewa.com.np/api/epay/transaction/status/';

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

function hmacBase64(message) {
  return crypto.createHmac('sha256', ESEWA_SECRET)
               .update(message)
               .digest('base64');
}

// Build a short, date-based transaction UUID matching eSewa's own example format
// e.g.  "250430-142536"  (13 chars, alphanumeric + hyphen only)
// A 3-char suffix from the OrderId makes it unique even within the same second.
function makeTransactionUuid(orderId) {
  const now = new Date();
  const p   = n => n.toString().padStart(2, '0');
  const date = `${now.getFullYear().toString().slice(-2)}${p(now.getMonth()+1)}${p(now.getDate())}`;
  const time = `${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}`;
  const suffix = orderId.toString().slice(-3); // last 3 hex chars of ObjectId
  return `${date}-${time}-${suffix}`;          // "250430-142536-a2f"
}

// Build the HMAC message string from a decoded eSewa response.
// The response's own signed_field_names tells us which fields to include, in order.
function buildResponseMessage(decoded) {
  return decoded.signed_field_names
    .split(',')
    .map(field => `${field}=${decoded[field]}`)
    .join(',');
}

// ──────────────────────────────────────────────────────────────────────────
// POST /esewa/pay
// Returns JSON with all form fields + the payment URL so the frontend can
// build and submit a real <form> — avoids document.write() which breaks React.
// ──────────────────────────────────────────────────────────────────────────
module.exports.esewaPay = async (req, res) => {
  try {
    const { orderId, total_amount, amount, delivery_charge = 0,
            product_code = ESEWA_PRODUCT_CODE, success_url, failure_url } = req.body;

    if (!orderId || !total_amount) {
      return res.status(400).json({ message: 'orderId and total_amount are required' });
    }

    // Use short date-based UUID matching eSewa's own example format
    const transaction_uuid = makeTransactionUuid(orderId);

    // Save the UUID to the order so we can look it up during verification
    await orderModel.findByIdAndUpdate(orderId, { transactionUuid: transaction_uuid });

    // Signature covers: total_amount, transaction_uuid, product_code (in this order)
    const sigMessage = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const signature  = hmacBase64(sigMessage);

    // Proper amount breakdown per eSewa docs:
    // total_amount = amount + tax_amount + product_service_charge + product_delivery_charge
    const base_amount = amount || (total_amount - delivery_charge);

    return res.json({
      paymentUrl: ESEWA_PAYMENT_URL,
      formData: {
        amount:                   base_amount,
        tax_amount:               0,
        product_service_charge:   0,
        product_delivery_charge:  delivery_charge,
        total_amount:             total_amount,
        transaction_uuid:         transaction_uuid,
        product_code:             product_code,
        success_url:              success_url,
        failure_url:              failure_url,
        signed_field_names:       'total_amount,transaction_uuid,product_code',
        signature:                signature,
      }
    });
  } catch (e) {
    console.error('esewaPay error:', e);
    return res.status(500).json({ message: e.message });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// POST /esewa/verify
// Frontend calls this with the raw base64 `data` param eSewa attached to success_url.
// 1. Decodes and verifies HMAC signature (using signed_field_names from the RESPONSE)
// 2. Cross-checks with eSewa Status Check API as a fallback safety net
// 3. Updates order paymentStatus to 'completed'
// ──────────────────────────────────────────────────────────────────────────
module.exports.esewaVerify = async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ message: 'Missing data param from eSewa' });

    // 1 — Decode
    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    } catch {
      return res.status(400).json({ message: 'Invalid base64 data from eSewa' });
    }

    const { transaction_code, status, total_amount, transaction_uuid,
            product_code, signature: receivedSig } = decoded;

    // 2 — Verify signature (response uses its own signed_field_names set)
    const expectedSig = hmacBase64(buildResponseMessage(decoded));
    if (expectedSig !== receivedSig) {
      return res.status(400).json({ message: 'Signature mismatch — possible tampering' });
    }

    // 3 — Cross-check with eSewa Status API (safety net)
    let confirmedStatus = status;
    try {
      const statusRes = await axios.get(ESEWA_STATUS_URL, {
        params: { product_code, total_amount, transaction_uuid },
        timeout: 5000,
      });
      confirmedStatus = statusRes.data?.status || status;
    } catch (e) {
      console.warn('eSewa status check failed (using response status):', e.message);
    }

    if (confirmedStatus !== 'COMPLETE') {
      return res.status(400).json({ message: `Payment not complete. Status: ${confirmedStatus}` });
    }

    // 4 — Find order by transactionUuid and mark as paid
    const order = await orderModel.findOneAndUpdate(
      { transactionUuid: transaction_uuid },
      { paymentStatus: 'completed' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found for transaction: ' + transaction_uuid });
    }

    return res.status(200).json({
      message: 'Payment verified successfully',
      transactionCode: transaction_code,
      order: { _id: order._id, totalAmount: order.totalAmount, paymentStatus: order.paymentStatus },
    });
  } catch (err) {
    console.error('esewaVerify error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /esewa/success  — eSewa backend redirect handler (legacy)
module.exports.esewaSuccess = async (req, res) => {
  const { data } = req.query;
  if (data) return res.redirect(`${process.env.FRONTEND_URL}/payment-success?data=${data}`);
  return res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
};

// GET /esewa/fail — eSewa backend redirect handler (legacy)
module.exports.esewaFail = async (req, res) => {
  const { transaction_uuid } = req.query;
  if (transaction_uuid) {
    await orderModel.findOneAndUpdate(
      { transactionUuid: transaction_uuid },
      { paymentStatus: 'failed' }
    ).catch(() => {});
  }
  return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
};
