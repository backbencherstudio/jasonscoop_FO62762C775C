/*
  Warnings:

  - You are about to drop the column `approved_at` on the `user_documents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_documents" DROP COLUMN "approved_at",
ADD COLUMN     "status" TEXT;
