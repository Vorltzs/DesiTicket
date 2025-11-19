import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, CheckCircle, Clock, AlertCircle } from 'lucide-react';

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
            // In a real app, we'd have a specific endpoint for getting one ticket
            // For now, we filter from the list (inefficient but works for prototype)
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
            fetchTicket(); // Refresh data
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

    if (loading) return <div className="p-8">Loading...</div>;
    if (!ticket) return <div className="p-8">Ticket not found.</div>;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <button onClick={() => navigate('/')} className="mb-4 text-indigo-600 hover:text-indigo-800">
                &larr; Back to Dashboard
            </button>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Ticket #{ticket.id}</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">{ticket.title}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold 
            ${ticket.status === 'Done' ? 'bg-green-100 text-green-800' :
                            ticket.status === 'Review Required' ? 'bg-purple-100 text-purple-800' :
                                'bg-blue-100 text-blue-800'}`}>
                        {ticket.status}
                    </span>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Requester</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{ticket.requester_name} ({ticket.requester_wa})</dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Description</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-wrap">{ticket.description}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* Action Area */}
            <div className="bg-white shadow sm:rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Actions</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Designer Actions */}
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Designer Controls</p>
                        <button
                            onClick={() => handleAction('START_WORK')}
                            disabled={actionLoading || ticket.status === 'In Progress'}
                            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Clock className="mr-2 h-4 w-4" /> Start Work
                        </button>
                        <button
                            onClick={() => handleAction('REQUEST_REVIEW')}
                            disabled={actionLoading || ticket.status === 'Review Required'}
                            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                        >
                            <AlertCircle className="mr-2 h-4 w-4" /> Request Review
                        </button>
                    </div>

                    {/* Requester Actions (Simulated) */}
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Requester Controls</p>
                        <button
                            onClick={() => {
                                const notes = prompt("What needs revision?");
                                if (notes) handleAction('REQUEST_REVISION', { notes });
                            }}
                            disabled={actionLoading}
                            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Request Revision
                        </button>
                        <button
                            onClick={() => handleAction('APPROVE')}
                            disabled={actionLoading || ticket.status === 'Done'}
                            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        >
                            <CheckCircle className="mr-2 h-4 w-4" /> Approve & Done
                        </button>
                    </div>
                </div>

                {/* WA Notification */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Communication Helper</h4>
                    <a
                        href={generateWALink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600"
                    >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Chat Requester on WhatsApp
                    </a>
                    <p className="mt-2 text-sm text-gray-500">
                        Clicking this will open WhatsApp with a pre-filled status update message.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TicketDetail;
