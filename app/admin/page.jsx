'use client'
import React, { useEffect, useState } from "react";
import { userDummyData } from "@/assets/assets";
import Image from "next/image";
import Footer from "@/components/admin/Footer";
import Loading from "@/components/Loading";
import EditUserModal from "@/components/admin/EditUserModal";

const UserList = () => {

    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingUser, setEditingUser] = useState(null);

    const fetchUsers = async () => {
        // In a real app, you would fetch all users from your backend
        const allUsers = [
            userDummyData,
            { ...userDummyData, _id: 'user_2', name: 'Jane Doe', email: 'jane@example.com', role: 'buyer' },
            { ...userDummyData, _id: 'user_3', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
        ]
        setUsers(allUsers)
        setLoading(false)
    }

    useEffect(() => {
        fetchUsers();
    }, [])

    const handleEditClick = (user) => {
        setEditingUser(user);
    };

    const handleSaveUser = (updatedUser) => {
        // In a real app, you would send this to your backend
        setUsers(users.map(u => (u._id === updatedUser._id ? updatedUser : u)));
        setEditingUser(null);
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
    };

    return (
        <div className="flex-1 min-h-screen flex flex-col justify-between">
            {loading ? <Loading /> : <div className="w-full md:p-10 p-4">
                <h2 className="pb-4 text-lg font-medium">All Users</h2>
                <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
                    <table className=" table-fixed w-full overflow-hidden">
                        <thead className="text-gray-900 text-sm text-left">
                            <tr>
                                <th className="w-2/5 px-4 py-3 font-medium truncate">User</th>
                                <th className="px-4 py-3 font-medium truncate max-sm:hidden">Email</th>
                                <th className="px-4 py-3 font-medium truncate">Role</th>
                                <th className="px-4 py-3 font-medium truncate max-sm:hidden">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-500">
                            {users.map((user, index) => (
                                <tr key={index} className="border-t border-gray-500/20">
                                    <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                                        <Image
                                            src={user.imageUrl}
                                            alt="user Image"
                                            className="w-10 h-10 rounded-full"
                                            width={40}
                                            height={40}
                                        />
                                        <span className="truncate w-full">
                                            {user.name}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 max-sm:hidden">{user.email}</td>
                                    <td className="px-4 py-3 capitalize">{user.role}</td>
                                    <td className="px-4 py-3 max-sm:hidden">
                                        <button onClick={() => handleEditClick(user)} className="px-3.5 py-2 bg-gray-100 text-gray-700 rounded-md text-xs">
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>}
            <Footer />
            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onSave={handleSaveUser}
                    onCancel={handleCancelEdit}
                />
            )}
        </div>
    );
};

export default UserList;
