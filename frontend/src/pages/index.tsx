import { useEffect, useState } from 'react';
import { Button, Toast } from 'antd-mobile';
import { api, Stats } from '@/services/api';
import BarList, { BarItem } from '@/components/BarList';
import { GENDER_LABEL } from '@/constants';

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  const load = async () => {
    try {
      setStats(await api.getStats());
    } catch {
      Toast.show({ icon: 'fail', content: '加载失败' });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toBars = (obj?: Record<string, number>): BarItem[] =>
    Object.entries(obj ?? {}).map(([k, v]) => ({ label: k, value: v }));

  const genderBars = toBars(stats?.gender).map((b) => ({
    ...b,
    label: GENDER_LABEL[b.label] || b.label,
  }));

  return (
    <div className="page">
      <div className="page-header">
        <span className="page-title">数据统计</span>
        <Button size="small" fill="outline" onClick={load}>
          刷新
        </Button>
      </div>

      <div className="viz-card hero">
        <div className="viz-hero-label">已登记人数</div>
        <div className="viz-hero-value">{stats ? stats.total : '—'}</div>
      </div>

      <BarList title="性别分布" data={genderBars} unit=" 人" />
      <BarList title="舞种分布" data={toBars(stats?.dance_styles)} unit=" 人" />
      <BarList title="地区分布" data={toBars(stats?.regions)} unit=" 人" />
      <BarList title="MBTI 分布" data={toBars(stats?.mbti)} unit=" 人" />
      <BarList title="星座分布" data={toBars(stats?.zodiac)} unit=" 人" />
    </div>
  );
}
