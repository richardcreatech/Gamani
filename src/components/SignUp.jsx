import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { signup } = useAuth();
  const { showNotification } = useNotification();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   const response = await fetch("http://localhost:3000/api/auth/signup", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(formData),
  //   });

  //   const data = await response.json();

  //   console.log(data);
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await signup(formData);
      showNotification(
        data?.message || "Account created successfully.",
        "success",
      );
    } catch (error) {
      showNotification(
        error.message || "Sign up failed. Please try again.",
        "error",
      );
      console.error("Signup error:", error);
    }
  };

  return (
    <form className="auth_form" onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
      />

      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
      />

      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
      />

      <button type="submit">Sign up</button>
    </form>
  );
}

export default Signup;
