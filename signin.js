document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signin-form");
  const passwordInput = document.querySelector(".password-input");
  const continueBtn = document.getElementById("continue-btn");

  let stage = 1;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value;

    if (stage === 1) {
      // Show password field
      passwordInput.style.display = "block";
      passwordInput.required = true;
      continueBtn.value = "Sign in";
      stage = 2;
      return;
    }

    const password = form.password.value;

    try {
      const res = await fetch("http://127.0.0.1:5000/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      });

      const data = await res.json();

      if (res.ok) {
        // Store email in cookie
        document.cookie = `email=${encodeURIComponent(email)}; path=/`;

        alert("Login successful!");
        window.location.href = "dashboard.html";
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Error during signin:", err);
      alert("Something went wrong.");
    }
  });
});