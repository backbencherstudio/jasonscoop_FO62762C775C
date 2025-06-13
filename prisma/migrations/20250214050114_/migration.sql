-- CreateTable
CREATE TABLE "traffic_sources" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "user_id" TEXT,
    "source" TEXT,
    "referrer" TEXT,

    CONSTRAINT "traffic_sources_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "traffic_sources" ADD CONSTRAINT "traffic_sources_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
