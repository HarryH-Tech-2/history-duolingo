import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { colors, fonts } from '../theme';

export function Flame({ size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFD27A" />
          <Stop offset="0.5" stopColor="#F28A3B" />
          <Stop offset="1" stopColor="#B94418" />
        </LinearGradient>
      </Defs>
      <Path
        d="M12 2 Q8 7 9 12 Q6 11 5 14 Q4 18 8 21 Q10 22 12 22 Q14 22 16 21 Q20 18 19 14 Q18 11 15 12 Q16 7 12 2 Z"
        fill="url(#fg)"
      />
      <Path
        d="M12 10 Q10 13 11 16 Q9 16 9 18 Q10 20 12 20 Q14 20 15 18 Q15 16 13 16 Q14 13 12 10 Z"
        fill="#FFD876"
        opacity="0.8"
      />
    </Svg>
  );
}

export function Gem({ size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="gg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#7EE8A5" />
          <Stop offset="0.5" stopColor="#3FBD6A" />
          <Stop offset="1" stopColor="#1F6A3C" />
        </LinearGradient>
      </Defs>
      <Path
        d="M7 4 L17 4 L21 10 L12 21 L3 10 Z"
        fill="url(#gg)"
        stroke="#1F6A3C"
        strokeWidth="1"
      />
      <Path d="M7 4 L12 10 L17 4" fill="none" stroke="#1F6A3C" strokeWidth="1" />
      <Path d="M3 10 L12 10 L21 10" fill="none" stroke="#1F6A3C" strokeWidth="1" />
      <Path d="M12 10 L12 21" fill="none" stroke="#1F6A3C" strokeWidth="0.8" />
      <Path d="M8 6 L6 9" stroke="#B8F5CF" strokeWidth="1" opacity="0.7" />
    </Svg>
  );
}

export function Heart({ size = 20, filled = true }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FF7A8E" />
          <Stop offset="1" stopColor="#C83049" />
        </LinearGradient>
      </Defs>
      <Path
        d="M12 21 Q3 14 3 8 Q3 4 7 4 Q10 4 12 7 Q14 4 17 4 Q21 4 21 8 Q21 14 12 21 Z"
        fill={filled ? 'url(#hg)' : 'transparent'}
        stroke="#8B1E2E"
        strokeWidth="1.5"
      />
    </Svg>
  );
}

export function StatPill({ icon, value, style }) {
  return (
    <View style={[styles.pill, style]}>
      {icon}
      <Text style={styles.pillText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(11, 15, 28, 0.65)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillText: {
    color: colors.textPrimary,
    fontFamily: fonts.serifBold,
    fontSize: 15,
    marginLeft: 4,
  },
});
