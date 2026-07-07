import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ShortsPlayer from '../components/shorts/ShortsPlayer';
import api from '../api/Api';

const ShortsWatchPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialIndex, setInitialIndex] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShorts = async () => {
      try {
        const response = await api.get('/videos', {
          params: { page: 0, size: 100, sort: 'publishedAt,desc' }
        });
        const all = response.data.content || response.data || [];
        const shortsList = all.filter(v => v.type === 'SHORTS');
        setShorts(shortsList);

        // Find index of the requested short
        const index = shortsList.findIndex(v => v.id === id);
        setInitialIndex(index !== -1 ? index : 0);
      } catch (err) {
        console.error('Failed to fetch shorts:', err);
        setError('Failed to load shorts');
      } finally {
        setLoading(false);
      }
    };
    fetchShorts();
  }, [id]);

  const handleClose = () => {
    navigate('/'); // Return to home page
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || shorts.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <p>Shorts not available</p>
        <button onClick={handleClose} className="ml-4 px-4 py-2 bg-blue-600 rounded">Go Back</button>
      </div>
    );
  }

  return (
    <ShortsPlayer
      shorts={shorts}
      initialIndex={initialIndex}
      onClose={handleClose}
    />
  );
};

export default ShortsWatchPage;