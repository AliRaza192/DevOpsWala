import React from 'react';

const stats = [
  {value: '19', label: 'Phases'},
  {value: '95', label: 'Incident Scenarios'},
  {value: '100%', label: 'Free'},
  {value: 'Roman Urdu', label: 'Language'},
];

export default function StatsBar(): React.JSX.Element {
  return (
    <div className="stats-bar">
      <div className="max-w-[1140px] mx-auto flex flex-wrap justify-center">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="stat-item flex-1 min-w-[140px] py-5 px-4 text-center"
            style={{
              borderRight: i < stats.length - 1 ? '1px solid hsl(var(--border))' : undefined,
            }}>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
