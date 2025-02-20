import React, { useEffect, useState, useRef } from "react";
import Layout from "./Layout";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

export default function AdminTicketDetails() {
    const { id } = useParams(); // Get the ticket ID from the URL
    const [ticket, setTicket] = useState(null);
    const [assets, setAssets] = useState(null);
    const [users, setUsers] = useState([]); // State to hold users data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(""); // State for selected status
    const [replyMessage, setReplyMessage] = useState(""); // State for reply message
    const [popupMessage, setPopupMessage] = useState(""); // State for popup message
    const [popupType, setPopupType] = useState(""); // Type of popup: 'success' or 'error'
    const [showPopup, setShowPopup] = useState(false); // Controls visibility of the popup
    const [messages, setMessages] = useState([]); // Array to store posted messages
    const [showApprovalPopup, setShowApprovalPopup] = useState(false);
    const [isApprovalRequested, setIsApprovalRequested] = useState(false); // State to track button visibility
    const [approvalStatus, setApprovalStatus] = useState("Pending"); // For example: "Pending" or "Approved"
    const [approverMessage, setApproverMessage] = useState(""); // Approver message
    const [approverEmail, setApproverEmail] = useState(""); // Email input value
    const [approvalMessage, setApprovalMessage] = useState(""); // Message input value
    const [timeWorked, setTimeWorked] = useState("00:00:00");
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerRef = useRef(null);
    const secondsRef = useRef(0);

    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
            2,
            "0"
        )}:${String(seconds).padStart(2, "0")}`;
    };

    const startStopTimer = () => {
        if (isTimerRunning) {
            clearInterval(timerRef.current);
        } else {
            timerRef.current = setInterval(() => {
                secondsRef.current += 1;
                setTimeWorked(formatTime(secondsRef.current));
            }, 1000);
        }
        setIsTimerRunning(!isTimerRunning);
    };

    const resetTimer = () => {
        clearInterval(timerRef.current);
        secondsRef.current = 0;
        setTimeWorked("00:00:00");
        setIsTimerRunning(false);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!isTimerRunning) {
            startStopTimer(); // Start the timer automatically when page loads
        }
    }, []); // Empty dependency array means this runs once when component mounts

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

    useEffect(() => {
        const fetchTicketDetails = async () => {
            try {
                const response = await fetch(
                    `http://127.0.0.1:8000/api/admin/tickets/${id}`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch ticket details");
                }
                const result = await response.json();
                console.log(result);
                setTicket(result.ticket); // Assuming the API response gives the ticket details directly
                setAssets(result.assets ? result.assets[0] : null);
                setSelectedStatus(result.ticket.status); // Set the initial status
            } catch (error) {
                console.error("Error fetching ticket details:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        // API call to fetch details based on ticket ID
        const fetchTicketApprovalDetails = async () => {
            try {
                const response = await fetch(
                    `http://127.0.0.1:8000/api/admin/request-approval/${id}`
                );

                if (response.ok) {
                    const data = await response.json();

                    // Check if the data exists and is valid
                    if (data && data.change_management_data) {
                        const { approval_status, approver_message } =
                            data.change_management_data;

                        // Update state variables with the fetched data
                        setApprovalStatus(approval_status || "No status");
                        setApproverMessage(approver_message || "NA");
                        setIsApprovalRequested(true); // Data successfully fetched
                    } else {
                        console.error(
                            "Invalid data structure or no data returned."
                        );
                        setIsApprovalRequested(false);
                    }
                } else {
                    console.error("Failed to fetch data:", response.statusText);
                }
            } catch (error) {
                console.error("API Error:", error);
            }
        };
        const fetchUsers = async () => {
            try {
                const response = await fetch(
                    "http://127.0.0.1:8000/api/admin/hesk-users"
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch users");
                }
                const result = await response.json();
                setUsers(result.data); // Set users data
            } catch (error) {
                console.error("Error fetching users:", error);
                setError(error.message);
            }
        };

        fetchTicketDetails();
        fetchUsers();
        fetchTicketApprovalDetails();
    }, [id]);

    const getAssignedUserName = (userId) => {
        const user = users.find((user) => user.id === userId);
        return user ? user.name : "N/A";
    };

    // Mapping status codes to human-readable status
    const statusOptions = {
        0: "New",
        1: "Waiting reply",
        2: "Replied",
        3: "Resolved",
        4: "In Progress",
        5: "On Hold",
    };

    const handleStatusChange = (event) => {
        setSelectedStatus(event.target.value);
    };

    const handleUpdateStatus = async () => {
        try {
            const response = await fetch(
                `http://127.0.0.1:8000/api/admin/tickets/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ status: selectedStatus }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update ticket status");
            }

            const result = await response.json();
            setTicket(result.ticket);

            // Check if the email is triggered by backend
            if (result.ticket.status === 3) {
                console.log(
                    "Status updated to resolved, backend should send email"
                );
            }

            // Show success popup
            showPopupMessage("Ticket status updated successfully!", "success");
        } catch (error) {
            console.error("Error updating status:", error);
            setError(error.message);

            // Show error popup
            showPopupMessage(
                "Failed to update ticket status. Please try again.",
                "error"
            );
        }
    };

    const handleSubmitReply = async () => {
        if (!replyMessage.trim()) {
            showPopupMessage("Reply message cannot be empty!", "error");
            return;
        }

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/api/admin/tickets/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ message: replyMessage }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to submit reply");
            }

            const result = await response.json();

            // Add the new message to the messages array
            setMessages((prevMessages) => [...prevMessages, replyMessage]);
            // Show success popup and clear the input field
            showPopupMessage("Reply submitted successfully!", "success");

            setReplyMessage("");
        } catch (error) {
            console.error("Error submitting reply:", error);
            showPopupMessage(
                "Failed to submit reply. Please try again.",
                "error"
            );
        }
    };
    // Function to show popup message
    const showPopupMessage = (message, type) => {
        setPopupMessage(message);
        setPopupType(type);
        setShowPopup(true);

        // Close the popup after 3 seconds
        setTimeout(() => {
            setShowPopup(false);
        }, 3000);
    };

    if (loading) {
        return (
            <Layout>
                <div className="text-center mt-10 text-lg">
                    Loading ticket details...
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="text-center mt-10 text-lg text-red-600">
                    Error: {error}
                </div>
            </Layout>
        );
    }

    if (!ticket) {
        return (
            <Layout>
                <div className="text-center mt-10 text-lg text-gray-500">
                    No details available for this ticket.
                </div>
            </Layout>
        );
    }

    // Conditional category mapping
    const categoryName =
        ticket.category === 1
            ? "Submit an Incident"
            : ticket.category === 2
            ? "Submit a Request"
            : "N/A";

    // Mapping priority to string values based on the API response
    const priority =
        ticket.priority === "2"
            ? "High"
            : ticket.priority === "1"
            ? "Medium"
            : ticket.priority === "0"
            ? "Low"
            : "N/A";

    // Get the assigned owner's name using the helper function
    const assignedTo = getAssignedUserName(ticket.owner);

    // Get the subcategory name based on category and emp_cat
    const getSubCategoryName = () => {
        if (ticket.category === 1) {
            const subCategory = incidentSubCategories.find(
                (sub) => sub.id === Number(ticket.emp_cat)
            ); // Convert to number
            return subCategory ? subCategory.name : "N/A";
        } else if (ticket.category === 2) {
            const subCategory = requestSubCategories.find(
                (sub) => sub.id === Number(ticket.emp_cat)
            ); // Convert to number
            return subCategory ? subCategory.name : "N/A";
        }
        return "N/A";
    };

    const handleRequestApproval = () => {
        setShowApprovalPopup(true);
    };
    const handlePopupClose = () => {
        setShowApprovalPopup(false);
    };

    const handleApprovalSubmit = async () => {
        const apiUrl = "http://127.0.0.1:8000/api/admin/request-approval";

        const requestData = {
            approver_email: approverEmail,
            staff_message: approvalMessage,
            track_id: ticket.trackid,
            ticket_id: ticket.id,
            emp_email: ticket.email,
            emp_name: ticket.name,
            emp_message: ticket.message,
            owner_email: ticket.owner_email,
            owner_name: ticket.owner_name,
            approval_status: approvalStatus, // Or the default approval status
        };

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                const responseData = await response.json();

                // Show success message
                Swal.fire({
                    title: "Success!",
                    text: "Approval request submitted successfully!",
                    icon: "success",
                    confirmButtonText: "OK",
                });

                // Update state and store in localStorage
                const newApprovalStatus = "Pending"; // Update based on your API response if needed
                setIsApprovalRequested(true);
                setApprovalStatus(newApprovalStatus);
                setApproverMessage(approvalMessage);
                setShowApprovalPopup(false);
            } else {
                console.error(
                    "Error submitting the approval request:",
                    response.statusText
                );

                // Show error message
                Swal.fire({
                    title: "Error!",
                    text: "Failed to submit the approval request. Please try again.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
                setShowApprovalPopup(true);
            }
        } catch (error) {
            console.error("API Error:", error);

            // Show error message
            Swal.fire({
                title: "Error!",
                text: "An error occurred while submitting the approval request.",
                icon: "error",
                confirmButtonText: "OK",
            });
            setShowApprovalPopup(true);
        }
    };

    const approverEmails = [
        "nanda.kumar@fidelisgroup.in",
        "karteek.kr@fidelisgroup.in",
        "prashant.kokane@fidelisgroup.in",
        "udaya.m@fidelisgroup.in",
        "sridhara.s@fidelisgroup.in",
        "chetan.s@fidelisgroup.in",
        "raghavendra@fidelisgroup.in",
    ]; // Replace with dynamic email list
    return (
        <Layout>
            <div className="">
                <h1 className="text-2xl font-semibold mb-4 p-2 sm:text-left text-center rounded-md">
                    Ticket Details
                </h1>
                <div className="sm:flex block w-full gap-5">
                    <div className=" sm:w-3/4  block">
                    <div className="w-full bg-white shadow-md rounded-lg sm:p-6 p-4 mb-6 sm:max-h-[600px] sm:h-[400px]">
                        {/* Ticket Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                            <div>
                                <h3 className="font-semibold rounded-md">
                                    Track ID:{" "}
                                    <span className="text-blue-600">
                                        {ticket.trackid}
                                    </span>
                                </h3>
                            </div>
                            <div className="flex items-center mt-4 sm:mt-0">
                                <p className="font-semibold text-green-600 mr-4">
                                    Status:{" "}
                                    {statusOptions[ticket.status] || "N/A"}
                                </p>
                                <select
                                    value={selectedStatus}
                                    onChange={handleStatusChange}
                                    className="p-2 border sm:w-40 rounded-lg truncate w-full"
                                >
                                    {Object.entries(statusOptions).map(
                                        ([key, value]) => (
                                            <option key={key} value={key}>
                                                {value}
                                            </option>
                                        )
                                    )}
                                </select>
                                <button
                                    onClick={handleUpdateStatus}
                                    className="ml-4 sm:mt-0 bg-[#f8703c] text-white px-6 py-2 rounded-md whitespace-nowrap"
                                >
                                    Update Status
                                </button>
                            </div>
                        </div>

                        {/* Ticket Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div className="sm:block  flex justify-between">
                                <strong>Name:</strong> {ticket.name || "N/A"}
                            </div>
                            <div className="sm:block  flex justify-between">
                                <strong>Email:</strong> {ticket.email || "N/A"}
                            </div>
                            <div className="sm:block  flex justify-between">
                                <strong>Ticket Type:</strong>{" "}
                                {categoryName || "N/A"}
                            </div>
                            <div className="sm:block  flex justify-between">
                                <strong>Category:</strong>{" "}
                                {getSubCategoryName() || "N/A"}
                            </div>
                            <div className="sm:block  flex justify-between">
                                <strong>Priority:</strong> {priority || "N/A"}
                            </div>
                            <div className="sm:block  flex justify-between">
                                <strong>Assigned To:</strong>{" "}
                                {assignedTo || "N/A"}
                            </div>
                            <div className="sm:block  flex justify-between">
                                <strong>Created On:</strong>{" "}
                                {ticket.dt || "N/A"}
                            </div>
                            <div className="sm:block  flex justify-between">
                                <strong>Due Date:</strong>{" "}
                                {ticket.due_date || "N/A"}
                            </div>
                            {ticket.attachments ? (
                                <div className="sm:block  flex justify-between">
                                    <strong>Attachment Details:</strong>{" "}
                                    <a
                                        href={`/attachments/${ticket.attachments}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block px-4 py-2 bg-[#f8703c] text-sm font-medium text-white rounded-md transition-all"
                                    >
                                        View Attachment
                                    </a>
                                </div>
                            ) : (
                                <p className="text-gray-500"></p>
                            )}
                        </div>
                        {/* Description */}
                        <div className="border-t-2 py-4 flex sm:flex-row justify-between items-center mb-4">
                            <p>
                                <strong>Description:</strong>{" "}
                                {ticket.message || "No description provided."}
                            </p>
                            {/* Show the "Request for Approval" button or the approval details */}
                            {!isApprovalRequested ? (
                                <button
                                    onClick={handleRequestApproval}
                                    className="ml-4 bg-[#f8703c] text-white px-6 py-2 rounded-md whitespace-nowrap"
                                >
                                    Request for Approval
                                </button>
                            ) : (
                                <div>
                                    <p>
                                        <strong>Status:</strong>{" "}
                                        {approvalStatus}
                                    </p>
                                    <p>
                                        <strong>Approval Message:</strong>{" "}
                                        {approverMessage}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Reply Section */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                        Reply to Ticket
                                    </h3>
                                    <div className="">
                                        <textarea
                                            value={replyMessage}
                                            onChange={(e) =>
                                                setReplyMessage(e.target.value)
                                            }
                                            className=" w-full h-[100px] p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#f8703c] focus:border-transparent"
                                            rows="1"
                                            placeholder="Type your reply here..."
                                        ></textarea>
                                        <div className="w-full flex justify-center">
                                        <button
                                            onClick={handleSubmitReply}
                                            className="px-6 w-[200px] py-2 bg-[#f8703c] text-white rounded-md hover:bg-[#e7612e] transition-colors duration-200 whitespace-nowrap self-start"
                                        >
                                            Send Reply
                                        </button>
                                        </div>
                                    </div>
                                </div>
                                </div>
                    <div className="sm:w-1/4 w-full">
                        {/* Asset Details */}
                        <div className="pt-4 bg-white shadow-md rounded-lg sm:mt-0 mt-4 sm:p-6 p-4 mb-6">
                            <h4 className="text-lg font-semibold mb-2">
                                Asset Details:
                            </h4>
                            {assets ? (
                                <div className="block">
                                    <div className="flex items-center justify-center">
                                        {assets.image ? (
                                            <img
                                                src={assets.image}
                                                alt="Asset"
                                                className="w-48 h-32 object-cover rounded-md shadow-md"
                                            />
                                        ) : (
                                            <span className="text-gray-500">
                                                Image not available
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col mt-4 space-y-2">
                                        <div className="py-1 sm:block  flex justify-between">
                                            <strong>Asset Name:</strong>{" "}
                                            {assets.name || "N/A"}
                                        </div>
                                        <div className="py-1 sm:block  flex justify-between">
                                            <strong>Serial:</strong>{" "}
                                            {assets.serial || "N/A"}
                                        </div>
                                        <div className="py-1 sm:block  flex justify-between truncate w-50">
                                            <strong>Model:</strong>{" "}
                                            {assets.model.name || "N/A"}
                                        </div>
                                        <div className="py-1 sm:block  flex justify-between">
                                            <strong>Category:</strong>{" "}
                                            {assets.category.name || "N/A"}
                                        </div>
                                        <div className="py-1 sm:block  flex justify-between truncate w-50">
                                            <strong>Company:</strong>{" "}
                                            {assets.company.name || "N/A"}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-gray-500">
                                    No assets found for this user.
                                </span>
                            )}
                        </div>

                        {/* Messages, Time Tracking and Reply Section */}
                        <div className="border-t-2 py-6 space-y-6">
                            {/* Messages Section */}
                            {messages.length > 0 && (
                                <div className="bg-white rounded-lg shadow-lg p-6 w-full">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                        Previous Replies
                                    </h3>
                                    <div className="space-y-3">
                                        {messages.map((message, index) => (
                                            <div
                                                key={index}
                                                className="bg-gray-50 border border-gray-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md"
                                            >
                                                {message}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Time Tracking and Reply Controls */}
                            <div className="flex flex-wrap gap-4">
                                {/* Time Tracking Section */}
                                <div className="bg-white rounded-lg shadow-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                        Time Tracking
                                    </h3>
                                    <div className="space-x-4 [display:ruby]">
                                        <div className="space-x-3  flex">
                                            <span className="text-gray-600">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                            </span>
                                            <label
                                                htmlFor="time_worked"
                                                className="text-gray-600 font-medium whitespace-nowrap"
                                            >
                                                Time Spent:
                                            </label>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-32 px-3 py-2 text-lg font-mono bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#f8703c] focus:border-transparent transition-all duration-200 text-center"
                                                name="time_worked"
                                                id="time_worked"
                                                value={timeWorked}
                                                readOnly
                                            />
                                        </div>
                                        <div className="block ml-2">
                                            <button
                                                onClick={startStopTimer}
                                                className={`p-2 rounded-full transition-all duration-200 ${
                                                    isTimerRunning
                                                        ? "bg-red-100 hover:bg-red-200 text-red-600"
                                                        : "bg-green-100 hover:bg-green-200 text-green-600"
                                                }`}
                                                title={
                                                    isTimerRunning
                                                        ? "Pause"
                                                        : "Start"
                                                }
                                            >
                                                {isTimerRunning ? (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M10 9v6m4-6v6m-9-3a9 9 0 1118 0 9 9 0 01-18 0z"
                                                        />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                )}
                                            </button>
                                            <button
                                                onClick={resetTimer}
                                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all duration-200"
                                                title="Reset Timer"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {isTimerRunning ? (
                                                <div className="flex items-center text-green-600 whitespace-nowrap">
                                                    <span className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></span>
                                                    Running
                                                </div>
                                            ) : (
                                                <div className="flex items-center whitespace-nowrap">
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                                    Paused
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
                {/* Approval Popup */}
                {showApprovalPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white rounded-lg p-6 shadow-lg w-96">
                            <h2 className="text-lg text-center font-semibold mb-4">
                                Request for Approval
                            </h2>
                            <div className="mb-4">
                                <strong>Ticket ID:</strong>{" "}
                                <span className="text-blue-600">
                                    {ticket.trackid}
                                </span>
                            </div>
                            <div className="mb-4 hidden">
                                <strong>Ticket ID:</strong>{" "}
                                <span className="text-blue-600">
                                    {ticket.id}
                                </span>
                            </div>
                            <div className="mb-4">
                                <strong>Employee Name:</strong>{" "}
                                {ticket.name || "N/A"}
                            </div>
                            <div className="mb-4">
                                <strong>Employee Email:</strong>{" "}
                                {ticket.email || "N/A"}
                            </div>
                            <div className="mb-4">
                                <strong>Category:</strong>{" "}
                                {getSubCategoryName() || "N/A"}
                            </div>
                            <div className="mb-4">
                                <strong>Employee Message:</strong>{" "}
                                {ticket.message || "N/A"}
                            </div>
                            <div className="mb-4 hidden">
                                <strong>Owner Mail:</strong>{" "}
                                {ticket.owner_email || "N/A"}
                            </div>
                            <div className="mb-4 hidden">
                                <strong>Owner Name:</strong>{" "}
                                {ticket.owner_name || "N/A"}
                            </div>
                            <div className="mb-4 hidden">
                                <strong>Approval Status</strong>{" "}
                                {approvalStatus || "N/A"}
                            </div>
                            <div className="mb-4">
                                <label className="block font-semibold mb-2">
                                    Select Approver Email:
                                </label>
                                <select
                                    value={approverEmail}
                                    onChange={(e) =>
                                        setApproverEmail(e.target.value)
                                    }
                                    className="w-full border p-2 rounded-md"
                                >
                                    <option value="" disabled>
                                        Select Email
                                    </option>
                                    {approverEmails.map((email, index) => (
                                        <option key={index} value={email}>
                                            {email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block font-semibold mb-2">
                                    Message:
                                </label>
                                <textarea
                                    value={approvalMessage}
                                    onChange={(e) =>
                                        setApprovalMessage(e.target.value)
                                    }
                                    className="w-full border p-2 rounded-md"
                                    rows="4"
                                    placeholder="Enter your message"
                                ></textarea>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={handlePopupClose}
                                    className="bg-gray-400 text-white px-4 py-2 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApprovalSubmit}
                                    className="bg-[#f8703c] text-white px-4 py-2 rounded-md"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {showPopup && (
                    <div
                        className={`fixed top-4 right-4 px-6 py-3 rounded-md shadow-md text-white ${
                            popupType === "success"
                                ? "bg-green-500"
                                : "bg-red-500"
                        }`}
                    >
                        {popupMessage}
                    </div>
                )}
            </div>
        </Layout>
    );
}
