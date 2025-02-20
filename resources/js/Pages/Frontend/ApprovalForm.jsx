import React, { useEffect, useState } from "react";
import Footer from "./Footer";
import Header from "./Header";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

export default function ApprovalForm() {
    const { id } = useParams(); // Get the ticket ID from the URL
    const [approvalStatus, setApprovalStatus] = useState("");
    const [approverMessage, setApproverMessage] = useState("");
    const [ticketData, setTicketData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch ticket data when the component loads
    useEffect(() => {
        const fetchTicketApprovalDetails = async () => {
            try {
                const response = await fetch(
                    `http://127.0.0.1:8000/api/admin/request-approval/${id}`
                );
                if (response.ok) {
                    const data = await response.json();
                    console.log(data); // Debug fetched data

                    if (data && data.change_management_data) {
                        const {
                            approval_status,
                            approver_message,
                            ...rest
                        } = data.change_management_data;

                        setTicketData(rest); // Save all additional data
                        setApprovalStatus(approval_status || "Pending");
                        setApproverMessage(approver_message || "");
                    } else {
                        console.error("No valid data returned.");
                        setError("No valid data found for this ticket.");
                    }
                } else {
                    console.error("Failed to fetch data:", response.statusText);
                    setError("Failed to fetch ticket details.");
                }
            } catch (err) {
                console.error("API Error:", err);
                setError("An error occurred while fetching ticket details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTicketApprovalDetails();
    }, [id]);

    // Function to handle approval or rejection
    const handleSubmit = async (status) => {
        const payload = {
            approval_status: status,
            approver_message: approverMessage,
        };

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/api/admin/request-approval/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (response.ok) {
                const result = await response.json();
                console.log("Update Successful:", result);
                Swal.fire({
                    icon: "success",
                    title: `Ticket ${status.toLowerCase()} successfully`,
                    text: `The ticket has been ${status.toLowerCase()}.`,
                });
                setApprovalStatus(status); // Update status in the UI
            } else {
                console.error("Failed to update:", response.statusText);
                Swal.fire({
                    icon: "error",
                    title: "Failed to update status",
                    text: "Please try again.",
                });
            }
        } catch (err) {
            console.error("API Error:", err);
            Swal.fire({
                icon: "error",
                title: "Error updating status",
                text: "Please try again later.",
            });
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white">
            <Header />

            <main className="flex flex-grow items-center justify-center py-2 px-4">
                <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg">
                    {approvalStatus === "Pending" ? (
                        <form>
                            <h1 className="text-2xl font-bold mb-4 text-center">
                                Approval Form for {ticketData.emp_name}
                            </h1>
                            <p className="mb-2">
                                <strong>Ticket ID:</strong> {ticketData.track_id}
                            </p>
                            <p className="mb-2">
                                <strong>Employee Email:</strong>{" "}
                                {ticketData.emp_email}
                            </p>
                            <p className="mb-2">
                                <strong>Employee Message:</strong>{" "}
                                {ticketData.emp_message}
                            </p>
                            <p className="mb-2">
                                <strong>Staff Name:</strong> {ticketData.owner_name}
                            </p>
                            <p className="mb-2">
                                <strong>Staff Email:</strong>{" "}
                                {ticketData.owner_email}
                            </p>
                            <p className="mb-2">
                                <strong>Staff Message:</strong>{" "}
                                {ticketData.staff_message}
                            </p>
                            <p className="mb-4">
                                <strong>Current Status:</strong> {approvalStatus}
                            </p>
                            <div className="mb-4">
                                <label className="block mb-2 font-semibold">
                                    Approver Message:
                                </label>
                                <textarea
                                    value={approverMessage}
                                    onChange={(e) =>
                                        setApproverMessage(e.target.value)
                                    }
                                    placeholder="Enter your message"
                                    rows="2"
                                    className="w-full border rounded-md p-2"
                                ></textarea>
                            </div>
                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => handleSubmit("Approved")}
                                    className="px-4 py-2 bg-green-500 text-white font-bold rounded-md hover:bg-green-600"
                                >
                                    Approve
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSubmit("Rejected")}
                                    className="px-4 py-2 bg-red-500 text-white font-bold rounded-md hover:bg-red-600"
                                >
                                    Reject
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div>
                            <h2 className="text-xl text-center font-bold">
                                Ticket has been {approvalStatus.toLowerCase()}.
                            </h2>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
