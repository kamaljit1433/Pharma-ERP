import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { UserRole } from '../types/auth';
import * as assetController from '../controllers/assetController';

const router = Router();

router.use(authenticateToken as any);

const hrIt = [UserRole.HR_MANAGER, UserRole.IT_ADMIN, UserRole.SUPER_ADMIN];
const hrItFinance = [UserRole.HR_MANAGER, UserRole.IT_ADMIN, UserRole.FINANCE, UserRole.SUPER_ADMIN];
const allRoles = Object.values(UserRole);

// List & create
router.get('/', authorize(allRoles) as any, assetController.listAssets);
router.post('/', authorize(hrIt) as any, assetController.createAsset);

// Categories helper
router.get('/categories', authorize(allRoles) as any, assetController.getCategories);

// By employee
router.get('/employee/:employeeId', authorize(hrItFinance) as any, assetController.getAssetsByEmployee);

// Single asset CRUD
router.get('/:id', authorize(allRoles) as any, assetController.getAsset);
router.put('/:id', authorize(hrIt) as any, assetController.updateAsset);
router.delete('/:id', authorize(hrIt) as any, assetController.deleteAsset);

// Assign / unassign
router.post('/:id/assign', authorize(hrIt) as any, assetController.assignAsset);
router.post('/:id/unassign', authorize(hrIt) as any, assetController.unassignAsset);

export default router;
