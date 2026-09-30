import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ setUser }) {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Save user to local storage so they stay logged in after a refresh
                localStorage.setItem('authUser', JSON.stringify(data));
                setUser(data);
                
                // Route them to the correct page based on their role
                if (data.role === 'Admin') navigate('/admin');
                else navigate('/maintenance');
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Cannot connect to server.");
        }
    };

    const inputClass = "mt-1 block w-full rounded-md bg-white border-2 border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-base p-2.5 text-gray-900";

    return (
        <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-xl shadow-xl border border-gray-200">
            <h2 className="text-2xl font-extrabold text-slate-800 mb-6 text-center">System Login</h2>
            
            {error && <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4 text-sm font-bold text-center">{error}</div>}

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700">Username</label>
                    <input type="text" name="username" onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700">Password</label>
                    <input type="password" name="password" onChange={handleChange} required className={inputClass} />
                </div>
                <button type="submit" className="w-full py-3 px-4 rounded-md shadow-md text-base font-bold text-white bg-blue-600 hover:bg-blue-800 mt-6 transition-colors">
                    Sign In
                </button>
            </form>
        </div>
    );
}

export default Login;