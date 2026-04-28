import React from 'react';
import { View } from 'react-native';
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Rect,
  Path,
  G,
  Circle,
  Ellipse,
} from 'react-native-svg';

// Stylized fantasy-map backdrop evocative of the Mediterranean:
// warm ochre landmass, deep teal sea, scattered ruins, a lone ship.
export default function MapBackdrop({ width, height }) {
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="land" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#3A2A18" />
            <Stop offset="0.5" stopColor="#4A351C" />
            <Stop offset="1" stopColor="#2D1F10" />
          </LinearGradient>
          <LinearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#1A2838" />
            <Stop offset="1" stopColor="#0E1824" />
          </LinearGradient>
          <RadialGradient id="vignette" cx="0.5" cy="0.5" rx="0.7" ry="0.7">
            <Stop offset="0" stopColor="#000" stopOpacity="0" />
            <Stop offset="1" stopColor="#000" stopOpacity="0.6" />
          </RadialGradient>
          <LinearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0B0F1C" stopOpacity="1" />
            <Stop offset="0.15" stopColor="#0B0F1C" stopOpacity="0" />
            <Stop offset="0.85" stopColor="#0B0F1C" stopOpacity="0" />
            <Stop offset="1" stopColor="#0B0F1C" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* base sea */}
        <Rect x="0" y="0" width={width} height={height} fill="url(#sea)" />

        {/* main landmass - rolling hills shape, takes center-right */}
        <Path
          d={`
            M ${width * 0.28} 0
            L ${width} 0
            L ${width} ${height}
            L ${width * 0.32} ${height}
            C ${width * 0.38} ${height * 0.88}, ${width * 0.22} ${height * 0.82}, ${width * 0.3} ${height * 0.72}
            C ${width * 0.4} ${height * 0.62}, ${width * 0.22} ${height * 0.55}, ${width * 0.28} ${height * 0.45}
            C ${width * 0.36} ${height * 0.38}, ${width * 0.2} ${height * 0.3}, ${width * 0.3} ${height * 0.22}
            C ${width * 0.4} ${height * 0.14}, ${width * 0.22} ${height * 0.08}, ${width * 0.28} 0
            Z
          `}
          fill="url(#land)"
        />

        {/* small island on the left */}
        <Path
          d={`
            M ${width * 0.05} ${height * 0.42}
            C ${width * 0.12} ${height * 0.38}, ${width * 0.18} ${height * 0.44}, ${width * 0.15} ${height * 0.5}
            C ${width * 0.1} ${height * 0.55}, ${width * 0.02} ${height * 0.5}, ${width * 0.05} ${height * 0.42}
            Z
          `}
          fill="url(#land)"
          opacity="0.85"
        />

        {/* tiny far island */}
        <Ellipse
          cx={width * 0.08}
          cy={height * 0.75}
          rx={width * 0.06}
          ry={height * 0.025}
          fill="url(#land)"
          opacity="0.7"
        />

        {/* subtle terrain contours (lighter strokes) */}
        <G stroke="rgba(232, 201, 116, 0.08)" strokeWidth="1" fill="none">
          <Path d={`M ${width * 0.35} ${height * 0.15} Q ${width * 0.5} ${height * 0.12} ${width * 0.7} ${height * 0.18}`} />
          <Path d={`M ${width * 0.4} ${height * 0.4} Q ${width * 0.6} ${height * 0.38} ${width * 0.85} ${height * 0.44}`} />
          <Path d={`M ${width * 0.38} ${height * 0.65} Q ${width * 0.55} ${height * 0.63} ${width * 0.8} ${height * 0.68}`} />
          <Path d={`M ${width * 0.45} ${height * 0.85} Q ${width * 0.6} ${height * 0.83} ${width * 0.82} ${height * 0.88}`} />
        </G>

        {/* ziggurat ruin top-right */}
        <G opacity="0.35" stroke="rgba(232, 201, 116, 0.5)" strokeWidth="1.5" fill="rgba(58, 42, 24, 0.8)">
          <Path
            d={`
              M ${width * 0.82} ${height * 0.18}
              L ${width * 0.9} ${height * 0.18}
              L ${width * 0.9} ${height * 0.2}
              L ${width * 0.92} ${height * 0.2}
              L ${width * 0.92} ${height * 0.22}
              L ${width * 0.94} ${height * 0.22}
              L ${width * 0.94} ${height * 0.25}
              L ${width * 0.78} ${height * 0.25}
              L ${width * 0.78} ${height * 0.22}
              L ${width * 0.8} ${height * 0.22}
              L ${width * 0.8} ${height * 0.2}
              L ${width * 0.82} ${height * 0.2}
              Z
            `}
          />
        </G>

        {/* greek temple silhouette mid-left coast */}
        <G opacity="0.4" stroke="rgba(232, 201, 116, 0.5)" strokeWidth="1" fill="rgba(58, 42, 24, 0.8)">
          <Path
            d={`
              M ${width * 0.22} ${height * 0.32}
              L ${width * 0.33} ${height * 0.32}
              L ${width * 0.28} ${height * 0.28}
              Z
            `}
          />
          <Rect
            x={width * 0.23}
            y={height * 0.32}
            width={width * 0.09}
            height={height * 0.025}
          />
          {/* columns */}
          <Path d={`M ${width * 0.24} ${height * 0.345} L ${width * 0.24} ${height * 0.37}`} strokeWidth="1.5" />
          <Path d={`M ${width * 0.265} ${height * 0.345} L ${width * 0.265} ${height * 0.37}`} strokeWidth="1.5" />
          <Path d={`M ${width * 0.29} ${height * 0.345} L ${width * 0.29} ${height * 0.37}`} strokeWidth="1.5" />
          <Path d={`M ${width * 0.315} ${height * 0.345} L ${width * 0.315} ${height * 0.37}`} strokeWidth="1.5" />
          <Rect x={width * 0.22} y={height * 0.37} width={width * 0.11} height={height * 0.01} />
        </G>

        {/* tiny sailing ship */}
        <G opacity="0.55" stroke="rgba(245, 232, 208, 0.7)" strokeWidth="1.2" fill="rgba(245, 232, 208, 0.1)">
          <Path d={`M ${width * 0.07} ${height * 0.6} L ${width * 0.13} ${height * 0.6} L ${width * 0.12} ${height * 0.615} L ${width * 0.08} ${height * 0.615} Z`} />
          <Path d={`M ${width * 0.1} ${height * 0.6} L ${width * 0.1} ${height * 0.56}`} />
          <Path d={`M ${width * 0.1} ${height * 0.58} L ${width * 0.13} ${height * 0.59} L ${width * 0.1} ${height * 0.6} Z`} fill="rgba(245, 232, 208, 0.2)" />
        </G>

        {/* scattered tree/forest dots */}
        <G fill="rgba(232, 201, 116, 0.15)">
          <Circle cx={width * 0.78} cy={height * 0.42} r="2" />
          <Circle cx={width * 0.82} cy={height * 0.45} r="1.5" />
          <Circle cx={width * 0.85} cy={height * 0.43} r="2" />
          <Circle cx={width * 0.88} cy={height * 0.47} r="1.5" />
          <Circle cx={width * 0.75} cy={height * 0.7} r="2" />
          <Circle cx={width * 0.79} cy={height * 0.72} r="1.5" />
          <Circle cx={width * 0.83} cy={height * 0.68} r="2" />
        </G>

        {/* wave marks in water */}
        <G stroke="rgba(232, 201, 116, 0.06)" strokeWidth="1" fill="none">
          <Path d={`M ${width * 0.03} ${height * 0.25} q 6 -3 12 0 t 12 0`} />
          <Path d={`M ${width * 0.04} ${height * 0.5} q 5 -3 10 0 t 10 0`} />
          <Path d={`M ${width * 0.02} ${height * 0.88} q 6 -3 12 0 t 12 0`} />
        </G>

        {/* vignette darkening */}
        <Rect x="0" y="0" width={width} height={height} fill="url(#vignette)" />
        <Rect x="0" y="0" width={width} height={height} fill="url(#fade)" />
      </Svg>
    </View>
  );
}
