import React from 'react';
import Svg, { Path, G, Circle, Ellipse, Defs, LinearGradient, Stop, RadialGradient } from 'react-native-svg';

// Athena's owl — the history mascot. A friendly, wise owl with a scroll and cape.
export default function Owl({ size = 170 }) {
  const w = size;
  const h = size;
  return (
    <Svg width={w} height={h} viewBox="0 0 200 200">
      <Defs>
        <LinearGradient id="body" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#A07754" />
          <Stop offset="1" stopColor="#6B4A2B" />
        </LinearGradient>
        <LinearGradient id="belly" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#D9B382" />
          <Stop offset="1" stopColor="#B08A5A" />
        </LinearGradient>
        <LinearGradient id="cape" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#4B6A4E" />
          <Stop offset="1" stopColor="#2E4431" />
        </LinearGradient>
        <RadialGradient id="eye" cx="0.4" cy="0.35" r="0.7">
          <Stop offset="0" stopColor="#F5E8B8" />
          <Stop offset="0.6" stopColor="#8B6A1E" />
          <Stop offset="1" stopColor="#3A2808" />
        </RadialGradient>
      </Defs>

      {/* Cape behind */}
      <Path
        d="M 50 100 Q 40 130 55 170 L 145 170 Q 160 130 150 100 Q 130 95 100 95 Q 70 95 50 100 Z"
        fill="url(#cape)"
      />
      <Path d="M 100 95 L 100 170" stroke="#1F2E22" strokeWidth="1.5" opacity="0.5" />

      {/* Body */}
      <Path
        d="M 60 70 Q 55 130 75 160 Q 100 172 125 160 Q 145 130 140 70 Q 130 50 100 50 Q 70 50 60 70 Z"
        fill="url(#body)"
      />

      {/* Belly */}
      <Path
        d="M 75 90 Q 72 130 85 155 Q 100 162 115 155 Q 128 130 125 90 Q 115 80 100 80 Q 85 80 75 90 Z"
        fill="url(#belly)"
      />

      {/* Feather texture lines on chest */}
      <G stroke="#8B6A3E" strokeWidth="0.8" fill="none" opacity="0.6">
        <Path d="M 85 100 Q 90 105 95 100" />
        <Path d="M 100 100 Q 105 105 110 100" />
        <Path d="M 92 115 Q 97 120 102 115" />
        <Path d="M 105 115 Q 110 120 115 115" />
        <Path d="M 85 130 Q 90 135 95 130" />
        <Path d="M 100 130 Q 105 135 110 130" />
      </G>

      {/* Ear tufts */}
      <Path d="M 68 55 Q 62 42 70 40 Q 78 42 78 55 Z" fill="#6B4A2B" />
      <Path d="M 132 55 Q 138 42 130 40 Q 122 42 122 55 Z" fill="#6B4A2B" />

      {/* Face disc */}
      <Ellipse cx="100" cy="85" rx="35" ry="30" fill="#C9A472" />
      <Path d="M 100 60 Q 78 62 72 82 Q 78 72 100 72 Q 122 72 128 82 Q 122 62 100 60 Z" fill="#8B6A3E" opacity="0.5" />

      {/* Eyes - big bright */}
      <Circle cx="85" cy="82" r="14" fill="#2A1F10" />
      <Circle cx="115" cy="82" r="14" fill="#2A1F10" />
      <Circle cx="85" cy="82" r="11" fill="url(#eye)" />
      <Circle cx="115" cy="82" r="11" fill="url(#eye)" />
      <Circle cx="85" cy="82" r="5" fill="#0A0A0A" />
      <Circle cx="115" cy="82" r="5" fill="#0A0A0A" />
      {/* eye highlights */}
      <Circle cx="82" cy="79" r="2" fill="#FFF" />
      <Circle cx="112" cy="79" r="2" fill="#FFF" />

      {/* Beak */}
      <Path d="M 100 90 L 94 102 Q 100 106 106 102 Z" fill="#D4A85A" stroke="#8B6A1E" strokeWidth="1" />

      {/* Pendant on cape */}
      <Circle cx="100" cy="112" r="6" fill="#E8C974" stroke="#8B6A1E" strokeWidth="1" />
      <Circle cx="100" cy="112" r="2.5" fill="#8B6A1E" />

      {/* Scroll held in wing */}
      <G>
        <Ellipse cx="145" cy="135" rx="4" ry="8" fill="#E8D6B0" stroke="#8B6A3E" strokeWidth="1" />
        <Path d="M 141 135 L 115 145 L 115 155 L 141 145 Z" fill="#F2E2BE" stroke="#8B6A3E" strokeWidth="1" />
        <Ellipse cx="115" cy="150" rx="4" ry="8" fill="#E8D6B0" stroke="#8B6A3E" strokeWidth="1" />
      </G>
    </Svg>
  );
}
