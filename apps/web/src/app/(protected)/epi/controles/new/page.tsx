import NewEpiControleClient from './NewEpiControleClient';

export const dynamic = 'force-dynamic';

export default async function NewEpiControlePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const sp = await searchParams;
  const initialItemId = (sp?.epi_item_id as string) || undefined;
  return <NewEpiControleClient initialItemId={initialItemId} />;
}
