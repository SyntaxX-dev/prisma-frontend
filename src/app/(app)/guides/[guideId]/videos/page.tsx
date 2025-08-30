export default async function GuideVideosPage({ params }: { params: Promise<{ guideId: string }> }) {
	const { guideId } = await params;

	return (
		<h1 className="text-2xl font-semibold">Vídeos do guia {guideId}</h1>
	);
}


