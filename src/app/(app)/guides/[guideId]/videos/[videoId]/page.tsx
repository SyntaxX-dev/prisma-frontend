export default function VideoDetailPage({ params }: { params: { guideId: string; videoId: string } }) {
	return (
		<h1 className="text-2xl font-semibold">Vídeo {params.videoId} do guia {params.guideId}</h1>
	);
}


