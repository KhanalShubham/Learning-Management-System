/*
  Warnings:

  - You are about to drop the column `academicYearId` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `classId` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `sectionId` on the `students` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_academicYearId_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_classId_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_sectionId_fkey";

-- AlterTable
ALTER TABLE "students" DROP COLUMN "academicYearId",
DROP COLUMN "classId",
DROP COLUMN "fullName",
DROP COLUMN "sectionId",
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "middleName" TEXT,
ADD COLUMN     "temporaryAddress" TEXT,
ADD COLUMN     "temporaryDistrict" TEXT,
ADD COLUMN     "temporaryMunicipality" TEXT,
ADD COLUMN     "temporaryProvince" TEXT,
ADD COLUMN     "temporaryWard" TEXT;

-- CreateTable
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "rollNumber" INTEGER,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_studentId_academicYearId_key" ON "enrollments"("studentId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_academicYearId_sectionId_rollNumber_key" ON "enrollments"("academicYearId", "sectionId", "rollNumber");

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
