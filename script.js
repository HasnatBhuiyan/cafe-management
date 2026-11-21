// 1. HASNAT'S PART: LOGIN GUARD, STAFF BADGE, ADMIN UI & LOGOUT

let staffWelcome = document.getElementById("staffWelcome");
if (staffWelcome) {
  
    let loggedInStaff = localStorage.getItem("cafe_logged_in");
    let currentRole = localStorage.getItem("cafe_user_role");

    if (!loggedInStaff) {
        window.location.href = "login.html";
    } else {
        staffWelcome.innerHTML = "Staff: " + loggedInStaff;
    }

    
    let adminDeleteControls = document.getElementById("adminDeleteControls");
    let historyMsg = document.getElementById("historyMsg");
    if (adminDeleteControls && currentRole !== "Admin") {
        adminDeleteControls.style.display = "none";
        if (historyMsg) {
            historyMsg.innerHTML = "Note: Only Admin can delete order history.";
            historyMsg.style.color = "#555555";
        }
    }

    
    let logoutLink = document.getElementById("logoutLink");
    if (logoutLink) {
        logoutLink.addEventListener("click", function(event) {
            event.preventDefault();
            localStorage.removeItem("cafe_logged_in");
            localStorage.removeItem("cafe_user_role");
            window.location.href = "login.html";
        });
    }
}


// 2. MURAD'S PART: STAFF REGISTRATION & LOGIN

let registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", function(event) {
        event.preventDefault();

        let fullName = document.getElementById("regName").value;
        let username = document.getElementById("regUser").value;
        let password = document.getElementById("regPass").value;
        let role = document.getElementById("regRole").value;
        let regMsg = document.getElementById("regMsg");

        
        if (fullName === "" || username === "" || password === "" || role === "") {
            regMsg.innerHTML = "Error: Please fill in all registration fields!";
            regMsg.style.color = "red";
            return;
        }

        
        localStorage.setItem("cafe_reg_name", fullName + " (" + role + ")");
        localStorage.setItem("cafe_reg_user", username);
        localStorage.setItem("cafe_reg_pass", password);
        localStorage.setItem("cafe_reg_role", role);

        regMsg.innerHTML = "Registration Successful for " + fullName + " (" + role + ")! You can now log in below.";
        regMsg.style.color = "green";
        regMsg.style.fontWeight = "bold";
        registerForm.reset();
    });
}

let loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        let user = document.getElementById("loginUser").value;
        let pass = document.getElementById("loginPass").value;
        let loginMsg = document.getElementById("loginMsg");

        if (user === "" || pass === "") {
            loginMsg.innerHTML = "Error: Enter both username and password!";
            loginMsg.style.color = "red";
            return;
        }

        let savedUser = localStorage.getItem("cafe_reg_user");
        let savedPass = localStorage.getItem("cafe_reg_pass");
        let savedName = localStorage.getItem("cafe_reg_name");
        let savedRole = localStorage.getItem("cafe_reg_role");

        if (user === "admin" && pass === "1234") {
            localStorage.setItem("cafe_logged_in", "Admin");
            localStorage.setItem("cafe_user_role", "Admin");
            window.location.href = "index.html?staff=" + encodeURIComponent("Admin");
        } else if (savedUser && user === savedUser && pass === savedPass) {
            localStorage.setItem("cafe_logged_in", savedName);
            localStorage.setItem("cafe_user_role", savedRole);
            window.location.href = "index.html?staff=" + encodeURIComponent(savedName);
        } else {
            loginMsg.innerHTML = "Invalid username or password! (Default Admin: admin / 1234)";
            loginMsg.style.color = "red";
        }
    });
}


// 3. ASHIL'S PART: MULTI-ITEM ORDERS & DATE-WISE HISTORY

let orderHistory = [];
let orderCount = 0;


let savedHistoryData = localStorage.getItem("cafe_order_history");
if (savedHistoryData) {
    orderHistory = JSON.parse(savedHistoryData);
    if (orderHistory.length > 0) {
        orderCount = orderHistory[orderHistory.length - 1].id;
    }
}

