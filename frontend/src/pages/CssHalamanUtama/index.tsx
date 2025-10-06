export const customStyles = `
  /* Animasi */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(20px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Utility classes */
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }
  
  .animate-slideUp {
    animation: slideUp 0.5s ease-out forwards;
  }
  
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
  
  /* Line clamp */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  /* Custom styles for active category */
  .category-active {
    background-color: rgba(245, 158, 11, 0.1);
    color: rgb(180, 83, 9);
    font-weight: 600;
  }
`;