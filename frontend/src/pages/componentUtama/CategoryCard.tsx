import React from 'react';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryCardProps {
  category: Category;
  isSelected: boolean;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center min-w-[100px] p-4 rounded-2xl transition-all duration-300 ${
        isSelected
          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg transform -translate-y-1'
          : 'bg-white text-gray-700 hover:bg-amber-50 shadow-md'
      }`}
    >
      <span className="text-3xl mb-2">{category.icon}</span>
      <span className="font-medium">{category.name}</span>
    </button>
  );
};

export default CategoryCard;