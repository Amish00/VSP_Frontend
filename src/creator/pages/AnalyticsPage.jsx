import React, { useState, useEffect } from 'react';
import ViewsChart from '../components/ViewsChart';
import ContentPieChart from '../components/ContentPieChart';
import StatCard from '../components/ui/StatCard';
import { creatorApi } from '../api/creatorApi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { FiEye, FiClock, FiUsers, FiTrendingUp } from 'react-icons/fi';

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
          creatorApi.getTopVideos(5),
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
    { icon: <FiEye color="#60A5FA" />, label: 'Views', value: summary.views.toLocaleString(), change: '+12%', color: '#60A5FA' },
    { icon: <FiClock color="#10B981" />, label: 'Watch time', value: `${summary.watchTimeHours.toLocaleString()} hrs`, change: '+8%', color: '#10B981' },
    { icon: <FiUsers color="#F59E0B" />, label: 'New subs', value: `+${summary.newSubscribers.toLocaleString()}`, change: '+22%', color: '#F59E0B' },
    { icon: <FiTrendingUp color="#0EA5E9" />, label: 'CTR', value: `${summary.ctr}%`, change: '+0.3%', color: '#0EA5E9' },
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-text-primary">{data.title}</p>
          <p className="text-sm text-text-secondary">
            Views: <span className="font-semibold">{data.views.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="pb-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">Analytics</h1>
        <div className="flex gap-1 p-1 bg-bg-el border border-border rounded-xl">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                range === r ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <ViewsChart />
        <ContentPieChart />
      </div>

      {/* Horizontal Bar Chart for Top Videos */}
      <div className="bg-bg-card border border-border rounded-2xl p-5">
        <h3 className="font-display font-bold text-base mb-4 text-text-primary">Top Videos by Views</h3>
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-bg-el rounded" />
            ))}
          </div>
        ) : topVideos.length === 0 ? (
          <div className="text-text-secondary text-center py-4">No videos found</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(220, topVideos.length * 50)}>
            <BarChart
              layout="vertical"
              data={topVideos}
              margin={{ top: 10, right: 50, left: 20, bottom: 20 }}
            >
              <XAxis
                type="number"
                tickFormatter={(value) => value.toLocaleString()}
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                label={{
                  value: 'Views',
                  position: 'bottom',
                  offset: 0,
                  fill: '#9ca3af',
                  fontSize: 12,
                  fontWeight: 500,
                }}
              />
              <YAxis
                type="category"
                dataKey="title"
                tick={(props) => {
                  const { payload, x, y } = props;
                  const title = payload.value;
                  // Truncate long titles to avoid overflow
                  const displayTitle = title.length > 28 ? title.slice(0, 28) + '…' : title;
                  return (
                    <text
                      x={x}                     // exactly at axis line
                      y={y}
                      dy={4}
                      textAnchor="end"          // right-align so text sits to the left of the axis
                      fill="#e2e8f0"
                      fontSize={12}
                      fontWeight={500}
                    >
                      {displayTitle}
                    </text>
                  );
                }}
                width={160}                     // enough room for ~28 characters
                axisLine={false}
                tickLine={false}
                orientation="left"              // explicitly place labels on the left
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar
                dataKey="views"
                fill="#60A5FA"                  // solid blue (no gradient)
                radius={[0, 6, 6, 0]}
                barSize={26}
                label={{
                  position: 'right',
                  formatter: (value) => value.toLocaleString(),
                  fill: '#ffffff',
                  fontSize: 11,
                  fontWeight: 600,
                  offset: 6,
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;