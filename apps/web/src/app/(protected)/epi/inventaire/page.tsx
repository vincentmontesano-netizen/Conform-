import EpiInventaireClient from './EpiInventaireClient';

export const dynamic = 'force-dynamic';

export default async function EpiInventairePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const sp = await searchParams;
  const initialCategory = (sp?.category_id as string) || '';
  const initialEtat = (sp?.etat as string) || '';
  return (
    <EpiInventaireClient
      initialCategory={initialCategory}
      initialEtat={initialEtat}
    />
  );
}
