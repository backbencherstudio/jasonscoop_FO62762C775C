-- AlterTable
ALTER TABLE "main_orders" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "latitude" DECIMAL(10,8),
ADD COLUMN     "longitude" DECIMAL(10,8),
ADD COLUMN     "state" TEXT,
ADD COLUMN     "zip_code" TEXT;
