import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { User, Edit, Save, Plus, X, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';

const Profile = () => {
  const { authUser, updateProfile, isCheckingAuth } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    profilePic: null,
    location: '',
    bio: '',
    skillsOffered: [],
    skillsWanted: [],
    availability: 'not available'
  });

  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (authUser) {
      setProfileData({
        fullName: authUser.fullName || '',
        email: authUser.email || '',
        profilePic: authUser.profilePic || null,
        location: authUser.location || '',
        bio: authUser.bio || '',
        skillsOffered: authUser.skillsOffered || [],
        skillsWanted: authUser.skillsWanted || [],
        availability: authUser.availability || 'not available'
      });
    }
  }, [authUser]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile(profileData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePicClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploadingPic(true);
    
    try {
      // Create a canvas to compress the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = async () => {
        // Set canvas size (compress to reasonable dimensions)
        const maxWidth = 400;
        const maxHeight = 400;
        let { width, height } = img;
        
        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression (0.7 quality)
        const base64Image = canvas.toDataURL('image/jpeg', 0.7);
        
        try {
          // Use the updateProfile function from auth store with profilePic
          const updatedUser = await updateProfile({ profilePic: base64Image });
          
          console.log('Upload response:', updatedUser); // Debug log
          
          // Update local state
          setProfileData(prev => ({
            ...prev,
            profilePic: updatedUser.profilePic
          }));
          
          toast.success('Profile picture updated successfully!');
        } catch (error) {
          console.error('Upload error:', error);
          console.error('Error response:', error.response?.data); // Debug log
          toast.error('Failed to upload profile picture');
        } finally {
          setIsUploadingPic(false);
        }
      };
      
      img.onerror = () => {
        console.error('Error loading image');
        toast.error('Error loading image');
        setIsUploadingPic(false);
      };
      
      // Create object URL to load the image
      img.src = URL.createObjectURL(file);
      
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Error processing image');
      setIsUploadingPic(false);
    }
  };

  const addSkillOffered = () => {
    if (newSkillOffered.trim() && !profileData.skillsOffered.includes(newSkillOffered.trim())) {
      setProfileData(prev => ({
        ...prev,
        skillsOffered: [...prev.skillsOffered, newSkillOffered.trim()]
      }));
      setNewSkillOffered('');
    }
  };

  const addSkillWanted = () => {
    if (newSkillWanted.trim() && !profileData.skillsWanted.includes(newSkillWanted.trim())) {
      setProfileData(prev => ({
        ...prev,
        skillsWanted: [...prev.skillsWanted, newSkillWanted.trim()]
      }));
      setNewSkillWanted('');
    }
  };

  const removeSkillOffered = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skillsOffered: prev.skillsOffered.filter(skill => skill !== skillToRemove)
    }));
  };

  const removeSkillWanted = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skillsWanted: prev.skillsWanted.filter(skill => skill !== skillToRemove)
    }));
  };

  if (isCheckingAuth || !authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '120px' }}>
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your skills and information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {/* Avatar and Edit Button */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="relative">
                <div 
                  onClick={handleProfilePicClick}
                  className="w-16 h-16 rounded-full cursor-pointer overflow-hidden group relative"
                >
                  {profileData.profilePic ? (
                    <img 
                      src={profileData.profilePic} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                      {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                  
                  {/* Loading overlay */}
                  {isUploadingPic && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  className="hidden"
                />
              </div>
              
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900">{profileData.fullName}</h2>
                <p className="text-gray-600">{profileData.email}</p>
                <p className="text-xs text-gray-500 mt-1">Click photo to change</p>
              </div>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your location"
                />
              ) : (
                <p className="text-gray-900">{profileData.location || 'No location provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              {isEditing ? (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell others about yourself..."
                />
              ) : (
                <p className="text-gray-900">{profileData.bio || 'No bio added yet.'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
              {isEditing ? (
                <select
                  value={profileData.availability}
                  onChange={(e) => setProfileData(prev => ({ ...prev, availability: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="not available">Not Available</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="weekends">Weekends</option>
                  <option value="anytime">Anytime</option>
                </select>
              ) : (
                <p className="text-gray-900 capitalize">{profileData.availability}</p>
              )}
            </div>
          </div>
        </div>

        {/* Skills I Can Teach */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills I Can Teach</h3>
          
          {isEditing && (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkillOffered}
                onChange={(e) => setNewSkillOffered(e.target.value)}
                placeholder="Add a skill..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && addSkillOffered()}
              />
              <button
                onClick={addSkillOffered}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {profileData.skillsOffered.length > 0 ? (
              profileData.skillsOffered.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {skill}
                  {isEditing && (
                    <button
                      onClick={() => removeSkillOffered(skill)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No skills added yet.</p>
            )}
          </div>
        </div>

        {/* Skills I Want to Learn */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills I Want to Learn</h3>
          
          {isEditing && (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkillWanted}
                onChange={(e) => setNewSkillWanted(e.target.value)}
                placeholder="Add a skill..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                onKeyPress={(e) => e.key === 'Enter' && addSkillWanted()}
              />
              <button
                onClick={addSkillWanted}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {profileData.skillsWanted.length > 0 ? (
              profileData.skillsWanted.map((skill, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {skill}
                  {isEditing && (
                    <button
                      onClick={() => removeSkillWanted(skill)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No learning goals yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
