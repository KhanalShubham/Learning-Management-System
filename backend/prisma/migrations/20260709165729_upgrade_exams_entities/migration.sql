/*
  Warnings:

  - Added the required column `percentage` to the `exam_report_cards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalMaxMarks` to the `exam_report_cards` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('PASS', 'FAIL', 'WITHHELD', 'ABSENT', 'INCOMPLETE');

-- AlterTable
ALTER TABLE "exam_report_cards" ADD COLUMN     "classRank" INTEGER,
ADD COLUMN     "division" TEXT,
ADD COLUMN     "percentage" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "resultStatus" "ResultStatus" NOT NULL DEFAULT 'PASS',
ADD COLUMN     "sectionRank" INTEGER,
ADD COLUMN     "totalMaxMarks" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "exam_terms" ADD COLUMN     "weightage" DOUBLE PRECISION NOT NULL DEFAULT 1.0;

-- CreateTable
CREATE TABLE "exam_report_card_details" (
    "id" TEXT NOT NULL,
    "reportCardId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "theoryObtained" DOUBLE PRECISION,
    "practicalObtained" DOUBLE PRECISION,
    "totalObtained" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "gradePoint" DOUBLE PRECISION NOT NULL,
    "letterGrade" TEXT NOT NULL,
    "status" "ResultStatus" NOT NULL DEFAULT 'PASS',
    "subjectRank" INTEGER,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_report_card_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_transcripts" (
    "id" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "gpa" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "resultStatus" "ResultStatus" NOT NULL DEFAULT 'PASS',
    "classRank" INTEGER,
    "sectionRank" INTEGER,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_transcripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_transcript_details" (
    "id" TEXT NOT NULL,
    "transcriptId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "gpa" DOUBLE PRECISION NOT NULL,
    "letterGrade" TEXT NOT NULL,
    "status" "ResultStatus" NOT NULL DEFAULT 'PASS',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_transcript_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exam_report_card_details_reportCardId_subjectId_key" ON "exam_report_card_details"("reportCardId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_transcripts_academicYearId_studentId_key" ON "exam_transcripts"("academicYearId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_transcript_details_transcriptId_subjectId_key" ON "exam_transcript_details"("transcriptId", "subjectId");

-- AddForeignKey
ALTER TABLE "exam_report_card_details" ADD CONSTRAINT "exam_report_card_details_reportCardId_fkey" FOREIGN KEY ("reportCardId") REFERENCES "exam_report_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_report_card_details" ADD CONSTRAINT "exam_report_card_details_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_transcripts" ADD CONSTRAINT "exam_transcripts_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_transcripts" ADD CONSTRAINT "exam_transcripts_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_transcript_details" ADD CONSTRAINT "exam_transcript_details_transcriptId_fkey" FOREIGN KEY ("transcriptId") REFERENCES "exam_transcripts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_transcript_details" ADD CONSTRAINT "exam_transcript_details_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
