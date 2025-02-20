import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import axios from "axios";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({
        user: "",
        pass: "",
        isadmin: "0",
        name: "",
        email: "",
        signature: "Best Regards",
        categories: "1",
    });
    const [editingUser, setEditingUser] = useState(null);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [notification, setNotification] = useState({ message: "", type: "" });

    useEffect(() => {
        axios
            .get("http://127.0.0.1:8000/api/admin/hesk-users/")
            .then((response) => {
                if (Array.isArray(response.data.data)) {
                    setUsers(response.data.data);
                } else {
                    console.error(
                        "API response does not contain user data as an array."
                    );
                }
            })
            .catch((error) => console.error("Error fetching users:", error));
    }, []);

    const handleAddUser = () => {
        axios
            .post("http://127.0.0.1:8000/api/admin/hesk-users/", newUser)
            .then((response) => {
                if (response.data && response.data.success) {
                    const newUserData = response.data.data;
                    setUsers((prevUsers) => [...prevUsers, newUserData]);
                    setShowAddUserModal(false);
                    setNewUser({
                        user: "",
                        pass: "",
                        isadmin: "0",
                        name: "",
                        email: "",
                        signature: "Best Regards",
                        categories: "1",
                    });
                    showNotification("User added successfully!", "success");
                }
            })
            .catch((error) => {
                console.error("Error adding user:", error);
                showNotification(
                    "There was an error adding the user.",
                    "error"
                );
            });
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setShowEditUserModal(true);
    };

    const handleUpdateUser = () => {
        axios
            .put(
                `http://127.0.0.1:8000/api/admin/hesk-users/${editingUser.id}`,
                editingUser
            )
            .then((response) => {
                const updatedUser = response.data;
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user.id === updatedUser.id ? updatedUser : user
                    )
                );
                setShowEditUserModal(false);
                showNotification("User updated successfully!", "success");
            })
            .catch((error) => {
                console.error("Error updating user:", error);
                showNotification("Error updating user", "error");
            });
    };

    const handleDeleteUser = (id) => {
        axios
            .delete(`http://127.0.0.1:8000/api/admin/hesk-users/${id}`)
            .then(() => {
                // Update users state to remove the deleted user
                setUsers(users.filter((user) => user.id !== id));
                showNotification("User deleted successfully!", "success");
            })
            .catch((error) => {
                console.error("Error deleting user:", error);
                showNotification("Error deleting user", "error");
            });
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: "", type: "" });
        }, 3000); // Clear notification after 3 seconds
    };
    const getAdminStatus = (isadmin) => (isadmin === "1" ? "Admin" : "Staff");

    const getCategoryName = (category) =>
        category === "1" ? "Submit an Incident" : "Submit a Request";

    return (
        <Layout>
            {/* Notification Popup */}
            {notification.message && (
                <div
                    className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md text-white ${
                        notification.type === "success"
                            ? "bg-green-500"
                            : "bg-red-500"
                    }`}
                    style={{ zIndex: 9999 }}
                >
                    {notification.message}
                </div>
            )}
            <div className="sm:p-6 rounded-lg">
                <h1 className="text-2xl sm:text-left text-center font-semibold mb-4 p-2 border-b border-gray-300 rounded-md">
                    Manage Users
                </h1>

                {/* Button to Open Add User Modal */}
                <button
                    onClick={() => setShowAddUserModal(true)}
                    className="bg-[#f8703c] text-white px-4 py-2 rounded-md mb-6"
                >
                    Add New User
                </button>

                {/* Users Table */}
                <>
                <table className="hidden sm:table min-w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-[#f8703c] text-white">
                        <tr className="border-b border-gray-300">
                            <th className="px-4 py-2 text-center border border-gray-300">
                                ID
                            </th>
                            <th className="px-4 py-2 text-center border border-gray-300">
                                Username
                            </th>
                            <th className="px-4 py-2 text-center border border-gray-300">
                                Name
                            </th>
                            <th className="px-4 py-2 text-center border border-gray-300">
                                Email
                            </th>
                            <th className="px-4 py-2 text-center border border-gray-300">
                                Admin Status
                            </th>
                            <th className="px-4 py-2 text-center border border-gray-300">
                                Category
                            </th>
                            <th className="px-4 py-2 text-center border border-gray-300">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(users) && users.length > 0 ? (
                            users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="border-b border-gray-300"
                                >
                                    <td className="px-4 py-2 text-center border border-gray-300">
                                        {user.id}
                                    </td>
                                    <td className="px-4 py-2 text-center border border-gray-300">
                                        {user.user}
                                    </td>
                                    <td className="px-4 py-2 text-center border border-gray-300">
                                        {user.name}
                                    </td>
                                    <td className="px-4 py-2 text-center border border-gray-300">
                                        {user.email}
                                    </td>
                                    <td className="px-4 py-2 text-center border border-gray-300">
                                        {getAdminStatus(user.isadmin)}
                                    </td>
                                    <td className="px-4 py-2 text-center border border-gray-300">
                                        {getCategoryName(user.categories)}
                                    </td>
                                    <td className="px-4 py-2 justify-center flex gap-2 border border-gray-300">
                                        <button
                                            onClick={() => handleEditUser(user)}
                                            className="bg-[#f8703c] text-white px-4 py-2 rounded-md"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDeleteUser(user.id)
                                            }
                                            className="bg-[#ff0000] text-white px-4 py-2 rounded-md"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="7"
                                    className="px-4 py-2 text-center text-gray-500 border border-gray-300"
                                >
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="sm:hidden">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className="border rounded-lg shadow-md p-4 mb-4 bg-white"
                                >
                                    <div className="flex justify-between">
                                        <strong>ID:</strong>{" "}
                                        <span>{user.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <strong>Username:</strong>{" "}
                                        <span>{user.user}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <strong>Name:</strong>{" "}
                                        <span>{user.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <strong>Email:</strong>{" "}
                                        <span>{user.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <strong>Admin Status:</strong>{" "}
                                        <span>{user.isadmin}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <strong>Category:</strong>{" "}
                                        <span>{user.categories}</span>
                                    </div>

                                    <div className="flex justify-center gap-4 mt-2">
                                    <button
                                            onClick={() => handleEditUser(user)}
                                            className="bg-[#f8703c] text-white px-4 py-2 rounded-md"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDeleteUser(user.id)
                                            }
                                            className="bg-[#ff0000] text-white px-4 py-2 rounded-md"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                </>
                {showAddUserModal && (
                    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
                            <h2 className="text-xl font-semibold mb-4 p-2 rounded-md">
                                Add New User
                            </h2>
                            <div className="mb-4">
                                <label
                                    htmlFor="user"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="user"
                                    placeholder="Username"
                                    value={newUser.user}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            user: e.target.value,
                                        })
                                    }
                                    className="border p-2 rounded-md w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    htmlFor="pass"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="pass"
                                    placeholder="Password"
                                    value={newUser.pass}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            pass: e.target.value,
                                        })
                                    }
                                    className="border p-2 rounded-md w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="Name"
                                    value={newUser.name}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            name: e.target.value,
                                        })
                                    }
                                    className="border p-2 rounded-md w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Email"
                                    value={newUser.email}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            email: e.target.value,
                                        })
                                    }
                                    className="border p-2 rounded-md w-full"
                                />
                            </div>
                            <div className="mb-4 hidden">
                                <label
                                    htmlFor="signature"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Signature
                                </label>
                                <input
                                    type="text"
                                    id="signature"
                                    placeholder="Signature"
                                    value={newUser.signature}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            signature: e.target.value,
                                        })
                                    }
                                    className="border p-2 rounded-md w-full"
                                />
                            </div>
                            <div className="mb-4 hidden">
                                <label
                                    htmlFor="categories"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Category
                                </label>
                                <select
                                    id="categories"
                                    value={newUser.categories}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            categories: e.target.value,
                                        })
                                    }
                                    className="border p-2 rounded-md w-full"
                                >
                                    <option value="1">
                                        Submit an Incident
                                    </option>
                                    <option value="2">Submit a Request</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label
                                    htmlFor="isadmin"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Admin Status
                                </label>
                                <select
                                    id="isadmin"
                                    value={newUser.isadmin}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            isadmin: e.target.value,
                                        })
                                    }
                                    className="border p-2 rounded-md w-full"
                                >
                                    <option value="0">Staff</option>
                                    <option value="1">Admin</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={handleAddUser}
                                    className="bg-[#f8703c] text-white px-4 py-2 rounded-md"
                                >
                                    Add User
                                </button>
                                <button
                                    onClick={() => setShowAddUserModal(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-md"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit User Modal */}
                {/* Edit User Modal */}
                {showEditUserModal && editingUser && (
                    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-md w-96">
                            <h2 className="text-xl font-semibold mb-4 p-2 rounded-md">
                                Edit User
                            </h2>
                            <div className="mb-4">
                                <label
                                    htmlFor="edit-user"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="edit-user"
                                    value={editingUser.user}
                                    onChange={(e) =>
                                        setEditingUser({
                                            ...editingUser,
                                            user: e.target.value,
                                        })
                                    }
                                    className="border p-2 rounded-md w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    htmlFor="edit-pass"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="edit-pass"
                                    value={editingUser.pass}
                                    onChange={(e) =>
                                        setEditingUser({
                                            ...editingUser,
                                            pass: e.target.value,
                                        })
                                    }
                                    className="border p-2 rounded-md w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    htmlFor="edit-name"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="edit-name"
                                    value={editingUser.name}
                                    onChange={(e) =>
                                        setEditingUser({
                                            ...editingUser,
                                            name: e.target.value,
                                        })
                                    }
                                    className="border p-2 rounded-md w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    htmlFor="edit-email"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="edit-email"
                                    value={editingUser.email}
                                    onChange={(e) =>
                                        setEditingUser({
                                            ...editingUser,
                                            email: e.target.value,
                                        })
                                    }
                                    className="border p-2 rounded-md w-full"
                                />
                            </div>
                            <div className="mb-4 hidden">
                                <label
                                    htmlFor="edit-signature"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Signature
                                </label>
                                <input
                                    type="text"
                                    id="edit-signature"
                                    value={editingUser.signature}
                                    onChange={(e) =>
                                        setEditingUser({
                                            ...editingUser,
                                            signature: e.target.value,
                                        })
                                    }
                                    className="border p-2 rounded-md w-full"
                                />
                            </div>
                            <div className="mb-4 hidden">
                                <label
                                    htmlFor="edit-categories"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Category
                                </label>
                                <select
                                    id="edit-categories"
                                    value={editingUser.categories}
                                    onChange={(e) =>
                                        setEditingUser({
                                            ...editingUser,
                                            categories: e.target.value,
                                        })
                                    }
                                    className="border p-2 rounded-md w-full"
                                >
                                    <option value="1">
                                        Submit an Incident
                                    </option>
                                    <option value="2">Submit a Request</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label
                                    htmlFor="edit-isadmin"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Admin Status
                                </label>
                                <select
                                    id="edit-isadmin"
                                    value={editingUser.isadmin}
                                    onChange={(e) =>
                                        setEditingUser({
                                            ...editingUser,
                                            isadmin: e.target.value,
                                        })
                                    }
                                    className="border p-2 rounded-md w-full"
                                >
                                    <option value="0">Staff</option>
                                    <option value="1">Admin</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={handleUpdateUser}
                                    className="bg-[#f8703c] text-white px-4 py-2 rounded-md"
                                >
                                    Update User
                                </button>
                                <button
                                    onClick={() => setShowEditUserModal(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-md"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
