import React from 'react';

const PageLoading = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" style={{
      zIndex: 999
    }}>
      <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
    </div>
  );
};

export default PageLoading;
