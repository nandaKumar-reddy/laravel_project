import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import Swal from "sweetalert2";

export default function NotificationConfig() {
    const [notificationConfig, setNotificationConfig] = useState({
        id: "",
        tech_team_email: "",
        tech_leader_email: "",
        hr_officer_email: "",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch SMTP Configuration
    useEffect(() => {
        const fetchNotificationConfig = async () => {
            setLoading(true);
            try {
                const response = await fetch("http://localhost:8000/api/admin/notify-email");
                if (!response.ok) throw new Error("Failed to fetch SMTP configuration");
                const result = await response.json();

                if (Array.isArray(result) && result.length > 0) {
                    setNotificationConfig(result[0]);
                } else {
                    throw new Error("No data found");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNotificationConfig();
    }, []);

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNotificationConfig((prev) => ({ ...prev, [name]: value }));
    };

    // Handle Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const id = notificationConfig.id || 1; // Default to 1 if id is not available
            const response = await fetch(`http://localhost:8000/api/admin/notify-email/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(notificationConfig),
            });
            const result = await response.json();

            if (result.success) {
                // Show success popup
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "SMTP configuration updated successfully!",
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                });
            } else {
                // Show error popup
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    timer: 3000,
                    text: "Failed to update SMTP configuration.",
                });
            }
        } catch (err) {
            // Show error popup for unexpected errors
            Swal.fire({
                icon: "error",
                title: "Error",
                timer: 3000,
                text: "An error occurred while updating SMTP configuration.",
            });
        }
    };

    if (loading) return <Layout>Loading...</Layout>;
    if (error) return <Layout>Error: {error}</Layout>;

    return (
        <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="p-6 bg-white shadow-xl rounded-lg max-w-4xl w-full sm:mx-4 mx-0 border border-gray-200">
            <h1 className="sm:text-3xl text-[1.2rem] font-bold text-center text-gray-800 mb-8">
              Notification Email Configuration
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tech Team Email */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <label className="block text-base font-medium text-gray-700 text-center sm:text-left">
                  Tech Team Email
                </label>
                <div className="col-span-2">
                  <input
                    type="email"
                    name="tech_team_email"
                    value={notificationConfig.tech_team_email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300 ease-in-out bg-gray-50 hover:bg-white"
                    placeholder="Enter tech team email"
                    required
                  />
                </div>
              </div>
      
              {/* Tech Lead Email */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <label className="block text-base font-medium text-gray-700 text-center sm:text-left">
                  Tech Lead Email
                </label>
                <div className="col-span-2">
                  <input
                    type="email"
                    name="tech_leader_email"
                    value={notificationConfig.tech_leader_email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300 ease-in-out bg-gray-50 hover:bg-white"
                    placeholder="Enter tech lead email"
                    required
                  />
                </div>
              </div>
      
              {/* HR Officer Email */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <label className="block text-base font-medium text-gray-700 text-center sm:text-left">
                  HR Officer Email
                </label>
                <div className="col-span-2">
                  <input
                    type="email"
                    name="hr_officer_email"
                    value={notificationConfig.hr_officer_email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300 ease-in-out bg-gray-50 hover:bg-white"
                    placeholder="Enter HR officer email"
                    required
                  />
                </div>
              </div>
      
              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#f8703c] to-[#e7612e] text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#f8703c] transition-all duration-300 ease-in-out w-full sm:w-auto"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
      
    
    );
}
