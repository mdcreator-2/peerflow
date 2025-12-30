import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserBarterRequests, updateBarterRequestStatus } from '../../services/skillService';
import { useAuth } from '../../hooks/useAuth';
import { formatRelativeTime } from '../../utils/formatters';
import { BARTER_STATUSES } from '../../utils/constants';
import { SectionLoader } from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const BarterRequests = () => {
  const { currentUser } = useAuth();
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');

  useEffect(() => {
    fetchRequests();
  }, [currentUser]);

  const fetchRequests = async () => {
    try {
      const { sentRequests: sent, receivedRequests: received } = await getUserBarterRequests(currentUser.uid);
      setSentRequests(sent);
      setReceivedRequests(received);
    } catch (error) {
      console.error('Error fetching barter requests:', error);
      toast.error('Error loading requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await updateBarterRequestStatus(requestId, newStatus);
      
      // Update local state
      setReceivedRequests(prev =>
        prev.map(req =>
          req.id === requestId ? { ...req, status: newStatus } : req
        )
      );
      
      toast.success(`Request ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update request');
    }
  };

  if (loading) {
    return <SectionLoader />;
  }

  const RequestCard = ({ request, isReceived }) => {
    const status = BARTER_STATUSES[request.status] || BARTER_STATUSES.pending;
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-medium">
              {isReceived ? request.requester_name?. charAt(0) : request.provider_name?.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {isReceived ? request.requester_name : request.provider_name}
              </p>
              <p className="text-sm text-gray-500">
                {formatRelativeTime(request. created_at)}
              </p>
            </div>
          </div>
          <span className={`badge badge-${status. color}`}>
            {status.icon} {status.name}
          </span>
        </div>

        <div className="space-y-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">
              {isReceived ? 'Wants to learn' : 'You want to learn'}
            </p>
            <p className="font-medium text-gray-900">{request.skill_requested?. skill_name}</p>
            <p className="text-sm text-gray-500">
              {request.skill_requested?. hours_needed} hours needed
            </p>
          </div>

          <div className="bg-primary-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">
              {isReceived ? 'Offering in exchange' : 'You\'re offering'}
            </p>
            <p className="font-medium text-gray-900">{request.skill_offered?. skill_name}</p>
            <p className="text-sm text-gray-500">
              {request.skill_offered?. hours_available} hours • {request.skill_offered?.proficiency_level}
            </p>
          </div>
        </div>

        {request.skill_requested?.learning_goal && (
          <p className="text-sm text-gray-600 mb-4">
            <span className="font-medium">Goal:</span> {request.skill_requested.learning_goal}
          </p>
        )}

        {request. notes && (
          <p className="text-sm text-gray-600 mb-4">
            <span className="font-medium">Notes:</span> {request.notes}
          </p>
        )}

        {/* Actions for received requests */}
        {isReceived && request.status === 'pending' && (
          <div className="flex space-x-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => handleStatusUpdate(request.id, 'accepted')}
              className="flex-1 btn-primary py-2 text-sm"
            >
              Accept
            </button>
            <button
              onClick={() => handleStatusUpdate(request.id, 'rejected')}
              className="flex-1 btn-secondary py-2 text-sm text-red-600 border-red-200 hover: bg-red-50"
            >
              Decline
            </button>
          </div>
        )}

        {/* Action for accepted requests */}
        {request.status === 'accepted' && (
          <div className="pt-3 border-t border-gray-100">
            <button
              onClick={() => handleStatusUpdate(request.id, 'in_progress')}
              className="w-full btn-primary py-2 text-sm"
            >
              Start Exchange
            </button>
          </div>
        )}

        {/* Action for in-progress requests */}
        {request. status === 'in_progress' && (
          <div className="pt-3 border-t border-gray-100">
            <button
              onClick={() => handleStatusUpdate(request.id, 'completed')}
              className="w-full btn-primary py-2 text-sm bg-green-600 hover:bg-green-700"
            >
              Mark as Completed
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Barter Requests</h1>
          <Link to="/skills" className="btn-secondary text-sm">
            Browse Skills
          </Link>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('received')}
                className={`flex-1 px-6 py-4 text-sm font-medium text-center border-b-2 ${
                  activeTab === 'received'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Received ({receivedRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`flex-1 px-6 py-4 text-sm font-medium text-center border-b-2 ${
                  activeTab === 'sent'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover: text-gray-700'
                }`}
              >
                Sent ({sentRequests.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'received' && (
              <div>
                {receivedRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">📥</div>
                    <h3 className="text-lg font-medium text-gray-900">No requests received</h3>
                    <p className="text-gray-500 mt-1">
                      Post a skill to start receiving barter requests! 
                    </p>
                    <Link to="/post-skill" className="btn-primary mt-4 inline-block">
                      Post a Skill
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {receivedRequests.map(request => (
                      <RequestCard key={request.id} request={request} isReceived={true} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sent' && (
              <div>
                {sentRequests.length === 0 ?  (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">📤</div>
                    <h3 className="text-lg font-medium text-gray-900">No requests sent</h3>
                    <p className="text-gray-500 mt-1">
                      Browse skills and send a barter request! 
                    </p>
                    <Link to="/skills" className="btn-primary mt-4 inline-block">
                      Browse Skills
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sentRequests.map(request => (
                      <RequestCard key={request.id} request={request} isReceived={false} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarterRequests;