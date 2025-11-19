import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, CheckCircle, Clock, AlertCircle, ArrowLeft, User, Calendar, FileText } from 'lucide-react';

const TicketDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchTicket();
    }, [id]);

    const fetchTicket = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/tickets');
            const found = res.data.data.find(t => t.id === parseInt(id));
            setTicket(found);
        } catch (error) {
            console.error('Error fetching ticket:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (actionType, payload = {}) => {
        if (!window.confirm(`Are you sure you want to ${actionType.replace('_', ' ')}?`)) return;

        setActionLoading(true);
        try {
            await axios.post(`http://localhost:3000/api/tickets/${id}/action`, {
                action_type: actionType,
                payload
            });
            alert('Action recorded!');
            fetchTicket();
        } catch (error) {
            console.error('Error performing action:', error);
            alert('Failed to perform action.');
        } finally {
            setActionLoading(false);
        }
    };

    const generateWALink = () => {
        if (!ticket) return '';
        const phone = ticket.requester_wa;
        const message = `Halo ${ticket.requester_name}, update untuk request "${ticket.title}": Status sekarang *${ticket.status}*. Mohon dicek ya.`;
        return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!ticket) return <div className="p-8 text-center text-slate-500">Ticket not found.</div>;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Done': return 'bg-green-100 text-green-800 border-green-200';
            case 'Review Required': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <button
                onClick={() => navigate('/')}
                className="mb-6 flex items-center text-slate-500 hover:text-indigo-600 transition-colors font-medium"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Board
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Ticket Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel p-8 rounded-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">{ticket.title}</h1>
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                                        <Calendar className="w-3 h-3" /> {new Date(ticket.created_at).toLocaleDateString()}
                                    </span>
                                    <span className="font-mono text-slate-400">#{ticket.id}</span>
                                </div>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(ticket.status)}`}>
                                {ticket.status}
                            </span>
                        </div>

                        <div className="prose prose-slate max-w-none">
                            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-3">
                                <FileText className="w-5 h-5 text-indigo-500" /> Description
                            </h3>
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-slate-700 whitespace-pre-wrap leading-relaxed">
                                {ticket.description}
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                                <User className="w-5 h-5 text-indigo-500" /> Requester Info
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                                    {ticket.requester_name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">{ticket.requester_name}</p>
                                    <p className="text-slate-500 text-sm">{ticket.requester_wa}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Actions */}
                <div className="space-y-6">
                    {/* Action Card */}
                    <div className="glass-panel p-6 rounded-2xl sticky top-24">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Actions</h3>

                        <div className="space-y-6">
                            {/* Designer Actions */}
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Designer Controls</p>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => handleAction('START_WORK')}
                                        disabled={actionLoading || ticket.status === 'In Progress'}
                                        className="w-full btn-primary bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Clock className="mr-2 h-4 w-4" /> Start Work
                                    </button>
                                    <button
                                        onClick={() => handleAction('REQUEST_REVIEW')}
                                        disabled={actionLoading || ticket.status === 'Review Required'}
                                        className="w-full btn-primary bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <AlertCircle className="mr-2 h-4 w-4" /> Request Review
                                    </button>
                                </div>
                            </div>

                            {/* Requester Actions */}
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Requester Controls</p>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => {
                                            const notes = prompt("What needs revision?");
                                            if (notes) handleAction('REQUEST_REVISION', { notes });
                                        }}
                                        disabled={actionLoading}
                                        className="w-full btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Request Revision
                                    </button>
                                    <button
                                        onClick={() => handleAction('APPROVE')}
                                        disabled={actionLoading || ticket.status === 'Done'}
                                        className="w-full btn-primary bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" /> Approve & Done
                                    </button>
                                </div>
                            </div>

                            {/* WA Notification */}
                            <div className="pt-6 border-t border-slate-200">
                                <a
                                    href={generateWALink()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full btn-primary bg-green-500 hover:bg-green-600 shadow-green-200"
                                >
                                    <MessageCircle className="mr-2 h-4 w-4" />
                                    Chat on WhatsApp
                                </a>
                                <p className="mt-3 text-xs text-center text-slate-400">
                                    Opens WhatsApp with pre-filled status update.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetail;
