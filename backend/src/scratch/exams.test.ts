import { PrismaClient, ExamResultStatus, MarksEntryStatus } from '@prisma/client';
import { PrismaExamsRepository } from '../modules/exams/exams.repository';
import { ExamsService } from '../modules/exams/exams.service';

const prisma = new PrismaClient();
const repo = new PrismaExamsRepository();
const service = new ExamsService(repo);

async function runTests() {
  console.log('🧪 Starting Examination Backend Integration Tests...');
  
  // 1. Get reference records from DB
  const academicYear = await prisma.academicYear.findFirst({
    where: { isCurrent: true },
  });
  if (!academicYear) {
    console.error('❌ Active academic year not found. Run db seed first.');
    process.exit(1);
  }
  
  const classSubject = await prisma.classSubject.findFirst({
    include: { class: true, subject: true },
  });
  if (!classSubject) {
    console.error('❌ ClassSubject not found. Run db seed first.');
    process.exit(1);
  }

  // Find or create a demo student and enroll them in the class
  let student = await prisma.student.findFirst();
  if (!student) {
    student = await prisma.student.create({
      data: {
        admissionNumber: 'DPS-TEST-0001',
        firstName: 'Test',
        lastName: 'Student',
        dateOfBirth: new Date('2015-05-15'),
        gender: 'MALE',
        status: 'ACTIVE',
      },
    });
  }

  // Find or create a section for this class
  let section = await prisma.section.findFirst({ where: { classId: classSubject.classId } });
  if (!section) {
    section = await prisma.section.create({
      data: {
        classId: classSubject.classId,
        name: 'A',
        capacity: 40,
      },
    });
  }

  // Create enrollment
  await prisma.enrollment.upsert({
    where: {
      studentId_academicYearId: {
        studentId: student.id,
        academicYearId: academicYear.id,
      },
    },
    update: {
      classId: classSubject.classId,
      sectionId: section.id,
      rollNumber: 10,
    },
    create: {
      studentId: student.id,
      academicYearId: academicYear.id,
      classId: classSubject.classId,
      sectionId: section.id,
      rollNumber: 10,
    },
  });

  const adminUser = await prisma.user.findFirst({
    where: { role: { name: 'ADMIN' } },
  });
  if (!adminUser) {
    console.error('❌ Admin user account not found. Run db seed first.');
    process.exit(1);
  }

  let createdTermId = '';
  let createdExamId = '';

  try {
    const termStart = new Date(academicYear.startDate);
    termStart.setDate(termStart.getDate() + 15); // 15 days in
    const termEnd = new Date(academicYear.startDate);
    termEnd.setDate(termEnd.getDate() + 45); // 45 days in
    const examDate = new Date(academicYear.startDate);
    examDate.setDate(examDate.getDate() + 30); // 30 days in

    const termStartStr = termStart.toISOString().split('T')[0];
    const termEndStr = termEnd.toISOString().split('T')[0];
    const examDateStr = examDate.toISOString().split('T')[0];

    const outOfBoundsDate = new Date(termEnd);
    outOfBoundsDate.setDate(outOfBoundsDate.getDate() + 10);
    const outOfBoundsDateStr = outOfBoundsDate.toISOString().split('T')[0];

    // Test Case 1: Create Exam Term
    console.log('\n--- Test Case 1: Create Exam Term ---');
    const term = await service.createExamTerm(
      {
        name: 'First Term Examination 2082/83',
        academicYearId: academicYear.id,
        startDate: termStartStr,
        endDate: termEndStr,
      },
      adminUser.id
    );
    createdTermId = term.id;
    console.log('✅ Exam term created successfully:', term.name);

    // Test Case 2: Schedule Exam inside term boundaries
    console.log('\n--- Test Case 2: Schedule Exam Inside Boundaries ---');
    const exam = await service.createExam(
      {
        examTermId: term.id,
        classSubjectId: classSubject.id,
        examDate: examDateStr,
        startTime: '10:00',
        endTime: '13:00',
        roomNumber: 'Room 204',
        theoryMaxMarks: 75,
        theoryPassMarks: 26.25,
        practicalMaxMarks: 25,
        practicalPassMarks: 8.75,
      },
      adminUser.id
    );
    createdExamId = exam.id;
    console.log('✅ Exam scheduled successfully for subject:', classSubject.subject.name);

    // Test Case 3: Verify scheduling outside term bounds throws error
    console.log('\n--- Test Case 3: Schedule Exam Outside Boundaries (Should fail) ---');
    try {
      await service.createExam(
        {
          examTermId: term.id,
          classSubjectId: classSubject.id,
          examDate: outOfBoundsDateStr,
          startTime: '10:00',
          endTime: '13:00',
          theoryMaxMarks: 75,
          theoryPassMarks: 26.25,
          practicalMaxMarks: 25,
          practicalPassMarks: 8.75,
        },
        adminUser.id
      );
      console.log('❌ FAIL: Expected error for out-of-bounds date was not thrown.');
    } catch (err: any) {
      console.log('✅ PASS: Correctly threw validation error:', err.message);
    }

    // Test Case 4: Verify ledger entries input limits validations
    console.log('\n--- Test Case 4: Enter marks exceeding maximum limits (Should fail) ---');
    try {
      await service.submitExamMarks(
        exam.id,
        [
          {
            studentId: student.id,
            status: MarksEntryStatus.PRESENT,
            theoryObtained: 80, // Exceeds max 75
            practicalObtained: 20,
          },
        ],
        adminUser.id
      );
      console.log('❌ FAIL: Expected error for score exceeding max marks limits was not thrown.');
    } catch (err: any) {
      console.log('✅ PASS: Correctly threw validation error:', err.message);
    }

    // Test Case 5: Valid scores entries & Grade points compilation check
    console.log('\n--- Test Case 5: Enter valid passing marks & publish term ---');
    // Ensure Grading scales are seeded
    await prisma.gradingScale.upsert({
      where: { grade: 'A+' },
      update: { minPercentage: 90, maxPercentage: 100, gpa: 4.0, order: 1 },
      create: { grade: 'A+', minPercentage: 90, maxPercentage: 100, gpa: 4.0, order: 1 },
    });
    await prisma.gradingScale.upsert({
      where: { grade: 'A' },
      update: { minPercentage: 80, maxPercentage: 89.9, gpa: 3.6, order: 2 },
      create: { grade: 'A', minPercentage: 80, maxPercentage: 89.9, gpa: 3.6, order: 2 },
    });

    await service.submitExamMarks(
      exam.id,
      [
        {
          studentId: student.id,
          status: MarksEntryStatus.PRESENT,
          theoryObtained: 68,
          practicalObtained: 22, // 68 + 22 = 90 marks = 90% (maps to A+)
        },
      ],
      adminUser.id
    );
    console.log('✅ Valid marks submitted successfully.');

    // Publish term results to compile the report card
    console.log('⚙️ Compiling report card results...');
    await service.publishExamTerm(term.id, ExamResultStatus.PUBLISHED, adminUser.id);
    console.log('✅ Exam term published.');

    // Fetch and check compiled report card
    const card = await repo.findExamReportCard(term.id, student.id);
    if (!card) {
      throw new Error('Report card was not compiled or cached!');
    }
    console.log('ℹ️ Compiled Report Card details:');
    console.log(`   Total Max Marks possible: ${card.totalMaxMarks}`);
    console.log(`   Total Marks obtained: ${card.totalMarksObtained}`);
    console.log(`   Percentage: ${card.percentage}%`);
    console.log(`   Calculated GPA: ${card.gpa}`);
    console.log(`   Result Status: ${card.resultStatus}`);
    console.log(`   Division: ${card.division}`);
    console.log(`   Class Rank: ${card.classRank}`);
    console.log(`   Section Rank: ${card.sectionRank}`);
    
    if (card.details && card.details[0]) {
      const detail = card.details[0];
      console.log(`   Subject Score: Theory=${detail.theoryObtained}, Practical=${detail.practicalObtained}, Total=${detail.totalObtained}`);
      console.log(`   Subject Grade: Letter=${detail.letterGrade}, GP=${detail.gradePoint}, Rank=${detail.subjectRank}`);
    }

    if (card.gpa === 4.0 && card.classRank === 1 && card.details[0]?.subjectRank === 1) {
      console.log('✅ PASS: GPA and rankings calculated correctly.');
    } else {
      console.log(`❌ FAIL: Expected GPA 4.0 and rank 1 but got GPA=${card.gpa}, classRank=${card.classRank}, subjectRank=${card.details[0]?.subjectRank}`);
    }

    // Test Case 6: Try to edit marks on a published/locked term (Should fail)
    console.log('\n--- Test Case 6: Modify marks on locked published term (Should fail) ---');
    try {
      await service.submitExamMarks(
        exam.id,
        [
          {
            studentId: student.id,
            status: MarksEntryStatus.PRESENT,
            theoryObtained: 70,
            practicalObtained: 20,
          },
        ],
        adminUser.id
      );
      console.log('❌ FAIL: Expected locked validation error was not thrown.');
    } catch (err: any) {
      console.log('✅ PASS: Correctly rejected edit on published term:', err.message);
    }

  } catch (error) {
    console.error('❌ Unexpected Error during test execution:', error);
  } finally {
    // 6. Cleanup testing data
    console.log('\n🧹 Cleaning up test database records...');
    if (createdExamId) {
      await prisma.examMark.deleteMany({ where: { examId: createdExamId } });
      await prisma.exam.delete({ where: { id: createdExamId } });
    }
    if (createdTermId) {
      await prisma.examReportCard.deleteMany({ where: { examTermId: createdTermId } });
      await prisma.examTerm.delete({ where: { id: createdTermId } });
    }
    console.log('✅ Cleanup complete. Teardown finished.');
    await prisma.$disconnect();
  }
}

runTests();
