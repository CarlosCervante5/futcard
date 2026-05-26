import React from 'react';

const RadarChart = ({ skills }) => {
  const size = 200;
  const center = size / 2;
  const maxRadius = 70;

  // Order of axes: Ritmo, Tiro, Pase, Regate, Defensa, Físico
  const keys = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'];
  const labels = ['RIT', 'TIR', 'PAS', 'REG', 'DEF', 'FIS'];

  // Calculate coordinates for a specific key, value and radius
  const getCoordinates = (index, value, maxVal = 100) => {
    const angle = (index * 2 * Math.PI) / 6 - Math.PI / 2;
    const r = (value / maxVal) * maxRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Generate the coordinates for standard grid levels (33%, 66%, 100%)
  const getGridPoints = (levelRatio) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const coord = getCoordinates(i, levelRatio * 100);
      points.push(`${coord.x},${coord.y}`);
    }
    return points.join(' ');
  };

  // Generate points string for the actual skills data
  const dataPoints = keys.map((key, index) => {
    // Standardize skill: defaults to 50 if missing, clamps between 0-99
    const val = skills[key] ? skills[key].value : 50;
    return getCoordinates(index, val);
  });

  const polygonPointsStr = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="radar-chart-container">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="radar-chart-svg"
      >
        {/* Concentric grid lines (Hexagons) */}
        {[0.33, 0.66, 1.0].map((ratio, idx) => (
          <polygon
            key={idx}
            points={getGridPoints(ratio)}
            className="radar-grid-line"
            fill="none"
          />
        ))}

        {/* Axis Lines from Center to Hexagon Corners */}
        {keys.map((_, index) => {
          const outerCoord = getCoordinates(index, 100);
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={outerCoord.x}
              y2={outerCoord.y}
              className="radar-axis-line"
            />
          );
        })}

        {/* Filled Dynamic Data Area */}
        <polygon
          points={polygonPointsStr}
          className="radar-polygon-base"
        />

        {/* Data Vertices (Dots) */}
        {dataPoints.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            className="radar-polygon-dot"
          />
        ))}

        {/* Labels at Hexagon Corners */}
        {labels.map((label, index) => {
          const angle = (index * 2 * Math.PI) / 6 - Math.PI / 2;
          // Offset label slightly outside max radius
          const offsetRadius = maxRadius + 18;
          const x = center + offsetRadius * Math.cos(angle);
          const y = center + offsetRadius * Math.sin(angle);
          
          // Small vertical adjustment for readability
          const dy = angle === -Math.PI / 2 ? -2 : angle === Math.PI / 2 ? 8 : 3;

          // Display the score value along with the label
          const skillKey = keys[index];
          const skillVal = skills[skillKey] ? skills[skillKey].value : 50;

          return (
            <text
              key={index}
              x={x}
              y={y + dy}
              className="radar-label"
            >
              {label} <tspan fill="#fff" fontWeight="800">{skillVal}</tspan>
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default RadarChart;
