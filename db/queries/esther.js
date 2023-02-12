const db = require("../connection");

const editPreptime = (order_id, preptime) => {
  return db
    .query(
      `UPDATE orders
  SET preparation_time = $2
  WHERE orders.id = $1
  RETURNING *;`,
      [order_id, preptime]
    )
    .then((data) => {
      console.log(data);
      return data.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};

const cancelOrder = (order_id) => {
  return db
    .query(
      `UPDATE orders
  SET isCancelled = TRUE
  WHERE orders.id = $1
  RETURNING *;`,
      [order_id]
    )
    .then((data) => {
      console.log(data);
      return data.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};

module.exports = { editPreptime, cancelOrder };
