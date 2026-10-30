import { Outlet, useLocation, useNavigate } from 'umi';
import { TabBar } from 'antd-mobile';
import {
  AppOutline,
  AddCircleOutline,
  UnorderedListOutline,
  TeamOutline,
  SetOutline,
} from 'antd-mobile-icons';
import '@/global.css';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  // 手机端独立登记页：只显示登记内容，不显示底部导航
  if (location.pathname === '/m') {
    return (
      <div className="app">
        <Outlet />
      </div>
    );
  }

  const tabs = [
    { key: '/stats', title: '统计', icon: <AppOutline /> },
    { key: '/register', title: '登记', icon: <AddCircleOutline /> },
    { key: '/list', title: '列表', icon: <UnorderedListOutline /> },
    { key: '/match', title: '匹配', icon: <TeamOutline /> },
    { key: '/manage', title: '管理', icon: <SetOutline /> },
  ];

  return (
    <div className="app">
      <div className="app-body">
        <Outlet />
      </div>
      <div className="app-tabbar">
        <TabBar activeKey={location.pathname} onChange={(k) => navigate(k)}>
          {tabs.map((t) => (
            <TabBar.Item key={t.key} title={t.title} icon={t.icon} />
          ))}
        </TabBar>
      </div>
    </div>
  );
}
