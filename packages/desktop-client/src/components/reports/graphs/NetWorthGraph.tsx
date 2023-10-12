import React from 'react';

import { css } from 'glamor';
import {
  ComposedChart,
  Line,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { theme } from '../../../style';
import { type CSSProperties } from '../../../style';
import AlignedText from '../../common/AlignedText';
import Container from '../Container';

type NetWorthGraphProps = {
  style?: CSSProperties;
  graphData;
  compact: boolean;
};
type PotentialNumber = number | string | undefined | null;

const numberFormatterTooltip = (value: PotentialNumber): number | null => {
  if (typeof value === 'number') {
    return Math.round(value);
  }
  return null; // or some default value for other cases
};

function NetWorthGraph({ style, graphData, compact }: NetWorthGraphProps) {
  const tickFormatter = tick => {
    return `${Math.round(tick).toLocaleString()}`; // Formats the tick values as strings with commas
  };

  const gradientOffset = () => {
    const dataMax = Math.max(...graphData.data.map(i => i.y));
    const dataMin = Math.min(...graphData.data.map(i => i.y));

    if (dataMax <= 0) {
      return 0;
    }
    if (dataMin >= 0) {
      return 1;
    }

    return dataMax / (dataMax - dataMin);
  };

  const off = gradientOffset();

  type PayloadItem = {
    payload: {
      date: string;
      assets: number | string;
      debt: number | string;
      networth: number | string;
      change: number | string;
    };
  };

  type CustomTooltipProps = {
    active?: boolean;
    payload?: PayloadItem[];
    label?: string;
  };

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`${css(
            {
              zIndex: 1000,
              pointerEvents: 'none',
              borderRadius: 2,
              boxShadow: '0 1px 6px rgba(0, 0, 0, .20)',
              backgroundColor: theme.alt2MenuBackground,
              color: theme.alt2MenuItemText,
              padding: 10,
            },
            style,
          )}`}
        >
          <div>
            <div style={{ marginBottom: 10 }}>
              <strong>{payload[0].payload.date}</strong>
            </div>
            <div style={{ lineHeight: 1.5 }}>
              <AlignedText left="Assets:" right={payload[0].payload.assets} />
              <AlignedText left="Debt:" right={payload[0].payload.debt} />
              <AlignedText
                left="Net worth:"
                right={<strong>{payload[0].payload.networth}</strong>}
              />
              <AlignedText left="Change:" right={payload[0].payload.change} />
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <Container
      style={{
        ...style,
        ...(compact && { height: 'auto' }),
      }}
    >
      {(width, height, portalHost) =>
        graphData && (
          <ResponsiveContainer>
            <div>
              {!compact && <div style={{ marginTop: '15px' }} />}
              <ComposedChart
                width={width}
                height={height}
                data={graphData.data}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                barCategoryGap={10}
              >
                {compact ? null : (
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                )}
                {compact ? null : <XAxis dataKey="x" />}
                {compact ? null : (
                  <YAxis
                    // dataKey="assets"
                    // domain={[graphData.data.minVal, graphData.data.maxVal]}
                    domain={['auto', 'auto']}
                    tickFormatter={tickFormatter}
                    allowDataOverflow={true}
                  />
                )}
                <Tooltip
                  content={<CustomTooltip />}
                  formatter={numberFormatterTooltip}
                  isAnimationActive={false}
                />
                <defs>
                  <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset={off}
                      stopColor={theme.reportsBlue}
                      stopOpacity={0.5}
                    />
                    <stop
                      offset={off}
                      stopColor={theme.reportsRed}
                      stopOpacity={0.8}
                    />
                  </linearGradient>
                </defs>

                <Line
                  type="linear"
                  dot={false}
                  activeDot={false}
                  isAnimationActive={false}
                  dataKey="y"
                  stroke="url(#splitColor)"
                  strokeWidth={3}
                  fillOpacity={1}
                />
                {compact ? null : (
                  <Bar
                    dataKey="debt"
                    barSize={20}
                    fill={theme.reportsRed}
                    isAnimationActive={false}
                    fillOpacity={0.6}
                  />
                )}
                {compact ? null : (
                  <Bar
                    dataKey="assets"
                    barSize={20}
                    fill={theme.reportsBlue}
                    isAnimationActive={false}
                    fillOpacity={0.6}
                  />
                )}
              </ComposedChart>
            </div>
          </ResponsiveContainer>
        )
      }
    </Container>
  );
}

export default NetWorthGraph;
