import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreateHelpPostModal } from './CreateHelpPostModal';

interface HelpDeskHeaderProps {
  teamName: string | null;
  canCreatePost: boolean;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  submitPost: (formData: FormData) => void;
  isPending: boolean;
  error: string | null;
  imagePreview: string | null;
  onImageChange: (file: File | null) => void;
}

export function HelpDeskHeader({
  teamName,
  canCreatePost,
  dialogOpen,
  setDialogOpen,
  submitPost,
  isPending,
  error,
  imagePreview,
  onImageChange,
}: HelpDeskHeaderProps) {
  return (
    <>
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Peer support</p>
          <h1 className="text-3xl font-bold">Help Desk</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {teamName
              ? `Ask and answer questions inside ${teamName}.`
              : 'Join a team to use peer support.'}
          </p>
        </div>

        <CreateHelpPostModal
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          canCreatePost={canCreatePost}
          onSubmit={submitPost}
          isPending={isPending}
          error={error}
          imagePreview={imagePreview}
          onImageChange={onImageChange}
        />
      </header>

      {!canCreatePost && (
        <Card>
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">An active team membership is required</p>
              <p className="text-sm text-muted-foreground">
                Your platform role already permits Help Desk access, but requests belong to a team.
                Ask an admin to assign you to a team.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/team">View team status</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
