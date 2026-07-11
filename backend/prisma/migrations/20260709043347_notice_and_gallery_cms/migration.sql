-- CreateEnum
CREATE TYPE "NoticeTag" AS ENUM ('ADMISSIONS', 'EXAMINATION', 'EVENT', 'NOTICE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'NOTICE_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'NOTICE_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'NOTICE_ARCHIVED';
ALTER TYPE "AuditAction" ADD VALUE 'NOTICE_DELETED';
ALTER TYPE "AuditAction" ADD VALUE 'GALLERY_IMAGE_ADDED';
ALTER TYPE "AuditAction" ADD VALUE 'GALLERY_IMAGE_REMOVED';

-- CreateTable
CREATE TABLE "notices" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tag" "NoticeTag" NOT NULL DEFAULT 'NOTICE',
    "excerpt" TEXT NOT NULL,
    "body" TEXT[],
    "attachmentUrl" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_images" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notices_slug_key" ON "notices"("slug");
