import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Eye, Calendar, ThumbsUp, ArrowLeft } from 'lucide-react';
import UpNextPanel from '../components/video/UpNextPanel';
import api from '../api/Api';

const formatRelativeDate = (isoString) => {
  if (!isoString) return 'Recently';
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return `${Math.floor(diffDays / 7)} weeks ago`;
};

const formatViewCount = (views) => {
  if (!views) return '? views';
  if (typeof views === 'string') return `${views} views`;
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
  return `${views} views`;
};

// Map YouTube API response to the format expected by UpNextPanel
const mapYouTubeVideo = (ytVideo) => ({
  id: ytVideo.id,
  title: ytVideo.title,
  thumbnailUrl: ytVideo.thumbnailUrl,
  username: ytVideo.channelTitle,
  channelId: ytVideo.channelId,
  views: ytVideo.viewCount ? ytVideo.viewCount.toLocaleString() : '?',
  time: formatRelativeDate(ytVideo.publishedAt),
  paid: false,
  profilePicture: ytVideo.profilePictureUrl || null,
  isYouTube: true,
  publishedAt: ytVideo.publishedAt,
  description: ytVideo.description || '',
  // UpNextPanel uses 'thumb' as fallback, so include both
  thumb: ytVideo.thumbnailUrl,
  em: '📹', // fallback emoji if no thumbnail
});

const YouTubeWatchPage = () => {
  const { videoId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [error, setError] = useState(null);

  // Load video details from navigation state (no API call needed)
  useEffect(() => {
    if (location.state?.video) {
      setVideo(location.state.video);
      setLoading(false);
    } else {
      setError('Please navigate from the search page to watch a video.');
      setLoading(false);
    }
  }, [location.state, videoId]);

  // Load recommendations based on current video
  useEffect(() => {
    const loadRecommendations = async () => {
      if (!video) return;

      setLoadingRecs(true);
      try {
        const keywords = video.title.split(' ').slice(0, 5).join(' ');
        const searchQuery = `${video.username} ${keywords}`;
        
        const response = await api.get('/youtube/search', {
          params: { q: searchQuery, max: 20 }
        });
        
        let recs = response.data.map(mapYouTubeVideo);
        recs = recs.filter(rec => rec.id !== video.id);
        setRecommendations(recs.slice(0, 12)); // UpNextPanel handles show more/less internally
      } catch (err) {
        console.error('Failed to load recommendations:', err);
        try {
          const trendingResponse = await api.get('/youtube/trending', { params: { max: 12 } });
          let trending = trendingResponse.data.map(mapYouTubeVideo);
          trending = trending.filter(rec => rec.id !== video.id);
          setRecommendations(trending);
        } catch (trendingErr) {
          console.error('Failed to load trending fallback:', trendingErr);
          setRecommendations([]);
        }
      } finally {
        setLoadingRecs(false);
      }
    };

    if (video) {
      loadRecommendations();
    }
  }, [video]);

  const handleWatchRecommendation = (recommendedVideo) => {
    navigate(`/watch/${recommendedVideo.id}`, { state: { video: recommendedVideo } });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-[68px] md:pt-[92px]">
        <Loader2 size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-[68px] md:pt-[92px] px-4">
        <div className="text-center text-red-500 bg-red-500/10 rounded-xl p-6 max-w-md">
          <p className="text-lg mb-4">{error || 'Video not found'}</p>
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-primary min-h-screen pt-[68px] md:pt-[92px] pb-12">
      <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button for mobile */}
        <button
          onClick={handleGoBack}
          className="mb-4 flex items-center gap-2 text-text-secondary hover:text-text-primary transition md:hidden"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main video player area */}
          <div className="lg:flex-[2] min-w-0">
            {/* Video Player */}
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
              <iframe
                src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
                title={video.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                frameBorder="0"
              />
            </div>

            {/* Video Info */}
            <div className="mt-4">
              <h1 className="text-xl md:text-2xl font-bold text-text-primary mb-2">
                {video.title}
              </h1>
              
              <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-y border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                    {video.profilePicture ? (
                      <img src={video.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-primary font-bold text-lg">
                        {video.username?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{video.username}</p>
                    <p className="text-sm text-text-secondary">YouTube Channel</p>
                  </div>
                </div>
                
                <div className="flex gap-4 text-sm text-text-secondary">
                  <div className="flex items-center gap-1">
                    <Eye size={16} />
                    <span>{formatViewCount(video.views)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>{video.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp size={16} />
                    <span>{video.likes || '?'}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {video.description && (
                <div className="mt-4 p-4 bg-bg-el rounded-xl">
                  <p className="text-text-secondary text-sm whitespace-pre-wrap">
                    {video.description.length > 500 
                      ? `${video.description.substring(0, 500)}...` 
                      : video.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations Sidebar - using UpNextPanel */}
          <div className="lg:flex-1">
            <div className="sticky top-[92px]">
              {loadingRecs ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={32} className="animate-spin text-primary" />
                </div>
              ) : recommendations.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  No recommendations available
                </div>
              ) : (
                <UpNextPanel 
                  videos={recommendations} 
                  onWatch={handleWatchRecommendation} 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeWatchPage;