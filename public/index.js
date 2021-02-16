let transactions = [];
let myChart;



// const dbName = "budget"

// const request = indexedDB.open(dbName)

// request.onupgradeneeded = () => {
//   console.log(`indexedDB ${dbName} upgrade called`)
//   // const db = e.target.result
//   // const store = db.createObjectStore("budget", { keyPath: "id" })
//   request.result.createObjectStore("offLineBudget", { keyPath: "id", autoIncrement: true })
// }

// request.onsuccess = () => {
//   console.log(`indexedDB ${dbName} success called`)

// }


// request.onerror = e => {
//   console.log(`indexedDB ${dbName}  error called`)
// }


fetch("/api/transaction")
  .then(response => {
    return response.json();
  })
  .then(data => {
    // save db data on global variable
    transactions = data;

    populateTotal();
    populateTable();
    populateChart();
  });

function populateTotal() {
  // reduce transaction amounts to a single total value
  let total = transactions.reduce((total, t) => {
    return total + parseInt(t.value);
  }, 0);

  let totalEl = document.querySelector("#total");
  totalEl.textContent = total;
}

function populateTable() {
  let tbody = document.querySelector("#tbody");
  tbody.innerHTML = "";

  transactions.forEach(transaction => {
    // create and populate a table row
    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${transaction.name}</td>
      <td>${transaction.value}</td>
    `;

    tbody.appendChild(tr);
  });
}

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
      // save to indexedDB if budget db is offline 

      // fetch failed, so save in indexed db
      saveRecord(transaction)
      // console.log(transaction)

      // function saveRecord(transaction) {
      //   console.log(transaction)


      //   const request = indexedDB.open(dbName)
      //   // openRequest.onupgradeneeded = () => {
      //   //   console.log(`indexedDB ${dbName} upgrade called`)
      //   //   // const db = e.target.result
      //   //   // const store = db.createObjectStore("budget", { keyPath: "id" })
      //   //   openRequest.result.createObjectStore("offLineBudget", { keyPath: "id", autoIncrement: true })
      //   // }
      //   request.onsuccess = () => {
      //     // const db = e.target.result
      //     // console.log(`${transaction.name} added to indexedDB`)
      //     // saveRecord()
      //     // console.log(transaction)

      //     let store = request.result.transaction("offLineBudget", "readwrite").objectStore("offLineBudget");
      //     store.add(transaction)
      //     console.log(`${transaction.name} added to indexedDB`)
      //   }

      // https://www.freecodecamp.org/news/a-quick-but-complete-guide-to-indexeddb-25f030425501/

      // const dbName = "budget"

      // const openRequest = indexedDB.open(dbName)

      // openRequest.onupgradeneeded = () => {
      //   console.log(`indexedDB ${dbName} upgrade called`)
      //   // const db = e.target.result
      //   // const store = db.createObjectStore("budget", { keyPath: "id" })
      //   openRequest.result.createObjectStore("offLineBudget", { keyPath: "id", autoIncrement: true })
      // }

      // openRequest.onsuccess = () => {
      //   // const db = e.target.result
      //   console.log(`indexedDB ${dbName} success called`)

      //   console.log(transaction)

      //   let store = openRequest.result.transaction("offLineBudget", "readwrite").objectStore("offLineBudget");
      //   store.add(transaction)
      //   // let getRequest = store.get(transaction)
      //   // getRequest.onsuccess = () => {
      //   //   let result = getRequest.result
      //   //   if (result) {
      //   //     console.log(`found ${result}`)
      //   //   } else {
      //   //     console.log("not found")
      //   //     store.add(id, transaction)
      //   //   }
      //   // }

      //   // const offLine = db.store("transactions", "readwrite")
      //   // const offLineTransaction = offLine.objectStore("transactions")
      //   // offLineTransaction.add(transaction)

      //   // colum = ID, colum  = transaction obj { key : value }


      // }






      // request.onerror = e => {
      //   console.log(`indexedDB ${dbName}  error called`)
      // }

      // }









      // clear form
      nameEl.value = "";
      amountEl.value = "";
    });
}

document.querySelector("#add-btn").onclick = function () {
  sendTransaction(true);
};

document.querySelector("#sub-btn").onclick = function () {
  sendTransaction(false);
};

// function that runs on page reload (invoked)
// check the indexded db if there is data. 
// loop the array of key value pairs

// https://medium.com/@seandmelody/fun-with-linear-radial-gradients-bfcc47cade71


// function getIndexedDB() {
//   let offLine = request.result.transaction("offLineBudget").objectStore("offLineBudget").get("1").onsuccess = function (event) {
//     console.log("Name for SSN 444-44-4444 is " + event.target.result.name);
//   };
// }
// getIndexedDB()