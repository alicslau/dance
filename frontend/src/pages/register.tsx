import { useState } from 'react';
import { Button, Input, Selector, TextArea, Toast } from 'antd-mobile';
import { useNavigate } from 'umi';
import { api } from '@/services/api';
import { GENDER_OPTIONS, DANCE_STYLES, ZODIACS, MBTIS, REGIONS } from '@/constants';

export default function RegisterPage() {
  const navigate = useNavigate();
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

  const submit = async () => {
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
      const res = await api.createPerson({
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
      Toast.show({
        icon: 'success',
        content: res.overwritten ? '已存在相同学号·姓名，已覆盖更新原信息' : '登记成功',
      });
      navigate('/list');
    } catch (e: any) {
      Toast.show({ icon: 'fail', content: e?.response?.data?.detail || '提交失败' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <span className="page-title">登记信息</span>
      </div>

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
        提交登记
      </Button>
    </div>
  );
}
