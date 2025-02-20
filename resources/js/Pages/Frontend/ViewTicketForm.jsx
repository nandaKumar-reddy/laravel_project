import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function ViewTicketForm() {
  const [trackId, setTrackId] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // State to track loading status
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!trackId || !email) {
      setError("Please fill in both Track ID and Email.");
      return;
    }

    setLoading(true); // Set loading to true when API call starts
    setError(""); // Clear any previous error

    try {
      // API call to fetch ticket details
      const response = await fetch("http://127.0.0.1:8000/api/view-ticket", {
        method: "POST", // Confirm that the backend supports POST
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trackid: trackId, email }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch ticket details. Please try again.");
      }

      const data = await response.json();
      console.log(data);

      if (data.success) {
        // Redirect to the ticket details page and pass the ticket data
        navigate("/ticket-details", { state: { ticket: data.data,replies:data.replies, assets: data.assets } });
      } else {
        setError(data.message || "Ticket not found.");
      }
    } catch (error) {
      setError("No ticket found with the provided track ID and email.");
    } finally {
      setLoading(false); // Set loading to false after API call ends
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col dark:bg-gray-900">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto py-4 px-6 flex-grow mt-4">
        <h2 className="sm:text-3xl text-2xl font-semibold text-center mb-8 text-[#133e5e] dark:text-white">
          View Existing Ticket
        </h2>

        {/* Form Section with Image */}
        <div className="sm:flex block justify-center items-center max-w-5xl mx-auto bg-white p-6 shadow-md rounded-lg border border-gray-300">
          {/* Left Section: Form */}
          <div className="w-full md:w-1/2 pr-4">
            {error && <div className="text-red-600 mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mb-4">
                <label htmlFor="trackId" className="block text-[#133e5e] sm:text-xl text-lg font-medium">
                  Track ID
                </label>
                <input
                  type="text"
                  id="trackId"
                  className="w-full px-4 dark:text-black py-3 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  value={trackId}
                  onChange={(e) => setTrackId(e.target.value)}
                  placeholder="Enter your Track ID"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-[#133e5e] sm:text-xl text-lg font-medium">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 dark:text-black py-3 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#133e5e] to-[#f8703c] text-white py-3 rounded-md hover:from-[#f8703c] hover:to-[#133e5e] transition-all"
                disabled={loading} // Disable the button while loading
              >
                {loading ? (
                  <span>Loading...</span>
                ) : (
                  "View Ticket Details"
                )}
              </button>
            </form>

            {loading && (
              <div className="flex justify-center mt-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-dashed rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Right Section: Image */}
          <div className="w-full md:w-1/2 pl-4 md:block">
            <img
              src="/images/ticketimage2.jpg" // Add your image path here
              alt="Illustration"
              className="w-full h-[300px] object-cover rounded-lg"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
