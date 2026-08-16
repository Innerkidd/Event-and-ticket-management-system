-- DropIndex
DROP INDEX "idx_attendance_booking";

-- DropIndex
DROP INDEX "idx_attendance_event";

-- DropIndex
DROP INDEX "idx_staff_event";

-- AlterTable
ALTER TABLE "organizer_applications" ADD COLUMN     "document_name" VARCHAR(255),
ADD COLUMN     "event_count" INTEGER,
ADD COLUMN     "org_type" VARCHAR(100);
