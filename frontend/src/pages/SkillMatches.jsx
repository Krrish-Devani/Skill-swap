import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Target, Users, Star, Book, TrendingUp, Heart, MessageCircle } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const SkillMatches = () => {
  const { authUser } = useAuthStore();
  const [matches, setMatches] = useState({
    canTeachYou: [],
    wantToLearnFromYou: [],
    mutualMatches: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mutual');

  // Calculate match score between two users
  const calculateMatchScore = (user1, user2) => {
    const user1Offers = user1.skillsOffered || [];
    const user1Wants = user1.skillsWanted || [];
    const user2Offers = user2.skillsOffered || [];
    const user2Wants = user2.skillsWanted || [];

    // Skills user1 can teach that user2 wants to learn
    const canTeachThem = user1Offers.filter(skill => 
      user2Wants.some(wantedSkill => 
        wantedSkill.toLowerCase() === skill.toLowerCase()
      )
    );

    // Skills user2 can teach that user1 wants to learn
    const canTeachYou = user2Offers.filter(skill => 
      user1Wants.some(wantedSkill => 
        wantedSkill.toLowerCase() === skill.toLowerCase()
      )
    );

    const mutualSkills = canTeachThem.length + canTeachYou.length;
    const totalPossible = Math.max(user1Offers.length + user1Wants.length, 1);
    
    return {
      score: Math.round((mutualSkills / totalPossible) * 100),
      canTeachThem,
      canTeachYou,
      isMutual: canTeachThem.length > 0 && canTeachYou.length > 0
    };
  };

  // Fetch and process matches
  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/users/browse');
      const allUsers = response.data.filter(user => 
        user._id !== authUser._id && user.isPublic
      );

      const processedMatches = {
        canTeachYou: [],
        wantToLearnFromYou: [],
        mutualMatches: []
      };

      allUsers.forEach(user => {
        const matchData = calculateMatchScore(authUser, user);
        
        if (matchData.canTeachYou.length > 0) {
          processedMatches.canTeachYou.push({
            ...user,
            matchScore: matchData.score,
            matchingSkills: matchData.canTeachYou,
            matchType: 'canTeachYou'
          });
        }

        if (matchData.canTeachThem.length > 0) {
          processedMatches.wantToLearnFromYou.push({
            ...user,
            matchScore: matchData.score,
            matchingSkills: matchData.canTeachThem,
            matchType: 'wantToLearnFromYou'
          });
        }

        if (matchData.isMutual) {
          processedMatches.mutualMatches.push({
            ...user,
            matchScore: matchData.score,
            canTeachYou: matchData.canTeachYou,
            canTeachThem: matchData.canTeachThem,
            matchType: 'mutual'
          });
        }
      });

      // Sort by match score
      Object.keys(processedMatches).forEach(key => {
        processedMatches[key].sort((a, b) => b.matchScore - a.matchScore);
      });

      setMatches(processedMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to load skill matches');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchMatches();
    }
  }, [authUser]);

  // Send swap request
  const handleConnect = async (user) => {
    try {
      // Use the matching skills for a more targeted swap
      const requesterSkill = user.canTeachThem?.[0] || authUser.skillsOffered?.[0] || 'General Skills';
      const recipientSkill = user.canTeachYou?.[0] || user.matchingSkills?.[0] || user.skillsOffered?.[0] || 'General Skills';

      const response = await axiosInstance.post('/swaps', {
        recipientId: user._id,
        requesterSkill: requesterSkill,
        recipientSkill: recipientSkill,
        message: `Hi ${user.fullName}, we have great skill compatibility! I can teach you ${requesterSkill} and would love to learn ${recipientSkill}.`
      });

      if (response.data.swap) {
        toast.success(`Swap request sent to ${user.fullName}!`);
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

  const getMatchTypeColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const renderUserCard = (user) => (
    <div key={user._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">{user.fullName}</h3>
            <div className="flex items-center">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchTypeColor(user.matchScore)}`}>
                {user.matchScore}% Match
              </span>
            </div>
          </div>
        </div>
        <TrendingUp className="h-5 w-5 text-green-500" />
      </div>

      {/* Bio */}
      {user.bio && (
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{user.bio}</p>
      )}

      {/* Matching Skills */}
      {user.matchType === 'mutual' && (
        <div className="space-y-3 mb-4">
          <div>
            <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center">
              <Star className="h-3 w-3 mr-1" />
              They can teach you:
            </h4>
            <div className="flex flex-wrap gap-1">
              {user.canTeachYou.map((skill, index) => (
                <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center">
              <Book className="h-3 w-3 mr-1" />
              You can teach them:
            </h4>
            <div className="flex flex-wrap gap-1">
              {user.canTeachThem.map((skill, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {user.matchType === 'canTeachYou' && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center">
            <Star className="h-3 w-3 mr-1" />
            They can teach you:
          </h4>
          <div className="flex flex-wrap gap-1">
            {user.matchingSkills.map((skill, index) => (
              <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {user.matchType === 'wantToLearnFromYou' && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center">
            <Book className="h-3 w-3 mr-1" />
            You can teach them:
          </h4>
          <div className="flex flex-wrap gap-1">
            {user.matchingSkills.map((skill, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Contact Button */}
      <button
        onClick={() => handleConnect(user)}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-2"
      >
        <MessageCircle className="h-4 w-4" />
        Connect
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: '120px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Finding your skill matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '120px' }}>
      <div className="max-w-6xl mx-auto px-4 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Skill Matches</h1>
          <p className="text-gray-600">Discover perfect skill exchange opportunities</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{matches.mutualMatches.length}</h3>
            <p className="text-gray-600">Mutual Matches</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Star className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{matches.canTeachYou.length}</h3>
            <p className="text-gray-600">Can Teach You</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Book className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{matches.wantToLearnFromYou.length}</h3>
            <p className="text-gray-600">Want to Learn From You</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('mutual')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'mutual'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Heart className="h-4 w-4 inline mr-2" />
              Mutual Matches ({matches.mutualMatches.length})
            </button>
            <button
              onClick={() => setActiveTab('canTeachYou')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'canTeachYou'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Star className="h-4 w-4 inline mr-2" />
              Can Teach You ({matches.canTeachYou.length})
            </button>
            <button
              onClick={() => setActiveTab('wantToLearn')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'wantToLearn'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Book className="h-4 w-4 inline mr-2" />
              Want to Learn From You ({matches.wantToLearnFromYou.length})
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'mutual' && matches.mutualMatches.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No mutual matches yet</h3>
              <p className="text-gray-600">Update your skills to find perfect matches!</p>
            </div>
          )}
          {activeTab === 'canTeachYou' && matches.canTeachYou.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No teachers found</h3>
              <p className="text-gray-600">Add skills you want to learn to find teachers!</p>
            </div>
          )}
          {activeTab === 'wantToLearn' && matches.wantToLearnFromYou.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Book className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-600">Add skills you can teach to find students!</p>
            </div>
          )}

          {activeTab === 'mutual' && matches.mutualMatches.map(renderUserCard)}
          {activeTab === 'canTeachYou' && matches.canTeachYou.map(renderUserCard)}
          {activeTab === 'wantToLearn' && matches.wantToLearnFromYou.map(renderUserCard)}
        </div>
      </div>
    </div>
  );
};

export default SkillMatches;
