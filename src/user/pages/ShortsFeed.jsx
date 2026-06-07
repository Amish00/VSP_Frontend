// src/pages/ShortsFeed.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/Api';
import ShortsPlayer from '../components/shorts/ShortsPlayer';
import ShortsCard from '../components/shorts/ShortsCard';

const ShortsFeed = () => {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShortIndex, setSelectedShortIndex] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShorts = async () => {
      try {
        const response = await api.get('/videos', {
          params: { page: 0, size: 100, sort: 'publishedAt,desc' }
        });
        const all = response.data.content || response.data || [];
        const shortsList = all.filter(v => v.type === 'SHORT' || v.type === 'SHORTS');
        setShorts(shortsList);
      } catch (err) {
        console.error('Failed to fetch shorts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShorts();
  }, []);

  useEffect(() => {
    const playId = searchParams.get('play');
    if (!playId || shorts.length === 0) return;
    const index = shorts.findIndex(short => String(short.id) === String(playId));
    if (index !== -1) {
      setSelectedShortIndex(index);
    }
  }, [searchParams, shorts]);

  const openPlayer = (index) => setSelectedShortIndex(index);
  const closePlayer = () => {
    setSelectedShortIndex(null);
    navigate('/shorts', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 pt-[68px] md:pt-[92px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading shorts...</p>
        </div>
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 pt-[68px] md:pt-[92px] flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-gray-400 text-lg">No shorts available yet.</p>
          <p className="text-gray-500 text-sm mt-2">Check back later for short videos!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 pt-[68px] md:pt-[92px] pb-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Shorts</h1>
          <p className="text-gray-400 mt-1">Watch quick, entertaining vertical videos</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {shorts.map((short, idx) => (
            <ShortsCard key={short.id} short={short} onPlay={() => openPlayer(idx)} />
          ))}
        </div>

        {selectedShortIndex !== null && (
          <ShortsPlayer
            shorts={shorts}
            initialIndex={selectedShortIndex}
            onClose={closePlayer}
          />
        )}
      </div>
    </div>
  );
};

export default ShortsFeed;