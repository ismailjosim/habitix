import { MaterialsLibrary } from '@/components/study-materials/materials-library';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';
import { getStudyMaterials } from '@/lib/queries/study-materials';

export default async function StudyMaterialsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; module?: string }>;
}) {
  const params = await searchParams;
  const search = params.search?.trim() ?? '';
  const module = params.module ?? 'all';
  const data = await getStudyMaterials({ search, module });
  return (
    <div className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto`}>
      <MaterialsLibrary data={data} search={search} module={module} />
    </div>
  );
}
