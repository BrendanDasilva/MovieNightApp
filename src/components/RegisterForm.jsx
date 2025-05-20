import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const RegisterForm = ({ onAuth }) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  // Update form state on input change
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Handle registration form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple password confirmation check
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // Send registration request
      const res = await axios.post("http://localhost:3001/auth/register", {
        email: form.email,
        password: form.password,
      });

      // Store token and update auth state
      localStorage.setItem("token", res.data.token);
      onAuth(res.data.token);
    } catch (err) {
      setError("Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-20">
      <h2 className="text-2xl font-bold mb-4 text-white text-center">
        Register
      </h2>

      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      {/* Email field */}
      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="w-full mb-3 px-4 py-2 border rounded"
        required
      />

      {/* Password field */}
      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Password"
        className="w-full mb-3 px-4 py-2 border rounded"
        required
      />

      {/* Confirm password field */}
      <input
        type="password"
        name="confirmPassword"
        value={form.confirmPassword}
        onChange={handleChange}
        placeholder="Confirm Password"
        className="w-full mb-3 px-4 py-2 border rounded"
        required
      />

      {/* Submit button */}
      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        Register
      </button>

      {/* Link to login page */}
      <p className="text-md text-white text-center mt-4">
        Already have an account?{" "}
        <Link to="/login" className="underline text-blue-600">
          Login
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
