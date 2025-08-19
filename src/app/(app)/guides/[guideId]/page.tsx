export default function GuideDetailPage({ params }: { params: { guideId: string } }) {
	return (
		<h1 className="text-2xl font-semibold">Guia {params.guideId}</h1>
	);
}


