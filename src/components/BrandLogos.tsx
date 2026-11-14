import React from 'react';
import Svg, { Rect, Line, Circle, Path } from 'react-native-svg';

const GREEN = '#10B981';
const RED = '#EF4444';

interface LogoProps {
  size?: number;
}

/**
 * 1. Dashboard Screen Logo:
 * Dynamic dual candlesticks (Bullish Green & Bearish Red) with market pulse.
 */
export const DashboardBrandLogo: React.FC<LogoProps> = ({ size = 32 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      {/* Dark rounded badge */}
      <Rect width="40" height="40" rx="10" fill="#18181B" stroke="#27272A" strokeWidth="1.5" />
      
      {/* Green Bullish Candle */}
      <Line x1="14" y1="8" x2="14" y2="32" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" />
      <Rect x="10.5" y="14" width="7" height="13" rx="2" fill={GREEN} />

      {/* Red Bearish Candle */}
      <Line x1="26" y1="8" x2="26" y2="32" stroke={RED} strokeWidth="1.5" strokeLinecap="round" />
      <Rect x="22.5" y="11" width="7" height="11" rx="2" fill={RED} />
    </Svg>
  );
};

/**
 * 2. 12-Month Year View Logo:
 * Ascending 4-candle performance ladder (Green, Red, Green, Green).
 */
export const YearViewBrandLogo: React.FC<LogoProps> = ({ size = 32 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      {/* Dark rounded badge */}
      <Rect width="40" height="40" rx="10" fill="#18181B" stroke="#27272A" strokeWidth="1.5" />

      {/* Candle 1 (Green) */}
      <Line x1="10" y1="20" x2="10" y2="32" stroke={GREEN} strokeWidth="1" strokeLinecap="round" />
      <Rect x="8" y="23" width="4" height="6" rx="1" fill={GREEN} />

      {/* Candle 2 (Red) */}
      <Line x1="17" y1="16" x2="17" y2="28" stroke={RED} strokeWidth="1" strokeLinecap="round" />
      <Rect x="15" y="19" width="4" height="5" rx="1" fill={RED} />

      {/* Candle 3 (Green) */}
      <Line x1="24" y1="12" x2="24" y2="24" stroke={GREEN} strokeWidth="1" strokeLinecap="round" />
      <Rect x="22" y="14" width="4" height="6" rx="1" fill={GREEN} />

      {/* Candle 4 (Green Breakout) */}
      <Line x1="31" y1="8" x2="31" y2="20" stroke={GREEN} strokeWidth="1" strokeLinecap="round" />
      <Rect x="29" y="10" width="4" height="7" rx="1" fill={GREEN} />
    </Svg>
  );
};

/**
 * 3. Settings & Security Logo:
 * Red & Green candlesticks encased inside an on-device vault shield.
 */
export const SecurityBrandLogo: React.FC<LogoProps> = ({ size = 32 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      {/* Dark rounded badge */}
      <Rect width="40" height="40" rx="10" fill="#18181B" stroke="#27272A" strokeWidth="1.5" />

      {/* Vault Shield contour */}
      <Path
        d="M20 7L29 10.5V18C29 24 25.1 29.5 20 32C14.9 29.5 11 24 11 18V10.5L20 7Z"
        fill="#141416"
        stroke="#3F3F46"
        strokeWidth="1.2"
      />

      {/* Green Candle Inside Shield */}
      <Line x1="17" y1="13" x2="17" y2="25" stroke={GREEN} strokeWidth="1" strokeLinecap="round" />
      <Rect x="15" y="16" width="4" height="6" rx="1" fill={GREEN} />

      {/* Red Candle Inside Shield */}
      <Line x1="23" y1="13" x2="23" y2="25" stroke={RED} strokeWidth="1" strokeLinecap="round" />
      <Rect x="21" y="15" width="4" height="5" rx="1" fill={RED} />
    </Svg>
  );
};

/**
 * 4. Lock Screen Hero Logo:
 * Biometric reticle surrounding the prominent Red & Green candlesticks.
 */
export const LockScreenHeroLogo: React.FC<LogoProps> = ({ size = 68 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 68 68" fill="none">
      {/* Dark elevated squircle */}
      <Rect width="68" height="68" rx="18" fill="#18181B" stroke="#2E2E34" strokeWidth="2" />

      {/* Biometric reticle arcs */}
      <Circle cx="34" cy="34" r="26" stroke="#27272A" strokeWidth="1.5" strokeDasharray="6 4" />
      <Circle cx="34" cy="34" r="21" stroke="#323238" strokeWidth="1" strokeDasharray="3 3" />

      {/* Bullish Green Candle */}
      <Line x1="26" y1="16" x2="26" y2="52" stroke={GREEN} strokeWidth="2" strokeLinecap="round" />
      <Rect x="20.5" y="24" width="11" height="20" rx="3" fill={GREEN} />

      {/* Bearish Red Candle */}
      <Line x1="42" y1="16" x2="42" y2="52" stroke={RED} strokeWidth="2" strokeLinecap="round" />
      <Rect x="36.5" y="20" width="11" height="18" rx="3" fill={RED} />
    </Svg>
  );
};

/**
 * 5. Backup & 2:00 AM Auto-Refetch Logo:
 * Dual-orbit synchronizing arrows encircling the candlesticks.
 */
export const BackupBrandLogo: React.FC<LogoProps> = ({ size = 36 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      {/* Dark rounded badge */}
      <Rect width="44" height="44" rx="12" fill="#18181B" stroke="#27272A" strokeWidth="1.5" />

      {/* Orbit sync circle: Top half Green, Bottom half Red */}
      <Path
        d="M22 8C28.6 8 34 13.4 34 20"
        stroke={GREEN}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Path
        d="M22 36C15.4 36 10 30.6 10 24"
        stroke={RED}
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Candlesticks in center */}
      <Line x1="18" y1="14" x2="18" y2="30" stroke={GREEN} strokeWidth="1.2" strokeLinecap="round" />
      <Rect x="15.5" y="19" width="5" height="7" rx="1.5" fill={GREEN} />

      <Line x1="26" y1="14" x2="26" y2="30" stroke={RED} strokeWidth="1.2" strokeLinecap="round" />
      <Rect x="23.5" y="17" width="5" height="6" rx="1.5" fill={RED} />
    </Svg>
  );
};
