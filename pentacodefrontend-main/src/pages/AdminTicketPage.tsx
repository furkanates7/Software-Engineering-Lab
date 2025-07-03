import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SkeletonLoader } from '../components/restaurants/SkeletonLoader';
import { useLocation } from 'react-router-dom';

interface Text {
  text: string;
  index: number;
}

interface User {
  name: string;
  restaurant: number;
  courier: number;
  customer: number;
}

interface TicketDTO {
  subject: string;
  ticketRequests: Text[];
  ticketResponses: Text[];
  resolved: boolean;
  pk: number;
  user: User;
}

const AdminTicketPage: React.FC = () => {
  const [tickets, setTickets] = useState<TicketDTO[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketDTO | null>(null);
  const [newResponse, setNewResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const location = useLocation();

  // Determine module based on user fields
  const getModule = (user: User): string => {
    if (user.restaurant) return 'restaurant';
    if (user.courier) return 'courier';
    if (user.customer) return 'customer';
    return 'unknown';
  };

  // Fetch all tickets based on URL query parameter
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        // Extract 'type' from URL query (e.g., ?type=customer)
        const queryParams = new URLSearchParams(location.search);
        const type = queryParams.get('type');

        // Map 'type' to 'role' parameter; omit if no type
        const params = type ? { role: type } : {};

        const response = await axios.get('http://localhost:8080/api/auth/get-all-tickets', {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        const fetchedTickets = Array.isArray(response.data.data) ? response.data.data : [];
        setTickets(fetchedTickets);
      } catch (err: any) {
        console.error('Error fetching tickets:', err);
        setError(err.response?.data || 'Failed to load tickets.');
        toast.error(err.response?.data || 'Failed to load tickets.');
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchTickets();
    } else {
      setError('Please log in to view tickets.');
      toast.error('Please log in to view tickets.');
      setLoading(false);
    }
  }, [token, location.search]);

  // Fetch ticket chat when a ticket is selected
  useEffect(() => {
    if (selectedTicket?.pk) {
      const fetchTicketChat = async () => {
        try {
          const response = await axios.get(`http://localhost:8080/api/auth/get-ticket-chat/${selectedTicket.pk}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSelectedTicket(response.data);
        } catch (err: any) {
          console.error('Error fetching ticket chat:', err);
          setError(err.response?.data || 'Failed to load ticket chat.');
          toast.error(err.response?.data || 'Failed to load ticket chat.');
        }
      };
      fetchTicketChat();
    }
  }, [selectedTicket?.pk, token]);

  // Send a new response
  const handleSendResponse = async () => {
    if (!selectedTicket || !newResponse.trim()) {
      setError('Please select a ticket and enter a response.');
      toast.error('Please select a ticket and enter a response.');
      return;
    }
    if (selectedTicket.resolved) {
      setError('Cannot send response to a resolved ticket.');
      toast.error('Cannot send response to a resolved ticket.');
      return;
    }
    try {
      await axios.post(
        'http://localhost:8080/api/auth/write-response',
        {
          pk: selectedTicket.pk,
          ticketResponses: [{ text: newResponse, index: 0 }], // Index set to 0; backend assigns actual index
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewResponse('');
      // Refresh ticket chat
      const response = await axios.get(`http://localhost:8080/api/auth/get-ticket-chat/${selectedTicket.pk}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedTicket(response.data);
      toast.success('Response sent successfully.');
    } catch (err: any) {
      console.error('Error sending response:', err);
      setError(err.response?.data || 'Failed to send response.');
      toast.error(err.response?.data || 'Failed to send response.');
    }
  };

  // Resolve a ticket
  const handleResolveTicket = async () => {
    if (!selectedTicket) {
      setError('Please select a ticket.');
      toast.error('Please select a ticket.');
      return;
    }
    try {
      await axios.post(
        `http://localhost:8080/api/auth/resolve-ticket/${selectedTicket.pk}`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Refresh ticket chat
      const response = await axios.get(`http://localhost:8080/api/auth/get-ticket-chat/${selectedTicket.pk}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedTicket(response.data);
      // Refresh ticket list
      const ticketsResponse = await axios.get('http://localhost:8080/api/auth/get-all-tickets', {
        headers: { Authorization: `Bearer ${token}` },
        params: new URLSearchParams(location.search).get('type') ? { role: new URLSearchParams(location.search).get('type') } : {},
      });
      setTickets(Array.isArray(ticketsResponse.data.data) ? ticketsResponse.data.data : []);
      toast.success('Ticket resolved successfully.');
    } catch (err: any) {
      console.error('Error resolving ticket:', err);
      setError(err.response?.data || 'Failed to resolve ticket.');
      toast.error(err.response?.data || 'Failed to resolve ticket.');
    }
  };

  // Combine and sort requests and responses by index
  const getConversation = (ticket: TicketDTO) => {
    const module = getModule(ticket.user);
    const conversation: { type: 'request' | 'response'; text: string; index: number; userName?: string; module?: string }[] = [
      ...ticket.ticketRequests.map((req) => ({
        type: 'request' as const,
        text: req.text,
        index: req.index,
        userName: ticket.user.name,
        module,
      })),
      ...ticket.ticketResponses.map((res) => ({
        type: 'response' as const,
        text: res.text,
        index: res.index,
      })),
    ];

    // Sort by index in ascending order
    return conversation.sort((a, b) => a.index - b.index);
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-red-700 mb-6">Admin Support Tickets</h1>

        {/* Error Message */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Ticket List */}
        {loading ? (
          <SkeletonLoader />
        ) : tickets.length === 0 ? (
          <div className="text-center py-12">
            <img
              src="https://via.placeholder.com/200?text=No+Tickets"
              alt="No tickets"
              className="mx-auto mb-4"
            />
            <p className="text-amber-800 text-lg">No tickets found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ticket List */}
            <div>
              <h2 className="text-xl font-semibold text-amber-800 mb-2">All Tickets</h2>
              <div className="bg-white border border-amber-600 rounded overflow-hidden">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.pk}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 border-b border-amber-200 cursor-pointer hover:bg-orange-100 ${
                      selectedTicket?.pk === ticket.pk ? 'bg-orange-100' : ''
                    }`}
                  >
                    <p className="text-amber-800 font-semibold">{ticket.subject}</p>
                    <p className="text-sm text-amber-600">User: {ticket.user.name}</p>
                    <p className="text-sm text-amber-600">Module: {getModule(ticket.user)}</p>
                    <p className="text-sm text-amber-600">
                      Status: {ticket.resolved ? 'Resolved' : 'Open'}
                    </p>
                    <p className="text-sm text-amber-600">Ticket ID: {ticket.pk}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Chatbox */}
            <div>
              <h2 className="text-xl font-semibold text-amber-800 mb-2">
                {selectedTicket ? `Ticket: ${selectedTicket.subject}` : 'Select a Ticket'}
              </h2>
              {selectedTicket ? (
                <div className="bg-white border border-amber-600 rounded p-4">
                  <div className="h-64 overflow-y-auto mb-4">
                    {getConversation(selectedTicket).map((message, idx) => (
                      <div
                        key={`${message.type}-${message.index}-${idx}`}
                        className={`mb-2 flex ${message.type === 'request' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`p-2 rounded-lg max-w-xs ${
                            message.type === 'request' ? 'bg-amber-100' : 'bg-gray-100'
                          }`}
                        >
                          <p className="text-amber-800 text-sm">{message.text}</p>
                          <p className="text-xs text-amber-600">
                            {message.type === 'request'
                              ? `${message.userName} (${message.module})`
                              : 'Support'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedTicket.resolved ? (
                    <p className="text-amber-800 text-sm font-semibold">This ticket is resolved.</p>
                  ) : (
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        placeholder="Type your response..."
                        value={newResponse}
                        onChange={(e) => setNewResponse(e.target.value)}
                        className="w-full border border-amber-600 rounded px-3 py-2 focus:ring-2 focus:ring-orange-700 text-amber-800 placeholder-amber-400"
                      />
                      <button
                        onClick={handleSendResponse}
                        className={`px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900 transition ${
                          !token || !newResponse.trim() || selectedTicket.resolved
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                        disabled={!token || !newResponse.trim() || selectedTicket.resolved}
                      >
                        Send
                      </button>
                    </div>
                  )}
                  {!selectedTicket.resolved && (
                    <div className="flex justify-end">
                      <button
                        onClick={handleResolveTicket}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                        disabled={!token}
                      >
                        Resolve Ticket
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-amber-800">Select a ticket to view the conversation.</p>
              )}
            </div>
          </div>
        )}

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default AdminTicketPage;