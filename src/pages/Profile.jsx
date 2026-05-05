import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { HiOutlineUser, HiOutlineMail, HiOutlineBadgeCheck, HiCamera, HiSave } from 'react-icons/hi';
import supabase from '../lib/SupabaseClient';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    user_role: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, user_role')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: profile.username })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl border border-gray-100">
          
          {/* Header/Cover Area */}
          <div className="h-32 bg-green-600"></div>

          <div className="relative px-6 pb-10 sm:px-10">
            {/* Avatar Section */}
            <div className="relative -mt-16 mb-6 flex justify-center sm:justify-start">
              <div className="relative group">
                <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow-md">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <HiOutlineUser size={64} />
                    </div>
                  )}
                </div>
                <button className="absolute bottom-1 right-1 rounded-full bg-white p-2 text-gray-600 shadow-lg transition-transform hover:scale-110">
                  <HiCamera size={20} />
                </button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-black tracking-tight text-gray-900">
                {profile.username || 'User Profile'}
              </h1>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-green-700 border border-green-100">
                  <HiOutlineBadgeCheck size={14} />
                  {profile.user_role || 'No Role Assigned'}
                </span>
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <HiOutlineMail size={16} />
                  {user?.email}
                </span>
              </div>
            </div>

            {/* Settings Form */}
            <form onSubmit={handleUpdate} className="mt-10 space-y-6 border-t border-gray-100 pt-10">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Display Username</label>
                  <div className="relative">
                    <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={profile.username}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 outline-none transition-all focus:border-green-600 focus:ring-4 focus:ring-green-600/10"
                      placeholder="Enter your username"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 opacity-50">Account Role (Non-editable)</label>
                  <div className="relative">
                    <HiOutlineBadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input
                      type="text"
                      disabled
                      value={profile.user_role}
                      className="w-full cursor-not-allowed rounded-xl border border-gray-100 bg-gray-50/50 py-3 pl-10 text-gray-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-green-600 px-10 py-3 font-bold text-white shadow-lg shadow-green-600/20 transition-all hover:bg-green-700 active:scale-95 disabled:bg-green-400"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <HiSave size={20} />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;