import { PixelRatio, useWindowDimensions } from 'react-native';

export default function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isSmall = width < 375;
  const fontScale = PixelRatio.getFontScale();

  const typography = {
    title: (isTablet ? 28 : isSmall ? 18 : 22) / fontScale,
    body: (isTablet ? 16 : isSmall ? 12 : 14) / fontScale,
    caption: (isTablet ? 14 : isSmall ? 10 : 12) / fontScale,
  };

  const spacing = {
    padding: isTablet ? 24 : isSmall ? 12 : 16,
    margin: isTablet ? 20 : isSmall ? 8 : 12,
    borderRadius: isTablet ? 16 : 12,
  };

  const chart = {
    width: width - (isTablet ? 64 : 32),
    height: isTablet ? 280 : 200,
  };

  const inputHeight = isTablet ? 56 : 48;

  return { width, height, isTablet, isSmall, fontScale, typography, spacing, chart, inputHeight };
}

