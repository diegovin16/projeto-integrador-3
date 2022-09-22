-- CreateTable
CREATE TABLE "JobOffer" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "rating" INTEGER,
    "title" TEXT NOT NULL,
    "place" TEXT NOT NULL,
    "salary" TEXT,
    "salaryAverage" TEXT,
    "postDate" TEXT,
    "description" TEXT,
    "technologies" TEXT[],
    "isRemote" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "JobOffer_pkey" PRIMARY KEY ("id")
);
