import { Selector } from 'antd-mobile';

const ALL = '__all__';

export interface FilterOption {
  label: string;
  value: string;
}

/** 单选筛选器，带「不限」项；value 为空字符串表示不限。 */
export default function FilterSelector({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  const opts = [{ label: '不限', value: ALL }, ...options];
  return (
    <div className="filter-item">
      <div className="filter-label">{label}</div>
      <Selector
        columns={3}
        options={opts}
        value={value === '' ? [ALL] : [value]}
        onChange={(v) => onChange(v[0] === ALL ? '' : (v[0] ?? ''))}
      />
    </div>
  );
}
