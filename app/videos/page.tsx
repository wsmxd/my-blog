import { getAllVideos } from '../../lib/videos';
import VideoListClient from './VideoListClient';

const VIDEOS_PER_PAGE = 6;

export const dynamic = 'force-static';
export const revalidate = 3600;

export const metadata = {
  title: '视频',
  description: '视频列表与播放记录。',
};

export default async function VideoIndexPage() {
  const allVideos = await getAllVideos();
  const totalPages = Math.max(1, Math.ceil(allVideos.length / VIDEOS_PER_PAGE));
  const videos = allVideos.slice(0, VIDEOS_PER_PAGE);
  return <VideoListClient videos={videos} currentPage={1} totalPages={totalPages} />;
}
