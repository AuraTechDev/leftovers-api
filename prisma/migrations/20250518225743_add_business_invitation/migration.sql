-- CreateEnum
CREATE TYPE "BusinessInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "BusinessInvitation" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "BusinessInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessId" INTEGER NOT NULL,

    CONSTRAINT "BusinessInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessInvitation_token_key" ON "BusinessInvitation"("token");

-- AddForeignKey
ALTER TABLE "BusinessInvitation" ADD CONSTRAINT "BusinessInvitation_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
