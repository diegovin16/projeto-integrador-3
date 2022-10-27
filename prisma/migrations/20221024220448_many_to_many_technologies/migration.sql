/*
  Warnings:

  - You are about to drop the column `jobOfferId` on the `Technology` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Technology" DROP CONSTRAINT "Technology_jobOfferId_fkey";

-- AlterTable
ALTER TABLE "Technology" DROP COLUMN "jobOfferId";

-- CreateTable
CREATE TABLE "_JobOfferToTechnology" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_JobOfferToTechnology_AB_unique" ON "_JobOfferToTechnology"("A", "B");

-- CreateIndex
CREATE INDEX "_JobOfferToTechnology_B_index" ON "_JobOfferToTechnology"("B");

-- AddForeignKey
ALTER TABLE "_JobOfferToTechnology" ADD CONSTRAINT "_JobOfferToTechnology_A_fkey" FOREIGN KEY ("A") REFERENCES "JobOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobOfferToTechnology" ADD CONSTRAINT "_JobOfferToTechnology_B_fkey" FOREIGN KEY ("B") REFERENCES "Technology"("id") ON DELETE CASCADE ON UPDATE CASCADE;
