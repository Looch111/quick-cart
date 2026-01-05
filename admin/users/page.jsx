'use client'
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Footer from "@/components/admin/Footer";
import Loading from "@/components/Loading";
import EditUserModal from "@/components/admin/EditUserModal";
import { useCollection } from "@/src/firebase";

const UserList = () => {

    const { data: users, loading: usersLoading } = useCollection('users');
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const handleEditClick = (user) => {
        setEditingUser(user);
    };

    const handleSaveUser = (updatedUser) => {
        setEditingUser(null);
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
    };

    const filteredUsers = (users || []).filter(user =>
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex-1 min-h-screen flex flex-col justify-between">
            {usersLoading ? <Loading /> : <div className="w-full md:p-10 p-4">
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

                {/* Mobile View: Cards */}
                <div className="md:hidden space-y-4">
                    {filteredUsers.length > 0 ? filteredUsers.map(user => (
                        <div key={user.id} className="bg-white border rounded-lg p-4 shadow-sm">
                            <div className="flex items-center gap-4">
                                <Image
                                    src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.email}`}
                                    alt="user Image"
                                    className="w-12 h-12 rounded-full"
                                    width={48}
                                    height={48}
                                />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800 truncate">{user.name || 'No Name'}</h3>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    <p className="text-xs font-medium text-gray-600 capitalize mt-1">Role: <span className="font-bold">{user.role}</span></p>
                                </div>
                            </div>
                             <div className="flex justify-end items-center gap-2 mt-3 pt-3 border-t">
                                <button onClick={() => handleEditClick(user)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs">
                                    Edit Role
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10 text-gray-500">No users found.</div>
                    )}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto rounded-md bg-white border border-gray-500/20">
                    <table className="min-w-full table-auto">
                        <thead className="text-gray-900 text-sm text-left bg-gray-500/10">
                            <tr>
                                <th className="px-4 py-3 font-medium">User</th>
                                <th className="px-4 py-3 font-medium">Email</th>
                                <th className="px-4 py-3 font-medium">Role</th>
                                <th className="px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-500">
                            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                <tr key={user.id} className="border-t border-gray-500/20">
                                    <td className="px-4 py-3 flex items-center space-x-3">
                                        <Image
                                            src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.email}`}
                                            alt="user Image"
                                            className="w-10 h-10 rounded-full"
                                            width={40}
                                            height={40}
                                        />
                                        <span className="font-medium text-gray-800">{user.name || user.email}</span>
                                    </td>
                                    <td className="px-4 py-3">{user.email}</td>
                                    <td className="px-4 py-3 capitalize">{user.role}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => handleEditClick(user)} className="px-3.5 py-2 bg-gray-100 text-gray-700 rounded-md text-xs">
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-gray-500">No users found.</td>
                                </tr>
                            )}
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
