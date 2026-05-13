import { Request, Response, NextFunction } from 'express';
import { AssetService } from '../services/assetService';
import { getKnexInstance } from '../config/knex';

const assetService = new AssetService(getKnexInstance());

export const createAsset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const asset = await assetService.createAsset(req.body);
    res.status(201).json({ success: true, data: asset, message: 'Asset created successfully' });
  } catch (err) { next(err); }
};

export const listAssets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, category, assigned_to, search, page, limit } = req.query as Record<string, string>;
    const result = await assetService.listAssets({
      status,
      category,
      assigned_to,
      search,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const getAsset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const asset = await assetService.getAsset(req.params['id']!);
    res.status(200).json({ success: true, data: asset });
  } catch (err) { next(err); }
};

export const getAssetsByEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assets = await assetService.getAssetsByEmployee(req.params['employeeId']!);
    res.status(200).json({ success: true, data: assets, count: assets.length });
  } catch (err) { next(err); }
};

export const updateAsset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const asset = await assetService.updateAsset(req.params['id']!, req.body);
    res.status(200).json({ success: true, data: asset, message: 'Asset updated successfully' });
  } catch (err) { next(err); }
};

export const assignAsset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) {
      res.status(400).json({ success: false, message: 'employeeId is required' });
      return;
    }
    const asset = await assetService.assignAsset(req.params['id']!, employeeId);
    res.status(200).json({ success: true, data: asset, message: 'Asset assigned successfully' });
  } catch (err) { next(err); }
};

export const unassignAsset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const asset = await assetService.unassignAsset(req.params['id']!);
    res.status(200).json({ success: true, data: asset, message: 'Asset unassigned successfully' });
  } catch (err) { next(err); }
};

export const deleteAsset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await assetService.deleteAsset(req.params['id']!);
    res.status(200).json({ success: true, message: 'Asset deleted successfully' });
  } catch (err) { next(err); }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await assetService.getCategories();
    res.status(200).json({ success: true, data: categories });
  } catch (err) { next(err); }
};
