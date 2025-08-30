export default async function GuideLevelsPage({ params }: { params: Promise<{ guideId: string }> }) {
	const { guideId } = await params;

	return (
		<h1 className="text-2xl font-semibold">Níveis do guia {guideId}</h1>
	);
}


