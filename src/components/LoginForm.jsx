import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const LoginForm = ({ onAuth }) => {
  // Form state: email and password
  const [form, setForm] = useState({ email: "", password: "" });

  // Error message display
  const [error, setError] = useState("");

  // Update form values when user types
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Submit login form
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send login request to backend
      const res = await axios.post("http://localhost:3001/auth/login", form);

      // Save token to localStorage and update app state
      localStorage.setItem("token", res.data.token);
      onAuth(res.data.token);
    } catch (err) {
      // Display error message on login failure
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black px-4">
      <div className="bg-[#1c1f26] p-8 rounded-lg shadow-md w-full max-w-md text-white">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">🎬 Movie Night</h1>
          <p className="text-sm text-gray-400 mt-1">
            Sign in to start curating your watchlist
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit}>
          {/* Email input */}
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full mb-3 px-4 py-2 border border-gray-700 bg-gray-800 rounded text-white"
            required
          />

          {/* Password input */}
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full mb-3 px-4 py-2 border border-gray-700 bg-gray-800 rounded text-white"
            required
          />

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        {/* Link to registration */}
        <p className="text-md text-gray-400 text-center mt-4">
          Don’t have an account?{" "}
          <Link to="/register" className="underline text-blue-400">
            Register
          </Link>
        </p>

        {/* Feature list */}
        <div className="mt-6 text-sm text-gray-400">
          <p className="mb-1">🎞 Build a custom movie watchlist</p>
          <p className="mb-1">🗳 Pick and vote with friends</p>
          <p className="mb-1">📊 Log and track your selections</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
