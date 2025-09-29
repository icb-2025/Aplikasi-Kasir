import React, { useState } from 'react';
import ProfileInfo from './ProfileInfo';
import ChangePassword from './ChangePassword';

const ProfileTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('info');

  const tabs = [
    { id: 'info', label: 'Informasi Profile', icon: '👤' },
    { id: 'password', label: 'Ubah Password', icon: '🔒' },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'info' && <ProfileInfo />}
        {activeTab === 'password' && <ChangePassword />}
      </div>
    </div>
  );
};

export default ProfileTabs;