const crypto = require('crypto');
const orderModel = require('../models/order.model');

const ESEWA_SECRET      = process.env.ESEWA_SECRET || '8gBm/:&EnhH.1/q';
// ✅ CORRECT test URL per official eSewa docs (rc-epay, NOT rc-web)
const ESEWA_PAYMENT_URL = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

function hmac(message) {
  return crypto.createHmac('sha256', ESEWA_SECRET).update(message).digest('base64');
}

// Build the signature message from a decoded eSewa response object.
// The response's signed_field_names lists exactly which fields to include, in order.
function buildResponseMessage(decoded) {
  return decoded.signed_field_names
    .split(',')
    .map(field => `${field}=${decoded[field]}`)
    .join(',');
}

// ─────────────────────────────────────────────────────────────────
// POST /esewa/pay
// Returns JSON params so the frontend can build+submit the form
// itself — avoids the document.write() approach which breaks React.
// ─────────────────────────────────────────────────────────────────
module.exports.esewaPay = async (req, res) => {
  try {
    const {
      orderId, total_amount,
      product_code = 'EPAYTEST',
      success_url, failure_url
    } = req.body;

    if (!orderId || !total_amount) {
      return res.status(400).json({ message: 'orderId and total_amount are required' });
    }

    const transaction_uuid = orderId;
    const message   = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const signature = hmac(message);

    // Return JSON — frontend will create a real <form> and .submit() it
    return res.json({
      paymentUrl: ESEWA_PAYMENT_URL,
      formData: {
        amount:                   total_amount,
        tax_amount:               0,
        product_service_charge:   0,
        product_delivery_charge:  0,
        total_amount,
        transaction_uuid,
        product_code,
        success_url,
        failure_url,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature,
      }
    });
  } catch (e) {
    console.error('esewaPay error:', e);
    return res.status(500).json({ message: e.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// POST /esewa/verify
// Frontend calls this with the raw base64 `data` param from eSewa.
// FIXED: response signature covers different fields than the request
// (transaction_code,status,total_amount,transaction_uuid,
//  product_code,signed_field_names) — per official eSewa docs.
// ─────────────────────────────────────────────────────────────────
module.exports.esewaVerify = async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ message: 'Missing data param from eSewa' });

    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    } catch {
      return res.status(400).json({ message: 'Invalid base64 data from eSewa' });
    }

    // Verify signature using fields listed in signed_field_names
    const expectedSig = hmac(buildResponseMessage(decoded));
    if (expectedSig !== decoded.signature) {
      return res.status(400).json({ message: 'Signature mismatch — possible tampering' });
    }

    if (decoded.status !== 'COMPLETE') {
      return res.status(400).json({ message: `Payment not complete. Status: ${decoded.status}` });
    }

    const order = await orderModel.findByIdAndUpdate(
      decoded.transaction_uuid,
      { paymentStatus: 'completed' },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: 'Order not found' });

    return res.status(200).json({
      message: 'Payment verified',
      transactionCode: decoded.transaction_code,
      order: { _id: order._id, totalAmount: order.totalAmount, paymentStatus: order.paymentStatus }
    });
  } catch (err) {
    console.error('esewaVerify error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /esewa/success  — backend redirect handler (if failure_url points to backend)
module.exports.esewaSuccess = async (req, res) => {
  const { data } = req.query;
  if (data) return res.redirect(`${process.env.FRONTEND_URL}/payment-success?data=${data}`);
  return res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
};

// GET /esewa/fail — backend redirect handler (if failure_url points to backend)
module.exports.esewaFail = async (req, res) => {
  const { transaction_uuid } = req.query;
  if (transaction_uuid) {
    await orderModel.findByIdAndUpdate(transaction_uuid, { paymentStatus: 'failed' }).catch(() => {});
  }
  return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
};
