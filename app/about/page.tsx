import AnimatedProfile from './AnimatedProfile';
import StarBackground from './StarBackground'; // 👈 导入新组件

export type ProfileData = {
  name: string;
  title: string;
  bio: string;
};

export type SocialLink = {
  name: string;
  href: string;
  icon: 'github' | 'bilibili' | 'douyin' | 'email';
};

const profile: ProfileData = {
  name: 'wsmxd',
  title: 'Full Stack Developer & Open Source Enthusiast',
  bio: '我是一名热爱技术的全栈开发者，对于.NET平台和前端有浓厚兴趣，喜欢任何有趣的事物。喜欢探索前沿技术，也乐于分享知识。欢迎与大家交流合作！',
};

const socialLinks: SocialLink[] = [
  { name: 'GitHub', href: 'https://github.com/wsmxd', icon: 'github' },
  { name: 'Bilibili', href: 'https://space.bilibili.com/353008084', icon: 'bilibili' },
  { name: 'Douyin', href: '/', icon: 'douyin' },
  { name: 'Email', href: 'mailto:mxd2166846893@163.com?subject=网站联系', icon: 'email' },
];

export default function AboutPage() {
  return (
    // 移除旧的背景类，保留布局类
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* 放置星空背景组件 */}
      <StarBackground />
      
      {/* 确保内容在背景之上 */}
      <AnimatedProfile profile={profile} socialLinks={socialLinks} />
    </div>
  );
}