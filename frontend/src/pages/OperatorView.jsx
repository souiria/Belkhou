import React, { useState, useEffect } from 'react';

function OperatorView() {
    const [dropdowns, setDropdowns] = useState([]);
    const [formData, setFormData] = useState({
        project: '', line: '', station: '', problem: '',
        problem_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetch('http://localhost:5000/api/dropdowns')
            .then(res => res.json())
            .then(data => setDropdowns(data))
            .catch(err => console.error(err));
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/issues', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                alert("Issue Logged Successfully!");
                // Reset form to default
                setFormData({
                    project: '', line: '', station: '', problem: '',
                    problem_date: new Date().toISOString().split('T')[0]
                });
            }
        } catch (error) { console.error(error); }
    };

    const getOptions = (category) => dropdowns.filter(d => d.category === category).map(d => d.value);

    const inputClass = "mt-1 block w-full rounded-md bg-white border-2 border-blue-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-base p-2.5 text-gray-900";
    const labelClass = "block text-sm font-bold text-blue-900";

    return (
        <div className="max-w-lg mx-auto bg-blue-50 p-8 rounded-xl shadow-xl border border-blue-200">
            <h2 className="text-2xl font-extrabold text-blue-900 mb-6 border-b-2 pb-2 border-blue-200">Log Production Issue</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Project:</label>
                        <select name="project" value={formData.project} onChange={handleChange} required className={inputClass}>
                            <option value="">Select</option>
                            {getOptions('Project').map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Line:</label>
                        <select name="line" value={formData.line} onChange={handleChange} required className={inputClass}>
                            <option value="">Select</option>
                            {getOptions('Line').map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Station:</label>
                    <select name="station" value={formData.station} onChange={handleChange} required className={inputClass}>
                        <option value="">Select Station</option>
                        {getOptions('Station').map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                </div>

                <div>
                    <label className={labelClass}>Problem:</label>
                    <textarea name="problem" value={formData.problem} onChange={handleChange} required rows="3" className={inputClass} />
                </div>

                <div>
                    <label className={labelClass}>Problem Date:</label>
                    <input type="date" name="problem_date" value={formData.problem_date} onChange={handleChange} required className={inputClass} />
                </div>

                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-md text-base font-bold text-white bg-blue-600 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-6 transition-colors">
                    Submit to Maintenance
                </button>
            </form>
        </div>
    );
}

export default OperatorView;