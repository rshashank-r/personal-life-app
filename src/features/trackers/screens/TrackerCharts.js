import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors, typography } from '../../../core/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SimpleLineChart = ({ data, height = 150, color = colors.accent }) => {
    if (!data || data.length === 0) {
        return (
            <View style={[styles.chartContainer, { height }]}>
                <Text style={styles.noData}>No data yet</Text>
            </View>
        );
    }

    const chartWidth = SCREEN_WIDTH - 64;
    const padding = 20;
    const maxVal = Math.max(...data.map((d) => Number(d.value || 0)), 1);
    const points = data.map((d, i) => {
        const x = padding + (i / Math.max(data.length - 1, 1)) * (chartWidth - padding * 2);
        const y = height - padding - ((Number(d.value || 0) / maxVal) * (height - padding * 2));
        return { x, y };
    });
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPathD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
        <View style={[styles.chartContainer, { height }]}>
            <Svg width={chartWidth} height={height}>
                <Path d={areaPathD} fill={`${color}15`} />
                <Path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                {points.map((p, i) => <Circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />)}
            </Svg>
        </View>
    );
};

export const SimpleBarChart = ({ data, height = 150, color = colors.accent }) => {
    if (!data || data.length === 0) {
        return (
            <View style={[styles.chartContainer, { height }]}>
                <Text style={styles.noData}>No data yet</Text>
            </View>
        );
    }

    const chartWidth = SCREEN_WIDTH - 64;
    const padding = 20;
    const maxVal = Math.max(...data.map((d) => Number(d.value || 0)), 1);
    const barWidth = Math.min((chartWidth - padding * 2) / data.length - 4, 30);

    return (
        <View style={[styles.chartContainer, { height }]}>
            <Svg width={chartWidth} height={height}>
                {data.map((d, i) => {
                    const barHeight = (Number(d.value || 0) / maxVal) * (height - padding * 2);
                    const x = padding + (i * (chartWidth - padding * 2)) / data.length + 2;
                    const y = height - padding - barHeight;
                    return <Rect key={i} x={x} y={y} width={barWidth} height={barHeight} rx={4} fill={Number(d.value || 0) > 0 ? color : `${color}30`} />;
                })}
            </Svg>
            <View style={styles.barLabels}>
                {data.map((d, i) => (
                    <Text key={i} style={styles.barLabel}>{d.label || ''}</Text>
                ))}
            </View>
        </View>
    );
};

const TrackerCharts = ({ data, type }) => {
    if (type === 'numeric') return <SimpleLineChart data={data} />;
    return <SimpleBarChart data={data} />;
};

const styles = StyleSheet.create({
    chartContainer: { alignItems: 'center', justifyContent: 'center' },
    noData: { ...typography.caption, color: colors.textMuted },
    barLabels: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingHorizontal: 20 },
    barLabel: { ...typography.caption, color: colors.textMuted, fontSize: 9 },
});

export default TrackerCharts;
