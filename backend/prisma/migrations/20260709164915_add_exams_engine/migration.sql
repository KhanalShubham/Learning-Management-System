-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MarksEntryStatus" AS ENUM ('PRESENT', 'ABSENT', 'DISQUALIFIED');

-- CreateEnum
CREATE TYPE "ExamResultStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'EXAM_TERM_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'EXAM_TERM_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'EXAM_TERM_PUBLISHED';
ALTER TYPE "AuditAction" ADD VALUE 'EXAM_SCHEDULED';
ALTER TYPE "AuditAction" ADD VALUE 'EXAM_MARKS_ENTERED';
ALTER TYPE "AuditAction" ADD VALUE 'EXAM_MARKS_UPDATED';

-- CreateTable
CREATE TABLE "exam_terms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "ExamResultStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "examTermId" TEXT NOT NULL,
    "classSubjectId" TEXT NOT NULL,
    "examDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "roomNumber" TEXT,
    "theoryMaxMarks" DOUBLE PRECISION NOT NULL,
    "theoryPassMarks" DOUBLE PRECISION NOT NULL,
    "practicalMaxMarks" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "practicalPassMarks" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "ExamStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_marks" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "MarksEntryStatus" NOT NULL DEFAULT 'PRESENT',
    "theoryObtained" DOUBLE PRECISION,
    "practicalObtained" DOUBLE PRECISION,
    "remarks" TEXT,
    "enteredById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_marks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_report_cards" (
    "id" TEXT NOT NULL,
    "examTermId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "totalMarksObtained" DOUBLE PRECISION NOT NULL,
    "gpa" DOUBLE PRECISION NOT NULL,
    "attendanceRate" DOUBLE PRECISION,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_report_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exam_terms_academicYearId_name_key" ON "exam_terms"("academicYearId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "exams_examTermId_classSubjectId_key" ON "exams"("examTermId", "classSubjectId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_marks_examId_studentId_key" ON "exam_marks"("examId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_report_cards_examTermId_studentId_key" ON "exam_report_cards"("examTermId", "studentId");

-- AddForeignKey
ALTER TABLE "exam_terms" ADD CONSTRAINT "exam_terms_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_examTermId_fkey" FOREIGN KEY ("examTermId") REFERENCES "exam_terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_classSubjectId_fkey" FOREIGN KEY ("classSubjectId") REFERENCES "class_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_marks" ADD CONSTRAINT "exam_marks_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_marks" ADD CONSTRAINT "exam_marks_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_marks" ADD CONSTRAINT "exam_marks_enteredById_fkey" FOREIGN KEY ("enteredById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_report_cards" ADD CONSTRAINT "exam_report_cards_examTermId_fkey" FOREIGN KEY ("examTermId") REFERENCES "exam_terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_report_cards" ADD CONSTRAINT "exam_report_cards_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
