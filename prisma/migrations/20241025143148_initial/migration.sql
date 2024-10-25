-- CreateEnum
CREATE TYPE "UserRolesEnum" AS ENUM ('CUSTOMER', 'SHOP_OWNER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255),
    "password" VARCHAR(255),
    "email" VARCHAR(255),
    "phone_number" VARCHAR(255) DEFAULT '0600000000',
    "role" "UserRolesEnum" DEFAULT 'CUSTOMER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_vip" BOOLEAN DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
