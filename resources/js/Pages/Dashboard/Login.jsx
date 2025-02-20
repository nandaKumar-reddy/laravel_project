import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import bcrypt from "bcryptjs"; // Import bcryptjs to compare passwords

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear any existing error

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      // Make a GET request to fetch users from the API
      const response = await axios.get("http://127.0.0.1:8000/api/admin/hesk-users", {
        params: {
          user: username,
          pass: password,
        },
      });

      if (response.data.success) {
        const user = response.data.data.find((u) => u.user === username);

        if (user) {
          // Use bcryptjs to compare the hashed password
          const isPasswordValid = await bcrypt.compare(password, user.pass);

          if (isPasswordValid) {
            // Store the userId in localStorage
            localStorage.setItem("userId", user.id);  // Store the user ID in localStorage
            // Login successful, navigate to the dashboard
            navigate("/admin/dashboard");
          } else {
            // Invalid password
            setError("Invalid password. Please try again.");
          }
        } else {
          // Invalid username
          setError("Invalid username. Please try again.");
        }
      } else {
        // API error
        setError("Failed to fetch user data. Please try again later.");
      }
    } catch (err) {
      // Handle server or network errors
      setError("An error occurred while logging in. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
  <div className="flex flex-col lg:flex-row bg-white shadow-lg w-full h-screen lg:h-screen">
    {/* Left Section: Company Image */}
    <div className="lg:w-[70%] bg-blue-100 h-full">
      <img
        src="/images/Ajmera.jpg"
        alt="Ajmera Logo"
        className="h-[inherit] lg:h-screen w-full object-cover"
      />
    </div>

    {/* Right Section: Login Form */}
    <div className="lg:w-[30%] bg-[#e9f0f3] flex flex-col justify-center p-4 h-full">
      {/* Logo above the form */}
      <div className="flex justify-center mb-4">
        <img
          src="/images/fidelis-logo.png"
          alt="Form Logo"
          className="sm:h-14 h-10 w-auto"
        />
      </div>

      <h1 className="text-lg sm:text-2xl font-semibold text-gray-800 text-center mb-6">
        Welcome! Please log in.
      </h1>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Username *
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div className="relative">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password *
          </label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 mt-7"
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 28 28"
                strokeWidth={2}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.704C4.832 6.977 7.694 4 12 4s7.168 2.977 8.02 4.704a10.478 10.478 0 01-1.02 1.295c-1.13 1.13-2.779 2.751-7 2.751s-5.87-1.621-7-2.751a10.478 10.478 0 01-1.02-1.295z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.293 2.293a1 1 0 011.414 0L21.707 21.707a1 1 0 01-1.414 1.414L2.293 3.707a1 1 0 010-1.414z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.704C4.832 6.977 7.694 4 12 4s7.168 2.977 8.02 4.704a10.478 10.478 0 01-1.02 1.295c-1.13 1.13-2.779 2.751-7 2.751s-5.87-1.621-7-2.751a10.478 10.478 0 01-1.02-1.295z"
                />
              </svg>
            )}
          </button>
        </div>

        <div>
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 sm:py-3 rounded-md hover:bg-orange-600 transition"
          >
            Click here to login
          </button>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </form>
    </div>
  </div>
</div>

  );
}

export default Login;
