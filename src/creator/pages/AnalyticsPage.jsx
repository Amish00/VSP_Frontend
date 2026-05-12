import React, { useState, useEffect } from 'react';
import ViewsChart from '../components/ViewsChart';
import ContentPieChart from '../components/ContentPieChart';
import StatCard from '../components/ui/StatCard';
import { creatorApi } from '../api/creatorApi';

const RANGES = ['7 days', '30 days', '90 days', '1 year'];

const AnalyticsPage = () => {
  const [range, setRange] = useState('30 days');
  const [summary, setSummary] = useState({ views: 0, watchTimeHours: 0, newSubscribers: 0, ctr: 0 });
  const [topVideos, setTopVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const daysMap = { '7 days': 7, '30 days': 30, '90 days': 90, '1 year': 365 };
  const currentDays = daysMap[range];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [summaryRes, topRes] = await Promise.all([
          creatorApi.getAnalyticsSummary(currentDays),
          creatorApi.getTopVideos(5)
        ]);
        setSummary(summaryRes.data);
        setTopVideos(topRes.data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentDays]);

  const stats = [
    { icon: '👁', label: 'Views', value: summary.views.toLocaleString(), change: '+12%', color: '#60A5FA' },
    { icon: '⏱', label: 'Watch time', value: `${summary.watchTimeHours.toLocaleString()} hrs`, change: '+8%', color: '#10B981' },
    { icon: '👥', label: 'New subs', value: `+${summary.newSubscribers.toLocaleString()}`, change: '+22%', color: '#F59E0B' },
    { icon: '📈', label: 'CTR', value: `${summary.ctr}%`, change: '+0.3%', color: '#0EA5E9' },
  ];

  return (
    <div className="pb-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">Analytics</h1>
        <div className="flex gap-1 p-1 bg-bg-el border border-border rounded-xl">
          {RANGES.map(r => (
            <button key={r} onClick={() => setRange(r)} 
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${range === r ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <ViewsChart />
        <ContentPieChart />
      </div>

      <div className="bg-bg-card border border-border rounded-2xl p-5">
        <h3 className="font-display font-bold text-base mb-4 text-text-primary">Top Videos by Views</h3>
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-bg-el rounded"></div>)}
          </div>
        ) : topVideos.length === 0 ? (
          <div className="text-text-secondary text-center py-4">No videos found</div>
        ) : (
          <div className="space-y-3">
            {topVideos.map((video, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="text-text-muted font-mono text-sm w-5">#{idx+1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{video.title}</p>
                  <div className="h-1.5 bg-bg-el rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${video.percentage}%` }} />
                  </div>
                </div>
                <span className="text-sm text-text-secondary tabular-nums">{video.views.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;