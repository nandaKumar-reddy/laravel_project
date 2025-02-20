import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function CreateTicket() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [category, setCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [priority, setPriority] = useState("");
    const [issueCategories, setIssueCategories] = useState([]);
    const [empCat, setEmpCat] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [notices, setNotices] = useState([]);
    const navigate = useNavigate();
    const [attachments, setAttachments] = useState([]);
    useEffect(() => {
        // Fetch notices from the API
        fetch("http://127.0.0.1:8000/api/hesk-notices")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setNotices(data);
                setLoading(false);
            })
            .catch((errors) => {
                setErrors(errors);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(
                    "http://127.0.0.1:8000/api/admin/categories"
                );
                const data = await response.json();
                if (data.success) {
                    setCategories(data.data);
                } else {
                    setErrors((prev) => ({
                        ...prev,
                        category: data.message || "Failed to load categories.",
                    }));
                }
            } catch (error) {
                setErrors((prev) => ({
                    ...prev,
                    category: "Error fetching categories.",
                }));
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        if (category) {
            const fetchIssueCategories = async () => {
                try {
                    const endpoint =
                        category === "1"
                            ? "http://127.0.0.1:8000/api/incident-categories"
                            : category === "2"
                            ? "http://127.0.0.1:8000/api/request-categories"
                            : null;

                    if (!endpoint) return;

                    const response = await fetch(endpoint);
                    const data = await response.json();
                    if (data) {
                        setIssueCategories(data || []);
                    } else {
                        setIssueCategories([]);
                        setErrors((prev) => ({
                            ...prev,
                            empCat: "No issue categories available.",
                        }));
                    }
                } catch (error) {
                    setIssueCategories([]);
                    setErrors((prev) => ({
                        ...prev,
                        empCat: "Error fetching issue categories.",
                    }));
                }
            };

            fetchIssueCategories();
        } else {
            setIssueCategories([]);
        }
    }, [category]);
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files); // Convert FileList to an array
        const maxFileSize = 5 * 1024 * 1024; // 5MB file size limit
        const allowedFileTypes = [
            "image/png",
            "image/jpeg",
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];

        const invalidFiles = files.filter(
            (file) =>
                !allowedFileTypes.includes(file.type) || file.size > maxFileSize
        );

        if (invalidFiles.length > 0) {
            setErrors((prev) => ({
                ...prev,
                attachment:
                    "Some files are invalid. Please upload valid files (PNG, JPEG, PDF, DOCX, XLSX) under 5MB.",
            }));
            return;
        }

        setErrors((prev) => ({ ...prev, attachment: null })); // Clear attachment error
        setAttachments(files); // Store files in state
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const newErrors = {};
        if (!name) newErrors.name = "Name is required.";
        if (!email) {
            newErrors.email = "Email is required.";
        } else if (
            !/\S+@\S+\.\S+/.test(email) ||
            !email.endsWith("@fidelisgroup.in")
        ) {
            newErrors.email =
                "The email is not in the allowed list. Enter your valid mail.";
        }
        if (!category) newErrors.category = "Category is required.";
        if (!priority) newErrors.priority = "Priority is required.";
        if (!empCat) newErrors.empCat = "Subcategory is required.";
        if (!message) newErrors.message = "Message is required.";
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("email", email);
            formData.append("category", category);
            formData.append("priority", priority);
            formData.append("emp_cat", empCat);
            formData.append("message", message);

            // Append attachments (if any)
            attachments.forEach((file, index) => {
                formData.append(`attachments[${index}]`, file);
            });

            const response = await fetch("http://127.0.0.1:8000/api/tickets", {
                method: "POST",
                body: formData,
            });
            console.log(response);
            if (!response.ok) {
                throw new Error(
                    `Failed to create ticket. Status: ${response.status}`
                );
            }

            const data = await response.json();
            if (data.success) {
                navigate("/ticket-submitted", {
                    state: { ticketId: data.data.trackid },
                });
            } else {
                setErrors((prev) => ({
                    ...prev,
                    form: data.message || "Error creating ticket.",
                }));
            }
        } catch (error) {
            setErrors((prev) => ({
                ...prev,
                form: "An error occurred while creating the ticket.",
            }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />

            <main className="container mx-auto py-8 px-4">
                <h2 className="sm:text-3xl text-2xl font-semibold text-[#133e5e] mb-6 text-center dark:text-white">
                    Submit a Support Request
                </h2>
                {notices && notices.length > 0 ? (
                    <div className="w-full flex justify-center mb-6">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 border-l-4 border-yellow-600 text-white p-6 max-w-lg w-full rounded-lg shadow-lg transition-transform transform hover:scale-105 animate__animated animate__fadeIn flex items-center justify-center">
                            <div className="flex justify-center gap-6 items-center space-y-4 w-full">
                                {/* Emoji */}
                                <span className="text-5xl animate__animated animate__bounceIn">
                                    📢
                                </span>
                                <div className="flex flex-col space-y-6 text-center">
                                    {notices.map(
                                        (notice, index) =>
                                            (notice.title ||
                                                notice.message ||
                                                notice.created_at) && (
                                                <div
                                                    key={index}
                                                    className="space-y-4"
                                                >
                                                    {notice.title && (
                                                        <h3 className="font-bold text-3xl text-blue-900">
                                                            {notice.title}
                                                        </h3>
                                                    )}
                                                    {notice.message && (
                                                        <p className="text-xl text-gray-100">
                                                            {notice.message}
                                                        </p>
                                                    )}
                                                    {notice.created_at && (
                                                        <p className="text-sl text-gray-100">
                                                            <span>
                                                                Posted On:{" "}
                                                            </span>
                                                            {notice.created_at}
                                                        </p>
                                                    )}
                                                </div>
                                            )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="flex flex-wrap bg-white rounded-lg shadow-lg overflow-hidden max-w-5xl mx-auto">
                    {/* Left Section with Form */}
                    <div className="w-full md:w-1/2 flex flex-col items-start justify-start sm:p-8 p-4 space-y-6">
                        <form
                            onSubmit={handleSubmit}
                            className="w-full bg-white sm:p-4 p-0 space-y-6"
                        >
                            {/* Name Input */}
                            <div className="mb-6">
                                <label
                                    htmlFor="name"
                                    className="block sm:text-xl text-lg font-medium text-[#133e5e] mb-2"
                                >
                                    Name
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="Enter your name"
                                    className="w-full dark:text-black px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                {errors.name && (
                                    <div className="text-red-500 mt-2">
                                        {errors.name}
                                    </div>
                                )}
                            </div>

                            {/* Email Input */}
                            <div className="mb-6">
                                <label
                                    htmlFor="email"
                                    className="block sm:text-xl text-lg font-medium text-[#133e5e] mb-2 dark:text-black"
                                >
                                    Email
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Enter your email"
                                    className="w-full px-4 dark:text-black py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                {errors.email && (
                                    <div className="text-red-500 mt-2">
                                        {errors.email}
                                    </div>
                                )}
                            </div>

                            {/* Ticket Type Radio Buttons */}
                            <div className="mb-6">
                                <label
                                    htmlFor="category"
                                    className="block sm:text-xl text-lg font-medium text-[#133e5e] mb-2 dark:text-black"
                                >
                                    Ticket Type{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="space-y-4">
                                    {categories.map((cat) => (
                                        <div
                                            key={cat.id}
                                            className="flex items-center dark:text-black"
                                        >
                                            <input
                                                type="radio"
                                                id={`category-${cat.id}`}
                                                name="category"
                                                value={cat.id}
                                                checked={category == cat.id}
                                                onChange={(e) =>
                                                    setCategory(e.target.value)
                                                }
                                                className="w-4 h-4 dark:text-black sm:text-xl text-lg text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <label
                                                htmlFor={`category-${cat.id}`}
                                                className="ml-2 sm:text-xl text-lg dark:text-black text-gray-700"
                                            >
                                                {cat.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {errors.category && (
                                    <div className="text-red-500 mt-2 dark:text-black">
                                        {errors.category}
                                    </div>
                                )}
                            </div>

                            {/* Subcategory Dropdown */}
                            <div className="mb-6">
                                <label
                                    htmlFor="empCat"
                                    className="block sm:text-xl text-lg font-medium text-[#133e5e] mb-2 dark:text-black"
                                >
                                    Subcategory
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="empCat"
                                    className="w-full dark:text-black px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                    value={empCat}
                                    onChange={(e) => setEmpCat(e.target.value)}
                                >
                                    <option value="">
                                        Select a subcategory
                                    </option>
                                    {issueCategories.map((issueCat) => (
                                        <option
                                            key={issueCat.id}
                                            value={issueCat.id}
                                        >
                                            {issueCat.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.empCat && (
                                    <div className="text-red-500 mt-2 dark:text-black">
                                        {errors.empCat}
                                    </div>
                                )}
                            </div>

                            {/* Priority Radio Buttons */}
                            <div className="mb-6">
                                <label
                                    htmlFor="priority"
                                    className="block sm:text-xl text-lg font-medium text-[#133e5e] mb-2"
                                >
                                    Priority{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="flex space-x-6">
                                    {[
                                        { value: "0", label: "Low" },
                                        { value: "1", label: "Medium" },
                                        { value: "2", label: "High" },
                                    ].map((priorityOption) => (
                                        <div
                                            key={priorityOption.value}
                                            className="flex items-center"
                                        >
                                            <input
                                                type="radio"
                                                id={`priority-${priorityOption.value}`}
                                                name="priority"
                                                value={priorityOption.value}
                                                checked={
                                                    priority ===
                                                    priorityOption.value
                                                }
                                                onChange={(e) =>
                                                    setPriority(e.target.value)
                                                }
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <label
                                                htmlFor={`priority-${priorityOption.value}`}
                                                className="ml-2 text-lg text-gray-700"
                                            >
                                                {priorityOption.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {errors.priority && (
                                    <div className="text-red-500 mt-2">
                                        {errors.priority}
                                    </div>
                                )}
                            </div>

                            {/* Message Input */}
                            <div className="mb-6">
                                <label
                                    htmlFor="message"
                                    className="block sm:text-xl text-lg font-medium text-[#133e5e] mb-2 dark:text-black"
                                >
                                    Message
                                    <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="message"
                                    rows="4"
                                    placeholder="Enter you issue here in detail"
                                    className="w-full dark:text-black px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                                {errors.message && (
                                    <div className="text-red-500 mt-2 dark:text-black">
                                        {errors.message}
                                    </div>
                                )}
                            </div>
                            {/* Attachments Field */}
                            <div className="mb-6">
                                <label
                                    htmlFor="attachment"
                                    className="block text-lg font-medium text-[#133e5e] mb-2"
                                >
                                    Attachments (Maximum 2MB)
                                </label>
                                <input
                                    type="file"
                                    id="attachment"
                                    accept="image/*, .pdf, .docx, .xlsx"
                                    multiple
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                    onChange={handleFileChange}
                                />
                                {errors.attachment && (
                                    <div className="text-red-500 mt-2">
                                        {errors.attachment}
                                    </div>
                                )}
                            </div>
                            {/* Submit Button */}
                            <div className="mb-6 flex justify-center">
                                <button
                                    type="submit"
                                    className="px-6 py-3 w-full bg-gradient-to-r from-[#133e5e] to-[#f8703c] text-white text-lg rounded-md hover:bg-gradient-to-l transition-all"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Submitting..."
                                        : "Create Ticket"}
                                </button>
                            </div>

                            {errors.form && (
                                <div className="text-red-500 mt-4">
                                    {errors.form}
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Right Section with Image */}
                    {/* Right Section with Sticky Image Scrolling Along with Form */}
                    <div className="w-full md:w-1/2 flex justify-center items-start sticky top-[160px] bottom-0 self-start">
                        <img
                            src="/images/ticketimage.jpg"
                            alt="Create Ticket"
                            className="w-full h-full object-cover mix-blend-multiply"
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
