
const crypto = require('crypto');
const orderModel = require('../models/order.model');

// generate pay form same style shopnepal
module.exports.esewaPay = async (req, res) => {
  try {
    const { orderId, total_amount, product_code = 'EPAYTEST', success_url, failure_url } = req.body;
    if (!orderId || !total_amount) return res.status(400).send('missing');

    const secret = process.env.ESEWA_SECRET || '8gBm/:&EnhH.1/q';
    const transaction_uuid = orderId;

    const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const signature = crypto.createHmac('sha256', secret).update(message).digest('base64');

    const html = `
      <form id="esewaForm" method="POST" action="https://rc-web.esewa.com.np/api/epay/main/v2/form">
        <input name="amount" value="${total_amount}" />
        <input name="tax_amount" value="0" />
        <input name="product_service_charge" value="0" />
        <input name="product_delivery_charge" value="0" />
        <input name="total_amount" value="${total_amount}" />
        <input name="transaction_uuid" value="${transaction_uuid}" />
        <input name="product_code" value="${product_code}" />
        <input name="success_url" value="${success_url}" />
        <input name="failure_url" value="${failure_url}" />
        <input name="signature" value="${signature}" />
        <input name="signed_field_names" value="total_amount,transaction_uuid,product_code" />
      </form>
      <script>document.getElementById('esewaForm').submit();</script>
    `;
    return res.send(html);
  } catch (e) { return res.status(500).send(e.message); }
};

// == SUCCESS CALLBACK, replace your existing function with this ==
module.exports.esewaSuccess = async (req, res) => {
  try {
    // esewa sends transaction_uuid = orderId
    const transaction_uuid = req.query.transaction_uuid;
    const total_amount = req.query.total_amount;

    // load order model
    const Order = require("../models/order.model");

    // update order as paid
    await Order.findByIdAndUpdate(transaction_uuid, {
      paymentStatus: "completed",
      paidAmount: total_amount
    });

    // redirect user to frontend order success UI
    return res.redirect(`${process.env.FRONTEND_URL}/payment-success?orderId=${transaction_uuid}`);


  } catch (err) {
    console.error("esewaSuccess error", err);
    return res.status(500).send("server error in esewa success");
  }
};


module.exports.esewaFail = async (req, res) => {
  const { transaction_uuid } = req.query;
  if (transaction_uuid) await orderModel.findByIdAndUpdate(transaction_uuid, { paymentStatus: 'failed' });
  res.send('fail');
}
