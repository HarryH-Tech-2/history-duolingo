import React from 'react';
import Svg, { Path, G, Circle, Rect, Ellipse, Defs, LinearGradient, Stop } from 'react-native-svg';

// Illustrative monoline icons used on the lesson path nodes.
// Kept as flat SVGs tinted with theme colors.

const base = { strokeLinecap: 'round', strokeLinejoin: 'round' };

export function Amphora({ size = 44, color = '#2A1E0A' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <G stroke={color} strokeWidth={2.2} fill="none" {...base}>
        <Path d="M18 10 L18 14 Q14 18 14 24 Q14 34 20 40 L28 40 Q34 34 34 24 Q34 18 30 14 L30 10" />
        <Path d="M18 10 L30 10" />
        <Path d="M14 20 Q10 22 10 26 Q10 30 14 28" />
        <Path d="M34 20 Q38 22 38 26 Q38 30 34 28" />
        <Path d="M19 22 Q24 24 29 22" />
        <Path d="M19 28 L29 28" />
      </G>
    </Svg>
  );
}

export function Helmet({ size = 44, color = '#1A2A1A' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <G stroke={color} strokeWidth={2.2} fill="none" {...base}>
        {/* plume */}
        <Path d="M12 10 Q18 6 24 8 Q30 6 36 10 Q34 12 32 12 L16 12 Q14 12 12 10 Z" fill={color} />
        {/* helmet body */}
        <Path d="M12 22 Q12 14 24 14 Q36 14 36 22 L36 32 Q32 36 24 36 Q16 36 12 32 Z" />
        {/* eye slit */}
        <Path d="M16 24 L22 24" />
        <Path d="M26 24 L32 24" />
        {/* nose guard */}
        <Path d="M24 20 L24 34" />
        <Path d="M20 36 L28 36" />
      </G>
    </Svg>
  );
}

export function Laurel({ size = 44, color = '#2A1E3A' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <G stroke={color} strokeWidth={2.2} fill="none" {...base}>
        {/* left branch */}
        <Path d="M10 34 Q8 24 14 14" />
        <Ellipse cx="11" cy="30" rx="3" ry="5" transform="rotate(-20 11 30)" fill={color} />
        <Ellipse cx="10" cy="24" rx="3" ry="5" transform="rotate(-10 10 24)" fill={color} />
        <Ellipse cx="12" cy="18" rx="3" ry="5" transform="rotate(10 12 18)" fill={color} />
        {/* right branch */}
        <Path d="M38 34 Q40 24 34 14" />
        <Ellipse cx="37" cy="30" rx="3" ry="5" transform="rotate(20 37 30)" fill={color} />
        <Ellipse cx="38" cy="24" rx="3" ry="5" transform="rotate(10 38 24)" fill={color} />
        <Ellipse cx="36" cy="18" rx="3" ry="5" transform="rotate(-10 36 18)" fill={color} />
        {/* center ribbon */}
        <Path d="M14 34 Q24 36 34 34" strokeWidth={2.5} />
        <Path d="M20 36 L18 40" />
        <Path d="M28 36 L30 40" />
      </G>
    </Svg>
  );
}

export function Dragon({ size = 44, color = '#2A1E3A' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <G stroke={color} strokeWidth={2.2} fill="none" {...base}>
        <Path d="M8 30 Q14 20 24 22 Q32 24 38 18 L38 22 Q34 28 28 30 Q32 36 38 36" />
        <Path d="M12 26 L14 22" />
        <Path d="M18 24 L20 20" />
        <Path d="M8 30 Q6 32 8 34" />
        <Circle cx="10" cy="30" r="1" fill={color} />
      </G>
    </Svg>
  );
}

export function Sword({ size = 44, color = '#3A1E1E' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <G stroke={color} strokeWidth={2.2} fill="none" {...base}>
        <Path d="M24 6 L24 30" strokeWidth={3} />
        <Path d="M16 30 L32 30" strokeWidth={2.5} />
        <Path d="M24 30 L24 38" strokeWidth={2} />
        <Circle cx="24" cy="40" r="2.5" fill={color} />
        <Path d="M24 8 L20 12 L24 10 L28 12 Z" fill={color} />
      </G>
    </Svg>
  );
}

export function Column({ size = 44, color = '#2A1E0A' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <G stroke={color} strokeWidth={2.2} fill="none" {...base}>
        <Rect x="10" y="10" width="28" height="4" />
        <Rect x="12" y="14" width="24" height="3" />
        <Path d="M16 17 L16 34" />
        <Path d="M22 17 L22 34" />
        <Path d="M26 17 L26 34" />
        <Path d="M32 17 L32 34" />
        <Rect x="12" y="34" width="24" height="3" />
        <Rect x="10" y="37" width="28" height="4" />
      </G>
    </Svg>
  );
}

export function Lock({ size = 22, color = 'rgba(245, 232, 208, 0.4)' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G stroke={color} strokeWidth={2} fill="none" {...base}>
        <Rect x="5" y="11" width="14" height="10" rx="2" />
        <Path d="M8 11 L8 8 Q8 4 12 4 Q16 4 16 8 L16 11" />
      </G>
    </Svg>
  );
}

export function Check({ size = 14, color = '#fff' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path
        d="M3 8.5 L6.5 12 L13 4.5"
        stroke={color}
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function iconFor(name) {
  switch (name) {
    case 'amphora':
      return Amphora;
    case 'helmet':
      return Helmet;
    case 'laurel':
      return Laurel;
    case 'dragon':
      return Dragon;
    case 'sword':
      return Sword;
    case 'column':
      return Column;
    default:
      return Amphora;
  }
}
