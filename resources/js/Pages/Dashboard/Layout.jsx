import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    FaTachometerAlt,
    FaListAlt,
    FaEnvelope,
    FaBars,
    FaTimes,
    FaUsers,
    FaCheckCircle,
    FaClock,
    FaSignOutAlt,
    FaTools,
    FaTicketAlt,
    FaClipboardList,
    FaDatabase,
    FaFileExport,
    FaBell,
    FaRegEnvelope,
    FaExclamationTriangle,
    FaCaretDown,
    FaRegBell,
    FaUserCircle,
} from "react-icons/fa";

function Layout({ children }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [userName, setUserName] = useState("");
    const [isAdmin, setIsAdmin] = useState("");
    const [isTicketsDropdownOpen, setIsTicketsDropdownOpen] = useState(false);
    const [isTicketDropdownOpen, setIsTicketDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const userId = localStorage.getItem("userId");

    if (!userId) {
        window.location.href = "/admin";
        return null;
    }

    useEffect(() => {
        const fetchUserName = async () => {
            if (userId) {
                try {
                    const response = await fetch(
                        `http://127.0.0.1:8000/api/admin/hesk-users/${userId}`
                    );
                    const data = await response.json();
                    if (response.ok && data.success) {
                        setUserName(data.data.name);
                        setIsAdmin(data.data.isadmin);
                    } else {
                        setError(
                            data.message ||
                                "An error occurred while fetching user data."
                        );
                        window.location.href = "/admin";
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setError("An error occurred while fetching user data.");
                    window.location.href = "/admin";
                } finally {
                    setIsLoading(false);
                }
            } else {
                setError("User not logged in.");
                setIsLoading(false);
                window.location.href = "/admin";
            }
        };

        fetchUserName();
    }, []);

    const getAbbreviatedName = (name) => {
        if (!name) return "U";
        const nameParts = name.split(" ");
        if (nameParts.length > 1) {
            return nameParts[0][0] + nameParts[1][0];
        }
        return nameParts[0][0];
    };

    const handleLogout = () => {
        localStorage.removeItem("userId");
        window.location.href = "/admin";
    };

    const closeAllDropdowns = () => {
        setIsTicketsDropdownOpen(false);
        setIsUserDropdownOpen(false);
        setIsSettingsDropdownOpen(false);
    };

    return (
        <div className="flex h-screen bg-gray-100 relative">
            {/* Mobile Sidebar Overlay */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setIsMobileSidebarOpen(false)}
                ></div>
            )}
            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full bg-gray-800 text-white z-40 transform bg-gray-800 text-white flex flex-col transition-all duration-300 h-full ${
                    isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                } transition-transform duration-300 ease-in-out md:static md:transform-none md:translate-x-0 ${
                    isSidebarCollapsed ? "w-16" : "w-64"
                }`}
            >
                {/* Header section with logo and toggle button */}
                <div className="flex items-center bg-white px-2 py-2 mb-4 shadow-md transition-all duration-300 ease-in-out">
                    <button
                        className="focus:outline-none text-gray-800 hover:text-gray-600 transition-transform transform duration-300 ease-in-out md:block hidden"
                        onClick={() =>
                            setIsSidebarCollapsed(!isSidebarCollapsed)
                        }
                    >
                        {isSidebarCollapsed ? (
                            <FaBars size={20} />
                        ) : (
                            <FaTimes size={20} />
                        )}
                    </button>
                    <div className="flex justify-center w-full">
                        {!isSidebarCollapsed && (
                            <Link
                                to="/"
                                className="transition-transform duration-300 ease-in-out transform hover:scale-110"
                            >
                                <img
                                    src="/images/fidelis-logo.png"
                                    alt="Fidelis Logo"
                                    className="h-10 sm:h-10 ml-6 sm:ml-0 transition-all duration-300 ease-in-out"
                                />
                            </Link>
                        )}
                    </div>
                </div>

                {/* Sidebar links and dropdowns */}
                <div className="flex-1 overflow-y-auto space-y-4">
                    <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-4 py-2 px-2 hover:bg-gray-700 rounded"
                    >
                        <FaTachometerAlt size={20} />
                        {!isSidebarCollapsed && <span>Dashboard</span>}
                    </Link>
                    {/* Tickets Dropdown */}
                    <div className="relative group">
                        <button
                            className={`flex items-center ${
                                isSidebarCollapsed ? "" : "gap-4"
                            } py-2 px-2 hover:bg-gray-700 rounded w-full`}
                            onClick={() => {
                                closeAllDropdowns();
                                setIsTicketDropdownOpen(
                                    !isTicketDropdownOpen
                                );
                            }}
                        >
                            <FaTicketAlt size={20} />
                            {!isSidebarCollapsed && <span>Tickets</span>}
                            <FaCaretDown
                                className={`ml-auto transform transition-transform ${
                                    isTicketDropdownOpen ? "rotate-180" : ""
                                }`}
                                size={14}
                            />
                        </button>

                        {isTicketDropdownOpen && (
    <div
        className={`mt-2 bg-gray-700 rounded shadow-lg z-10 ${
            isSidebarCollapsed ? "left-14 w-auto" : "left-0 w-56"
        }`}
    >
        {/* Tickets */}
        <Link
            to="/admin/tickets"
            className="flex items-center gap-4 py-2 px-4 hover:bg-gray-600 rounded text-gray-300 hover:text-white"
            onClick={(e) => e.stopPropagation()}
        >
            <FaRegEnvelope size={20} />
            {!isSidebarCollapsed && <span>Tickets</span>}
        </Link>

        {/* Resolved Tickets */}
        <Link
            to="/admin/resolved-tickets"
            className="flex items-center gap-4 py-2 px-4 hover:bg-gray-600 rounded text-gray-300 hover:text-white"
            onClick={(e) => e.stopPropagation()}
        >
            <FaCheckCircle size={20} /> {/* ✅ Green check for resolved tickets */}
            {!isSidebarCollapsed && <span>Resolved Tickets</span>}
        </Link>

        {/* Overdue Tickets */}
        <Link
            to="/admin/overdue-tickets"
            className="flex items-center gap-4 py-2 px-4 hover:bg-gray-600 rounded text-gray-300 hover:text-white"
            onClick={(e) => e.stopPropagation()}
        >
            <FaClock size={20} /> {/* ⏰ Clock for overdue tickets */}
            {!isSidebarCollapsed && <span>Overdue Tickets</span>}
        </Link>
    </div>
)}
                    </div>
                    {/* Tickets Dropdown */}
                    <div className="relative group">
                        <button
                            className={`flex items-center ${
                                isSidebarCollapsed ? "" : "gap-4"
                            } py-2 px-2 hover:bg-gray-700 rounded w-full`}
                            onClick={() => {
                                closeAllDropdowns();
                                setIsTicketsDropdownOpen(
                                    !isTicketsDropdownOpen
                                );
                            }}
                        >
                            <FaClipboardList size={20} />
                            {!isSidebarCollapsed && <span>Ticket Types</span>}
                            <FaCaretDown
                                className={`ml-auto transform transition-transform ${
                                    isTicketsDropdownOpen ? "rotate-180" : ""
                                }`}
                                size={14}
                            />
                        </button>

                        {isTicketsDropdownOpen && (
                            <div
                                className={`mt-2 bg-gray-700 rounded shadow-lg z-10 ${
                                    isSidebarCollapsed
                                        ? "left-14 w-auto"
                                        : "left-0 w-56"
                                }`}
                            >
                                <Link
                                    to="/admin/request-tickets"
                                    className="flex items-center gap-4 py-2 px-4 hover:bg-gray-600 rounded text-gray-300 hover:text-white"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <FaRegEnvelope size={20} />
                                    {!isSidebarCollapsed && (
                                        <span>Request Tickets</span>
                                    )}
                                </Link>
                                <Link
                                    to="/admin/incident-tickets"
                                    className="flex items-center gap-4 py-2 px-4 hover:bg-gray-600 rounded text-gray-300 hover:text-white"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <FaExclamationTriangle size={20} />
                                    {!isSidebarCollapsed && (
                                        <span>Incident Tickets</span>
                                    )}
                                </Link>
                            </div>
                        )}
                    </div>
                    <Link
                        to="/admin/notice"
                        className="flex items-center gap-4 py-2 px-2 hover:bg-gray-700 rounded"
                    >
                        <FaRegBell size={20} />
                        {!isSidebarCollapsed && <span>Add Notice</span>}
                    </Link>
                    <Link
                                to="/admin/emails"
                                className="flex items-center gap-4 py-2 px-2 hover:bg-gray-700 rounded"
                            >
                                <FaEnvelope size={20} />
                                {!isSidebarCollapsed && (
                                    <span>Fidelis Emails</span>
                                )}
                            </Link>
                    {/* Fields visible only to isAdmin === 1 */}
                    {Number(isAdmin) === 1 && (
                        <>
                            <Link
                                to="/admin/categories"
                                className="flex items-center gap-4 py-2 px-2 hover:bg-gray-700 rounded"
                            >
                                <FaListAlt size={20} />
                                {!isSidebarCollapsed && <span>Categories</span>}
                            </Link>
                            <Link
                                to="/admin/users"
                                className="flex items-center gap-4 py-2 px-2 hover:bg-gray-700 rounded"
                            >
                                <FaUsers size={20} />
                                {!isSidebarCollapsed && <span>Users</span>}
                            </Link>

                            <div className="relative group">
                                <button
                                    className={`flex items-center ${
                                        isSidebarCollapsed ? "" : "gap-4"
                                    } py-2 px-2 hover:bg-gray-700 rounded w-full`}
                                    onClick={() => {
                                        closeAllDropdowns();
                                        setIsSettingsDropdownOpen(
                                            !isSettingsDropdownOpen
                                        );
                                    }}
                                >
                                    <FaTools size={20} />
                                    {!isSidebarCollapsed && (
                                        <span>Settings</span>
                                    )}
                                    <FaCaretDown
                                        className={`ml-auto transform transition-transform ${
                                            isSettingsDropdownOpen
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                        size={14}
                                    />
                                </button>

                                {isSettingsDropdownOpen && (
                                    <div
                                        className={`mt-2 bg-gray-700 rounded shadow-lg z-10 ${
                                            isSidebarCollapsed
                                                ? "left-14 w-auto"
                                                : "left-0 w-56"
                                        }`}
                                    >
                                        <Link
                                            to="/admin/db-config"
                                            className="flex items-center gap-4 py-2 px-4 hover:bg-gray-600 rounded text-gray-300 hover:text-white"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <FaDatabase size={20} />
                                            {!isSidebarCollapsed && (
                                                <span>General</span>
                                            )}
                                        </Link>
                                        <Link
                                            to="/admin/smtp-config"
                                            className="flex items-center gap-4 py-2 px-4 hover:bg-gray-600 rounded text-gray-300 hover:text-white"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <FaEnvelope size={20} />
                                            {!isSidebarCollapsed && (
                                                <span>SMTP Config</span>
                                            )}
                                        </Link>
                                        <Link
                                            to="/admin/notify-email"
                                            className="flex items-center gap-4 py-2 px-4 hover:bg-gray-600 rounded text-gray-300 hover:text-white"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <FaBell size={20} />
                                            {!isSidebarCollapsed && (
                                                <span>Notifications</span>
                                            )}
                                        </Link>
                                        <Link
                                            to="/admin/export-tickets"
                                            className="flex items-center gap-4 py-2 px-4 hover:bg-gray-600 rounded text-gray-300 hover:text-white"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <FaFileExport size={20} />
                                            {!isSidebarCollapsed && (
                                                <span>Export Tickets</span>
                                            )}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* User Dropdown with Logout Button */}
                <div className="mt-24 py-2 px-2 relative group">
                    {isLoading ? (
                        <div className="text-white">Loading...</div>
                    ) : error ? (
                        <div className="text-red-500">{error}</div>
                    ) : (
                        <button
                            className="flex items-center gap-2 py-2 text-white hover:text-white w-full"
                            onClick={() =>
                                setIsUserDropdownOpen(!isUserDropdownOpen)
                            }
                        >
                            <span className="flex-1 text-left capitalize">
                                {isSidebarCollapsed
                                    ? getAbbreviatedName(userName)
                                    : userName || "Guest"}
                            </span>
                                <FaCaretDown
                                        className={`ml-auto transform transition-transform ${
                                            isUserDropdownOpen
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                        size={14}
                                    />
                        </button>
                    )}

                    {isUserDropdownOpen && (
                        <div
                            className={`left-0 mt-2 bg-gray-700 rounded shadow-lg z-20 transition-transform transform scale-95 group-hover:scale-100 ${
                                isSidebarCollapsed ? "w-12" : "w-56"
                            }`}
                        >
                            <Link
                                to="/admin/profile"
                                className={`flex items-center gap-4 py-2 px-4 hover:bg-gray-600 rounded text-gray-300 hover:text-white ${
                                    isSidebarCollapsed ? "justify-center" : ""
                                }`}
                            >
                                <FaUserCircle size={20} />
                                {!isSidebarCollapsed && <span>Profile</span>}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className={`flex items-center gap-4 py-2 px-4 hover:bg-red-700 rounded text-gray-300 hover:text-white w-full ${
                                    isSidebarCollapsed ? "justify-center" : ""
                                }`}
                            >
                                <FaSignOutAlt size={20} />
                                {!isSidebarCollapsed && <span>Logout</span>}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 p-6 bg-gray-100 overflow-auto relative">
                {/* Mobile Toggle Button */}
                <div className="fixed top-[0.6rem] left-2 md:hidden z-50">
                    <button
                        onClick={() =>
                            setIsMobileSidebarOpen(!isMobileSidebarOpen)
                        }
                        className="p-2 bg-gray-800 text-white rounded-full shadow-md focus:outline-none"
                    >
                        {isMobileSidebarOpen ? (
                            <FaTimes size={20} />
                        ) : (
                            <FaBars size={20} />
                        )}
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

export default Layout;
