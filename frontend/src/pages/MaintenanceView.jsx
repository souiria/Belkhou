import React, { useState, useEffect } from 'react';

function MaintenanceView() {
    const [issues, setIssues] = useState([]);
    
    // Filtering and Pagination States
    const [searchTerm, setSearchTerm] = useState('');
    const [showCompleted, setShowCompleted] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => { fetchIssues(); }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, showCompleted]);

    const fetchIssues = () => {
        fetch('http://localhost:5000/api/dropdowns') // Fetch dropdowns to get emails later
            .then(res => res.json())
            .then(dropdowns => {
                window.emailList = dropdowns.filter(d => d.category === 'Email').map(d => d.value).join(';');
            });

        fetch('http://localhost:5000/api/issues')
            .then(res => res.json())
            .then(data => setIssues(data))
            .catch(err => console.error(err));
    };

    const handleUpdate = async (id, issue) => {
        try {
            await fetch(`http://localhost:5000/api/issues/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: issue.action, responsible: issue.responsible,
                    team_leader: issue.team_leader, due_date: issue.due_date,
                    actual_closure_date: issue.actual_closure_date, status: issue.status,
                    sers_num: issue.sers_num, comments: issue.comments
                })
            });
            fetchIssues(); 
        } catch (error) { console.error(error); }
    };

    // --- 1. EXPORT TO EXCEL (CSV) LOGIC ---
    const exportToExcel = () => {
        const headers = ["ID", "Project", "Line", "Station", "Problem", "Problem Date", "Action", "Responsible", "Team Leader", "Due Date", "Closure Date", "Status", "SERS Num", "Comments"];
        
        // Use filtered issues so they only export what they are currently looking at
        const csvRows = [headers.join(",")];
        
        filteredIssues.forEach(issue => {
            const row = [
                issue.id,
                `"${issue.project}"`,
                `"${issue.line}"`,
                `"${issue.station}"`,
                `"${issue.problem}"`,
                issue.problem_date,
                `"${issue.action || ''}"`,
                `"${issue.responsible || ''}"`,
                `"${issue.team_leader || ''}"`,
                issue.due_date || '',
                issue.actual_closure_date || '',
                issue.status,
                `"${issue.sers_num || ''}"`,
                `"${issue.comments || ''}"`
            ];
            csvRows.push(row.join(","));
        });

        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Maintenance_Tracker_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- 2. LOCAL OUTLOOK EMAIL LOGIC ---
    const handleOpenOutlook = () => {
        let bodyText = "Hello,\n\nPlease find below the list of currently open maintenance issues:\n\n";
        
        const openIssues = issues.filter(i => i.status !== '100%');
        
        if (openIssues.length === 0) {
            alert("There are no open issues to email!");
            return;
        }

        // Format as clean plain text since browsers block HTML in mailto links
        openIssues.forEach(issue => {
            bodyText += `• ID #${issue.id} [${issue.project} - ${issue.station}]\n`;
            bodyText += `  Problem: ${issue.problem}\n`;
            bodyText += `  Due: ${issue.due_date || 'Not set'} | Resp: ${issue.responsible || 'Unassigned'} | Status: ${issue.status}\n\n`;
        });
        
        bodyText += "Regards,\nMaintenance Tracker";

        const subject = "Summary of Open Maintenance Issues";
        const emails = window.emailList || "";

        // Trigger local default mail client (Outlook)
        const mailtoLink = `mailto:${emails}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
        window.location.href = mailtoLink;
    };

    const getRowColorClass = (dueDate, status) => {
        if (status === '100%') return 'bg-green-100 hover:bg-green-200';
        if (!dueDate) return 'bg-white hover:bg-gray-50';
        
        const due = new Date(dueDate);
        const today = new Date();
        const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

        if (diffDays > 0 && diffDays < 4) return 'bg-orange-100 hover:bg-orange-200';
        if (diffDays <= 0) return 'bg-red-100 hover:bg-red-200 text-red-900';
        return 'bg-white hover:bg-gray-50';
    };

    const filteredIssues = issues.filter(issue => {
        if (!showCompleted && issue.status === '100%') return false;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (
                (issue.project?.toLowerCase().includes(term)) ||
                (issue.line?.toLowerCase().includes(term)) ||
                (issue.station?.toLowerCase().includes(term)) ||
                (issue.problem?.toLowerCase().includes(term)) ||
                (issue.responsible?.toLowerCase().includes(term)) ||
                (issue.id?.toString().includes(term))
            );
        }
        return true;
    });

    const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredIssues.slice(indexOfFirstItem, indexOfLastItem);

    const thClass = "px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100 border-b border-gray-300";
    const tdClass = "px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-b border-gray-200";

    return (
        <div className="bg-white shadow-xl rounded-lg border border-gray-200">
            {/* Header Section */}
            <div className="px-6 py-5 border-b border-gray-200 bg-white rounded-t-lg flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-bold text-gray-800">Maintenance Action Tracker</h2>
                
                <div className="flex space-x-3">
                    <button 
                        onClick={exportToExcel} 
                        className="font-bold py-2 px-4 rounded shadow text-sm transition-colors bg-green-600 hover:bg-green-700 text-white"
                    >
                        📊 Export to Excel
                    </button>
                    <button 
                        onClick={handleOpenOutlook} 
                        className="font-bold py-2 px-4 rounded shadow text-sm transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        ✉️ Open in Outlook
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-1/3">
                    <input 
                        type="text" 
                        placeholder="Search by Project, Line, Problem, ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    />
                </div>
                
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input 
                        type="checkbox" 
                        checked={showCompleted}
                        onChange={(e) => setShowCompleted(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="font-bold text-gray-700">Show Completed Actions (100%)</span>
                </label>
            </div>
            
            {/* Table Section */}
            <div className="overflow-x-auto w-full">
                <table className="min-w-max w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className={thClass}>ID / Info</th>
                            <th className={thClass}>Action</th>
                            <th className={thClass}>Responsible</th>
                            <th className={thClass}>Team Leader</th>
                            <th className={thClass}>Due Date</th>
                            <th className={thClass}>Closure Date</th>
                            <th className={thClass}>Status</th>
                            <th className={thClass}>SERS Num</th>
                            <th className={thClass}>Comments</th>
                            <th className={thClass}>Save</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {currentItems.length === 0 ? (
                            <tr><td colSpan="10" className="px-6 py-8 text-center text-gray-500 font-bold">No issues found matching your filters.</td></tr>
                        ) : (
                            currentItems.map(issue => (
                                <tr key={issue.id} className={`transition-colors ${getRowColorClass(issue.due_date, issue.status)}`}>
                                    <td className={tdClass}>
                                        <div className="font-bold">#{issue.id} - {issue.project}</div>
                                        <div className="text-xs text-gray-500">{issue.station}</div>
                                        <div className="text-xs text-red-600 truncate max-w-[150px]" title={issue.problem}>{issue.problem}</div>
                                    </td>
                                    <td className={tdClass}>
                                        <input type="text" defaultValue={issue.action} onBlur={(e) => issue.action = e.target.value} className="table-input w-32" />
                                    </td>
                                    <td className={tdClass}>
                                        <input type="text" defaultValue={issue.responsible} onBlur={(e) => issue.responsible = e.target.value} className="table-input w-24" />
                                    </td>
                                    <td className={tdClass}>
                                        <input type="text" defaultValue={issue.team_leader} onBlur={(e) => issue.team_leader = e.target.value} className="table-input w-24" />
                                    </td>
                                    <td className={tdClass}>
                                        <input type="date" defaultValue={issue.due_date} onBlur={(e) => issue.due_date = e.target.value} className="table-input w-36" />
                                    </td>
                                    <td className={tdClass}>
                                        <input type="date" defaultValue={issue.actual_closure_date} onBlur={(e) => issue.actual_closure_date = e.target.value} className="table-input w-36" />
                                    </td>
                                    <td className={tdClass}>
                                        <select defaultValue={issue.status} onBlur={(e) => issue.status = e.target.value} className="table-input font-bold w-20">
                                            <option value="0%">0%</option>
                                            <option value="50%">50%</option>
                                            <option value="100%">100%</option>
                                        </select>
                                    </td>
                                    <td className={tdClass}>
                                        <input type="text" defaultValue={issue.sers_num} onBlur={(e) => issue.sers_num = e.target.value} className="table-input w-24" />
                                    </td>
                                    <td className={tdClass}>
                                        <input type="text" defaultValue={issue.comments} onBlur={(e) => issue.comments = e.target.value} className="table-input w-32" />
                                    </td>
                                    <td className={tdClass}>
                                        <button onClick={() => handleUpdate(issue.id, issue)} 
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded shadow">
                                            Save
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="px-6 py-4 bg-white border-t border-gray-200 flex justify-between items-center rounded-b-lg">
                    <span className="text-sm text-gray-700 font-bold">
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredIssues.length)} of {filteredIssues.length} entries
                    </span>
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded font-bold text-sm ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-sm font-bold text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 rounded font-bold text-sm ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MaintenanceView;