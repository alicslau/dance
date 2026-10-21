export interface BarItem {
  label: string;
  value: number;
}

const MAX_SERIES = 8;

export default function BarList({
  title,
  data,
  unit,
}: {
  title: string;
  data: BarItem[];
  unit?: string;
}) {
  const items = data.filter((d) => d.value > 0);
  if (items.length === 0) {
    return (
      <div className="viz-card">
        <div className="viz-title">{title}</div>
        <div className="viz-empty">暂无数据</div>
      </div>
    );
  }
  const max = Math.max(...items.map((d) => d.value), 1);
  return (
    <div className="viz-card">
      <div className="viz-title">{title}</div>
      <div className="viz-bars">
        {items.slice(0, MAX_SERIES).map((d, i) => (
          <div className="viz-row" key={d.label}>
            <span className="viz-label">{d.label}</span>
            <div className="viz-track">
              <div
                className="viz-bar"
                style={{
                  width: `${Math.round((d.value / max) * 100)}%`,
                  background: `var(--viz-series-${i + 1})`,
                }}
              />
            </div>
            <span className="viz-value">
              {d.value}
              {unit ?? ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
