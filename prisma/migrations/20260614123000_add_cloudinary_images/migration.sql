ALTER TABLE "UserProfile" ADD COLUMN "avatarPublicId" TEXT;

ALTER TABLE "HelpPost"
ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "imagePublicId" TEXT;
