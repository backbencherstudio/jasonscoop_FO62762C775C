-- CreateTable
CREATE TABLE "transaction_reports" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "date_from" TIMESTAMP(3) NOT NULL,
    "date_to" TIMESTAMP(3),
    "format" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "report_type" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "transaction_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_reports" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "order_date" TIMESTAMP(3) NOT NULL,
    "date_from" TIMESTAMP(3) NOT NULL,
    "date_to" TIMESTAMP(3),
    "format" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "report_type" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "order_reports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transaction_reports" ADD CONSTRAINT "transaction_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_reports" ADD CONSTRAINT "order_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
