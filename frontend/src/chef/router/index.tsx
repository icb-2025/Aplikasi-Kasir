// src/chef/router/index.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ChefLayout from '../layout';
import Productions from '../productions';
import BahanBakuTersedia from '../bahan-baku';

const ChefRouter: React.FC = () => {
  return (
    <ChefLayout>
      <Routes>
        <Route path="productions" element={<Productions />} />
        <Route path="bahan-baku" element={<BahanBakuTersedia />} />
        <Route path="/" element={<Navigate to="bahan-baku" replace />} />
      </Routes>
    </ChefLayout>
  );
};

export default ChefRouter;