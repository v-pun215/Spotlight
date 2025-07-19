document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signup-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value;

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const res = await fetch("https://spotlight-97bl.onrender.com/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        const user = data.user;
        if (!user.name || !user.username) {
          window.location.href = "index.html?showProfile=1";
        } else {
          window.location.href = "index.html";
        }
      } else {
        alert(data.error || "Signup failed");
      }
    } catch (err) {
      console.error("Error during signup:", err);
      alert("Something went wrong. Please try again.");
    }
  });
});