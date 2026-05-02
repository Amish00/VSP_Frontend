// src/components/ChannelStrip.jsx
import React, { useState, useEffect } from 'react';
import api from '../../api/Api';

const ChannelStrip = ({ onChannelClick }) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscribedChannels = async () => {
      try {
        const response = await api.get('/subscriptions/me', {
          params: { page: 0, size: 50, sort: 'subscribedAt,desc' }
        });

        const subscriptions = response.data.content || [];
        if (subscriptions.length === 0) {
          setChannels([]);
          setLoading(false);
          return;
        }

        const channelsWithSubs = await Promise.all(
          subscriptions.map(async (sub) => {
            try {
              const infoRes = await api.get(`/subscriptions/${sub.subscribedToId}/info`);
              return {
                id: sub.subscribedToId,
                name: sub.username,
                avatar: sub.profilePicture || sub.username?.[0]?.toUpperCase() || '?',
                subs: formatSubscriberCount(infoRes.data.subscriberCount),
                bg: getConsistentBgColor(sub.subscribedToId),
              };
            } catch (err) {
              return {
                id: sub.subscribedToId,
                name: sub.username,
                handle: `@${sub.username}`,
                avatar: sub.profilePicture || sub.username?.[0]?.toUpperCase() || '?',
                subs: '?',
                bg: getConsistentBgColor(sub.subscribedToId),
              };
            }
          })
        );

        setChannels(channelsWithSubs);
      } catch (err) {
        console.error('Failed to load subscribed channels:', err);
        setError('Could not load your subscriptions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribedChannels();
  }, []);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 mb-8 scrollbar-hide">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-28 h-36 bg-bg-card rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-4 mb-8">{error}</div>;
  }

  if (channels.length === 0) {
    return (
      <div className="text-center text-text-secondary py-8 mb-8 bg-bg-card rounded-2xl">
        You aren’t subscribed to any channels yet.
      </div>
    );
  }

  return (
    <div className="relative mb-10">
      {/* Gradient fade on edges (optional, for nicer scroll indication) */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-bg-main to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-bg-main to-transparent pointer-events-none z-10" />
      
      <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => onChannelClick?.(channel)}
            className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer p-4 rounded-2xl border border-border bg-bg-card w-32 hover:scale-105 hover:border-primary hover:shadow-lg transition-all duration-200 snap-start"
          >
            {/* Avatar - much larger and with gradient border */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full ring-2 ring-primary/20 ring-offset-2 ring-offset-bg-card overflow-hidden bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-3xl font-bold shadow-md">
                {channel.avatar?.startsWith('http') ? (
                  <img 
                    src={channel.avatar} 
                    alt={channel.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white drop-shadow-sm">{channel.avatar}</span>
                )}
              </div>
            </div>
            
            {/* Channel name - larger & bolder */}
            <p className="text-sm font-bold text-text-primary truncate w-full text-center mt-1">
              {channel.name}
            </p>
          
            
            {/* Subscriber count - clean badge style */}
            <div className="mt-1 px-3 py-0.5 bg-bg-elevated rounded-full">
              <p className="text-2xs font-medium text-text-secondary">{channel.subs} subscribers</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Helper: format subscriber count like "128K"
const formatSubscriberCount = (num) => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num?.toString() || '0';
};

// Helper: generate a consistent but nicer bg color (softer, modern)
const getConsistentBgColor = (id) => {
  const colors = [
    'from-indigo-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-500',
    'from-violet-500 to-fuchsia-500',
  ];
  return colors[id % colors.length];
};

export default ChannelStrip;