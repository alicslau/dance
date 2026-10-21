import { useState } from 'react';
import { Button, Segmented, Slider, Tag, Toast } from 'antd-mobile';
import { api, MatchResult, Person } from '@/services/api';
import { GENDER_LABEL, DANCE_STYLES, REGIONS } from '@/constants';
import FilterSelector from '@/components/FilterSelector';

function PersonBox({ p }: { p: Person }) {
  return (
    <div className="person-box">
      <div className="person-box-name">{p.name}</div>
      <div className="person-box-meta">
        {GENDER_LABEL[p.gender]}
        {p.age ? ` · ${p.age}岁` : ''}
      </div>
      <div className="person-box-meta">
        {p.dance_styles?.slice(0, 3).join(' / ') || ''}
      </div>
    </div>
  );
}

function csvCell(s: any): string {
  const str = s === null || s === undefined ? '' : String(s);
  return '"' + str.replace(/"/g, '""') + '"';
}

function exportCSV(result: MatchResult) {
  const lines: string[] = [];
  const header = [
    '序号', '姓名A', '性别A', '年龄A', '地区A', '舞种A',
    '姓名B', '性别B', '年龄B', '地区B', '舞种B', '匹配度', '匹配理由',
  ];
  lines.push('﻿' + header.map(csvCell).join(','));

  result.pairs.forEach((pr, i) => {
    const a = pr.person_a;
    const b = pr.person_b;
    lines.push(
      [
        i + 1,
        a.name, GENDER_LABEL[a.gender] || a.gender, a.age ?? '', a.region ?? '', a.dance_styles?.join('/') ?? '',
        b.name, GENDER_LABEL[b.gender] || b.gender, b.age ?? '', b.region ?? '', b.dance_styles?.join('/') ?? '',
        Math.round(pr.score * 100) + '%', pr.reasons.join('；'),
      ].map(csvCell).join(','),
    );
  });

  result.unmatched.forEach((p) => {
    lines.push(
      [
        '未匹配', p.name, GENDER_LABEL[p.gender] || p.gender, p.age ?? '', p.region ?? '',
        p.dance_styles?.join('/') ?? '', '', '', '', '', '', '',
      ].map(csvCell).join(','),
    );
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `匹配结果_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function MatchPage() {
  const [mode, setMode] = useState('opposite');
  const [algorithm, setAlgorithm] = useState('optimal');
  const [minScore, setMinScore] = useState(0);
  const [danceFilter, setDanceFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const hasFilter = danceFilter !== '' || regionFilter !== '';

  const run = async () => {
    setLoading(true);
    try {
      const r = await api.match({
        gender_mode: mode,
        algorithm,
        min_score: minScore,
        filters: {
          dance_style: danceFilter || null,
          region: regionFilter || null,
          gender: null,
        },
      });
      setResult(r);
      if (r.pairs.length === 0) {
        Toast.show('暂无可匹配的组合，请先登记或调整筛选');
      }
    } catch {
      Toast.show({ icon: 'fail', content: '匹配失败' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <span className="page-title">舞伴匹配</span>
      </div>

      <div className="form-block">
        <div className="form-label">匹配规则</div>
        <Segmented
          block
          options={[
            { label: '异性优先', value: 'opposite' },
            { label: '不限性别', value: 'any' },
          ]}
          value={mode}
          onChange={(v) => setMode(v as string)}
        />
      </div>

      <div className="form-block">
        <div className="form-label">匹配算法</div>
        <Segmented
          block
          options={[
            { label: '最优匹配（匈牙利）', value: 'optimal' },
            { label: '贪心', value: 'greedy' },
          ]}
          value={algorithm}
          onChange={(v) => setAlgorithm(v as string)}
        />
      </div>

      <div className="form-block">
        <div className="form-label">最低匹配分：{minScore.toFixed(2)}</div>
        <Slider min={0} max={0.8} step={0.05} value={minScore} onChange={(v) => setMinScore(v as number)} />
        <div className="form-hint">低于此分的组合不配对（0 表示不限）</div>
      </div>

      <div className="form-block">
        <div className="form-label">筛选参与匹配的人</div>
        <FilterSelector label="舞种" options={DANCE_STYLES.map((s) => ({ label: s, value: s }))} value={danceFilter} onChange={setDanceFilter} />
        <FilterSelector label="地区" options={REGIONS.map((s) => ({ label: s, value: s }))} value={regionFilter} onChange={setRegionFilter} />
        {hasFilter && (
          <Button
            size="small"
            fill="none"
            onClick={() => {
              setDanceFilter('');
              setRegionFilter('');
            }}
          >
            清除筛选
          </Button>
        )}
      </div>

      <Button block color="primary" size="large" loading={loading} onClick={run}>
        开始匹配
      </Button>

      {result && (
        <>
          <div className="match-summary">
            共 {result.pairs.length} 对匹配成功
            {result.unmatched.length > 0 ? `，${result.unmatched.length} 人未匹配` : ''}
          </div>

          <Button block fill="outline" size="middle" onClick={() => exportCSV(result)}>
            导出结果 CSV
          </Button>

          <div style={{ height: 12 }} />

          {result.pairs.map((pr, idx) => (
            <div className="match-card" key={idx}>
              <div className="match-pair">
                <PersonBox p={pr.person_a} />
                <div className="match-score">{Math.round(pr.score * 100)}%</div>
                <PersonBox p={pr.person_b} />
              </div>
              <div className="match-reasons">
                {pr.reasons.map((r) => (
                  <Tag key={r} fill="outline" color="primary">
                    {r}
                  </Tag>
                ))}
              </div>
            </div>
          ))}

          {result.unmatched.length > 0 && (
            <div className="unmatched">
              <div className="viz-title">未匹配</div>
              {result.unmatched.map((p) => (
                <div className="unmatched-item" key={p.id}>
                  {p.name}（{GENDER_LABEL[p.gender]}）
                  {p.dance_styles?.length ? ' · ' + p.dance_styles.join('/') : ''}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!result && (
        <div className="empty">
          <p>点击「开始匹配」，系统将按舞种、性别、地区、年龄、爱好、MBTI、星座综合打分并两两配对</p>
        </div>
      )}
    </div>
  );
}
