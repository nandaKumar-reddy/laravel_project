import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Confetti from "react-confetti";
import Header from "./Header";
import Footer from "./Footer";

export default function TicketSubmitted() {
  const location = useLocation();

  // Extract the ticketId from the state passed to this page
  const ticketId = location.state?.ticketId || "N/A";

  // Confetti state to control duration
  const [showConfetti, setShowConfetti] = useState(true);

  // Window size for dynamic confetti
  const [windowSize, setWindowSize] = useState({
    width: document.documentElement.clientWidth,
    height: window.innerHeight,
  });

  // Update the window size dynamically on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: document.documentElement.clientWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Stop confetti after a certain time (e.g., 5 seconds)
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col relative dark:bg-gray-900 dark:text-white"
      style={{ overflowX: "hidden" }} // Prevent horizontal scroll
    >
      {/* Confetti Animation */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false} // Optional: stop confetti recycling
        />
      )}

      <Header />

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 pt-4">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg text-center animate-fade-in">
          {/* Success Icon */}
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-green-600 mb-3 animate-pulse">
            Ticket Submitted Successfully!
          </h2>
          <p className="text-gray-700 text-lg mb-6 leading-relaxed">
            Your support request has been received.
          </p>
          <p className="text-gray-600 text-lg mb-6">
            <span className="font-semibold">Ticket ID:</span>{" "}
            <span className="text-blue-600 font-bold">{ticketId}</span>
          </p>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            <strong className="text-red-600">No confirmation email?</strong>
            <br />
           If you don’t see our message in your inbox, please check other folders and mark it as important to ensure future messages reach you.
          </p>
          <Link
            to="/"
            className="inline-block bg-[#f8703c] hover:bg-[#f8703c] text-white font-medium py-2 px-6 rounded-full shadow-md transition duration-300"
          >
            Back to Home
          </Link>
        </div>
      </main>

     <Footer />
    </div>
  );
}
