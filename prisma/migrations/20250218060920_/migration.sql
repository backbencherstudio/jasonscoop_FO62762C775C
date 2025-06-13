-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_two_factor_enabled" INTEGER DEFAULT 0,
ADD COLUMN     "two_factor_secret" TEXT;
