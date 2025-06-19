/*
  Warnings:

  - You are about to drop the column `thumbnailUrl` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `Video` table. All the data in the column will be lost.
  - Added the required column `thumbnail` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `video` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "thumbnailUrl",
DROP COLUMN "videoUrl",
ADD COLUMN     "thumbnail" TEXT NOT NULL,
ADD COLUMN     "video" TEXT NOT NULL;