let orderForm = document.getElementById("orderForm");
if (orderForm) {
    
    renderHistory();

    orderForm.addEventListener("submit", function(event) {
        event.preventDefault();

        let name = document.getElementById("custName").value;
        let table = document.getElementById("tableNo").value;
        let errorMsg = document.getElementById("errorMsg");

        let qEspresso = parseInt(document.getElementById("qtyEspresso").value, 10) || 0;
        let qCold = parseInt(document.getElementById("qtyCold").value, 10) || 0;
        let qSandwich = parseInt(document.getElementById("qtySandwich").value, 10) || 0;
        let qMuffin = parseInt(document.getElementById("qtyMuffin").value, 10) || 0;

   
        let types = document.getElementsByName("orderType");
        let selectedType = "Dine-In";
        for (let i = 0; i < types.length; i++) {
            if (types[i].checked) {
                selectedType = types[i].value;
            }
        }

        // Validation
        if (name === "" || table === "") {
            errorMsg.innerHTML = "Error: Please enter Customer Name and Table Number!";
            errorMsg.style.color = "red";
            errorMsg.style.fontWeight = "bold";
            return;
        }

        if (table < 1 || table > 10) {
            errorMsg.innerHTML = "Error: Table number must be between 1 and 10.";
            errorMsg.style.color = "red";
            return;
        }

        if (qEspresso <= 0 && qCold <= 0 && qSandwich <= 0 && qMuffin <= 0) {
            errorMsg.innerHTML = "Error: Please select a quantity of at least 1 for any item!";
            errorMsg.style.color = "red";
            errorMsg.style.fontWeight = "bold";
            return;
        }

      
        let itemList = [];
        let totalBill = 0;

        if (qEspresso > 0) {
            itemList.push("Espresso Coffee x" + qEspresso);
            totalBill += qEspresso * 120;
        }
        if (qCold > 0) {
            itemList.push("Cold Coffee x" + qCold);
            totalBill += qCold * 150;
        }
        if (qSandwich > 0) {
            itemList.push("Chicken Sandwich x" + qSandwich);
            totalBill += qSandwich * 180;
        }
        if (qMuffin > 0) {
            itemList.push("Chocolate Muffin x" + qMuffin);
            totalBill += qMuffin * 100;
        }

        let combinedItems = itemList.join(", ");

        errorMsg.innerHTML = "";
        insertOrder(name, table, combinedItems, totalBill, selectedType);
        orderForm.reset();
    });
}


let deleteDayBtn = document.getElementById("deleteDayBtn");
if (deleteDayBtn) {
    deleteDayBtn.addEventListener("click", function() {
        let historyMsg = document.getElementById("historyMsg");

       
        if (localStorage.getItem("cafe_user_role") !== "Admin") {
            historyMsg.innerHTML = "Access Denied: Only Admin can delete order history!";
            historyMsg.style.color = "red";
            return;
        }

        let selectedDate = document.getElementById("deleteDateSelect").value;
        if (selectedDate === "") {
            historyMsg.innerHTML = "Error: Please choose a date first to delete!";
            historyMsg.style.color = "red";
            return;
        }

        let remainingOrders = [];
        for (let i = 0; i < orderHistory.length; i++) {
            if (orderHistory[i].date !== selectedDate) {
                remainingOrders.push(orderHistory[i]);
            }
        }

        orderHistory = remainingOrders;
        localStorage.setItem("cafe_order_history", JSON.stringify(orderHistory));

        historyMsg.innerHTML = "Deleted all orders from " + selectedDate + ".";
        historyMsg.style.color = "green";
        historyMsg.style.fontWeight = "bold";

        renderHistory();
    });
}


