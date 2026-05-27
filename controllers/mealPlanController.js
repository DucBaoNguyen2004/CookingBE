import MealPlan from "../models/MealPlan.js";

export const addToMealPlan = async (req, res, next) => {
  try {
    const item = await MealPlan.create(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Recipe added to meal plan',
      data: { item }
    });
  } catch (error) { next(error); }
};

export const getMealPlans = async (req, res, next) => {
  try {
    const { startDate, endDate, limit, start_date } = req.query;
    let items;

    if (limit) {
      items = await MealPlan.getUpcoming(req.user.id, parseInt(limit));
    } else {
      const start = startDate || start_date;
      if (start) {
        // Use findByDateRange or getWeeklyPlan
        if (endDate) {
          items = await MealPlan.findByDateRange(req.user.id, start, endDate);
        } else {
          items = await MealPlan.getWeeklyPlan(req.user.id, start);
        }
      } else {
        // Default to upcoming 5
        items = await MealPlan.getUpcoming(req.user.id, 5);
      }
    }

    res.json({ success: true, data: { items } });
  } catch (error) { next(error); }
};

export const getWeeklyMealPlan = async (req, res, next) => {
  try {
    const { start_date, weekStartDate } = req.query;
    const startDate = start_date || weekStartDate;

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide start_date or weekStartDate'
      });
    }

    const items = await MealPlan.getWeeklyPlan(req.user.id, startDate);
    res.json({ success: true, data: { items } });
  } catch (error) { next(error); }
};

export const getUpcomingMeals = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const items = await MealPlan.getUpcoming(req.user.id, limit);
    res.json({ success: true, data: { items } });
  } catch (error) { next(error); }
};

export const deleteMealPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mealPlan = await MealPlan.delete(id, req.user.id);

    if (!mealPlan) {
      return res.status(404).json({ success: false, message: 'Meal plan entry not found' });
    }

    res.json({ success: true, message: 'Meal plan entry deleted', data: { mealPlan } });
  } catch (error) { next(error); }
};

export const getMealPlanStats = async (req, res, next) => {
  try {
    const stats = await MealPlan.getStats(req.user.id);
    res.json({ success: true, data: { stats } });
  } catch (error) { next(error); }
};