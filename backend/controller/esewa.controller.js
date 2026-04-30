const crypto = require('crypto');
const orderModel = require('../models/order.model');

const ESEWA_SECRET = process.env.ESEWA_SECRET || '8gBm/:&EnhH.1/q';
// FIXED: was rc-epay.esewa.com.np — correct test URL is rc-web.esewa.com.np
const ESEWA_PAYMENT_URL = 'https://rc-web.esewa.com.np/api/epay/main/v2/form';

function generateSignature(totalAmount, transactionUuid, productCode) {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  return crypto.createHmac('sha256', ESEWA_SECRET).update(message).digest('base64');
}

// POST /esewa/pay
module.exports.esewaPay = async (req, res) => {
  try {
    const { orderId, total_amount, product_code = 'EPAYTEST', success_url, failure_url } = req.body;
    if (!orderId || !total_amount) return res.status(400).json({ message: 'orderId and total_amount are required' });

    const transaction_uuid = orderId;
    const signature = generateSignature(total_amount, transaction_uuid, product_code);

    const html = `
      <form id="esewaForm" method="POST" action="${ESEWA_PAYMENT_URL}">
        <input type="hidden" name="amount"                   value="${total_amount}" />
        <input type="hidden" name="tax_amount"               value="0" />
        <input type="hidden" name="product_service_charge"   value="0" />
        <input type="hidden" name="product_delivery_charge"  value="0" />
        <input type="hidden" name="total_amount"             value="${total_amount}" />
        <input type="hidden" name="transaction_uuid"         value="${transaction_uuid}" />
        <input type="hidden" name="product_code"             value="${product_code}" />
        <input type="hidden" name="success_url"              value="${success_url}" />
        <input type="hidden" name="failure_url"              value="${failure_url}" />
        <input type="hidden" name="signature"                value="${signature}" />
        <input type="hidden" name="signed_field_names"       value="total_amount,transaction_uuid,product_code" />
      </form>
      <script>document.getElementById('esewaForm').submit();</script>
    `;
    return res.send(html);
  } catch (e) {
    console.error('esewaPay error:', e);
    return res.status(500).json({ message: e.message });
  }
};

// POST /esewa/verify
// Frontend calls this with the raw base64 `data` param eSewa attached to success_url.
// Verifies HMAC signature and marks the order as paid.
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

    const { transaction_code, status, total_amount, transaction_uuid, product_code, signature: receivedSignature } = decoded;

    const expectedSignature = generateSignature(total_amount, transaction_uuid, product_code);
    if (expectedSignature !== receivedSignature) {
      return res.status(400).json({ message: 'Signature mismatch — possible tampering' });
    }

    if (status !== 'COMPLETE') {
      return res.status(400).json({ message: `Payment not complete. eSewa status: ${status}` });
    }

    const order = await orderModel.findByIdAndUpdate(
      transaction_uuid,
      { paymentStatus: 'completed' },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: 'Order not found for this transaction' });

    return res.status(200).json({
      message: 'Payment verified successfully',
      transactionCode: transaction_code,
      order: { _id: order._id, totalAmount: order.totalAmount, paymentStatus: order.paymentStatus, orderStatus: order.orderStatus },
    });
  } catch (err) {
    console.error('esewaVerify error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /esewa/success (legacy redirect handler)
module.exports.esewaSuccess = async (req, res) => {
  try {
    const { data } = req.query;
    if (data) {
      const decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
      const { transaction_uuid, status } = decoded;
      if (status === 'COMPLETE') {
        await orderModel.findByIdAndUpdate(transaction_uuid, { paymentStatus: 'completed' });
      }
      return res.redirect(`${process.env.FRONTEND_URL}/payment-success?data=${data}`);
    }
    return res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
  } catch (err) {
    console.error('esewaSuccess error:', err);
    return res.status(500).send('Server error in esewa success');
  }
};

// GET /esewa/fail
module.exports.esewaFail = async (req, res) => {
  const { transaction_uuid } = req.query;
  if (transaction_uuid) {
    await orderModel.findByIdAndUpdate(transaction_uuid, { paymentStatus: 'failed' }).catch(() => {});
  }
  return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
};
