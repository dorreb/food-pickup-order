$(() => {
  $(".tabs").tabs();

  getOrderCards();

  $(document).on("click", ".close-modal", (e) => {
    $(".modal-container").addClass("hide");
  });
});

/*------------------------------------------------------------------------------------*/

const getOrderCards = () => {
  $.ajax({
    type: "GET",
    url: "/api/restaurant/orders",
    success: (res) => {
      renderOrderCards(res);
    },
  });
};

/*------------------------------------------------------------------------------------*/

const onConfirm = (data) => {
  $.ajax({
    type: "POST",
    url: `/api/restaurant/orders/${data.orderId}/confirm`,
    data: data,
    success: getOrderCards,
  });
};

const onEdit = (data) => {
  $.ajax({
    type: "POST",
    url: `/api/restaurant/orders/${data.orderId}/update`,
    data: data,
    success: getOrderCards,
  });
};

/*------------------------------------------------------------------------------------*/

const orderFormHandler = function (event) {
  event.preventDefault();

  const data = event.target.dataset;
  const preptime = $(event.target)
    .find(`[id='preptime-form-${data.orderId}']`)
    .val();
  const completeData = {
    preptime: 0,
    isComplete: false,
    isCancelled: false,
    ...data,
    preptime,
  };
  console.log("data: ", data);
  console.log("complete: ", completeData);
  if (data.type === "confirm") {
    toggleModalHandler(onConfirm, completeData);
  } else {
    toggleModalHandler(onEdit, completeData);
  }
};

/*------------------------------------------------------------------------------------*/

const toggleModalHandler = (formSubmitHandler, data) => {
  const $modalContainer = $(".modal-container");
  const $modalMessage = $modalContainer.find("p");

  const modalMessages = {
    cancel: "Are you sure you want to cancel the order?",
    ready: "Are you sure you want to notify customer that order is ready?",
    complete: "Are you sure you want to complete this order?",
    edit: "Are you sure you want to edit the preparation time for this order?",
    confirm: "Are you sure you want to add the preparation time to this order?",
  };

  if ($modalContainer.hasClass("hide")) {
    $modalMessage.empty();
    $modalMessage.append(modalMessages[data.type]);
    $modalContainer.removeClass("hide");
    $modalContainer.find(".confirm-button").on("click", () => {
      formSubmitHandler(data);
    });
  } else {
    $modalContainer.addClass("hide");
  }
};

/*------------------------------------------------------------------------------------*/

const renderOrderCards = (ordersData) => {
  const parsedOrders = {};
  ordersData.forEach((order) => {
    const {
      order_id,
      created_at,
      estimated_ready_at,
      is_complete,
      ready_at,
      is_cancelled,
      phone_number,
    } = order;
    if (!parsedOrders[order_id]) {
      const orderObj = {
        order_id,
        created_at,
        estimated_ready_at,
        is_complete,
        ready_at,
        is_cancelled,
        phone_number,
        foods: [],
      };

      parsedOrders[order_id] = orderObj;
    }

    const parsedProduct = {
      name: order.name,
      quantity: Number(order.food_quantity),
    };

    parsedOrders[order_id].foods.push(parsedProduct);
  });

  const orders = Object.values(parsedOrders);

  const $modalContainer = $(".modal-container");
  $modalContainer.addClass("hide");
  $(".cards-container").empty();

  orders.forEach((order) => {
    const {
      order_id,
      phone_number,
      estimated_ready_at,
      ready_at,
      foods,
      is_complete,
      is_cancelled,
    } = order;

    if (is_cancelled) {
      return;
    }

    if (is_complete) {
      $("#completed").append(
        createOrderCard(
          order_id,
          phone_number,
          estimated_ready_at,
          foods,
          ready_at,
          is_complete,
          updateRemainingTime
        )
      );
    } else {
      $("#in-progress").append(
        createOrderCard(
          order_id,
          phone_number,
          estimated_ready_at,
          foods,
          ready_at,
          is_complete,
          updateRemainingTime
        )
      );
    }
  });
};

/*------------------------------------------------------------------------------------*/

