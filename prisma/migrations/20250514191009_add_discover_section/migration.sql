-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('PRODUCTS', 'BUSINESSES');

-- CreateTable
CREATE TABLE "DiscoverSection" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "SectionType" NOT NULL,
    "queryConfig" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscoverSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscoverSection_slug_key" ON "DiscoverSection"("slug");
