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
  const [summary, setSummary] = useState({
    views: 0,
    watchTimeHours: 0,
    newSubscribers: 0,
    ctr: 0,
  });
  const [topVideos, setTopVideos] = useState([]);
  const [viewsOverTime, setViewsOverTime] = useState([]);
  const [contentBreakdown, setContentBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topLoading, setTopLoading] = useState(true);

  const daysMap = { '7 days': 7, '30 days': 30, '90 days': 90, '1 year': 365 };
  const currentDays = daysMap[range];

  // ─── Fetch data that depends on range ──────────────────────
  useEffect(() => {
    const fetchRangeData = async () => {
      setLoading(true);
      try {
        const [summaryRes, viewsOverTimeRes, breakdownRes] = await Promise.all([
          creatorApi.getAnalyticsSummary(currentDays),
          creatorApi.getViewsOverTime(currentDays),
          creatorApi.getContentBreakdown(currentDays),
        ]);

        // ── Process summary ──
        let { views, watchTimeHours, newSubscribers, ctr } = summaryRes.data;

        if (ctr > 0 && ctr < 1) ctr = ctr * 100;
        if (ctr > 100) ctr = 100;

        // Watch time: if hours < 0.5, show minutes on frontend later
        setSummary({
          views,
          watchTimeHours,
          newSubscribers,
          ctr: ctr.toFixed(1),
        });

        setViewsOverTime(viewsOverTimeRes.data);
        setContentBreakdown(breakdownRes.data);
      } catch (err) {
        console.error('Failed to load analytics data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRangeData();
  }, [currentDays]);

  // ─── Fetch top videos only once (no days parameter) ────────
  useEffect(() => {
    const fetchTopVideos = async () => {
      setTopLoading(true);
      try {
        const res = await creatorApi.getTopVideos(5); // no days
        setTopVideos(res.data);
      } catch (err) {
        console.error('Failed to load top videos', err);
      } finally {
        setTopLoading(false);
      }
    };
    fetchTopVideos();
  }, []); // empty dependency = run once

  // ─── Format watch time: if < 1 hour, show minutes ──────────
  const formatWatchTime = (hours) => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} min${minutes !== 1 ? 's' : ''}`;
    }
    return `${hours.toLocaleString()} hrs`;
  };

  // ─── Stats cards ────────────────────────────────────────────
  const stats = [
    {
      icon: <FiEye color="#60A5FA" />,
      label: 'Views',
      value: summary.views.toLocaleString(),
      color: '#60A5FA',
    },
    {
      icon: <FiClock color="#10B981" />,
      label: 'Watch time',
      value: formatWatchTime(summary.watchTimeHours),
      color: '#10B981',
    },
    {
      icon: <FiUsers color="#F59E0B" />,
      label: 'New subs',
      value: `+${summary.newSubscribers.toLocaleString()}`,
      color: '#F59E0B',
    },
    {
      icon: <FiTrendingUp color="#0EA5E9" />,
      label: 'CTR',
      value: `${summary.ctr}%`,
      color: '#0EA5E9',
    },
  ];

  // ─── Tooltip for bar chart ──────────────────────────────────
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

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-6">
      {/* Header & Range Picker */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">
          Analytics
        </h1>
        <div className="flex gap-1 p-1 bg-bg-el border border-border rounded-xl">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                range === r
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Charts (receive filtered data from parent) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ViewsChart data={viewsOverTime} range={range} loading={loading} />
        <ContentPieChart data={contentBreakdown} range={range} loading={loading} />
      </div>

      {/* Top Videos Bar Chart – does NOT change with filter */}
      <div className="bg-bg-card border border-border rounded-2xl p-5">
        <h3 className="font-display font-bold text-base mb-4 text-text-primary">
          Top Videos by Views (All Time)
        </h3>
        {topLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-bg-el rounded" />
            ))}
          </div>
        ) : topVideos.length === 0 ? (
          <div className="text-text-secondary text-center py-4">
            No videos found
          </div>
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
                  const displayTitle =
                    title.length > 28 ? title.slice(0, 28) + '…' : title;
                  return (
                    <text
                      x={x}
                      y={y}
                      dy={4}
                      textAnchor="end"
                      fill="#e2e8f0"
                      fontSize={12}
                      fontWeight={500}
                    >
                      {displayTitle}
                    </text>
                  );
                }}
                width={160}
                axisLine={false}
                tickLine={false}
                orientation="left"
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar
                dataKey="views"
                fill="#60A5FA"
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