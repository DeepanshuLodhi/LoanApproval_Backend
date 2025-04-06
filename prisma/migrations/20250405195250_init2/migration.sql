/*
  Warnings:

  - You are about to drop the column `authorId` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Application` table. All the data in the column will be lost.
  - Added the required column `address` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenure` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Application" DROP COLUMN "authorId",
DROP COLUMN "content",
DROP COLUMN "published",
DROP COLUMN "title",
ADD COLUMN     "address" VARCHAR(255) NOT NULL,
ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "employment_status" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" VARCHAR(255) NOT NULL,
ADD COLUMN     "reason" VARCHAR(255) NOT NULL,
ADD COLUMN     "tenure" INTEGER NOT NULL;
