// src/admin/users/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import SweetAlert from '../../components/SweetAlert';
import UserModal from './component/usermodal'; // lowercase
import UserTable from './component/usertable'; // lowercase
import UserFilter from './component/userfilter'; // lowercase - perbaikan di sini

interface User {
  _id: string;
  nama_lengkap?: string;
  nama?: string;
  username?: string;
  role: string;
  status: string;
  umur?: number;
  alamat?: string;
  password?: string;
}

interface FormData {
  nama_lengkap: string;
  username: string;
  password: string;
  role: string;
  status: string;
  umur: string;
  alamat: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filters, setFilters] = useState({
    role: '',
    status: ''
  });

  const API_URL = 'http://192.168.110.16:5000/api/admin/users';

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Gagal mengambil data user');
      }
      const data = await response.json();
      setUsers(data);
      applyFilters(data, filters);
    } catch (error) {
      SweetAlert.error('Gagal memuat data user');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters, API_URL]);

  // Apply filters to users
  const applyFilters = (userList: User[], currentFilters: { role: string; status: string }) => {
    let result = [...userList];
    
    if (currentFilters.role) {
      result = result.filter(user => user.role === currentFilters.role);
    }
    
    if (currentFilters.status) {
      result = result.filter(user => user.status === currentFilters.status);
    }
    
    setFilteredUsers(result);
  };

  // Handle filter change
  const handleFilter = (newFilters: { role: string; status: string }) => {
    setFilters(newFilters);
    applyFilters(users, newFilters);
  };

  // Reset filters
  const handleResetFilter = () => {
    setFilters({ role: '', status: '' });
    setFilteredUsers(users);
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Submit form (create or update user)
  const handleSubmit = async (formData: FormData) => {
    try {
      SweetAlert.loading(editingUser ? 'Mengupdate user...' : 'Menambah user...');
      
      const payload = {
        ...formData,
        umur: formData.umur ? parseInt(formData.umur) : undefined
      };

      let response;
      if (editingUser) {
        // Update existing user
        response = await fetch(`${API_URL}/${editingUser._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new user
        response = await fetch(`${API_URL}/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        throw new Error(editingUser ? 'Gagal mengupdate user' : 'Gagal menambah user');
      }

      SweetAlert.success(editingUser ? 'User berhasil diupdate' : 'User berhasil ditambahkan');
      fetchUsers();
      setShowModal(false);
      setEditingUser(null);
    } catch (error) {
      SweetAlert.error(editingUser ? 'Gagal mengupdate user' : 'Gagal menambah user');
      console.error(error);
    } finally {
      SweetAlert.close();
    }
  };

  // Delete user
  const handleDelete = async (id: string) => {
    const result = await SweetAlert.confirmDelete();
    
    if (result.isConfirmed) {
      try {
        SweetAlert.loading('Menghapus user...');
        
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Gagal menghapus user');
        }

        SweetAlert.success('User berhasil dihapus');
        fetchUsers();
      } catch (error) {
        SweetAlert.error('Gagal menghapus user');
        console.error(error);
      } finally {
        SweetAlert.close();
      }
    }
  };

  // Edit user
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
  };

  // Add new user
  const handleAddUser = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen User</h1>
        <button
          onClick={handleAddUser}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tambah User
        </button>
      </div>

      <UserFilter onFilter={handleFilter} onReset={handleResetFilter} />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <UserTable 
          users={filteredUsers} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      )}

      <UserModal 
        showModal={showModal}
        editingUser={editingUser}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default UsersPage;