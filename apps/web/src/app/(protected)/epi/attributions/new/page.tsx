import NewEpiAttributionClient from './NewEpiAttributionClient';

export const dynamic = 'force-dynamic';

export default async function NewEpiAttributionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const sp = await searchParams;
  const initialItemId = (sp?.epi_item_id as string) || undefined;
  return <NewEpiAttributionClient initialItemId={initialItemId} />;
}
