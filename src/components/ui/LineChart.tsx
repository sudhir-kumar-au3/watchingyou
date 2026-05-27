export interface ChartPoint {
  x: number;
  y: number;
}

export interface ChartSeries {
  label: string;
  color: string;
  points: ChartPoint[];
}

interface LineChartProps {
  series: ChartSeries[];
  xLabel: string;
  yLabel: string;
}

const WIDTH = 600;
const HEIGHT = 340;
const PAD = { left: 56, right: 16, top: 16, bottom: 40 };

export const LineChart = ({ series, xLabel, yLabel }: LineChartProps) => {
  const allPoints = series.flatMap((s) => s.points);
  const maxX = Math.max(...allPoints.map((p) => p.x), 1);
  const maxY = Math.max(...allPoints.map((p) => p.y), 1);

  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const sx = (x: number): number => PAD.left + (x / maxX) * plotW;
  const sy = (y: number): number => PAD.top + plotH - (y / maxY) * plotH;

  const yTicks = Array.from({ length: 5 }, (_, i) => (maxY / 4) * i);
  const xTicks = Array.from(
    new Set(allPoints.map((p) => p.x))
  ).sort((a, b) => a - b);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full"
      role="img"
      aria-label={`${yLabel} versus ${xLabel}`}
    >
      {yTicks.map((tick) => (
        <g key={tick}>
          <line
            x1={PAD.left}
            y1={sy(tick)}
            x2={WIDTH - PAD.right}
            y2={sy(tick)}
            stroke="rgb(255 255 255 / 0.07)"
            strokeWidth={1}
          />
          <text
            x={PAD.left - 8}
            y={sy(tick) + 3}
            textAnchor="end"
            style={{ fontSize: 10, fill: '#8b93c7' }}
          >
            {Math.round(tick)}
          </text>
        </g>
      ))}

      {xTicks.map((tick) => (
        <text
          key={tick}
          x={sx(tick)}
          y={HEIGHT - PAD.bottom + 16}
          textAnchor="middle"
          style={{ fontSize: 10, fill: '#8b93c7' }}
        >
          {tick}
        </text>
      ))}

      <text
        x={PAD.left + plotW / 2}
        y={HEIGHT - 4}
        textAnchor="middle"
        style={{ fontSize: 11, fill: '#c7cdf0' }}
      >
        {xLabel}
      </text>
      <text
        transform={`translate(14 ${PAD.top + plotH / 2}) rotate(-90)`}
        textAnchor="middle"
        style={{ fontSize: 11, fill: '#c7cdf0' }}
      >
        {yLabel}
      </text>

      {series.map((s) => {
        const path = s.points
          .map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.x)} ${sy(p.y)}`)
          .join(' ');
        return (
          <g key={s.label}>
            <path
              d={path}
              fill="none"
              stroke={s.color}
              strokeWidth={2.2}
              strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 4px ${s.color}80)` }}
            />
            {s.points.map((p, i) => (
              <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={2.6} fill={s.color} />
            ))}
          </g>
        );
      })}
    </svg>
  );
};
