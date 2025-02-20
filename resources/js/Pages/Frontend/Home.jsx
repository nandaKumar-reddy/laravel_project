import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import "react-chatbot-kit/build/main.css";
import Chatbot from "react-chatbot-kit";
import { FaTimes } from "react-icons/fa"; // Add this import for the close button
import { BsFillChatDotsFill } from "react-icons/bs";
import botConfig from "./botConfig"; // Import the bot configuration
import MessageParser from "./MessageParser"; // Add this import for MessageParser
import ActionProvider from "./ActionProvider";
export default function Home() {
    const [showPopup, setShowPopup] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showChatbot, setShowChatbot] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    useEffect(() => {
        // Check localStorage for popup status
        const popupStatus = localStorage.getItem("popupStatus");
        if (!popupStatus) {
            setShowPopup(true);
        }

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault(); // Prevent the default mini-infobar
            setDeferredPrompt(e); // Save the event for later
        };

        window.addEventListener(
            "beforeinstallprompt",
            handleBeforeInstallPrompt
        );

          // Retrieve chatbot history from localStorage
          const storedHistory = localStorage.getItem("chatHistory");
          if (storedHistory) {
              setChatHistory(JSON.parse(storedHistory));
          }

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt
            );
        };
    }, []);

    const handlePopupResponse = async (response) => {
        if (response === "yes" && deferredPrompt) {
            try {
                await deferredPrompt.prompt(); // Show the installation prompt
                const choiceResult = await deferredPrompt.userChoice; // Wait for the user's response
                if (choiceResult.outcome === "accepted") {
                    console.log("App installation accepted!");
                } else {
                    console.log("App installation dismissed.");
                }
                setDeferredPrompt(null); // Clear the deferred prompt
            } catch (error) {
                console.error("Error during app installation:", error);
            }
        }

        // Save the user's response to localStorage
        localStorage.setItem("popupStatus", response);
        setShowPopup(false);
    };
  
    // Handle the opening/closing of the chatbot
    const toggleChatbot = () => {
        setShowChatbot(!showChatbot);
    };

    // Save chatbot messages to localStorage
    const saveMessages = (messages) => {
        setChatHistory(messages);
        localStorage.setItem("chatHistory", JSON.stringify(messages));
    };
    return (
        <div className="min-h-screen font-sans flex flex-col bg-gray-50 dark:bg-gray-900">
            <Header />

            {/* Main Section */}
            <main className="container mx-auto max-w-6xl text-center sm:py-12 py-4 px-6 flex-grow">
                <h1 className="text-3xl sm:text-4xl font-semibold text-[#133e5e] mb-6 dark:text-white">
                    Hello, how can we help?
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8">
                    {/* Submit a Ticket */}
                    <Link to="/create-ticket">
                        <div className="flex items-center justify-center p-6 shadow-lg rounded-lg hover:shadow-2xl transition duration-300">
                            {/* Icon */}
                            <div className="p-4 rounded-full bg-gradient-to-r from-[#133e5e] to-[#f8703c] hover:bg-gradient-to-l transition-all mr-4">
                                <svg
                                    className="icon sm:h-12 sm:w-12 h-8 w-8"
                                    style={{ fill: "#fff" }}
                                >
                                    <use xlinkHref="/images/sprite.svg#icon-submit-ticket"></use>
                                </svg>
                            </div>

                            {/* Text */}
                            <div className="text-center">
                                <h2 className="text-xl font-semibold text-[#133e5e] dark:text-white mb-2">
                                    Submit Ticket
                                </h2>
                                <p className="text-[#133e5e] text-sm dark:text-white">
                                    Submit a new issue to a department
                                </p>
                            </div>
                        </div>
                    </Link>

                    {/* View Existing Tickets */}
                    <Link to="/view-ticket">
                        <div className="flex items-center justify-center p-6 shadow-lg rounded-lg hover:shadow-2xl transition duration-300">
                            {/* Icon */}
                            <div className="p-4 rounded-full bg-gradient-to-r from-[#133e5e] to-[#f8703c] hover:bg-gradient-to-l transition-all mr-4">
                                <svg
                                    className="icon sm:h-12 sm:w-12 h-8 w-8"
                                    style={{ fill: "#fff" }}
                                >
                                    <use xlinkHref="/images/sprite.svg#icon-document"></use>
                                </svg>
                            </div>

                            {/* Text */}
                            <div className="text-center">
                                <h2 className="text-xl font-semibold text-[#133e5e] mb-2 dark:text-white">
                                    View Existing Tickets
                                </h2>
                                <p className="text-[#133e5e] text-sm dark:text-white">
                                    View tickets you submitted in the past
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Admin Panel Link */}
                {/* <div className="mt-8">
                    <Link
                        to="/admin"
                        className="inline-block text-[#133e5e] font-semibold underline text-lg dark:text-white hover:text-blue-800"
                    >
                        Go to Administration Panel
                    </Link>
                </div> */}
            </main>
            {/* Chatbot - Fixed Bottom Right */}
            <div
                onClick={toggleChatbot}
                className="fixed bottom-4 right-4 z-50 cursor-pointer p-4 rounded-full bg-gradient-to-r from-[#133e5e] to-[#f8703c] animate__animated animate__fadeIn animate__delay-1s"
                style={{ animationDuration: "0.5s" }}
            >
                <BsFillChatDotsFill className="sm:h-12 sm:w-12 h-8 w-8 text-white" />
            </div>

            {showChatbot && (
                <div className="fixed bottom-4 right-4 z-50 bg-white shadow-lg rounded-lg border-2 border-[#133e5e] overflow-hidden animate__animated animate__fadeIn animate__delay-1s max-w-xs sm:max-w-sm">
                    <div className="flex justify-between items-center bg-[#133e5e] p-3 text-white">
                        <h3 className="text-lg font-semibold">Chatbot</h3>
                        <button onClick={toggleChatbot} className="text-2xl">
                            <FaTimes />
                        </button>
                    </div>
                    <Chatbot
                        config={botConfig}
                        messageParser={MessageParser}
                        actionProvider={ActionProvider}
                        messageHistory={chatHistory}
                        saveMessages={saveMessages}
                    />
                </div>
            )}
            {/* Popup Modal */}
            {showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
                        <h2 className="text-lg font-semibold text-[#133e5e] mb-4">
                            Do you want to install the app?
                        </h2>
                        <div className="flex justify-around">
                            <button
                                onClick={() => handlePopupResponse("yes")}
                                className="px-4 py-2 text-white rounded-lg bg-gradient-to-r from-[#133e5e] to-[#f8703c] hover:bg-gradient-to-l transition-all"
                            >
                                Yes
                            </button>
                            <button
                                onClick={() => handlePopupResponse("no")}
                                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}
