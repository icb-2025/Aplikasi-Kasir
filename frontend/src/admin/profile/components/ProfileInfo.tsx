import { useAuth } from '../../../auth/hooks/useAuth';

const ProfileInfo = () => {
  const auth = useAuth();

  const handleLogout = () => {
    auth.logout();
    // Redirect ke halaman login bisa dilakukan di sini atau di komponen yang lebih tinggi
    window.location.href = '/login';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Informasi Profil</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Username</p>
          <p className="font-medium">{auth.user?.username || '-'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Nama Lengkap</p>
          <p className="font-medium">{auth.user?.nama_lengkap || auth.user?.username || '-'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Role</p>
          <p className="font-medium capitalize">{auth.user?.role || '-'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">ID</p>
          <p className="font-medium">{auth.user?.id || '-'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileInfo;