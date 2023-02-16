const express = require("express");
const router = express.Router();
const customerQueries = require("../db/queries/customers");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const smsMessage = (message) => {
  return new Promise((res, err) => {
    client.messages
      .create({
        body: `${message}`,
        from: "+15205237081",
        to: '14169869028',
      })
      .then((message) => res(message.sid))
      .catch((err) => {
        console.log(err);
      });
  });
};


// Customer Queries

router.get("/menu", (req, res) => {
  customerQueries
    .getAllFoods()
    .then((foods) => {
      res.json(foods);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

router.post("/checkout", (req, res) => {
  const { customerData, foodArray } = req.body;
  if (!customerData[0] || !customerData[1] || !foodArray?.length) {
    return res.status(401).render("menu", {
      errorMessage: "You cannot submit empty fields.",
      owner: false,
      status: false,
    });
  }
  customerQueries
    .addCustomer(customerData)
    .then((customer) => {
      return customerQueries.addOrder(customer.id);
    })
    .then((order) => {
      const message = `You have recieved a new order from ${customerData[0]}! The order id is: ${order.id}. Check your orders page for more details.`;
      // smsMessage(message).then((res =>
      //   console.log(res)));
      return customerQueries.addFoodOrder(foodArray, order.id);
    })
    .then((foodOrder) => {
      req.session.order_id = foodOrder[0].order_id;
      res.redirect("/customer/status");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err.message });
    });
});

router.get("/status", (req, res) => {
  const order_id = req.session.order_id;

  console.log(order_id);

  if (order_id) {
    customerQueries
      .getOrderById(order_id)
      .then((order) => {
        res.json(order);
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  } else {
    // change status code
    res.status(400).json({ error: "This is not your order." });
  }
});

module.exports = router;
