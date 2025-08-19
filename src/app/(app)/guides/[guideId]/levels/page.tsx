export default function GuideLevelsPage({ params }: { params: { guideId: string } }) {
	return (
		<h1 className="text-2xl font-semibold">Níveis do guia {params.guideId}</h1>
	);
}


