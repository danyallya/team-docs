-- Create an explicit, validated document kind while keeping existing library rows readable.
ALTER TABLE "Document" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'STUDIO_GUIDE';
