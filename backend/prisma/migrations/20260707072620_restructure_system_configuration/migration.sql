/*
  Warnings:

  - You are about to drop the `school` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "LeadershipRole" AS ENUM ('PRINCIPAL', 'VICE_PRINCIPAL', 'ADMINISTRATOR', 'ACCOUNT_OFFICER');

-- CreateEnum
CREATE TYPE "AttendanceMethod" AS ENUM ('ADMIN_ONLY', 'TEACHER', 'BIOMETRIC');

-- DropTable
DROP TABLE "school";

-- CreateTable
CREATE TABLE "school_profile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My School',
    "shortName" TEXT,
    "motto" TEXT,
    "description" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "address" TEXT,
    "province" TEXT,
    "district" TEXT,
    "municipality" TEXT,
    "ward" TEXT,
    "postalCode" TEXT,
    "googleMapLink" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_branding" (
    "id" TEXT NOT NULL,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "stampUrl" TEXT,
    "principalSignatureUrl" TEXT,
    "reportHeaderImageUrl" TEXT,
    "reportFooterImageUrl" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_branding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leadership" (
    "id" TEXT NOT NULL,
    "role" "LeadershipRole" NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "designation" TEXT,
    "photoUrl" TEXT,
    "signatureUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leadership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_settings" (
    "id" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kathmandu',
    "language" TEXT NOT NULL DEFAULT 'en',
    "currency" TEXT NOT NULL DEFAULT 'NPR',
    "dateFormat" TEXT NOT NULL DEFAULT 'YYYY-MM-DD',
    "timeFormat" TEXT NOT NULL DEFAULT 'HH:mm',
    "weekStartsOn" INTEGER NOT NULL DEFAULT 0,
    "defaultPassword" TEXT NOT NULL DEFAULT 'Password123',
    "attendanceMethod" "AttendanceMethod" NOT NULL DEFAULT 'ADMIN_ONLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_terms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grading_scales" (
    "id" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "minPercentage" DOUBLE PRECISION NOT NULL,
    "maxPercentage" DOUBLE PRECISION NOT NULL,
    "gpa" DOUBLE PRECISION,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grading_scales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "leadership_role_key" ON "leadership"("role");

-- CreateIndex
CREATE UNIQUE INDEX "academic_terms_name_key" ON "academic_terms"("name");

-- CreateIndex
CREATE UNIQUE INDEX "grading_scales_grade_key" ON "grading_scales"("grade");
