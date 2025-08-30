export default async function VideoDetailPage({ params }: { params: Promise<{ guideId: string; videoId: string }> }) {
	const { guideId, videoId } = await params;

	return (
		<h1 className="text-2xl font-semibold">Vídeo {videoId} do guia {guideId}</h1>
	);
}


