export default function GuideVideosPage({ params }: { params: { guideId: string } }) {
	return (
		<h1 className="text-2xl font-semibold">Vídeos do guia {params.guideId}</h1>
	);
}


