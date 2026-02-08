// src/chef/productions/index.tsx
import React, { useState, useEffect } from 'react';
import { portbe } from "../../../../backend/ngrokbackend";
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface BahanBaku {
  _id: string;
  nama: string;
  kategori: string;
  stok: number;
  satuan: string;
  is_bahan_siapp: boolean;
}

interface Production {
  _id: string;
  bahan_baku_id: BahanBaku;
  jumlah_diproses: number;
  status: 'pending' | 'approved' | 'cancelled' | 'completed';
  waktu_mulai?: Date;
  waktu_selesai?: Date;
  catatan?: string;
  createdAt: Date;
}

const ipbe = import.meta.env.VITE_IPBE;

const Productions: React.FC = () => {
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductions();
  }, []);

  const fetchProductions = async () => {
    try {
      const response = await fetch(`${ipbe}:${portbe}/api/chef/productions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProductions(data);
      }
    } catch (error) {
      console.error('Error fetching productions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'approved' | 'cancelled', catatan?: string) => {
    try {
      const response = await fetch(`${ipbe}:${portbe}/api/chef/productions/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status, catatan }),
      });
      if (response.ok) {
        fetchProductions();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />;
      case 'approved':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'completed':
        return <CheckCircle className="text-blue-500" size={20} />;
      case 'cancelled':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Productions</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Produk
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jumlah Diproses
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Waktu Mulai
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productions.map((prod) => (
              <tr key={prod._id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {prod.bahan_baku_id ? (
                      <div>
                        <div className="font-medium">{prod.bahan_baku_id.nama}</div>
                        <div className="text-gray-500">{prod.bahan_baku_id.kategori}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Bahan baku tidak ditemukan</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {prod.jumlah_diproses} {prod.bahan_baku_id?.satuan || ''}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(prod.status)}`}>
                    {getStatusIcon(prod.status)}
                    <span className="ml-1 capitalize">{prod.status}</span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {prod.waktu_mulai ? new Date(prod.waktu_mulai).toLocaleString() : '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  {prod.status === 'pending' ? (
                    <button
                      onClick={() => updateStatus(prod._id, 'approved')}
                      className="text-green-600 hover:text-green-900 font-medium"
                    >
                      Approve
                    </button>
                  ) : prod.status === 'approved' ? (
                    <span className="text-green-600">Approved - Menunggu Admin</span>
                  ) : (
                    <span className="text-red-600">Cancelled</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Productions;