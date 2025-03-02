const tableBody = document.querySelector("#postOfficeTable tbody");
const searchInput = document.getElementById("search");
const reportForm = document.getElementById("reportForm");
const currentDetailsTextarea = document.getElementById("currentDetails");
const suggestedChangesTextarea = document.getElementById("suggestedChanges");
const loginForm = document.getElementById("loginForm");
const logoutButton = document.getElementById("logoutButton");
const adminFeatures = document.getElementById("adminFeatures");
const showLoginButton = document.getElementById("showLoginButton");
const API_BASE_URL = 'https://your-render-app-url.onrender.com/api';
// Admin Credentials (for simplicity, store in localStorage)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "password123";

// Show Login Form
function showLoginForm() {
  loginForm.style.display = "block";
}

// Check if admin is logged in
function checkLogin() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn === "true") {
    loginForm.style.display = "none";
    showLoginButton.style.display = "none";
    logoutButton.style.display = "block";
    adminFeatures.style.display = "block";
  } else {
    loginForm.style.display = "none";
    showLoginButton.style.display = "block";
    logoutButton.style.display = "none";
    adminFeatures.style.display = "none";
  }
}

// Admin Login
document.getElementById("loginFormContent").addEventListener("submit", (e) => {
  e.preventDefault(); // Prevent form submission
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    localStorage.setItem("isLoggedIn", "true");
    checkLogin(); // Update UI after login
    loadData(); // Reload data to show edit buttons
    alert("Login successful!");
  } else {
    alert("Invalid username or password.");
  }
});

// Logout
function logout() {
  localStorage.removeItem("isLoggedIn");
  checkLogin(); // Update UI after logout
  loadData(); // Reload data to hide edit buttons
  alert("Logged out successfully!");
}

// Upload Excel File
document.getElementById("excelUpload").addEventListener("change", function (e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Convert Excel data to required format
    postOfficeData = jsonData.map((item) => ({
      office_name: item["office name"],
      control_office: item["control office"] === 0 ? "0" : item["control office"],
      num_sub_post_offices: item["number of sub post office"],
      ds_area: item["ds area"],
      dpmg_area: item["dpmg area"],
      postal_code: item["postal code"],
      delivery_state: item["delivery & non delivery state"] === "D" ? "D" : "ND",
      phone_number: item["phone number"].toString(),
    }));

    // Save to localStorage
    localStorage.setItem('postOfficeData', JSON.stringify(postOfficeData));

    loadData();
    alert("Data uploaded successfully!");
  };

  reader.readAsArrayBuffer(file);
});

// Load data into the table
function loadData() {
  tableBody.innerHTML = "";
  const isAdmin = localStorage.getItem("isLoggedIn") === "true";

  postOfficeData.forEach((office, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${office.office_name}</td>
      <td>${office.control_office === "0" ? "-" : office.control_office}</td>
      <td>${office.num_sub_post_offices}</td>
      <td>${office.delivery_state}</td>
      <td>${office.dpmg_area}</td>
      <td>${office.ds_area}</td>
      <td>${office.postal_code}</td>
      <td>${office.phone_number}</td>
      <td>
        ${!isAdmin ? `<button onclick="showReportForm('${encodeURIComponent(JSON.stringify(office))}')">Report</button>` : ''}
        ${isAdmin ? `<button class="editButton" onclick="editRow(${index})">Edit</button>` : ''}
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Edit Row
function editRow(index) {
  const row = tableBody.children[index];
  const cells = row.querySelectorAll("td");

  // Make cells editable
  for (let i = 0; i < cells.length - 1; i++) {
    const cell = cells[i];
    const originalValue = cell.textContent;
    cell.innerHTML = `<input type="text" value="${originalValue}">`;
  }

  // Replace Edit button with Save and Cancel buttons
  const actionCell = cells[cells.length - 1];
  actionCell.innerHTML = `
    <button onclick="saveRow(${index})">Save</button>
    <button onclick="cancelEdit(${index})">Cancel</button>
  `;
}

// Save Row
function saveRow(index) {
  const row = tableBody.children[index];
  const cells = row.querySelectorAll("td");
  const updatedData = {};

  // Update the data in the postOfficeData array
  for (let i = 0; i < cells.length - 1; i++) {
    const input = cells[i].querySelector("input");
    updatedData[Object.keys(postOfficeData[index])[i]] = input.value;
  }

  // Update the postOfficeData array
  postOfficeData[index] = updatedData;

  // Save to localStorage
  localStorage.setItem('postOfficeData', JSON.stringify(postOfficeData));

  // Reload the table
  loadData();
  alert("Changes saved successfully!");
}

// Cancel Edit
function cancelEdit(index) {
  // Reload the table to revert changes
  loadData();
}

// Filter table based on search input
function filterTable() {
  const searchTerm = searchInput.value.toLowerCase();
  const rows = tableBody.querySelectorAll("tr");
  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? "" : "none";
  });
}

// Show report form
function showReportForm(office) {
  try {
    const officeData = JSON.parse(decodeURIComponent(office));
    currentDetailsTextarea.value = JSON.stringify(officeData, null, 2);
  } catch (error) {
    console.error("Error parsing office data:", error);
    currentDetailsTextarea.value = "Error loading current details";
  }
  reportForm.style.display = "block";
}

// Submit report
document.getElementById("reportFormContent").addEventListener("submit", (e) => {
  e.preventDefault();
  const suggestedChanges = suggestedChangesTextarea.value;
  alert("Report submitted successfully!");
  reportForm.style.display = "none";
});

// Check login status on page load
checkLogin();
loadData();