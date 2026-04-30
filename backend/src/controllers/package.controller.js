import Package from '../models/Package.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listPackages = asyncHandler(async (req, res) => {
  const packages = await Package.find().sort({ price: 1 });
  res.json({ success: true, data: packages });
});

export const getPackageById = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (!pkg) {
    throw new ApiError(404, 'Package not found');
  }
  res.json({ success: true, data: pkg });
});

export const createPackage = asyncHandler(async (req, res) => {
  const { name, price, propertyLimit, validity, isActive } = req.body;
  if (!name || price === undefined || propertyLimit === undefined || validity === undefined) {
    throw new ApiError(400, 'name, price, propertyLimit, and validity are required');
  }

  const pkg = await Package.create({
    name: String(name).trim(),
    price: Number(price),
    propertyLimit: Number(propertyLimit),
    validity: Number(validity),
    isActive: Boolean(isActive),
  });

  res.status(201).json({ success: true, data: pkg });
});

export const updatePackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (!pkg) {
    throw new ApiError(404, 'Package not found');
  }

  const updates = {};
  ['name', 'price', 'propertyLimit', 'validity', 'isActive'].forEach((field) => {
    if (field in req.body) {
      updates[field] = field === 'isActive' ? Boolean(req.body[field]) : req.body[field];
    }
  });

  Object.assign(pkg, updates);
  await pkg.save();

  res.json({ success: true, data: pkg });
});

export const deletePackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findByIdAndDelete(req.params.id);
  if (!pkg) {
    throw new ApiError(404, 'Package not found');
  }

  res.json({ success: true, message: 'Package deleted successfully' });
});
