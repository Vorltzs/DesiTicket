import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Plus, Clock, AlertCircle, CheckCircle, MoreHorizontal } from 'lucide-react';

const Dashboard = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/tickets');
            setTickets(res.data.data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { id: 'Pending', title: 'Pending', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { id: 'In Progress', title: 'In Progress', icon: MoreHorizontal, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'Review Required', title: 'Review', icon: AlertCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
        { id: 'Done', title: 'Done', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Design Board</h2>
                    <p className="text-slate-500 mt-1">Manage and track all design requests.</p>
                </div>
                <Link to="/request" className="btn-primary">
                    <Plus className="w-5 h-5 mr-2" />
                    New Request
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {columns.map((col) => (
                    <div key={col.id} className="flex flex-col h-full">
                        <div className={`flex items-center justify-between p-3 rounded-t-xl ${col.bg} border-b border-slate-200`}>
                            <div className="flex items-center gap-2">
                                <col.icon className={`w-5 h-5 ${col.color}`} />
                                <h3 className={`font-semibold ${col.color}`}>{col.title}</h3>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-white text-xs font-bold text-slate-600 shadow-sm">
                                {tickets.filter(t => t.status === col.id).length}
                            </span>
                        </div>

                        <div className="bg-slate-100/50 p-3 rounded-b-xl min-h-[500px] space-y-3 border border-t-0 border-slate-200">
                            {tickets.filter(t => t.status === col.id).map((ticket) => (
                                <Link to={`/tickets/${ticket.id}`} key={ticket.id} className="block group">
                                    <div className="glass-panel p-4 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-l-4 border-l-transparent hover:border-l-indigo-500">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-mono text-slate-400">#{ticket.id}</span>
                                            <span className="text-xs text-slate-400">{new Date(ticket.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <h4 className="font-semibold text-slate-800 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                            {ticket.title}
                                        </h4>
                                        <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                                            {ticket.description}
                                        </p>
                                        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-slate-100">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold">
                                                {ticket.requester_name.charAt(0)}
                                            </div>
                                            <span className="text-xs text-slate-600 truncate max-w-[100px]">
                                                {ticket.requester_name}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {tickets.filter(t => t.status === col.id).length === 0 && (
                                <div className="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                                    No tickets
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
