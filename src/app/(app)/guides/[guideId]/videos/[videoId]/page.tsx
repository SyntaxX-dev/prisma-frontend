export default async function VideoDetailPage({ params }: { params: Promise<{ guideId: string; videoId: string }> }) {
	const { guideId, videoId } = await params;

	return (
		<div className="min-h-screen text-white p-6">
			<h1 className="text-2xl font-semibold">Vídeo {videoId} do guia {guideId}</h1>
		</div>
	);
}


