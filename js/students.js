const API = "/api";
const token = localStorage.getItem("token");

if (!token) {
  alert("Please login first");
  window.location.href = "index.html";
}

async function fetchStudents() {
  const res = await fetch(`${API}/students`, {
    headers: { "auth-token": token },
  });

  const students = await res.json();
  const tbody = document.querySelector("#studentTable tbody");
  tbody.innerHTML = "";

  students.forEach((s) => {
    tbody.innerHTML += `
      <tr>
        <td>${s.name}</td>
        <td>${s.rollNo}</td>
        <td>${s.department}</td>
        <td>${s.mobile}</td>
        <td><button class="delete-btn" onclick="deleteStudent('${s._id}')">X</button></td>
      </tr>
    `;
  });
}

async function addStudent() {
  const student = {
    name: document.getElementById("name").value,
    rollNo: document.getElementById("roll").value,
    department: document.getElementById("dept").value,
    mobile: document.getElementById("mobile").value
  };

  await fetch(`${API}/students/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "auth-token": token,
    },
    body: JSON.stringify(student),
  });

  document.getElementById("name").value = "";
  document.getElementById("roll").value = "";
  document.getElementById("dept").value = "";
  document.getElementById("mobile").value = "";

  fetchStudents();
}

async function deleteStudent(id) {
  await fetch(`${API}/students/delete/${id}`, {
    method: "DELETE",
    headers: { "auth-token": token },
  });

  fetchStudents();
}

fetchStudents();
