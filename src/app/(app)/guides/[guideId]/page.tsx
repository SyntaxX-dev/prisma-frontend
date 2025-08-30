export default async function GuideDetailPage({ params }: { params: Promise<{ guideId: string }> }) {
	const { guideId } = await params;
	
	return (
		<h1 className="text-2xl font-semibold">Guia {guideId}</h1>
	);
}


