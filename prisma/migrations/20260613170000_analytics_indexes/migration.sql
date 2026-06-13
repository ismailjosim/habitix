-- CreateIndex
CREATE INDEX "Task_assignedToProfileId_completedAt_idx" ON "Task"("assignedToProfileId", "completedAt");

-- CreateIndex
CREATE INDEX "FocusSession_profileId_completedAt_status_idx" ON "FocusSession"("profileId", "completedAt", "status");
