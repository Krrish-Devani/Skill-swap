import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { InboxIcon, SendIcon } from 'lucide-react';

const Swaps = () => {
  const { authUser } = useAuthStore();
  const [swaps, setSwaps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all swaps for the current user
  const fetchSwaps = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/swaps');
      
      console.log('Swap response:', response.data); // Debug log
      console.log('Current auth user:', authUser); // Debug current user
      
      if (response.data && response.data.success) {
        console.log('Swaps received:', response.data.swaps); // Debug swaps data
        setSwaps(response.data.swaps);
      }
    } catch (error) {
      console.error('Error fetching swaps:', error);
      toast.error('Failed to load swaps');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchSwaps();
    }
  }, [authUser]);

  // Respond to swap request
  const handleResponse = async (swapId, action) => {
    try {
      const endpoint = action === 'accepted' ? 'accept' : 'reject';
      const response = await axiosInstance.put(`/swaps/${swapId}/${endpoint}`);

      if (response.data) {
        toast.success(`Swap request ${action}`);
        fetchSwaps(); // Refresh the list
      }
    } catch (error) {
      console.error('Error responding to swap:', error);
      toast.error('Failed to respond to swap request');
    }
  };

  // Cancel swap request
  const handleCancel = async (swapId) => {
    try {
      const response = await axiosInstance.delete(`/swaps/${swapId}/cancel`);
      
      if (response.data) {
        toast.success('Swap request cancelled');
        fetchSwaps(); // Refresh the list
      }
    } catch (error) {
      console.error('Error cancelling swap:', error);
      toast.error('Failed to cancel swap request');
    }
  };

  // Complete swap
  const handleComplete = async (swapId) => {
    try {
      const response = await axiosInstance.put(`/swaps/${swapId}/complete`);
      
      if (response.data) {
        toast.success('Swap marked as completed!');
        fetchSwaps(); // Refresh the list
      }
    } catch (error) {
      console.error('Error completing swap:', error);
      toast.error('Failed to complete swap');
    }
  };

  if (!authUser) {
    return <div className="flex justify-center items-center h-screen">Please log in to view swaps</div>;
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading swaps...</div>;
  }

  const receivedSwaps = swaps.filter(swap => swap.recipient._id === authUser._id);
  const sentSwaps = swaps.filter(swap => swap.requester._id === authUser._id);

  // Debug filtering
  console.log('All swaps:', swaps);
  console.log('Received swaps:', receivedSwaps);
  console.log('Sent swaps:', sentSwaps);
  console.log('Auth user ID:', authUser._id);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Skill Swaps</h1>
          <p className="text-gray-600 mt-2">Manage your skill exchange requests</p>
        </div>

        {/* Received Swap Requests */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <InboxIcon className="w-5 h-5" />
            Received Requests ({receivedSwaps.length})
          </h2>

          {receivedSwaps.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No swap requests received yet</p>
          ) : (
            <div className="space-y-4">
              {receivedSwaps.map((swap) => (
                <div key={swap._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {swap.requester.fullName?.charAt(0) || swap.requester.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {swap.requester.fullName || swap.requester.name || 'Unknown User'}
                          </h3>
                          <p className="text-sm text-gray-500">{swap.requester.email}</p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Offering:</span> {swap.requesterSkill}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Wants:</span> {swap.recipientSkill}
                        </p>
                        {swap.scheduledDate && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Scheduled:</span> {new Date(swap.scheduledDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {swap.message && (
                        <div className="bg-gray-50 rounded p-3 mb-3">
                          <p className="text-sm text-gray-700">{swap.message}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          swap.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          swap.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          swap.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(swap.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons for received requests */}
                    <div className="flex gap-2 ml-4">
                      {swap.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleResponse(swap._id, 'accepted')}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleResponse(swap._id, 'rejected')}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {swap.status === 'accepted' && (
                        <button
                          onClick={() => handleComplete(swap._id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sent Swap Requests */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <SendIcon className="w-5 h-5" />
            Sent Requests ({sentSwaps.length})
          </h2>

          {sentSwaps.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No swap requests sent yet. Visit <span className="font-medium">Browse Users</span> to find people to swap skills with!
            </p>
          ) : (
            <div className="space-y-4">
              {sentSwaps.map((swap) => (
                <div key={swap._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {swap.recipient.fullName?.charAt(0) || swap.recipient.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {swap.recipient.fullName || swap.recipient.name || 'Unknown User'}
                          </h3>
                          <p className="text-sm text-gray-500">{swap.recipient.email}</p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">You offered:</span> {swap.requesterSkill}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">You wanted:</span> {swap.recipientSkill}
                        </p>
                        {swap.scheduledDate && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Scheduled:</span> {new Date(swap.scheduledDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {swap.message && (
                        <div className="bg-gray-50 rounded p-3 mb-3">
                          <p className="text-sm text-gray-700">Your message: {swap.message}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          swap.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          swap.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          swap.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(swap.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons for sent requests */}
                    <div className="flex gap-2 ml-4">
                      {swap.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(swap._id)}
                          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      )}
                      {swap.status === 'accepted' && (
                        <button
                          onClick={() => handleComplete(swap._id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Swaps;