-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "description" TEXT,
ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "user_documents" ADD COLUMN     "approved_at" TIMESTAMP(3);
