export default async function LevelDetailPage({ params }: { params: Promise<{ guideId: string; levelId: string }> }) {
	const { guideId, levelId } = await params;

	return (
		<h1 className="text-2xl font-semibold">Nível {levelId} do guia {guideId}</h1>
	);
}


