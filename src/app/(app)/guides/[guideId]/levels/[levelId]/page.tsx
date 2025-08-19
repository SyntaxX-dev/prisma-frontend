export default function LevelDetailPage({ params }: { params: { guideId: string; levelId: string } }) {
	return (
		<h1 className="text-2xl font-semibold">Nível {params.levelId} do guia {params.guideId}</h1>
	);
}


