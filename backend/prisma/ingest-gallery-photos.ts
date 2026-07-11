// One-off ingestion script — pushes the campus photos pasted into
// backend/src/pictures/ through the same Cloudinary pipeline the CMS admin
// Gallery tab uses (upload.middleware.ts -> config/cloudinary.ts), then
// creates a GalleryImage row for each, exactly like GalleryService.addImage.
// Run once with: npx ts-node -r tsconfig-paths/register prisma/ingest-gallery-photos.ts
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { uploadImageBuffer } from '@/config/cloudinary';

const prisma = new PrismaClient();
const picturesDir = path.join(__dirname, '..', 'src', 'pictures');

// Filenames aren't presentable captions on their own (sportss.jpg,
// environmenatal.jpg) — map the ones with an obvious real-world meaning,
// fall back to a title-cased filename for the rest.
const captionOverrides: Record<string, string> = {
  morning: 'Morning Assembly',
  sportss: 'Sports Day',
  sports: 'Sports Day',
  enjoying: 'Students Enjoying Campus Life',
  babies: 'Little Learners',
  outing: 'School Outing',
  tour: 'Educational Tour',
  faculty: 'Our Faculty',
  classes: 'Classroom Activities',
  busservice: 'School Bus Service',
  environmenatal: 'Environmental Awareness Programme',
  cleanliness: 'Cleanliness Drive',
  plantingcleaning: 'Tree Planting Campaign',
  sanitation: 'Sanitation Awareness',
  socialwork: 'Social Work Initiative',
  campaignclean: 'Cleanliness Campaign',
  foodfestival: 'Food Festival',
  foodfestival2: 'Food Festival',
};

function captionFor(baseName: string): string {
  if (captionOverrides[baseName]) return captionOverrides[baseName];
  // Numeric/IG-style export filenames (e.g. 441623706_921904389947417_...)
  // have no meaningful text to derive from.
  if (/^\d/.test(baseName)) return 'Campus Life';
  return baseName
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function main() {
  const files = fs
    .readdirSync(picturesDir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

  console.log(`Found ${files.length} photo(s) in ${picturesDir}`);

  let uploaded = 0;
  for (const file of files) {
    const baseName = path.parse(file).name;
    const caption = captionFor(baseName);

    const buffer = fs.readFileSync(path.join(picturesDir, file));
    const imageUrl = await uploadImageBuffer(buffer, 'gallery');

    const maxOrder = await prisma.galleryImage.aggregate({ _max: { displayOrder: true } });
    await prisma.galleryImage.create({
      data: {
        imageUrl,
        caption,
        displayOrder: (maxOrder._max.displayOrder ?? 0) + 1,
      },
    });

    uploaded += 1;
    console.log(`  ✅ ${file} -> "${caption}" (${imageUrl})`);
  }

  console.log(`🌱 Ingested ${uploaded} gallery photo(s).`);
}

main()
  .catch((e) => {
    console.error('❌ Ingestion failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
