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

interface TicketDTO {
  subject: string;
  ticketRequests: Text[];
  ticketResponses: Text[];
  resolved: boolean;
  pk: number;
}

const TicketPage: React.FC = () => {
  const [tickets, setTickets] = useState<TicketDTO[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketDTO | null>(null);
  const [newSubject, setNewSubject] = useState('');
  const [newRequest, setNewRequest] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const location = useLocation();

  // Fetch all tickets based on URL query parameter
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        // Extract 'type' from URL query (e.g., ?type=solved)
        const queryParams = new URLSearchParams(location.search);
        const type = queryParams.get('type');

        // Map 'type' to 'status' parameter
        const config = {
          headers: { Authorization: `Bearer ${token}` },
          params: type ? { status: type === 'solved' ? 'resolved' : 'unresolved' } : {},
        };

        const response = await axios.get('http://localhost:8080/api/auth/get-tickets', config);
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

  // Create a new ticket
  const handleCreateTicket = async () => {
    if (!newSubject.trim()) {
      setError('Subject cannot be empty.');
      toast.error('Subject cannot be empty.');
      return;
    }
    try {
      await axios.post(
        'http://localhost:8080/api/auth/create-ticket',
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { subject: newSubject },
        }
      );
      setNewSubject('');
      // Refresh tickets list with current filter
      const queryParams = new URLSearchParams(location.search);
      const type = queryParams.get('type');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: type ? { status: type === 'solved' ? 'resolved' : 'unresolved' } : {},
      };
      const response = await axios.get('http://localhost:8080/api/auth/get-tickets', config);
      setTickets(Array.isArray(response.data.data) ? response.data.data : []);
      toast.success('Ticket created successfully.');
    } catch (err: any) {
      console.error('Error creating ticket:', err);
      setError(err.response?.data || 'Failed to create ticket.');
      toast.error(err.response?.data || 'Failed to create ticket.');
    }
  };

  // Send a new request
  const handleSendRequest = async () => {
    if (!selectedTicket || !newRequest.trim()) {
      setError('Please select a ticket and enter a request.');
      toast.error('Please select a ticket and enter a request.');
      return;
    }
    if (selectedTicket.resolved) {
      setError('Cannot send request to a resolved ticket.');
      toast.error('Cannot send request to a resolved ticket.');
      return;
    }
    try {
      await axios.post(
        'http://localhost:8080/api/auth/write-request',
        {
          pk: selectedTicket.pk,
          ticketRequests: [{ text: newRequest, index: 0 }], // Index set to 0; backend assigns actual index
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewRequest('');
      // Refresh ticket chat
      const response = await axios.get(`http://localhost:8080/api/auth/get-ticket-chat/${selectedTicket.pk}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedTicket(response.data);
      toast.success('Request sent successfully.');
    } catch (err: any) {
      console.error('Error sending request:', err);
      setError(err.response?.data || 'Failed to send request.');
      toast.error(err.response?.data || 'Failed to send request.');
    }
  };

  // Combine and sort requests and responses by index
  const getConversation = (ticket: TicketDTO) => {
    const conversation: { type: 'request' | 'response'; text: string; index: number }[] = [
      ...ticket.ticketRequests.map((req) => ({
        type: 'request' as const,
        text: req.text,
        index: req.index,
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

  // Determine page title and empty state message based on type
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get('type');
  const isResolvedView = type === 'solved';
  const isAllView = !type;
  const pageTitle = isResolvedView ? 'Resolved Support Tickets' : isAllView ? 'All Support Tickets' : 'Open Support Tickets';
  const emptyMessage = isResolvedView ? 'No resolved tickets found.' : isAllView ? 'No tickets found.' : 'No open tickets found.';

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-red-700 mb-6">{pageTitle}</h1>

        {/* Error Message */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Create Ticket Form (only shown in unresolved or all view) */}
        {(isAllView || type === 'unsolved') && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-amber-800 mb-2">Create New Ticket</h2>
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Enter ticket subject..."
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full max-w-md border border-amber-600 rounded px-3 py-2 focus:ring-2 focus:ring-orange-700 text-amber-800 placeholder-amber-400"
              />
              <button
                onClick={handleCreateTicket}
                className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900 transition"
                disabled={!token || !newSubject.trim()}
              >
                Create Ticket
              </button>
            </div>
          </div>
        )}

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
            <p className="text-amber-800 text-lg">{emptyMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ticket List */}
            <div>
              <h2 className="text-xl font-semibold text-amber-800 mb-2">Your Tickets</h2>
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
                            {message.type === 'request' ? 'You' : 'Support'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedTicket.resolved ? (
                    <p className="text-amber-800 text-sm font-semibold">This ticket is resolved.</p>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        value={newRequest}
                        onChange={(e) => setNewRequest(e.target.value)}
                        className="w-full border border-amber-600 rounded px-3 py-2 focus:ring-2 focus:ring-orange-700 text-amber-800 placeholder-amber-400"
                      />
                      <button
                        onClick={handleSendRequest}
                        className={`px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900 transition ${
                          !token || !newRequest.trim() || selectedTicket.resolved
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                        disabled={!token || !newRequest.trim() || selectedTicket.resolved}
                      >
                        Send
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

export default TicketPage;