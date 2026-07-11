import { prisma } from '../prisma/client';

async function main() {
  console.log('Fetching document templates from database...');
  const templates = await prisma.documentTemplate.findMany();
  console.log(`Found ${templates.length} templates:`);
  templates.forEach(t => {
    console.log(`- [${t.category}] ${t.name} (slug: ${t.slug}, version: ${t.version}, default: ${t.isDefault})`);
  });
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
