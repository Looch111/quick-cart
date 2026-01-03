'use client'
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Footer from "@/components/admin/Footer";
import Loading from "@/components/Loading";
import EditUserModal from "@/components/admin/EditUserModal";
import { useCollection } from "@/src/firebase";

const UserList = () => {

    const { data: usersData, loading: usersLoading } = useCollection('users');
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (!usersLoading) {
            setUsers(usersData || []);
            setLoading(false);
        }
    }, [usersData, usersLoading]);


    const handleEditClick = (user) => {
        setEditingUser(user);
    };

    const handleSaveUser = (updatedUser) => {
        // This will be handled by AppContext now
        setEditingUser(null);
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
    };

    const filteredUsers = users.filter(user =>
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex-1 min-h-screen flex flex-col justify-between">
            {loading ? <Loading /> : <div className="w-full md:p-10 p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium">All Users</h2>
                    <div className="relative max-w-xs w-full">
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full pl-4 pr-10 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Image
                            src={assets.search_icon}
                            alt="search icon"
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        />
                    </div>
                </div>
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
                            {filteredUsers.map((user, index) => (
                                <tr key={index} className="border-t border-gray-500/20">
                                    <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                                        <Image
                                            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
                                            alt="user Image"
                                            className="w-10 h-10 rounded-full"
                                            width={40}
                                            height={40}
                                        />
                                        <span className="truncate w-full">
                                            {user.name || user.email}
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
