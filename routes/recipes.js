import express from 'express';
const router = express.Router();
import * as recipeController from '../controllers/recipeController.js';
import * as recipeExportController from '../controllers/recipeExportController.js';
import authMiddleware from '../middleware/auth.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

// All routes are protected
router.use(authMiddleware);

// Excel Import/Export
router.get('/export', recipeExportController.exportRecipes);
router.post('/import', upload.single('file'), recipeExportController.importRecipes);

// AI generation
router.post('/generate', recipeController.generateRecipe);
router.get('/suggestions', recipeController.getPantrySuggestions);

// CRUD operations
router.get('/', recipeController.getRecipes);
router.get('/recent', recipeController.getRecentRecipes);
router.get('/stats', recipeController.getRecipeStats);
router.get('/:id', recipeController.getRecipeById);
router.post('/', recipeController.saveRecipe);
router.put('/:id', recipeController.updateRecipe);
router.delete('/:id', recipeController.deleteRecipe);

export default router;