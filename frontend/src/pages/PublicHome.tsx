// src/pages/PublicHome.tsx
import React from 'react';
import Dashboard from './Dashboard';
import type { Barang } from '../admin/stok-barang';

interface PublicHomeProps {
  dataBarang: Barang[];
}

const PublicHome: React.FC<PublicHomeProps> = ({ dataBarang }) => {
  return <Dashboard dataBarang={dataBarang} />;
};

export default PublicHome;