document.addEventListener("DOMContentLoaded", function () {
  const authToken =
    sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
  if (authToken) {
    fetch("/data", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        updateUI(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  } else {
    console.error("No auth token found");
  }

  const socket = new WebSocket("ws://173.255.238.135:3001");

  socket.onopen = function (event) {
    console.log("Connection opened");
    var status = document.getElementById("connectionStatus");
    status.classList.replace("disconnected", "connected");
    status.innerHTML = "Connected";
  };

  socket.onmessage = function (event) {
    console.log("New Incoming Data: \n", event.data);
    try {
      const data = JSON.parse(event.data);
      if (validateData(data)) {
        updateUI(data);
      } else {
        console.error("Invalid data received", data);
      }
    } catch (e) {
      console.error("Error parsing the incoming data", e);
    }
  };

  socket.onclose = function (event) {
    console.log("Connection closed");
    var status = document.getElementById("connectionStatus");
    status.classList.replace("connected", "disconnected");
    status.innerHTML = "Disconnected";
  };

  socket.onerror = function (error) {
    console.log("WebSocket Error: ", error);
  };

  const ctxVending = document.getElementById("vendingChart").getContext("2d");
  const ctxChanger = document.getElementById("changerChart").getContext("2d");
  const ctxCoinBill = document.getElementById("coinBillChart").getContext("2d");

  const vendingChart = new Chart(ctxVending, {
    type: "bar",
    data: {
      labels: ["Product A", "Product B", "Product C"],
      datasets: [
        {
          label: "Vends Count",
          data: [0, 0, 0],
          backgroundColor: [
            "rgba(204, 15, 56, 0.81)",
            "rgba(5, 107, 174, 0.89)",
            "rgb(1, 159, 38)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(75, 192, 192, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  const changerChart = new Chart(ctxChanger, {
    type: "doughnut",
    data: {
      labels: ["Nickels", "Dimes", "Quarters"],
      datasets: [
        {
          label: "Changer Details",
          data: [0, 0, 0],
          backgroundColor: [
            "rgba(204, 15, 56, 0.81)",
            "rgba(5, 107, 174, 0.89)",
            "rgb(1, 159, 38)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(75, 192, 192, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
  });

  const coinBillChart = new Chart(ctxCoinBill, {
    type: "pie",
    data: {
      labels: ["Coin Box", "Bill Stack"],
      datasets: [
        {
          data: [0, 0],
          backgroundColor: [
            "rgba(204, 15, 56, 0.81)",
            "rgba(5, 107, 174, 0.89)",
          ],
          borderColor: ["rgb(192, 10, 49)", "rgba(54, 162, 235, 1)"],
          borderWidth: 1,
        },
      ],
    },
  });

  function validateData(data) {
    // Check for the main categories
    if (
      !data ||
      !data.vending ||
      !data.changer ||
      !data.coinBox ||
      !data.billStack
    ) {
      return false;
    }

    // Validate 'vending' object details
    const { vending } = data;
    if (!vending.products || vending.freeVends === undefined) {
      return false;
    }
    // Validate all products under 'vending'
    const products = vending.products;
    if (!products.A || !products.B || !products.C) {
      return false;
    }
    // Detailed validation for each product
    if (
      !validateProduct(products.A) ||
      !validateProduct(products.B) ||
      !validateProduct(products.C)
    ) {
      return false;
    }

    // Validate 'changer' object details
    const { changer } = data;
    if (
      changer.nickels === undefined ||
      changer.dimes === undefined ||
      changer.quarters === undefined ||
      changer.totalCashValue === undefined
    ) {
      return false;
    }

    // Validate 'coinBox' and 'billStack' objects
    if (
      data.coinBox.total === undefined ||
      data.billStack.total === undefined
    ) {
      return false;
    }

    return true; // If all checks pass
  }

  function validateProduct(product) {
    // Check required fields in a product
    return (
      product.count !== undefined &&
      product.price !== undefined &&
      product.flow !== undefined
    );
  }

  function updateCharts(data) {
    vendingChart.data.datasets[0].data = [
      data.vending.products.A.count,
      data.vending.products.B.count,
      data.vending.products.C.count,
    ];
    vendingChart.update();

    changerChart.data.datasets[0].data = [
      data.changer.nickels,
      data.changer.dimes,
      data.changer.quarters,
    ];
    changerChart.update();

    coinBillChart.data.datasets[0].data = [
      data.coinBox.total,
      data.billStack.total,
    ];
    coinBillChart.update();
  }

  function updateUI(data) {
    // Update charts
    updateCharts(data);

    // Update error flags
    document.getElementById("tankLow").textContent = data.errors.tankLow
      ? "Yes"
      : "No";
    document.getElementById("uvFail").textContent = data.errors.uvFail
      ? "Yes"
      : "No";
    document.getElementById("flowFail").textContent = data.errors.flowFail
      ? "Yes"
      : "No";
    document.getElementById("mdbFail").textContent = data.errors.mdbFail
      ? "Yes"
      : "No";
    document.getElementById("other").textContent = data.errors.other
      ? "Yes"
      : "No";

    // Update transaction details
    document.getElementById("escrow").textContent = data.transactions.escrow;
    document.getElementById(
      "cashTotal"
    ).textContent = `$${data.transactions.cashTotal}`;
    document.getElementById(
      "cashSinceLastReset"
    ).textContent = `$${data.transactions.cashSinceLastReset}`;
  }
});
