import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import Swal from "sweetalert2";

export default function DbConfig() {
    const [smtpConfig, setSmtpConfig] = useState({
        db_host: "",
        db_name: "",
        db_username: "",
        db_password: "",
        db_port: "",
        app_url: "",
        app_name: "",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch SMTP Configuration
    useEffect(() => {
        const fetchSmtpConfig = async () => {
            setLoading(true);
            try {
                const response = await fetch("http://127.0.0.1:8000/api/admin/db-config");
                if (!response.ok) throw new Error("Failed to fetch SMTP configuration");
                const result = await response.json();

                setSmtpConfig(result); // Populate the configuration data
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSmtpConfig();
    }, []);

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setSmtpConfig((prev) => ({ ...prev, [name]: value }));
    };

    // Handle Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/admin/update-db-config`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(smtpConfig),
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
                    text: "Failed to update SMTP configuration.",
                });
            }
        } catch (err) {
            // Show error popup for unexpected errors
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "An error occurred while updating SMTP configuration.",
            });
        }
    };

    if (loading) return <Layout>Loading...</Layout>;
    if (error) return <Layout>Error: {error}</Layout>;

    return (
        <Layout>
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
          <h1 className="text-2xl font-bold text-gray-700 text-center mb-8">General Settings</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Website Settings */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Website Settings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Website Title</label>
                  <input
                    type="text"
                    name="app_name"
                    value={smtpConfig.app_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-orange-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Website URL</label>
                  <input
                    type="text"
                    name="app_url"
                    value={smtpConfig.app_url}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-orange-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Help Desk Title</label>
                  <input
                    type="text"
                    name="helpdesk_title"
                    value={smtpConfig.helpdesk_title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-orange-400 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
      
            {/* Database Settings */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Database Settings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Database Host</label>
                  <input
                    type="text"
                    name="db_host"
                    value={smtpConfig.db_host}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-orange-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Database Name</label>
                  <input
                    type="text"
                    name="db_name"
                    value={smtpConfig.db_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-orange-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">DB Username</label>
                  <input
                    type="text"
                    name="db_username"
                    value={smtpConfig.db_username}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-orange-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">DB Password</label>
                  <input
                    type="password"
                    name="db_password"
                    value={smtpConfig.db_password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-orange-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Database Port</label>
                  <input
                    type="number"
                    name="db_port"
                    value={smtpConfig.db_port}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-orange-400 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
      
            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-orange-500 text-white font-medium px-8 py-3 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </Layout>
      
    );
}
