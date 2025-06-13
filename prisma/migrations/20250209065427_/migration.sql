/*
  Warnings:

  - You are about to drop the column `status` on the `order_returns` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "order_returns" DROP COLUMN "status",
ADD COLUMN     "additional_info" TEXT,
ADD COLUMN     "admin_status" TEXT DEFAULT 'pending',
ADD COLUMN     "vendor_status" TEXT DEFAULT 'pending';
