const API_URL = "http://localhost:4000/api/auth";
const loginForm = document.querySelector(".login-form");
const registerForm = document.querySelector(".register-form");

function showRegister() {
  loginForm.style.display = "none";
  registerForm.style.display = "flex";
}

function showLogin() {
  registerForm.style.display = "none";
  loginForm.style.display = "flex";
}

// Register Form logic
document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const age = document.getElementById("age").value;
    const gender = document.getElementById("gender").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const phone = document.getElementById("phone").value;
    const role = document.getElementById("role").value;

    const res = await fetch(`${API_URL}/register`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name,
        age,
        gender,
        email,
        password,
        phone,
        role,
      }),
    });

    const data = await res.json();

    alert(data.message);
  });

// Login Form logic
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  console.log("Login clicked");

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  console.log(email, password);

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    credentials: "include",

    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await res.json();

  console.log("Response:", data);

  if (res.ok) {
    window.location.href = "Home.html";
  } else {
    alert(data.message || "Login failed");
  }
});

// Google Login Button logic
document.getElementById("googleLogin").addEventListener("click", () => {
  window.location.href = "http://localhost:4000/api/auth/google";
});
