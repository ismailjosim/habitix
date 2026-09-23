import { NextResponse } from 'next/server';
import { getCurrentUserProfile } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { uploadImage, uploadDocument, deleteImage } from '@/lib/cloudinary';

export async function POST(req: Request) {
  try {
    const authData = await getCurrentUserProfile();
    if (!authData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'avatar';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (type === 'material' && (file.type === 'application/pdf' || file.name.endsWith('.pdf'))) {
      const uploaded = await uploadDocument(file, {
        folder: 'habitix/materials',
      });
      return NextResponse.json({
        success: true,
        url: uploaded.url,
        publicId: uploaded.publicId,
      });
    }

    let folder = 'habitix/general';
    let transformation: Array<Record<string, unknown>> | undefined;

    if (type === 'avatar') {
      folder = `habitix/avatars/${authData.profile.id}`;
      transformation = [
        { width: 512, height: 512, crop: 'fill', gravity: 'face', quality: 'auto' },
      ];
    } else if (type === 'team') {
      folder = 'habitix/teams';
      transformation = [
        { width: 512, height: 512, crop: 'fill', gravity: 'center', quality: 'auto' },
      ];
    } else if (type === 'help-desk') {
      folder = 'habitix/help-desk';
      transformation = [{ width: 1920, height: 1080, crop: 'limit', quality: 'auto' }];
    } else if (type === 'material') {
      folder = 'habitix/materials';
    }

    const uploaded = await uploadImage(file, {
      folder,
      transformation,
    });

    if (type === 'avatar') {
      const oldPublicId = authData.profile.avatarPublicId;
      await prisma.$transaction([
        prisma.userProfile.update({
          where: { id: authData.profile.id },
          data: {
            avatarUrl: uploaded.url,
            avatarPublicId: uploaded.publicId,
          },
        }),
        prisma.user.update({
          where: { id: authData.session.user.id },
          data: {
            image: uploaded.url,
          },
        }),
      ]);

      if (oldPublicId && oldPublicId !== uploaded.publicId) {
        deleteImage(oldPublicId).catch(() => undefined);
      }
    }

    return NextResponse.json({
      success: true,
      url: uploaded.url,
      publicId: uploaded.publicId,
    });
  } catch (error) {
    console.error('API Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const authData = await getCurrentUserProfile();
    if (!authData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { publicId, resourceType = 'image' } = body;

    if (!publicId) {
      return NextResponse.json({ error: 'publicId is required' }, { status: 400 });
    }

    await deleteImage(publicId, resourceType);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Delete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Delete failed' },
      { status: 500 }
    );
  }
}
