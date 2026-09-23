import type { Metadata } from 'next';
import { MaterialsLibrary } from '@/components/study-materials';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';
import { getStudyMaterials } from '@/lib/queries/study-materials';

export const metadata: Metadata = {
  title: 'Study Materials | Habitix',
  description: 'Curated study materials, reference docs, and learning guides.',
};

export default async function StudyMaterialsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; module?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search?.trim() ?? '';
  const selectedModule = params.module ?? 'all';
  const page = Math.max(1, Number(params.page) || 1);
  const data = await getStudyMaterials({ search, module: selectedModule, page });
  return (
    <div className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto`}>
      <MaterialsLibrary data={data} search={search} module={selectedModule} />
    </div>
  );
}
