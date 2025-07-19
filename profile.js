document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const showProfile = urlParams.get("showProfile");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const signinBtn = document.getElementById("signin-btn");

  if (token && user?.email && user?.name && user?.username) {
    if (signinBtn) {
      signinBtn.textContent = user.name;
      signinBtn.addEventListener("click", (e) => {
        e.preventDefault();
        actualProfile();
      });
    }
  }

  if (
    token &&
    user?.email &&
    (!user?.name || !user?.username)
  ) {
    showProfilePopup();
  }
});

function refreshButton() {
    const urlParams = new URLSearchParams(window.location.search);
    const showProfile = urlParams.get("showProfile");

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const signinBtn = document.getElementById("signin-btn");

    if (token && user?.email && user?.name && user?.username) {
        if (signinBtn) {
        signinBtn.textContent = user.name;
        signinBtn.addEventListener("click", (e) => {
            e.preventDefault();
            actualProfile();
        });
        }
    }
}

function actualProfile() {
  const user = JSON.parse(localStorage.getItem("user"));
  const firstLetter = user.name.charAt(0).toUpperCase();

  const popup = document.createElement("div");
  popup.id = "profile-popup";
  popup.innerHTML = `
    <div class="actual-popup-content">
        <div class="actual-profile-header">
        <div class="actual-pfp-circle">${firstLetter}</div>
        <div class="actual-profile-text">
            <h2>${user.name}</h2>
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email}</p>
        </div>
        </div>
        <button id="signout-btn">Sign out</button>
    </div>
  `;
  document.body.appendChild(popup);

  // Click outside to close
  popup.addEventListener("click", (e) => {
    if (!e.target.closest(".actual-popup-content")) {
      popup.remove();
    }
  });

  document.getElementById("signout-btn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "signin.html";
  });
}

function showProfilePopup() {
  const popup = document.createElement("div");
  popup.id = "profile-popup";
  popup.innerHTML = `
    <div class="popup-content">
      <h2>Welcome!</h2>
      <p>Please complete your Spotlight profile to continue</p>
      <input type="text" id="name" placeholder="Enter your name..." />
      <input type="text" id="username" placeholder="Choose a username..." />
      <button id="submit-profile">Continue</button>
    </div>
  `;
  document.body.appendChild(popup);

  document.getElementById("submit-profile").addEventListener("click", async () => {
    const name = document.getElementById("name").value.trim();
    const username = document.getElementById("username").value.trim();
    console.log("Submitting profile:", { name, username });

    if (!name || !username) {
      alert("Please enter both fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify({ name, username })
      });

      const data = await response.json();

      if (response.ok) {
        const email = JSON.parse(localStorage.getItem("user"))?.email || localStorage.getItem("email");

        if (email) {
        const user = { email, name, username };
        localStorage.setItem("user", JSON.stringify(user));
        }

        alert("Profile saved!");
        popup.remove();
        refreshButton();
      } else {
        alert(data.error || "Profile setup failed. Try again.");
      }
    } catch (err) {
      console.error("Error during profile submission:", err);
      alert("Something went wrong. Please try again.");
    }
  });
}