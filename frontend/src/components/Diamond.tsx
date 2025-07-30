import React from 'react';

// Define the props interface for IntricateDiamond
interface IntricateDiamondProps {
  className?: string; // Make className optional
}

const IntricateDiamond: React.FC<IntricateDiamondProps> = ({ className }) => {
  return (
    // Apply the passed className directly to the <svg> element
    <svg width="32" height="32" viewBox="0 0 250 250" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <filter id="diamondShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feOffset result="offOut" in="SourceAlpha" dx="4" dy="4" />
          <feGaussianBlur result="blurOut" in="offOut" stdDeviation="4" />
          <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
        </filter>

        {/* Linear gradient for main body to give depth */}
        <linearGradient id="diamondGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#FACC15', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#DAA520', stopOpacity: 1 }} />
        </linearGradient>

        {/* Gradient for top facet highlight */}
        <linearGradient id="topFacetGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#FFFACD', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#FACC15', stopOpacity: 0.8 }} />
        </linearGradient>

        {/* Gradient for side facets */}
        <linearGradient id="sideFacetGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#F0E68C', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#B8860B', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Main body of the diamond with a gradient fill and shadow */}
      <polygon
        points="125,20 25,90 125,230 225,90"
        fill="url(#diamondGradient)"
        stroke="#B8860B"
        strokeWidth="2"
        filter="url(#diamondShadow)"
      />

      {/* Top facet (highlight) */}
      <polygon
        points="125,20 85,70 165,70"
        fill="url(#topFacetGradient)"
        stroke="#FFD700"
        strokeWidth="1"
      />

      {/* Left top facet */}
      <polygon
        points="25,90 85,70 125,120"
        fill="#FFD700"
        stroke="#DAA520"
        strokeWidth="1"
      />

      {/* Right top facet */}
      <polygon
        points="225,90 165,70 125,120"
        fill="#FFD700"
        stroke="#DAA520"
        strokeWidth="1"
      />

      {/* Left bottom facet */}
      <polygon
        points="25,90 125,120 125,230"
        fill="#DAA520"
        stroke="#B8860B"
        strokeWidth="1"
      />

      {/* Right bottom facet */}
      <polygon
        points="225,90 125,120 125,230"
        fill="#DAA520"
        stroke="#B8860B"
        strokeWidth="1"
      />

      {/* Horizontal line for more facet detail */}
      <line x1="25" y1="90" x2="225" y2="90" stroke="#B8860B" strokeWidth="1" />
      <line x1="85" y1="70" x2="165" y2="70" stroke="#DAA520" strokeWidth="1" />
      <line x1="125" y1="120" x2="25" y2="90" stroke="#DAA520" strokeWidth="1" />
      <line x1="125" y1="120" x2="225" y2="90" stroke="#DAA520" strokeWidth="1" />
      <line x1="125" y1="120" x2="125" y2="230" stroke="#B8860B" strokeWidth="1" />
    </svg>
  );
};

export default IntricateDiamond;
