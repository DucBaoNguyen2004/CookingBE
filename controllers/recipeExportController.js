import * as XLSX from 'xlsx';
import Recipe from '../models/Recipe.js';

export const exportRecipes = async (req, res, next) => {
    try {
        const { ids } = req.query;
        console.log('Exporting recipes for user:', req.user.id, 'Selected IDs:', ids);

        let recipes;
        if (ids) {
            const idArray = Array.isArray(ids) ? ids : ids.split(',');
            recipes = await Promise.all(
                idArray.map(id => Recipe.findById(id, req.user.id))
            );
            recipes = recipes.filter(Boolean);
        } else {
            const summaryRecipes = await Recipe.findByUserId(req.user.id, { limit: 1000 });
            recipes = await Promise.all(
                summaryRecipes.map(r => Recipe.findById(r.id, req.user.id))
            );
        }

        console.log(`Processing ${recipes.length} recipes for export`);

        const data = recipes.map(r => {
            let instructionsStr = '';
            try {
                if (typeof r.instructions === 'string') {
                    // Check if it looks like a JSON array
                    if (r.instructions.trim().startsWith('[')) {
                        const parsed = JSON.parse(r.instructions);
                        instructionsStr = Array.isArray(parsed) ? parsed.join('; ') : parsed;
                    } else {
                        // Treat as single plain-text instruction
                        instructionsStr = r.instructions;
                    }
                } else if (Array.isArray(r.instructions)) {
                    instructionsStr = r.instructions.join('; ');
                } else {
                    instructionsStr = String(r.instructions || '');
                }
            } catch (e) {
                console.error(`Error parsing instructions for recipe ${r.id}:`, e);
                instructionsStr = String(r.instructions || '');
            }

            const ingredientsStr = (r.ingredients || [])
                .map(i => `${i.quantity || 0} ${i.unit || ''} ${i.name || ''}`.trim())
                .join('; ');

            return {
                'Name': r.name,
                'Description': r.description || '',
                'Cuisine Type': r.cuisine_type || '',
                'Difficulty': r.difficulty || '',
                'Prep Time (min)': r.prep_time || 0,
                'Cook Time (min)': r.cook_time || 0,
                'Servings': r.servings || 0,
                'Instructions': instructionsStr,
                'Ingredients': ingredientsStr,
                'Dietary Tags': (r.dietary_tags || []).join(', '),
                'User Notes': r.user_notes || '',
                'Calories': r.nutrition?.calories || '',
                'Protein': r.nutrition?.protein || '',
                'Carbs': r.nutrition?.carbs || '',
                'Fats': r.nutrition?.fats || '',
                'Fiber': r.nutrition?.fiber || ''
            };
        });

        console.log('Flattened data successfully, generating Excel...');

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Recipes');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=recipes.xlsx');
        res.send(buffer);

    } catch (error) {
        next(error);
    }
};

export const importRecipes = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an Excel file' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);

        const results = [];
        const errors = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
                // Parse ingredients: "200 g Chicken; 1 unit Onion"
                const ingredients = (row['Ingredients'] || '').split(';').map(ingStr => {
                    const parts = ingStr.trim().split(' ');
                    if (parts.length < 3) return null;
                    const quantity = parseFloat(parts[0]);
                    const unit = parts[1];
                    const name = parts.slice(2).join(' ');
                    return { name, quantity, unit };
                }).filter(Boolean);

                const recipeData = {
                    name: row['Name'],
                    description: row['Description'] || '',
                    cuisine_type: row['Cuisine Type'] || 'Any',
                    difficulty: row['Difficulty'] || 'Medium',
                    prep_time: parseInt(row['Prep Time (min)']) || 0,
                    cook_time: parseInt(row['Cook Time (min)']) || 0,
                    servings: parseInt(row['Servings']) || 4,
                    instructions: (row['Instructions'] || '').split(';').map(s => s.trim()).filter(Boolean),
                    dietary_tags: (row['Dietary Tags'] || '').split(',').map(s => s.trim()).filter(Boolean),
                    user_notes: row['User Notes'] || '',
                    ingredients,
                    nutrition: {
                        calories: parseFloat(row['Calories']) || 0,
                        protein: parseFloat(row['Protein']) || 0,
                        carbs: parseFloat(row['Carbs']) || 0,
                        fats: parseFloat(row['Fats']) || 0,
                        fiber: parseFloat(row['Fiber']) || 0
                    }
                };

                const recipe = await Recipe.create(req.user.id, recipeData);
                results.push(recipe);
            } catch (err) {
                console.error(`Error importing row ${i + 1}:`, err);
                errors.push(`Row ${i + 1}: ${err.message}`);
            }
        }

        res.json({
            success: true,
            message: `Successfully imported ${results.length} recipes`,
            data: {
                count: results.length,
                errors: errors.length > 0 ? errors : undefined
            }
        });

    } catch (error) {
        next(error);
    }
};
