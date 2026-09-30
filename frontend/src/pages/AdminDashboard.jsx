import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function AdminDashboard() {
    const [stats, setStats] = useState([]);
    const [users, setUsers] = useState([]);
    const [dropdowns, setDropdowns] = useState([]);
    
    // --- NEW: States for Auto-Email ---
    const [autoSettings, setAutoSettings] = useState({ email_day: '5', email_time: '16:00' });
    const [emailLogs, setEmailLogs] = useState([]);
    const [scheduleMessage, setScheduleMessage] = useState('');

    // States for user forms
    const [userForm, setUserForm] = useState({ username: '', password: '', role: 'Maintenance' });
    const [editingUserId, setEditingUserId] = useState(null);
    const [message, setMessage] = useState('');
    
    // State for the new dropdown inputs
    const [newListItem, setNewListItem] = useState({ Project: '', Line: '', Station: '', Email: '' });

    useEffect(() => {
        fetchStats();
        fetchUsers();
        fetchDropdowns();
        fetchAutomationData(); // Fetch the schedule on load
    }, []);

    const fetchStats = () => fetch('http://localhost:5000/api/stats').then(res => res.json()).then(setStats);
    const fetchUsers = () => fetch('http://localhost:5000/api/users').then(res => res.json()).then(setUsers);
    const fetchDropdowns = () => fetch('http://localhost:5000/api/dropdowns').then(res => res.json()).then(setDropdowns);
    
    // --- NEW: Fetch Email Automation Settings & Logs ---
    const fetchAutomationData = () => {
        fetch('http://localhost:5000/api/automation')
            .then(res => res.json())
            .then(data => {
                if(data.settings) {
                    const day = data.settings.find(s => s.key === 'email_day')?.value || '5';
                    const time = data.settings.find(s => s.key === 'email_time')?.value || '16:00';
                    setAutoSettings({ email_day: day, email_time: time });
                }
                if(data.logs) setEmailLogs(data.logs);
            })
            .catch(err => console.error(err));
    };

    // --- NEW: Save Email Schedule ---
    const handleSaveSchedule = async (e) => {
        e.preventDefault();
        try {
            await fetch('http://localhost:5000/api/automation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(autoSettings)
            });
            setScheduleMessage("Schedule saved successfully! Server is now waiting.");
            fetchAutomationData(); // Refresh logs
            setTimeout(() => setScheduleMessage(''), 4000);
        } catch (err) { 
            setScheduleMessage("Error saving schedule."); 
        }
    };

    /* --- USER MANAGEMENT LOGIC --- */
    const handleUserChange = (e) => setUserForm({ ...userForm, [e.target.name]: e.target.value });

    const handleEditClick = (user) => {
        setEditingUserId(user.id);
        setUserForm({ username: user.username, password: '', role: user.role });
        setMessage('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingUserId(null);
        setUserForm({ username: '', password: '', role: 'Maintenance' });
        setMessage('');
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        const url = editingUserId ? `http://localhost:5000/api/users/${editingUserId}` : 'http://localhost:5000/api/users';
        const method = editingUserId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userForm)
            });
            const result = await response.json();
            
            if (response.ok) {
                setMessage(editingUserId ? "User updated successfully!" : "User created successfully!");
                handleCancelEdit();
                fetchUsers();
            } else {
                setMessage(result.error || "Failed to save user.");
            }
        } catch (error) { setMessage("Server connection error."); }
    };

    /* --- DROPDOWN MANAGEMENT LOGIC --- */
    const handleAddListItem = async (category) => {
        const value = newListItem[category];
        if (!value.trim()) return;

        try {
            const response = await fetch('http://localhost:5000/api/dropdowns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, value })
            });
            if (response.ok) {
                setNewListItem({ ...newListItem, [category]: '' });
                fetchDropdowns();
            }
        } catch (error) { console.error("Error adding item", error); }
    };

    const handleDeleteListItem = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            const response = await fetch(`http://localhost:5000/api/dropdowns/${id}`, { method: 'DELETE' });
            if (response.ok) fetchDropdowns();
        } catch (error) { console.error("Error deleting item", error); }
    };

    const COLORS = { '0%': '#ef4444', '50%': '#f59e0b', '100%': '#10b981' };
    const inputClass = "mt-1 block w-full rounded-md bg-white border-2 border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-sm p-2 text-gray-900";
    const labelClass = "block text-sm font-bold text-gray-700";

    const renderConfigCard = (title, category) => {
        const items = dropdowns.filter(d => d.category === category);
        return (
            <div className="bg-white p-4 rounded-xl shadow border border-gray-200 flex flex-col h-full">
                <h3 className="font-bold text-slate-800 border-b pb-2 mb-3">{title}</h3>
                <div className="flex-grow overflow-y-auto max-h-48 space-y-2 mb-4">
                    {items.length === 0 ? <p className="text-xs text-gray-400 italic">No items found.</p> : null}
                    {items.map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100 text-sm">
                            <span className="truncate pr-2" title={item.value}>{item.value}</span>
                            <button onClick={() => handleDeleteListItem(item.id)} className="text-red-500 hover:text-red-700 font-bold px-2">X</button>
                        </div>
                    ))}
                </div>
                <div className="mt-auto flex space-x-2">
                    <input 
                        type="text" 
                        value={newListItem[category]} 
                        onChange={(e) => setNewListItem({...newListItem, [category]: e.target.value})}
                        placeholder={`New ${category}...`}
                        className="flex-grow rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-1.5"
                    />
                    <button onClick={() => handleAddListItem(category)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded text-sm transition-colors">
                        Add
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            
            {/* TOP ROW: Automation and Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* --- NEW: Email Automation Settings --- */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col">
                    <h2 className="text-xl font-extrabold text-gray-800 mb-6 border-b-2 pb-2 border-gray-100">Automated Weekly Report</h2>
                    
                    <form onSubmit={handleSaveSchedule} className="space-y-4 mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-inner">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Send Day:</label>
                                <select value={autoSettings.email_day} onChange={e => setAutoSettings({...autoSettings, email_day: e.target.value})} className={inputClass}>
                                    <option value="1">Monday</option>
                                    <option value="2">Tuesday</option>
                                    <option value="3">Wednesday</option>
                                    <option value="4">Thursday</option>
                                    <option value="5">Friday</option>
                                    <option value="6">Saturday</option>
                                    <option value="0">Sunday</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Send Time:</label>
                                <input type="time" value={autoSettings.email_time} onChange={e => setAutoSettings({...autoSettings, email_time: e.target.value})} required className={inputClass} />
                            </div>
                        </div>
                        <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-800 transition-colors">
                            Save Schedule
                        </button>
                        {scheduleMessage && <p className="text-xs font-bold text-green-700 mt-2 text-center">{scheduleMessage}</p>}
                    </form>

                    <h3 className="font-bold text-slate-800 border-b pb-2 mb-3">Email Delivery Log</h3>
                    <div className="flex-grow overflow-y-auto max-h-48 border border-gray-200 rounded-md">
                        <table className="min-w-full text-xs">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2 text-left text-gray-600 font-bold uppercase">Time</th>
                                    <th className="p-2 text-left text-gray-600 font-bold uppercase">Type</th>
                                    <th className="p-2 text-left text-gray-600 font-bold uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {emailLogs.length === 0 ? (
                                    <tr><td colSpan="3" className="p-4 text-center text-gray-400 font-bold">No emails sent yet.</td></tr>
                                ) : (
                                    emailLogs.map(log => (
                                        <tr key={log.id} className="border-b hover:bg-gray-50 transition-colors" title={log.details}>
                                            <td className="p-2 text-gray-800 font-medium">{new Date(log.sent_at).toLocaleString()}</td>
                                            <td className="p-2 text-gray-600">{log.type}</td>
                                            <td className={`p-2 font-bold ${log.status === 'Success' ? 'text-green-600' : log.status === 'Skipped' ? 'text-blue-500' : 'text-red-600'}`}>
                                                {log.status}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT COLUMN: Data Dashboard */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-xl font-extrabold text-gray-800 mb-6 border-b-2 pb-2 border-gray-100">Issue Status Overview</h2>
                    {stats.length > 0 ? (
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={stats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                                        {stats.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#cbd5e1'} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex h-64 items-center justify-center text-gray-500 font-bold">No issue data available to graph.</div>
                    )}
                </div>
            </div>

            {/* MIDDLE ROW: System Configuration (Dropdowns & Emails) */}
            <div className="bg-white shadow-xl rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-extrabold text-gray-800 mb-6 border-b-2 pb-2 border-gray-100">System Configuration (Dropdowns)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {renderConfigCard('Projects', 'Project')}
                    {renderConfigCard('Production Lines', 'Line')}
                    {renderConfigCard('Stations', 'Station')}
                    {renderConfigCard('Email Recipients', 'Email')}
                </div>
            </div>

            {/* BOTTOM ROW: Users & Create User Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Create/Edit User Form */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 col-span-1 h-fit">
                    <h2 className="text-xl font-extrabold text-gray-800 mb-6 border-b-2 pb-2 border-gray-100">
                        {editingUserId ? "Edit User Account" : "Create System User"}
                    </h2>
                    
                    {message && (
                        <div className={`p-3 mb-4 text-sm font-bold rounded-md text-center ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSaveUser} className="space-y-4">
                        <div>
                            <label className={labelClass}>Username:</label>
                            <input type="text" name="username" value={userForm.username} onChange={handleUserChange} required className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>
                                {editingUserId ? "New Password (leave blank to keep current):" : "Password:"}
                            </label>
                            <input type="password" name="password" value={userForm.password} onChange={handleUserChange} required={!editingUserId} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Role:</label>
                            <select name="role" value={userForm.role} onChange={handleUserChange} className={inputClass}>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                        
                        <div className="flex flex-col space-y-2 mt-4">
                            <button type="submit" className="w-full py-2 px-4 rounded-md shadow-sm text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 transition-colors">
                                {editingUserId ? "Save Changes" : "Create Account"}
                            </button>
                            {editingUserId && (
                                <button type="button" onClick={handleCancelEdit} className="w-full py-2 px-4 rounded-md shadow-sm text-sm font-bold text-slate-800 bg-gray-200 hover:bg-gray-300 transition-colors">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Users List Table */}
                <div className="bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden col-span-2">
                    <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-800">Manage Users</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Username</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">#{u.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold text-blue-600">{u.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button onClick={() => handleEditClick(u)} className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded font-bold text-xs">
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default AdminDashboard;