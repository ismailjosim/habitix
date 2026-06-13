-- CreateIndex
CREATE INDEX "HelpResponse_authorProfileId_updatedAt_idx" ON "HelpResponse"("authorProfileId", "updatedAt");

-- CreateIndex
CREATE INDEX "HelpResponse_updatedAt_pointsAwarded_idx" ON "HelpResponse"("updatedAt", "pointsAwarded");
