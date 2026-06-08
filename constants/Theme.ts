export const COLORS = {
  background: '#0A0E1A',
  card: '#131929',
  accent: '#00BCD4',
  danger: '#FF3B5C',
  success: '#22C55E',
  warning: '#F97316',
  text: '#F8FAFC',
  textMuted: '#64748B',
  border: '#1E293B',
};

export const chartConfig = {
  backgroundColor: COLORS.card,
  backgroundGradientFrom: COLORS.card,
  backgroundGradientTo: COLORS.card,
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(0, 188, 212, ${opacity})`,
  labelColor: () => COLORS.textMuted,
  propsForBackgroundLines: {
    stroke: COLORS.border,
    strokeWidth: 1,
  },
  propsForLabels: {
    fontSize: 10,
  },
};
