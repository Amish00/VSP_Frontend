// src/auth/pages/CreatorDashboard.js
import React from 'react';
import { Link } from 'react-router-dom';   // <-- import Link

const CreatorDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Creator Dashboard</h1>
      <div className="mt-6">
        <Link
          to="/creator/upload"
          className="inline-block bg-primary text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:bg-primary-dark transition-colors"
        >
          Upload New Video
        </Link>
      </div>
      {/* Rest of your dashboard content (videos list, stats, etc.) goes here */}
    </div>
  );
};

export default CreatorDashboard;