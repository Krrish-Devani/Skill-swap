import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Search, User, Star, Book, MapPin, Clock, Eye } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const BrowseUsers = () => {
  const { authUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState(new Set()); // Track sent swap requests

  // Get all available skills for filter dropdown
  const getAllSkills = () => {
    const allSkills = new Set();
    users.forEach(user => {
      user.skillsOffered?.forEach(skill => allSkills.add(skill));
    });
    return Array.from(allSkills).sort();
  };

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/users/browse');
      // Filter out current user and only show public profiles
      const publicUsers = response.data.filter(user => 
        user._id !== authUser._id && user.isPublic
      );
      setUsers(publicUsers);
      setFilteredUsers(publicUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch existing sent swap requests to disable buttons for already contacted users
  const fetchSentRequests = async () => {
    try {
      const response = await axiosInstance.get('/swaps?type=sent');
      if (response.data && response.data.success) {
        const sentUserIds = response.data.swaps
          .filter(swap => swap.status === 'pending') // Only pending requests
          .map(swap => swap.recipient._id);
        setSentRequests(new Set(sentUserIds));
      }
    } catch (error) {
      console.error('Error fetching sent requests:', error);
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchUsers();
      fetchSentRequests(); // Also fetch existing sent requests
    }
  }, [authUser]);

  // Filter users based on search and skill filter
  useEffect(() => {
    let filtered = users;

    // Filter by search term (name or bio)
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by skill
    if (skillFilter) {
      filtered = filtered.filter(user =>
        user.skillsOffered?.includes(skillFilter)
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, skillFilter, users]);

  // Send swap request
  const handleConnect = async (user) => {
    try {
      // For demo purposes, we'll pick the first skill from each user
      const requesterSkill = authUser.skillsOffered?.[0] || 'General Skills';
      const recipientSkill = user.skillsOffered?.[0] || 'General Skills';

      const response = await axiosInstance.post('/swaps', {
        recipientId: user._id,
        requesterSkill: requesterSkill,
        recipientSkill: recipientSkill,
        message: `Hi ${user.fullName}, I'd like to swap skills with you! I can teach you ${requesterSkill} and would love to learn ${recipientSkill}.`
      });

      if (response.data.swap) {
        toast.success(`Swap request sent to ${user.fullName}!`);
        // Add user to sent requests set to disable the button
        setSentRequests(prev => new Set([...prev, user._id]));
      }
    } catch (error) {
      console.error('Error sending swap request:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to send swap request');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: '120px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '120px' }}>
      <div className="max-w-6xl mx-auto px-4 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Users</h1>
          <p className="text-gray-600">Find people to swap skills with in our community</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by name or bio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Skill Filter */}
            <div className="md:w-64">
              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Skills</option>
                {getAllSkills().map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">
              {users.length === 0 
                ? "No users have made their profiles public yet." 
                : "Try adjusting your search or filter criteria."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div key={user._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  {/* User Header */}
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      {user.profilePic ? (
                        <img 
                          src={user.profilePic} 
                          alt={user.fullName} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
                          {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{user.fullName}</h3>
                    </div>
                  </div>

                  {/* Bio */}
                  {user.bio && (
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                      {user.bio}
                    </p>
                  )}

                  {/* Location & Availability */}
                  <div className="flex flex-wrap gap-2 mb-4 text-xs">
                    {user.location && (
                      <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                        <MapPin className="h-3 w-3 mr-1 text-gray-500" />
                        <span className="text-gray-700">{user.location}</span>
                      </div>
                    )}
                    {user.availability && (
                      <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                        <Clock className="h-3 w-3 mr-1 text-gray-500" />
                        <span className="text-gray-700 capitalize">{user.availability}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills Offered */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <Star className="h-4 w-4 mr-1 text-blue-500" />
                      Can Teach
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {user.skillsOffered?.length > 0 ? (
                        user.skillsOffered.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-xs">No skills listed</span>
                      )}
                      {user.skillsOffered?.length > 3 && (
                        <span className="text-blue-600 text-xs">
                          +{user.skillsOffered.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Skills Wanted */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <Book className="h-4 w-4 mr-1 text-green-500" />
                      Wants to Learn
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {user.skillsWanted?.length > 0 ? (
                        user.skillsWanted.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-xs">No learning goals</span>
                      )}
                      {user.skillsWanted?.length > 3 && (
                        <span className="text-green-600 text-xs">
                          +{user.skillsWanted.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact Button */}
                  <button
                    onClick={() => handleConnect(user)}
                    disabled={sentRequests.has(user._id)}
                    className={`w-full py-2 px-4 rounded-lg transition-colors duration-200 text-sm font-medium ${
                      sentRequests.has(user._id)
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {sentRequests.has(user._id) ? 'Sent' : 'Connect'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseUsers;
