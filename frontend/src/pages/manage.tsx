import { useEffect, useState } from 'react';
import { Button, Input, Selector, TextArea, Toast, Dialog } from 'antd-mobile';
import { api, Person } from '@/services/api';
import { GENDER_OPTIONS, GENDER_LABEL, DANCE_STYLES, ZODIACS, MBTIS, REGIONS } from '@/constants';

/** 管理页：清空所有人员信息 + 修改个人人员信息。 */
export default function ManagePage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [editing, setEditing] = useState<Person | null>(null);

  // 编辑表单字段
  const [name, setName] = useState('');
  const [gender, setGender] = useState<string | null>(null);
  const [age, setAge] = useState('');
  const [studentId, setStudentId] = useState('');
  const [region, setRegion] = useState<string | null>(null);
  const [danceStyles, setDanceStyles] = useState<string[]>([]);
  const [hobbies, setHobbies] = useState('');
  const [zodiac, setZodiac] = useState<string | null>(null);
  const [mbti, setMbti] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const startEdit = (p: Person) => {
    setEditing(p);
    setName(p.name);
    setGender(p.gender);
    setAge(p.age != null ? String(p.age) : '');
    setStudentId(p.student_id || '');
    setRegion(p.region || null);
    setDanceStyles(p.dance_styles || []);
    setHobbies((p.hobbies || []).join('，'));
    setZodiac(p.zodiac || null);
    setMbti(p.mbti || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => setEditing(null);

  const submit = async () => {
    if (!editing) return;
    if (!name.trim()) {
      Toast.show('请填写姓名');
      return;
    }
    if (!studentId.trim()) {
      Toast.show('请填写学号');
      return;
    }
    if (!gender) {
      Toast.show('请选择性别');
      return;
    }
    setSubmitting(true);
    try {
      await api.updatePerson(editing.id, {
        name: name.trim(),
        gender,
        age: age ? parseInt(age, 10) : null,
        student_id: studentId.trim() || null,
        region,
        dance_styles: danceStyles,
        hobbies: hobbies
          .split(/[,，、\s]+/)
          .map((s) => s.trim())
          .filter(Boolean),
        zodiac,
        mbti,
      });
      Toast.show({ icon: 'success', content: '已保存修改' });
      setEditing(null);
      load();
    } catch (e: any) {
      Toast.show({ icon: 'fail', content: e?.response?.data?.detail || '保存失败' });
    } finally {
      setSubmitting(false);
    }
  };

  const clearAll = async () => {
    const ok = await Dialog.confirm({
      title: '清空所有人员信息',
      content: `确定删除全部 ${persons.length} 条人员信息吗？此操作不可恢复。`,
    });
    if (!ok) return;
    try {
      const r = await api.clearPersons();
      Toast.show({ icon: 'success', content: `已清空 ${r.deleted} 条人员信息` });
      load();
    } catch {
      Toast.show({ icon: 'fail', content: '清空失败' });
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <span className="page-title">{editing ? `修改：${editing.name}` : '管理'}</span>
        {editing && (
          <Button size="small" fill="outline" onClick={cancelEdit}>
            取消修改
          </Button>
        )}
      </div>

      {!editing && (
        <>
          <div className="form-block">
            <div className="form-label">清空所有人员信息</div>
            <div className="form-hint">删除全部 {persons.length} 条登记数据，不可恢复。</div>
            <Button
              block
              color="danger"
              disabled={persons.length === 0}
              onClick={clearAll}
              style={{ marginTop: 10 }}
            >
              清空所有人员
            </Button>
          </div>

          <div className="form-block">
            <div className="form-label">修改个人人员信息</div>
            {persons.length === 0 ? (
              <div className="form-hint">暂无人员，请先到「登记」页录入。</div>
            ) : (
              persons.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>
                      {p.name}
                      {p.student_id && (
                        <span style={{ color: '#999', fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
                          {p.student_id}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                      {GENDER_LABEL[p.gender]}
                      {p.age ? ` · ${p.age}岁` : ''}
                      {p.region ? ` · ${p.region}` : ''}
                    </div>
                  </div>
                  <Button size="small" fill="outline" color="primary" onClick={() => startEdit(p)}>
                    修改
                  </Button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {editing && (
        <>
          <div className="form-block">
            <div className="form-label">姓名 *</div>
            <Input placeholder="请输入姓名" value={name} onChange={setName} />
          </div>

          <div className="form-block">
            <div className="form-label">性别 *</div>
            <Selector
              options={GENDER_OPTIONS}
              value={gender ? [gender] : []}
              onChange={(v) => setGender(v[0] ?? null)}
            />
          </div>

          <div className="form-block">
            <div className="form-label">年龄</div>
            <Input placeholder="选填" type="number" value={age} onChange={setAge} />
          </div>

          <div className="form-block">
            <div className="form-label">学号 *</div>
            <Input placeholder="请输入学号" value={studentId} onChange={setStudentId} />
          </div>

          <div className="form-block">
            <div className="form-label">地区</div>
            <Selector
              columns={3}
              options={REGIONS.map((r) => ({ label: r, value: r }))}
              value={region ? [region] : []}
              onChange={(v) => setRegion(v[0] ?? null)}
            />
          </div>

          <div className="form-block">
            <div className="form-label">舞种（可多选）</div>
            <Selector
              columns={3}
              multiple
              options={DANCE_STYLES.map((s) => ({ label: s, value: s }))}
              value={danceStyles}
              onChange={setDanceStyles}
            />
          </div>

          <div className="form-block">
            <div className="form-label">爱好（逗号分隔）</div>
            <TextArea
              placeholder="例如：摄影，旅行，音乐"
              value={hobbies}
              onChange={setHobbies}
              rows={2}
            />
          </div>

          <div className="form-block">
            <div className="form-label">星座</div>
            <Selector
              columns={4}
              options={ZODIACS.map((z) => ({ label: z, value: z }))}
              value={zodiac ? [zodiac] : []}
              onChange={(v) => setZodiac(v[0] ?? null)}
            />
          </div>

          <div className="form-block">
            <div className="form-label">MBTI</div>
            <Selector
              columns={4}
              options={MBTIS.map((m) => ({ label: m, value: m }))}
              value={mbti ? [mbti] : []}
              onChange={(v) => setMbti(v[0] ?? null)}
            />
          </div>

          <Button block color="primary" size="large" loading={submitting} onClick={submit}>
            保存修改
          </Button>
        </>
      )}
    </div>
  );
}
