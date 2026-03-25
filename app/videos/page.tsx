import { getAllVideos } from '../../lib/videos';
import VideoListClient from './VideoListClient';

export const dynamic = 'force-static';
export const revalidate = 3600;

export const metadata = {
  title: '视频',
  description: '视频列表与播放记录。',
};

export default async function VideoIndexPage() {
  const videos = await getAllVideos();
  return <VideoListClient videos={videos} />;
}
