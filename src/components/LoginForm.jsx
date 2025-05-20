import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const LoginForm = ({ onAuth }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  // Update form state when inputs change
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3001/auth/login", form);
      localStorage.setItem("token", res.data.token); // Save token locally
      onAuth(res.data.token); // Notify parent component of successful auth
    } catch (err) {
      setError("Invalid credentials"); // Display error on failure
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-20">
      <h2 className="text-2xl font-bold mb-4 text-white text-center">Login</h2>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      {/* Email Input */}
      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="w-full mb-3 px-4 py-2 border rounded"
        required
      />

      {/* Password Input */}
      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Password"
        className="w-full mb-3 px-4 py-2 border rounded"
        required
      />

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Login
      </button>

      {/* Link to Register Page */}
      <p className="text-md text-white text-center mt-4">
        Don’t have an account?{" "}
        <Link to="/register" className="underline text-blue-600">
          Register
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
