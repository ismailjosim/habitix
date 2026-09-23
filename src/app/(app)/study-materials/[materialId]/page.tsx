import type { Metadata } from 'next';
import { MaterialDetail } from '@/components/study-materials';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';
import { getStudyMaterial } from '@/lib/queries/study-materials';

interface StudyMaterialPageProps {
  params: Promise<{ materialId: string }>;
}

export async function generateMetadata({ params }: StudyMaterialPageProps): Promise<Metadata> {
  const { materialId } = await params;
  try {
    const data = await getStudyMaterial(materialId);
    return {
      title: `${data.material.title} | Habitix`,
      description: data.material.description || 'Study material and learning resource in Habitix',
    };
  } catch {
    return {
      title: 'Study Material | Habitix',
    };
  }
}

export default async function StudyMaterialPage({ params }: StudyMaterialPageProps) {
  const { materialId } = await params;
  const data = await getStudyMaterial(materialId);
  return (
    <div className={`${LAYOUT_CONSTRAINTS.pagePadding} py-6`}>
      <MaterialDetail data={data} />
    </div>
  );
}
