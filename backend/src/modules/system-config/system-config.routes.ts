import { Router } from 'express';
import { requireAuth, requirePermission } from '@/modules/auth/auth.middleware';
import { upload } from '@/middleware/upload.middleware';
import { SchoolProfileController } from './school-profile.controller';
import { BrandingController } from './branding.controller';
import { LeadershipController } from './leadership.controller';
import { SettingsController } from './settings.controller';
import { AcademicYearController } from './academic-year.controller';
import { AcademicTermController } from './academic-term.controller';
import { GradingScaleController } from './grading-scale.controller';

const router = Router();
router.use(requireAuth);

const readOnly = requirePermission('system.read');
const readWrite = requirePermission('system.write');

// School Profile
const schoolProfileController = new SchoolProfileController();
router.get('/school', readOnly, schoolProfileController.getProfile);
router.put('/school', readWrite, schoolProfileController.updateProfile);

// Branding
const brandingController = new BrandingController();
router.get('/branding', readOnly, brandingController.getBranding);
router.put('/branding', readWrite, brandingController.updateBranding);
router.post('/branding/logo', readWrite, upload.single('file'), brandingController.uploadLogo);
router.post(
  '/branding/favicon',
  readWrite,
  upload.single('file'),
  brandingController.uploadFavicon
);
router.post('/branding/stamp', readWrite, upload.single('file'), brandingController.uploadStamp);
router.post(
  '/branding/signature',
  readWrite,
  upload.single('file'),
  brandingController.uploadSignature
);
router.post(
  '/branding/report-header',
  readWrite,
  upload.single('file'),
  brandingController.uploadReportHeader
);
router.post(
  '/branding/report-footer',
  readWrite,
  upload.single('file'),
  brandingController.uploadReportFooter
);
router.post(
  '/branding/cover',
  readWrite,
  upload.single('file'),
  brandingController.uploadCover
);

// Leadership
const leadershipController = new LeadershipController();
router.get('/leadership', readOnly, leadershipController.getAll);
router.put('/leadership/:role', readWrite, leadershipController.updateByRole);
router.post(
  '/leadership/:role/photo',
  readWrite,
  upload.single('file'),
  leadershipController.uploadPhoto
);
router.post(
  '/leadership/:role/signature',
  readWrite,
  upload.single('file'),
  leadershipController.uploadSignature
);

// Settings
const settingsController = new SettingsController();
router.get('/settings', readOnly, settingsController.getSettings);
router.put('/settings', readWrite, settingsController.updateSettings);

// Academic Years
const academicYearController = new AcademicYearController();
router.post('/academic-years', readWrite, academicYearController.createAcademicYear);
router.get('/academic-years', readOnly, academicYearController.getAllAcademicYears);
router.get('/academic-years/:id', readOnly, academicYearController.getAcademicYearById);
router.put('/academic-years/:id', readWrite, academicYearController.updateAcademicYear);
router.delete('/academic-years/:id', readWrite, academicYearController.deleteAcademicYear);
router.post(
  '/academic-years/:id/activate',
  readWrite,
  academicYearController.activateAcademicYear
);

// Academic Terms
const academicTermController = new AcademicTermController();
router.post('/academic-terms', readWrite, academicTermController.createTerm);
router.get('/academic-terms', readOnly, academicTermController.getAllTerms);
router.put('/academic-terms/:id', readWrite, academicTermController.updateTerm);
router.delete('/academic-terms/:id', readWrite, academicTermController.deleteTerm);

// Grading Scale
const gradingScaleController = new GradingScaleController();
router.post('/grading', readWrite, gradingScaleController.createScale);
router.get('/grading', readOnly, gradingScaleController.getAllScales);
router.put('/grading/:id', readWrite, gradingScaleController.updateScale);
router.delete('/grading/:id', readWrite, gradingScaleController.deleteScale);

export default router;
