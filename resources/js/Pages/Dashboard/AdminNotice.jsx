import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import Swal from "sweetalert2";

export default function AdminNotice() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [noticeId, setNoticeId] = useState(null);

  // Fetch notice details and update localStorage
  const fetchNoticeDetails = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/hesk-notices/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch notice details");
      }

      const data = await response.json();
      setTitle(data.title);
      setMessage(data.message);
      setNoticeId(data.id);

      // Store fetched data in localStorage
      localStorage.setItem("noticeId", data.id);
      localStorage.setItem("title", data.title);
      localStorage.setItem("message", data.message);
    } catch (error) {
      console.error("Error fetching notice details:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to fetch notice details. Please try again.",
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Both fields are required!",
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    try {
      const method = noticeId ? "PUT" : "POST";
      const url = noticeId
        ? `http://localhost:8000/api/hesk-notices/${noticeId}`
        : "http://localhost:8000/api/hesk-notices";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, message }),
      });

      if (!response.ok) {
        throw new Error(
          noticeId ? "Failed to update notice" : "Failed to submit notice"
        );
      }

      const result = await response.json();
      console.log(noticeId ? "Notice updated:" : "Notice submitted:", result);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: noticeId
          ? "Notice updated successfully!"
          : "Notice submitted successfully!",
        timer: 3000,
        timerProgressBar: true,
      });

      setNoticeId(result.id || null); // Set the ID for further edits
      // Update localStorage after submission
      localStorage.setItem("noticeId", result.id || null);
      localStorage.setItem("title", title);
      localStorage.setItem("message", message);
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "An error occurred. Please try again.",
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };

  const handleDelete = async () => {
    if (!noticeId) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "No notice selected to delete.",
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/hesk-notices/${noticeId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete notice");
      }

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Notice deleted successfully.",
        timer: 3000,
        timerProgressBar: true,
      });

      handleClearForm();
    } catch (error) {
      console.error("Error deleting notice:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to delete notice. Please try again.",
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };

  const handleClearForm = () => {
    setTitle("");
    setMessage("");
    setNoticeId(null);
    // Clear localStorage
    localStorage.removeItem("noticeId");
    localStorage.removeItem("title");
    localStorage.removeItem("message");
  };

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const storedNoticeId = localStorage.getItem("noticeId");
    const storedTitle = localStorage.getItem("title");
    const storedMessage = localStorage.getItem("message");

    if (storedNoticeId && storedTitle && storedMessage) {
      setNoticeId(storedNoticeId);
      setTitle(storedTitle);
      setMessage(storedMessage);
    }
  }, []);

  // Fetch notice details when a specific ID is selected
  useEffect(() => {
    if (noticeId) {
      fetchNoticeDetails(noticeId);
    }
  }, [noticeId]);

  return (
    <Layout>
      <div className="min-h-full flex items-center justify-center bg-gray-100">
  <div className="p-6 w-[700px] bg-white shadow-lg rounded-lg">
    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
      {noticeId ? "Edit Notice" : "Post a Notice"}
    </h2>
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title Input */}
      <div>
        <label
          className="block text-sm font-medium text-gray-700 mb-2"
          htmlFor="title"
        >
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#f8703c] focus:outline-none"
          placeholder="Enter notice title"
        />
      </div>

      {/* Message Input */}
      <div>
        <label
          className="block text-sm font-medium text-gray-700 mb-2"
          htmlFor="message"
        >
          Message
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#f8703c] focus:outline-none"
          placeholder="Enter notice message"
          rows="4"
        ></textarea>
      </div>

      {/* Submit and Clear Buttons */}
      <div className="flex space-x-4 justify-center">
        <button
          type="submit"
          className="bg-[#f8703c] text-white px-6 py-3 rounded-lg font-medium shadow-md hover:bg-[#f75b1c] focus:ring-2 focus:ring-[#f8703c] focus:ring-offset-2 transition duration-300"
        >
          {noticeId ? "Update Notice" : "Submit Notice"}
        </button>

        {noticeId && (
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-300"
          >
            Delete Notice
          </button>
        )}
      </div>
    </form>
  </div>
  </div>
</Layout>

  );
}
