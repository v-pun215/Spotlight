document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signup-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value;
    const password = form.password.value;

    try {
      const res = await fetch("http://127.0.0.1:5000/signup", {
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

        alert("Signup successful! Redirecting...");
        window.location.href = "index.html";
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (err) {
      console.error("Error during signup:", err);
      alert("Something went wrong.");
    }
  });
});