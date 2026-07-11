import { prisma } from '../prisma/client';
import { DocumentService } from '../modules/documents/document.service';

async function main() {
  const documentService = new DocumentService();

  console.log('1. Checking for a student in the database...');
  let student = await prisma.student.findFirst();

  if (!student) {
    console.log('No student found. Creating a mock student for test...');
    // Fetch an academic year to create enrollment
    let academicYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
    if (!academicYear) {
      academicYear = await prisma.academicYear.create({
        data: {
          label: '2082/2083',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isCurrent: true,
        }
      });
    }

    // Fetch class and section
    let klass = await prisma.class.findFirst();
    if (!klass) {
      klass = await prisma.class.create({
        data: {
          name: 'Class 10',
          displayOrder: 10,
          academicYearId: academicYear.id,
        }
      });
    }

    let section = await prisma.section.findFirst({ where: { classId: klass.id } });
    if (!section) {
      section = await prisma.section.create({
        data: {
          name: 'Section A',
          classId: klass.id,
        }
      });
    }

    student = await prisma.student.create({
      data: {
        admissionNumber: `STD-${Date.now().toString().slice(-5)}`,
        firstName: 'Ram',
        middleName: 'Bahadur',
        lastName: 'Thapa',
        dateOfBirth: new Date('2068-05-15'),
        gender: 'MALE',
        status: 'ACTIVE',
        guardians: {
          create: {
            relation: 'FATHER',
            fullName: 'Hari Bahadur Thapa',
            phone: '9841234567',
          }
        },
        enrollments: {
          create: {
            academicYearId: academicYear.id,
            classId: klass.id,
            sectionId: section.id,
            rollNumber: 15,
          }
        }
      }
    });
    console.log(`Created mock student: ${student.firstName} ${student.lastName} (${student.admissionNumber})`);
  } else {
    console.log(`Found student in database: ${student.firstName} ${student.lastName} (${student.admissionNumber})`);
  }

  console.log('2. Fetching seeded classic certificate template...');
  // Force update orientation to LANDSCAPE in the database to align with redesign
  await prisma.documentTemplate.update({
    where: { slug: 'classic-character-certificate' },
    data: { orientation: 'LANDSCAPE' }
  });

  const template = await prisma.documentTemplate.findUnique({
    where: { slug: 'classic-character-certificate' }
  });

  if (!template) {
    throw new Error('Classic template not found in database. Make sure server has seeded default templates.');
  }
  console.log(`Found template: ${template.name} (ID: ${template.id})`);

  console.log('3. Triggering document generation pipeline...');
  const user = await prisma.user.findFirst();
  if (!user) {
    throw new Error('No user found in the database to act as document issuer. Run seed first.');
  }
  console.log(`Using user '${user.fullName}' (ID: ${user.id}) as issuer.`);

  const customVariables = {
    characterConduct: 'Excellent',
  };

  const doc = await documentService.generateDocument(
    template.id,
    student.id,
    undefined, // teacherId
    customVariables,
    user.id // userId
  );

  console.log('🎉 Document successfully generated!');
  console.log(`- Document Number: ${doc.documentNumber}`);
  console.log(`- Database ID: ${doc.id}`);
  console.log(`- PDF URL: ${doc.pdfPath}`);
  console.log(`- Status: ${doc.status}`);
  console.log(`- HTML Snapshot Length: ${doc.htmlSnapshot.length} characters`);

  // Verify verification endpoint
  const verified = await documentService.verifyDocument(doc.id);
  console.log('\n4. Testing Verification API for generated ID:');
  console.log(JSON.stringify(verified, null, 2));

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Generation pipeline failed:', err);
  process.exit(1);
});
