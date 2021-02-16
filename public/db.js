// consts for the database
let db;
// Open IndexedDB
const request = indexedDB.open("budget");

// request.on upgrade to set up the IndexedDB database
request.onupgradeneeded = function (e) {
    // Target the event
    let db = e.target.result;
    // Set up the database to be called "pending", and autoIncrement each item added
    db.createObjectStore("pending", { autoIncrement: true });
};

// request.on success to set up the connection to IndexedDB
request.onsuccess = function (e) {
    // Target the event
    db = e.target.result;

    // If statement to check to see if the database is online
    if (navigator.onLine) {
        // call the check database function
        checkDatabase();
    }
};

// request.onerror to check for errors in setting up IndexedDB
request.onerror = function (e) {
    // Console.log the error
    console.log("IndexedDB onerror" + e);
};

// Function getting called from the index.js page, catch error api request
function saveRecord(offLineItem) {
    // Create a transaction on the database "pending"
    const transaction = db.transaction(["pending"], "readwrite");
    // set the store
    const store = transaction.objectStore("pending");
    // add the offLineItem to the store
    store.add(offLineItem);
}

// Function to check the IndexedDB database
function checkDatabase() {
    // Open the "pending" transactions
    const transaction = db.transaction(["pending"], "readwrite");
    // Set the store
    const store = transaction.objectStore("pending");
    // get all records from store and set to getAllOffline
    const getAllOffline = store.getAll();

    getAllOffline.onsuccess = function () {
        // If statment to make sure there is something in the list
        if (getAllOffline.result.length > 0) {
            // Fetch POST request to send the data to the bulk fetch request
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAllOffline.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                // Json the response
                .then(response => response.json())
                .then(() => {
                    // if successful, open the "pending" transactions
                    const transaction = db.transaction(["pending"], "readwrite");
                    // Set the store
                    const store = transaction.objectStore("pending");
                    // Clear out the store
                    store.clear();
                });
        }
    };
}

// Event listener to check to see if the database is online
window.addEventListener("online", checkDatabase);