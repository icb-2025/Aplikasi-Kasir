import React from 'react';
import ProfileTabs from './components/ProfileTabs';

const ProfilePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800">Profile Admin</h1>
        <p className="text-gray-600">Kelola informasi profile dan password Anda</p>
      </div>
      
      <ProfileTabs />
    </div>
  );
};

export default ProfilePage;