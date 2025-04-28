import { useState } from "react";
import axios from "axios";

const RegisterForm = ({ onAuth, toggle }) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3001/auth/register", {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("token", res.data.token);
      onAuth(res.data.token);
    } catch (err) {
      setError("Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-20">
      <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="w-full mb-3 px-4 py-2 border rounded"
        required
      />
      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Password"
        className="w-full mb-3 px-4 py-2 border rounded"
        required
      />
      <input
        type="password"
        name="confirmPassword"
        value={form.confirmPassword}
        onChange={handleChange}
        placeholder="Confirm Password"
        className="w-full mb-3 px-4 py-2 border rounded"
        required
      />

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        Register
      </button>

      <p className="text-sm text-center mt-4">
        Already have an account?{" "}
        <button
          type="button"
          onClick={toggle}
          className="underline text-blue-600"
        >
          Login
        </button>
      </p>
    </form>
  );
};

export default RegisterForm;
