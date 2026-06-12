-- DropIndex
DROP INDEX "BadgeAward_badgeId_profileId_awardedAt_key";

-- AlterTable
ALTER TABLE "BadgeAward" ADD COLUMN "periodKey" TEXT NOT NULL DEFAULT 'lifetime';

-- CreateIndex
CREATE UNIQUE INDEX "BadgeAward_badgeId_profileId_periodKey_key" ON "BadgeAward"("badgeId", "profileId", "periodKey");
