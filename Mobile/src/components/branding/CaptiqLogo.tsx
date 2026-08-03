import { useId } from 'react';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

type CaptiqLogoProps = {
  size?: number;
};

export function CaptiqLogo({ size = 128 }: CaptiqLogoProps) {
  const gradId = `captiqGrad${useId().replace(/:/g, '')}`;

  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      <Defs>
        <LinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#5B4CF0" />
          <Stop offset="100%" stopColor="#47A5FF" />
        </LinearGradient>
      </Defs>
      <Rect width="1024" height="1024" rx="220" fill={`url(#${gradId})`} />
      <Path
        d="M512 300C395.4 300 300 395.4 300 512C300 628.6 395.4 724 512 724C628.6 724 724 628.6 724 512"
        stroke="white"
        strokeWidth="80"
        strokeLinecap="round"
        fill="none"
        opacity={0.9}
      />
      <Circle cx="512" cy="512" r="90" fill="white" opacity={0.15} />
      <Circle cx="512" cy="512" r="70" fill="white" opacity={0.95} />
      <Circle
        cx="512"
        cy="512"
        r="120"
        stroke="white"
        strokeWidth="12"
        strokeDasharray="10 40"
        fill="none"
        opacity={0.4}
      />
    </Svg>
  );
}
