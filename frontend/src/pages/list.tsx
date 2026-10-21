import { useEffect, useMemo, useState } from 'react';
import { Button, Tag, Toast, Dialog } from 'antd-mobile';
import { useNavigate } from 'umi';
import { api, Person } from '@/services/api';
import { GENDER_LABEL, GENDER_OPTIONS, DANCE_STYLES, REGIONS } from '@/constants';
import FilterSelector from '@/components/FilterSelector';

const GENDER_COLOR: Record<string, string> = {
  male: 'primary',
  female: 'danger',
  other: 'default',
};

export default function ListPage() {
  const navigate = useNavigate();
  const [persons, setPersons] = useState<Person[]>([]);
  const [danceFilter, setDanceFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');

  const load = async () => {
    try {
      setPersons(await api.listPersons());
    } catch {
      Toast.show({ icon: 'fail', content: '加载失败' });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return persons.filter((p) => {
      if (genderFilter && p.gender !== genderFilter) return false;
      if (regionFilter && p.region !== regionFilter) return false;
      if (danceFilter && !(p.dance_styles || []).includes(danceFilter)) return false;
      return true;
    });
  }, [persons, genderFilter, regionFilter, danceFilter]);

  const hasFilter = danceFilter !== '' || regionFilter !== '' || genderFilter !== '';

  const remove = async (p: Person) => {
    const ok = await Dialog.confirm({ content: `确定删除「${p.name}」吗？` });
    if (!ok) return;
    await api.deletePerson(p.id);
    Toast.show({ icon: 'success', content: '已删除' });
    load();
  };

  const seed = async () => {
    const r = await api.seed();
    Toast.show({ icon: 'success', content: r.seeded ? `已填充 ${r.count} 条示例` : '已有数据，无需填充' });
    load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <span className="page-title">
          人员列表（{filtered.length}
          {hasFilter ? `/${persons.length}` : ''}）
        </span>
        <Button size="small" fill="outline" onClick={load}>
          刷新
        </Button>
      </div>

      <div className="form-block">
        <div className="form-label">筛选</div>
        <FilterSelector label="性别" options={GENDER_OPTIONS} value={genderFilter} onChange={setGenderFilter} />
        <FilterSelector label="舞种" options={DANCE_STYLES.map((s) => ({ label: s, value: s }))} value={danceFilter} onChange={setDanceFilter} />
        <FilterSelector label="地区" options={REGIONS.map((s) => ({ label: s, value: s }))} value={regionFilter} onChange={setRegionFilter} />
      </div>

      {persons.length === 0 && (
        <div className="empty">
          <p>还没有登记信息</p>
          <Button block color="primary" onClick={() => navigate('/register')}>
            去登记
          </Button>
          <Button block fill="outline" onClick={seed}>
            填充示例数据
          </Button>
        </div>
      )}

      {persons.length > 0 && filtered.length === 0 && (
        <div className="empty">
          <p>没有符合筛选条件的人</p>
        </div>
      )}

      {filtered.map((p) => (
        <div className="person-card" key={p.id}>
          <div className="person-top">
            <span className="person-name">{p.name}</span>
            <Tag color={GENDER_COLOR[p.gender]}>{GENDER_LABEL[p.gender]}</Tag>
            <span className="person-meta">
              {p.age ? `${p.age}岁` : ''}
              {p.region ? ` · ${p.region}` : ''}
            </span>
            <span className="person-del" onClick={() => remove(p)}>
              删除
            </span>
          </div>
          {p.dance_styles?.length > 0 && (
            <div className="person-tags">
              {p.dance_styles.map((s) => (
                <Tag key={s} fill="outline">
                  {s}
                </Tag>
              ))}
            </div>
          )}
          {(p.mbti || p.zodiac) && (
            <div className="person-meta">
              MBTI {p.mbti || '—'} · {p.zodiac || '—'}
            </div>
          )}
          {p.student_id && <div className="person-meta">学号 {p.student_id}</div>}
        </div>
      ))}
    </div>
  );
}
