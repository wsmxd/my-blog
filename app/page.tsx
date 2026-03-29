import FlowingGradient from './components/FlowingGradient';
import AnimatedSection from './components/AnimatedSection';
import HomeContent from './components/HomeContent';
import { getAllPosts } from '../lib/posts';
import { getTotalReads } from '../lib/reads';
import { getAllVideos } from '../lib/videos';

export default async function HomePage() {
  const posts = await getAllPosts();
  const postsCount = posts.length;
  const totalReads = await getTotalReads();
  const videos = await getAllVideos();
  const videosCount = videos.length;

  return (
    <>
      {/* 动态背景 */}
      <FlowingGradient />

      {/* 内容区域 */}
      <AnimatedSection className="min-h-screen flex items-center justify-center">
        <HomeContent postsCount={postsCount} totalReads={totalReads} videosCount={videosCount} />
      </AnimatedSection>
    </>
  );
}