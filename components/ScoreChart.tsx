"use client";

interface ScoreChartProps {
  scores: number[];
}

const TARGET = 8.5;

export default function ScoreChart({ scores }: ScoreChartProps) {
  if (scores.length === 0) return null;

  const max = 10;
  const chartHeight = 120;
  const padding = { top: 16, right: 16, bottom: 32, left: 40 };

  const width = 100; // percentage-based
  const barWidth = scores.length === 1 ? 40 : Math.min(40, (100 - padding.left - padding.right) / scores.length - 8);

  return (
    <div className="w-full">
      <div className="relative" style={{ height: chartHeight + padding.top + padding.bottom }}>
        {/* Y-axis labels */}
        {[0, 2.5, 5, 7.5, 10].map((val) => {
          const y = padding.top + ((max - val) / max) * chartHeight;
          return (
            <div
              key={val}
              className="absolute left-0 text-xs text-neutral-600 w-8 text-right"
              style={{ top: y - 8 }}
            >
              {val}
            </div>
          );
        })}

        {/* Grid lines */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ paddingLeft: padding.left, paddingTop: padding.top, paddingBottom: padding.bottom, paddingRight: padding.right }}
          viewBox={`0 0 ${400} ${chartHeight + padding.top + padding.bottom}`}
          preserveAspectRatio="none"
        >
          {/* Horizontal grid lines */}
          {[0, 2.5, 5, 7.5, 10].map((val) => {
            const y = padding.top + ((max - val) / max) * chartHeight;
            return (
              <line
                key={val}
                x1={padding.left}
                y1={y}
                x2={400 - padding.right}
                y2={y}
                stroke={val === 0 ? "#404040" : "#262626"}
                strokeWidth={1}
              />
            );
          })}

          {/* Target line */}
          <line
            x1={padding.left}
            y1={padding.top + ((max - TARGET) / max) * chartHeight}
            x2={400 - padding.right}
            y2={padding.top + ((max - TARGET) / max) * chartHeight}
            stroke="#f59e0b"
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.5}
          />

          {/* Target label */}
          <text
            x={400 - padding.right + 4}
            y={padding.top + ((max - TARGET) / max) * chartHeight + 4}
            fontSize={9}
            fill="#f59e0b"
            opacity={0.7}
          >
            {TARGET}
          </text>

          {/* Bars */}
          {scores.map((score, i) => {
            const barAreaWidth = 400 - padding.left - padding.right;
            const segment = barAreaWidth / scores.length;
            const x = padding.left + i * segment + segment / 2 - 15;
            const barH = (score / max) * chartHeight;
            const y = padding.top + chartHeight - barH;
            const isFinal = i === scores.length - 1;

            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={30}
                  height={barH}
                  rx={3}
                  fill={isFinal ? "#f59e0b" : "#d97706"}
                  opacity={isFinal ? 1 : 0.5 + (i / scores.length) * 0.5}
                />
                {/* Score label above bar */}
                <text
                  x={x + 15}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize={10}
                  fill={isFinal ? "#fbbf24" : "#a3a3a3"}
                  fontWeight={isFinal ? "bold" : "normal"}
                >
                  {score.toFixed(1)}
                </text>
                {/* Iteration label below */}
                <text
                  x={x + 15}
                  y={padding.top + chartHeight + 20}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#737373"
                >
                  {i === 0 ? "Orig" : `Iter ${i}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