const createOrderCard = (
  order_id,
  phone_number,
  estimated_ready_at,
  foods,
  ready_at,
  is_complete,
  countdownFn
) => {
  const $orderCard = $(`
  <div class="card col">
  <div class="card-content">
<span class="card-title activator grey-text text-darken-4"
  >Order ID: ${order_id}<i class="material-icons right options-icon">more_vert</i></span
>
<p>Phone Number: <a href="tel:${phone_number}">${phone_number}</a></p>
<ul class='food-list'>

</ul>
<div class="preptime-form-container new">
</div>
</div>
<div class="card-reveal">
<section class="card-reveal-header">
  <span class="card-title grey-text text-darken-4"
    >Order ID: ${order_id}<i class="material-icons right">close</i></span
  >
  <p>Phone Number: <a href="tel:${phone_number}">${phone_number}</a></p>
</section>
<section class="card-reveal-content">
  <div class="preptime-form-container edit">

  </div>
  <div class="button-forms">
    <form class="update" data-type="ready" data-order-id="${order_id}" onSubmit="orderFormHandler(event)" id="order-ready">
      <button class="btn modal-trigger order-ready" type="submit">
        Order Ready
      </button>
    </form>
    <form class="update" data-is-cancelled="true" data-type="cancel" data-order-id="${order_id}" onSubmit="orderFormHandler(event)" id="order-cancel">
      <button class="btn modal-trigger order-cancel red darken-4" type="submit">
        Cancel Order
      </button>
    </form>
  </div>
</section>
</div>
</div>`);

  let $foodListContainer = $orderCard.find("ul");
  foods.forEach((food) => {
    $foodListContainer.append(
      `<li>${food.name} x <strong>${food.quantity}</strong></li>`
    );
  });

  let $preptimeFormContainer = $orderCard.find(".preptime-form-container.new");

  let $prepFormContent;

  console.log(ready_at);
  if (ready_at) {
    $prepFormContent = $(`
    <form class="update" id="order-complete" data-is-complete="true" data-type="complete" data-order-id='${order_id}' onSubmit="orderFormHandler(event)" >
      <button class="btn modal-trigger order-complete" type="submit">
        Complete Order
      </button>
    </form>
  `);
    $orderCard.find(".card-reveal").remove();
    $orderCard.find(".options-icon").remove();
    $orderCard.find(".card-title").removeClass("activator");
  }

  if (is_complete) {
    $orderCard.find(".card-reveal").remove();
    $orderCard.find("#options_icon").remove();
    $prepFormContent = $(`
    <p>
      Congratulations! This order is now complete.
    </p>
  `);
  }

  if (estimated_ready_at && !ready_at && !is_complete) {
    const utcDate = new Date(estimated_ready_at);
    const localTime = new Date(
      utcDate.getTime() - utcDate.getTimezoneOffset() * 60 * 1000
    ).toLocaleTimeString();

    countdownFn(estimated_ready_at, order_id);

    $prepFormContent = $(`
    <p>You have until ${localTime} to prepare this order.</p>
    <p id="countdown_${order_id}"></p>`);

    $orderCard.find(".preptime-form-container.edit").append(`
      <form class="update" id="preptime-edit" data-type="edit" data-order-id="${order_id}" onSubmit="orderFormHandler(event)" >
        <label for="preptime-input" >How much more time do you need? (minutes)</label>
        <div class='input-container'>
          <input
          class="browser-default"
          id="preptime-form-${order_id}"
          type="number"
          name="preparation_time"
          min="10"
          max="70"
          step='5'
          />
          <button id="preptime-button" class="btn" type="submit">Submit</button>
        </div>
      </form>
`);
  } else if (!estimated_ready_at && !ready_at) {
    $prepFormContent = $(`
    <form id="preptime-confirm" data-type="confirm" data-order-id="${order_id}" onSubmit="orderFormHandler(event)" >
      <label for="preptime-input" >Estimated prep time (minutes)</label>
      <div class='input-container'>
        <input
        class="browser-default"
        id="preptime-form-${order_id}"
        type="number"
        name="preparation_time"
        min="10"
        max="70"
        step='5'
        />
        <button id="preptime-button" class="btn">Confirm</button>
      </div>
    </form>
    `);
  }

  $preptimeFormContainer.append($prepFormContent);

  return $orderCard;
};

/*------------------------------------------------------------------------------------*/

const orderRemainingTimeIntervals = {};

const updateRemainingTime = (estimated_ready_at, order_id) => {
  clearInterval(orderRemainingTimeIntervals[order_id]);

  const dateExpectedReadyAt = new Date(estimated_ready_at);
  const msSinceEpoch = dateExpectedReadyAt.getTime();

  orderRemainingTimeIntervals[order_id] = setInterval(() => {
    const timeRemaining = msSinceEpoch - Date.now();

    const hours = Math.floor(
      (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    $(`#countdown_${order_id}`).empty();
    $(`#countdown_${order_id}`).append(
      `Time Remaining: ${String(hours).padStart(2, "0")} : ${String(
        minutes
      ).padStart(2, "0")} : ${String(seconds).padStart(2, "0")}`
    );

    if (timeRemaining < 0) {
      clearInterval(orderRemainingTimeIntervals[order_id]);
      $(`#countdown_${order_id}`).empty();
      $(`#countdown_${order_id}`).append(`Time's up!`);
    }
  }, 1000);
};

console.log(Intl.DateTimeFormat().resolvedOptions().timeZone);
