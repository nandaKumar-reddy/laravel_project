import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "./Header";
import Footer from "./Footer";

export default function TicketDetails() {
    const location = useLocation();
    const ticket = location.state?.ticket || {};
    // console.log(ticket);
    const replies = location.state?.replies || []; // Accessing replies
    const assets = location.state?.assets || []; 
    // State for owner name
    const [message, setMessage] = useState("");
    const [ownerName, setOwnerName] = useState("");
    const [error, setError] = useState(false);


    // Fetch Owner Name from API
    useEffect(() => {
        const fetchOwnerName = async () => {
            try {
                if (ticket.owner) {
                    const response = await fetch(
                        `http://127.0.0.1:8000/api/admin/hesk-users/${ticket.owner}`
                    );
                    const data = await response.json();

                    if (data.success && data.data) {
                        setOwnerName(data.data.name); // Set fetched user name
                    } else {
                        setOwnerName("Unknown User");
                    }
                }
            } catch (error) {
                console.error("Error fetching owner name:", error);
                setOwnerName("Error fetching user");
            }
        };

        fetchOwnerName();
    }, [ticket.owner]); // Run only when ticket.owner changes

    // Format Date Utility
    const formatDate = (dateStr) => {
        const options = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        };
        return new Date(dateStr).toLocaleDateString(undefined, options);
    };

     // Static data for subcategories based on category id
     const incidentSubCategories = [
        { id: 1, name: "Hardware" },
        { id: 2, name: "Software" },
        { id: 3, name: "Network" },
        { id: 4, name: "Security" },
        { id: 5, name: "Others" },
    ];

    const requestSubCategories = [
        { id: 1, name: "Access" },
        { id: 2, name: "Hardware" },
        { id: 3, name: "Information" },
        { id: 4, name: "Service" },
        { id: 5, name: "Others" },
    ];

    // Status Map
    const statusMap = {
        0: { label: "New", color: "bg-red-500" },
        1: { label: "Waiting reply", color: "bg-orange-500" },
        2: { label: "Replied", color: "bg-blue-500" },
        3: { label: "Resolved", color: "bg-green-500" },
        4: { label: "In Progress", color: "bg-purple-500" },
        5: { label: "On Hold", color: "bg-red-500" },
    };

    // Category Map
    const categoryMap = {
        1: "Incident",
        2: "Request",
    };

    // Priority Map
    const priorityMap = {
        0: { label: "Low", color: "bg-blue-500" },
        1: { label: "Medium", color: "bg-green-500" },
        2: { label: "High", color: "bg-yellow-500" },
    };

    const getSubCategoryName = () => {
        if (ticket.category === 1) {
            const subCategory = incidentSubCategories.find(
                (sub) => sub.id === Number(ticket.emp_cat)
            ); // Convert to number
            console.log("Incident Subcategory: ", subCategory); // Debugging log
            return subCategory ? subCategory.name : "N/A";
        } else if (ticket.category === 2) {
            const subCategory = requestSubCategories.find(
                (sub) => sub.id === Number(ticket.emp_cat)
            ); // Convert to number
            console.log("Request Subcategory: ", subCategory); // Debugging log
            return subCategory ? subCategory.name : "N/A";
        }
        return "N/A";
    };

    const handleReplySubmit = async (e) => {
        // e.preventDefault();

        const response = await fetch(
            `http://localhost:8000/api/update-ticket/${ticket.trackid}/${ticket.email}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message }),
            }
        );

        const data = await response.json();
        if (data.success) {
            // Show success popup
            Swal.fire({
                icon: "success",
                title: "Success",
                text: "Reply submitted successfully!",
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                timer: 3000,
                text: "Failed to update SMTP configuration.",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white">
            <Header />

            {/* Main Content */}
            <main className="container mx-auto max-w-4xl py-8 px-4">
                {/* Ticket Details */}
                <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                        Ticket Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="sm:block  flex justify-between dark:text-black">
                            <strong>Track ID:</strong> {ticket.trackid || "N/A"}
                        </div>
                        <div className="sm:block  flex justify-between dark:text-black">
                            <strong>Name:</strong> {ticket.name || "N/A"}
                        </div>
                        <div className="sm:block  flex justify-between dark:text-black">
                            <strong>Model Name: </strong>
                            {assets.length > 0 ? (
                                assets.map((asset, index) => (
                                    <span key={index}>
                                        {asset.model.name}
                                    </span>
                                ))
                            ) : (
                                "N/A"
                            )}
                        </div>
                        <div className="sm:block  flex justify-between dark:text-black">
                            <strong>Email:</strong> {ticket.email || "N/A"}
                        </div>
                        <div className="sm:block  flex justify-between dark:text-black">
                            <strong>Issue With: </strong>
                            {assets.length > 0 ? (
                                assets.map((asset, index) => (
                                    <span key={index}>
                                        {asset.category.name}
                                    </span>
                                ))
                            ) : (
                                "N/A"
                            )}
                        </div>
                        <div className="sm:block  flex justify-between dark:text-black">
                            <strong>Ticket Type:</strong>{" "}
                            {categoryMap[ticket.category] || "Unknown"}
                        </div>
                        <div className="sm:block  flex justify-between dark:text-black">
                            <strong>Priority:</strong>{" "}
                            {priorityMap[ticket.priority] ? (
                                <span
                                    className={`${priorityMap[ticket.priority].color
                                        } text-white px-2 py-1 rounded`}
                                >
                                    {priorityMap[ticket.priority].label}
                                </span>
                            ) : (
                                "Unknown"
                            )}
                        </div>
                        <div className="sm:block  flex justify-between dark:text-black">
                            {" "}
                            <strong>Status:</strong>{" "}
                            {statusMap[ticket.status] ? (
                                <span
                                    className={`${statusMap[ticket.status].color
                                        } text-white px-2 py-1 rounded`}
                                >
                                    {statusMap[ticket.status].label}
                                </span>
                            ) : (
                                "Unknown"
                            )}
                        </div>
                        <div className="sm:block  flex justify-between dark:text-black">
                            <strong>Category:</strong>{" "}
                            {getSubCategoryName() || "N/A"}
                        </div>
                        <div className="sm:block  flex justify-between dark:text-black">
                            <strong>Assigned User:</strong>{" "}
                            {ownerName || "Loading..."}
                        </div>
                        <div className="sm:block  flex justify-between dark:text-black">
                            <strong>Created On:</strong>{" "}
                            {ticket.dt ? formatDate(ticket.dt) : "N/A"}
                        </div>
                        <div className="sm:block  flex justify-between dark:text-black">
                            <strong>Updated On:</strong>{" "}
                            {ticket.lastchange
                                ? formatDate(ticket.lastchange)
                                : "N/A"}
                        </div>
                    </div>

                    {/* Message */}
                    <div className="sm:mt-6 sm:block  flex justify-between items-center gap-2">
                        <strong>Message:</strong>
                        <p className="mt-2 bg-gray-100 p-4 rounded-md text-gray-900 text-sm">
                            {ticket.message || "No message provided"}
                        </p>
                    </div>
                </div>

                {/* Reply Section */}
                <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        Replies
                    </h3>
                    {/* Loop through replies */}
                    {replies.length > 0 ? (
                        replies.map((reply, index) => (
                            <div key={index} className="mt-4">
                                <p className="mt-2 bg-gray-100 p-4 rounded-md text-gray-900 text-sm">
                                    {reply.message}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p>No replies yet.</p>
                    )}
                </div>

                {/* Reply Form */}
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        Reply to Ticket
                    </h3>
                    <textarea
                        className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-[#f8703c] outline-none text-sm"
                        rows="5"
                        placeholder="Type your reply here..."
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            setError(false);
                        }}
                    ></textarea>
                    {error && (
                        <p className="text-red-500 text-sm mt-2">
                            Please enter a message before submitting.
                        </p>
                    )}

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                        <button
                            className="w-full sm:w-auto px-6 py-2 bg-[#f8703c] text-white font-medium rounded-md hover:bg-[#e0612d] transition duration-300"
                            onClick={() => {
                                if (!message.trim()) {
                                    setError(true);
                                } else {
                                    console.log("Submit Reply: ", message);
                                    handleReplySubmit();
                                    setMessage("");
                                    setError(false);
                                }
                            }}
                        >
                            Submit Reply
                        </button>
                    </div>
                </div>

                {/* Back Button */}
                <div className="text-center mt-8">
                    <Link
                        to="/"
                        className="inline-block px-6 py-2 bg-[#f8703c] text-white font-medium rounded-md hover:bg-[#0f2d4a] transition duration-300"
                    >
                        Back to Home
                    </Link>
                </div>
            </main>

           <Footer />
        </div>
    );
}
