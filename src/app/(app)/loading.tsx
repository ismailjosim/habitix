import { LoadingState } from '@/components/shared';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';

export default function AppLoading() {
  return (
    <div className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto`}>
      <LoadingState title="Loading page" count={5} />
    </div>
  );
}
