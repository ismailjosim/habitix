-- DropIndex
DROP INDEX "HelpResponse_updatedAt_pointsAwarded_idx";

-- CreateIndex
CREATE INDEX "HelpResponse_authorProfileId_isAccepted_idx" ON "HelpResponse"("authorProfileId", "isAccepted");
