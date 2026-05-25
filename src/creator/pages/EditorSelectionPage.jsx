// src/pages/editor/EditorSelectionPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RiImageEditLine, 
  RiVideoLine, 
  RiCheckboxCircleLine
} from 'react-icons/ri';

const EditorCard = ({ title, description, icon: Icon, features, badge, onClick, buttonText }) => {
  return (
    <div
      className={`relative p-6 rounded-2xl border border-border bg-bg-card flex flex-col transition-all duration-200 hover:-translate-y-1 hover:border-primary/55 group cursor-pointer`}
      onClick={onClick}
    >
      {badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold whitespace-nowrap shadow-lg">
          {badge}
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
          <Icon size={28} />
        </div>
        <span className="text-xs font-mono text-text-muted bg-bg-el px-2 py-1 rounded-md">Creator Tool</span>
      </div>
      
      <h3 className="font-display text-2xl font-bold text-text-primary mb-1">{title}</h3>
      <p className="text-text-secondary text-sm mb-5 leading-relaxed">{description}</p>
      
      <ul className="space-y-2.5 mb-6 flex-1">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
            <RiCheckboxCircleLine className="text-success flex-shrink-0 mt-0.5" size={16} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      <button
        className={`w-full py-3 rounded-xl font-bold text-base transition-all ${
          badge === 'Most Popular' 
            ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90' 
            : 'bg-bg-el border border-border text-text-primary hover:bg-bg-hov hover:border-primary/40'
        }`}
      >
        {buttonText}
      </button>
    </div>
  );
};

const EditorSelectionPage = () => {
  const navigate = useNavigate();

  const thumbnailFeatures = [
    "AI-powered background removal",
    "Text overlays & custom fonts",
    "Stickers, shapes & frames",
    "Layer management & blending",
    "Export in 4K & custom ratios",
    "100+ templates & presets"
  ];

  const videoFeatures = [
    "Multi-track timeline editing",
    "Transitions & keyframe animations",
    "Audio ducking & royalty-free music",
    "Color grading & LUTs",
    "Captions & subtitles auto-generator",
    "Export up to 4K 60fps"
  ];

  const handleThumbnailClick = () => {
    navigate('/creator/thumbnail-editor');
  };

  const handleVideoClick = () => {
    navigate('/creator/video-editor');
  };

  return (
    <div className="pb-6">
      {/* Header – matches MyVideosPage style exactly */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">
          Choose Your Editor
        </h1>
        {/* Optional: you can add a button here later if needed */}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EditorCard
          title="Thumbnail Editor"
          description="Create click-worthy thumbnails that drive views. Perfect for YouTube, gaming, vlogs, and social media."
          icon={RiImageEditLine}
          features={thumbnailFeatures}
          onClick={handleThumbnailClick}
          buttonText="Launch Thumbnail Studio →"
          badge={null}
        />
        
        <EditorCard
          title="Video Editor"
          description="Full-featured timeline editor with transitions, effects, audio mixing, and professional export options."
          icon={RiVideoLine}
          features={videoFeatures}
          onClick={handleVideoClick}
          buttonText="Open Video Editor →"
        />
      </div>
    </div>
  );
};

export default EditorSelectionPage;