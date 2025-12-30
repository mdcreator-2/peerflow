import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile, uploadUserAvatar } from '../../services/userService';
import { HOSTELS } from '../../utils/constants';
import toast from 'react-hot-toast';

const EditProfile = () => {
  const navigate = useNavigate();
  const { userProfile, refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    displayName: userProfile?. displayName || '',
    bio: userProfile?.bio || '',
    hostel: userProfile?. location?.hostel || '',
    room:  userProfile?.location?. room || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(userProfile?.photoURL || '');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ... prev, [name]:  value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target. result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload avatar if changed
      let photoURL = userProfile?.photoURL;
      if (avatarFile) {
        photoURL = await uploadUserAvatar(userProfile. uid, avatarFile);
      }

      // Update profile
      await updateUserProfile(userProfile.uid, {
        displayName: formData.displayName,
        bio: formData.bio,
        photoURL,
        location: {
          hostel: formData. hostel,
          room: formData. room,
        },
      });

      await refreshProfile();
      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm: px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-6 lg:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {avatarPreview ?  (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-4xl font-bold border-4 border-primary-200">
                    {formData.displayName?. charAt(0) || '?'}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h. 93a2 2 0 001.664-. 89l. 812-1.22A2 2 0 0110. 07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018. 07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">Click to change photo</p>
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="mt-1 input-field"
                placeholder="Your name"
              />
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                className="mt-1 input-field"
                placeholder="Tell others about yourself..."
                maxLength={500}
              />
              <p className="mt-1 text-xs text-gray-500 text-right">
                {formData.bio. length}/500
              </p>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="hostel" className="block text-sm font-medium text-gray-700">
                  Hostel
                </label>
                <select
                  id="hostel"
                  name="hostel"
                  value={formData.hostel}
                  onChange={handleChange}
                  className="mt-1 input-field"
                >
                  <option value="">Select hostel</option>
                  {HOSTELS.map(hostel => (
                    <option key={hostel.id} value={hostel.id}>{hostel.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="room" className="block text-sm font-medium text-gray-700">
                  Room Number
                </label>
                <input
                  type="text"
                  id="room"
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                  className="mt-1 input-field"
                  placeholder="e.g., A-101"
                />
              </div>
            </div>

            {/* Email (Read Only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={userProfile?.email || ''}
                disabled
                className="mt-1 input-field bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving... 
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;