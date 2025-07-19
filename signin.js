document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signin-form");
  const passwordInput = document.querySelector(".password-input");
  const continueBtn = document.getElementById("continue-btn");

  let stage = 1;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (stage === 1) {
      passwordInput.style.display = "block";
      continueBtn.value = "Sign in";
      stage = 2;
      return;
    }

    const email = form.email.value;
    const password = form.password.value;

    try {
      const res = await fetch("https://spotlight-97bl.onrender.com/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user.name || !user.username) {
          window.location.href = "index.html?showProfile=1";
        } else {
          window.location.href = "index.html";
        }
      } else {
        alert(data.error || "Login failed");
      }

    } catch (err) {
      console.error("Error during sign in:", err);
      alert("Could not connect to server.");
    }
  });
});