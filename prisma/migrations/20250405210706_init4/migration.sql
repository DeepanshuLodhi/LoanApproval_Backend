-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "application_status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" VARCHAR(50) NOT NULL DEFAULT 'user';
