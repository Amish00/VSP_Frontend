// pages/NotFound.jsx - Custom 404 Not Found page
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-bg-deep">
      <div className="text-center max-w-2xl">
        {/* Animated 404 graphic */}
        <div className="mb-8 relative">
          <div className="text-[120px] sm:text-[180px] font-black leading-none font-display text-text-primary opacity-10 select-none">
            404
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
              <svg
                className="w-12 h-12 sm:w-16 sm:h-16 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-bold text-text-primary mb-3">
          Page Not Found
        </h1>
        <p className="text-text-secondary text-base sm:text-lg mb-8 max-w-md mx-auto">
          Oops! The video or page you're looking for seems to have vanished into the stream.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-85 transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Back to Home
          </Link>
          <Link
            to="/trending"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-bg-card text-text-primary font-semibold hover:border-primary/50 hover:text-primary-light transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            Explore Trending
          </Link>
        </div>

      </div>
    </div>
  );
};

export default NotFound;