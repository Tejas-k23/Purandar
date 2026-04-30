import { Router } from 'express';
import {
  createPackage,
  deletePackage,
  getPackageById,
  listPackages,
  updatePackage,
} from '../controllers/package.controller.js';
import { authorize, protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', listPackages);
router.get('/:id', getPackageById);

router.use(protect, authorize('admin'));
router.post('/', createPackage);
router.patch('/:id', updatePackage);
router.delete('/:id', deletePackage);

export default router;
