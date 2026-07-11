document.body.style.display = "none";
window.onload = async () => {
  await checkAuth();
  await loadUser();
  document.body.style.display = "block";
};

const API_URL = "http://localhost:4000/api/auth";

// Checking Authantication
async function checkAuth() {
  try {
    const res = await fetch(`${API_URL}/me`, {
      credentials: "include",
    });

    if (res.status === 401) {
      window.location.href = "index.html";
    }
  } catch (error) {
    window.location.href = "index.html";
  }
}

// Auto Refresh Logic
async function authFetch(url, options = {}) {
  let res = await fetch(url, {
    ...options,
    credentials: "include",
  });

  if (res.status === 401) {
    console.log("Access token expired...");

    const refreshRes = await fetch(`${API_URL}/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      console.log("Token refreshed, retrying request...");

      res = await fetch(url, {
        ...options,
        credentials: "include",
      });
    } else {
      alert("Session expired, please login again");
      window.location.href = "index.html";
      return;
    }
  }

  return res;
}

// Accessing projected route
document.querySelectorAll(".protectedRoute").forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    e.preventDefault();

    const res = await authFetch(`${API_URL}/protected`, {
      method: "GET",
    });

    const data = await res.json();
    alert(data.message);
  });
});

// Logout Logic
document.getElementById("logoutBtn").addEventListener("click", async () => {
  const res = await fetch(`${API_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });

  const data = await res.json();

  alert(data.message);

  // Redirect to login page
  window.location.href = "index.html";
});

// Fetch & Show User Data
async function loadUser() {
  try {
    const res = await authFetch(`${API_URL}/me`);

    if (!res || res.status === 401) {
      window.location.href = "index.html";
      return;
    }

    const data = await res.json();

    // Show user details
    document.getElementById("userName").innerText = data.name;
    document.getElementById("userEmail").innerText = data.email;
    document.getElementById("userPhone").innerText = data.phone;

    // Hide all first
    document.getElementById("adminPanel").style.display = "none";
    document.getElementById("teacherPanel").style.display = "none";
    document.getElementById("studentPanel").style.display = "none";

    // Show based on role
    if (data.role === "admin") {
      document.getElementById("adminPanel").style.display = "block";
    } else if (data.role === "teacher") {
      document.getElementById("teacherPanel").style.display = "block";
    } else {
      document.getElementById("studentPanel").style.display = "block";
    }
  } catch (error) {
    window.location.href = "index.html";
  }
}
