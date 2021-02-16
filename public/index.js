// Set transacations to an empty attay
let transactions = [];
let myChart;

// fetch Request for the data
fetch("/api/transaction")
  // Json the response
  .then(response => {
    return response.json();
  })
  // set the data
  .then(data => {
    // save db data on global variable
    transactions = data;

    // call the functions for the budget tracker
    populateTotal();
    populateTable();
    populateChart();
  });

// Function to get the total
function populateTotal() {
  // reduce transaction amounts to a single total value
  let total = transactions.reduce((total, t) => {
    return total + parseInt(t.value);
  }, 0);

  let totalEl = document.querySelector("#total");
  totalEl.textContent = total;
}

// Function to display to the table
function populateTable() {
  let tbody = document.querySelector("#tbody");
  tbody.innerHTML = "";
  // Loop through the transactions!
  transactions.forEach(transaction => {
    // create and populate a table row
    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${transaction.name}</td>
      <td>${transaction.value}</td>
    `;
    // Append to the screen
    tbody.appendChild(tr);
  });
}

// Function to display the chart
function populateChart() {
  // copy array and reverse it
  let reversed = transactions.slice().reverse();
  let sum = 0;

  // create date labels for chart
  let labels = reversed.map(t => {
    let date = new Date(t.date);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  });

  // create incremental values for chart
  let data = reversed.map(t => {
    sum += parseInt(t.value);
    return sum;
  });

  // remove old chart if it exists
  if (myChart) {
    myChart.destroy();
  }

  let ctx = document.getElementById("myChart").getContext("2d");

  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: "Total Over Time",
        fill: true,
        backgroundColor: "#6666ff",
        data
      }]
    }
  });
}

// Function to get the transaction data from the inputs
function sendTransaction(isAdding) {
  let nameEl = document.querySelector("#t-name");
  let amountEl = document.querySelector("#t-amount");
  let errorEl = document.querySelector(".form .error");

  // validate form
  if (nameEl.value === "" || amountEl.value === "") {
    errorEl.textContent = "Missing Information";
    return;
  }
  else {
    errorEl.textContent = "";
  }

  // create record
  let transaction = {
    name: nameEl.value,
    value: amountEl.value,
    date: new Date().toISOString()
  };

  // if subtracting funds, convert amount to negative number
  if (!isAdding) {
    transaction.value *= -1;
  }

  // add to beginning of current array of data
  transactions.unshift(transaction);

  // re-run logic to populate ui with new record
  populateChart();
  populateTable();
  populateTotal();

  // also send to server
  fetch("/api/transaction", {
    method: "POST",
    body: JSON.stringify(transaction),
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    }
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      if (data.errors) {
        errorEl.textContent = "Missing Information";
      }
      else {
        // clear form
        nameEl.value = "";
        amountEl.value = "";
      }
    })
    .catch(err => {

      // fetch failed, so save in indexed db
      saveRecord(transaction)

      // clear form
      nameEl.value = "";
      amountEl.value = "";
    });
}

// On click event for the add button
document.querySelector("#add-btn").onclick = function () {
  sendTransaction(true);
};

// On click event for the subtract button
document.querySelector("#sub-btn").onclick = function () {
  sendTransaction(false);
};

// function that runs on page reload (invoked)
// check the indexded db if there is data. 
// loop the array of key value pairs

// https://medium.com/@seandmelody/fun-with-linear-radial-gradients-bfcc47cade71

