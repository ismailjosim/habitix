-- AlterTable
ALTER TABLE "StudyMaterial" ADD COLUMN "module" TEXT,
ADD COLUMN "milestone" TEXT,
ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "publishedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "StudyMaterialView" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'view',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudyMaterialView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudyMaterial_isPublished_module_idx" ON "StudyMaterial"("isPublished", "module");
CREATE INDEX "StudyMaterialView_materialId_createdAt_idx" ON "StudyMaterialView"("materialId", "createdAt");
CREATE INDEX "StudyMaterialView_profileId_createdAt_idx" ON "StudyMaterialView"("profileId", "createdAt");

-- AddForeignKey
ALTER TABLE "StudyMaterialView" ADD CONSTRAINT "StudyMaterialView_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "StudyMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyMaterialView" ADD CONSTRAINT "StudyMaterialView_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
