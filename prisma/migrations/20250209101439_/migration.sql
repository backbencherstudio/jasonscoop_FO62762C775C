-- AlterTable
ALTER TABLE "order_return_items" ADD COLUMN     "price" DECIMAL(65,30),
ADD COLUMN     "quantity" INTEGER DEFAULT 1;
