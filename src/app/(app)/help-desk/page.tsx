import { HelpDeskBoard } from '@/components/help-desk/help-desk-board';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';
import { getHelpDeskData } from '@/lib/queries/help-desk';

export default async function HelpDeskPage() {
  const data = await getHelpDeskData();
  return (
    <div className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto`}>
      <HelpDeskBoard data={data} />
    </div>
  );
}
