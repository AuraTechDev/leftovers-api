/*
  Warnings:

  - The primary key for the `Business` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Business` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `businessId` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `businessId` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_businessId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_businessId_fkey";

-- AlterTable
ALTER TABLE "Business" DROP CONSTRAINT "Business_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Business_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "businessId",
ADD COLUMN     "businessId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "businessId",
ADD COLUMN     "businessId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
