import { MaterialDetail } from '@/components/study-materials/material-detail';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';
import { getStudyMaterial } from '@/lib/queries/study-materials';

export default async function StudyMaterialPage({
  params,
}: {
  params: Promise<{ materialId: string }>;
}) {
  const { materialId } = await params;
  const data = await getStudyMaterial(materialId);
  return (
    <div className={`${LAYOUT_CONSTRAINTS.pagePadding} py-6`}>
      <MaterialDetail data={data} />
    </div>
  );
}