let clearHistoryBtn = document.getElementById("clearHistoryBtn");
if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", function() {
        let historyMsg = document.getElementById("historyMsg");

       
        if (localStorage.getItem("cafe_user_role") !== "Admin") {
            historyMsg.innerHTML = "Access Denied: Only Admin can clear order history!";
            historyMsg.style.color = "red";
            return;
        }

        orderHistory = [];
        localStorage.removeItem("cafe_order_history");
        historyMsg.innerHTML = "All order history cleared by Admin.";
        historyMsg.style.color = "green";
        renderHistory();
    });
}


function insertOrder(name, table, itemsText, totalBill, type) {
    orderCount = orderCount + 1;
    let rowId = "row_" + orderCount;
    let statusId = "status_" + orderCount;

    let now = new Date();
    let orderDate = now.toLocaleDateString();
    let orderTime = now.toLocaleTimeString();

    let orderBody = document.getElementById("orderBody");
    let row = document.createElement("tr");
    row.id = rowId;

    row.innerHTML =
        "<td>" + name + "</td>" +
        "<td>" + table + "</td>" +
        "<td>" + itemsText + "</td>" +
        "<td>" + totalBill + " BDT</td>" +
        "<td>" + type + "</td>" +
        "<td id='" + statusId + "'>Pending</td>" +
        "<td>" +
            "<button type='button' onclick='updateStatus(\"" + orderCount + "\")'>Serve</button> " +
            "<button type='button' onclick='deleteOrder(\"" + rowId + "\")'>Delete</button>" +
        "</td>";

    orderBody.appendChild(row);

    let newRecord = {
        id: orderCount,
        date: orderDate,
        time: orderTime,
        name: name,
        table: table,
        items: itemsText,
        total: totalBill,
        type: type,
        status: "Pending"
    };

    orderHistory.push(newRecord);
    localStorage.setItem("cafe_order_history", JSON.stringify(orderHistory));
    renderHistory();
}


function renderHistory() {
    let historyBody = document.getElementById("historyBody");
    let historyCount = document.getElementById("historyCount");
    let deleteDateSelect = document.getElementById("deleteDateSelect");
    if (!historyBody) return;

    historyBody.innerHTML = "";
    historyCount.innerHTML = orderHistory.length;

    let uniqueDates = [];

    for (let i = 0; i < orderHistory.length; i++) {
        let record = orderHistory[i];

        if (uniqueDates.indexOf(record.date) === -1) {
            uniqueDates.push(record.date);
        }

        let hRow = document.createElement("tr");

        let statusColor = "black";
        if (record.status === "Served") {
            statusColor = "green";
        }

        hRow.innerHTML =
            "<td>#" + record.id + "</td>" +
            "<td>" + record.date + " (" + record.time + ")</td>" +
            "<td>" + record.name + "</td>" +
            "<td>" + record.table + "</td>" +
            "<td>" + record.items + "</td>" +
            "<td>" + record.total + " BDT</td>" +
            "<td>" + record.type + "</td>" +
            "<td style='color:" + statusColor + "; font-weight:bold;'>" + record.status + "</td>";

        historyBody.appendChild(hRow);
    }

    if (deleteDateSelect) {
        deleteDateSelect.innerHTML = "<option value=''>-- Choose Date --</option>";
        for (let j = 0; j < uniqueDates.length; j++) {
            let opt = document.createElement("option");
            opt.value = uniqueDates[j];
            opt.innerHTML = uniqueDates[j];
            deleteDateSelect.appendChild(opt);
        }
    }
}


function updateStatus(idNumber) {
    let statusCell = document.getElementById("status_" + idNumber);
    if (statusCell) {
        statusCell.innerHTML = "Served";
        statusCell.style.color = "green";
        statusCell.style.fontWeight = "bold";
    }

    for (let i = 0; i < orderHistory.length; i++) {
        if (orderHistory[i].id == idNumber) {
            orderHistory[i].status = "Served";
        }
    }

    localStorage.setItem("cafe_order_history", JSON.stringify(orderHistory));
    renderHistory();
}


function deleteOrder(rowId) {
    let orderBody = document.getElementById("orderBody");
    let rowToDelete = document.getElementById(rowId);
    orderBody.removeChild(rowToDelete);
}