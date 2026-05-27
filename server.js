import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import recipeRoutes from "./routes/recipes.js";
import pantryRoutes from "./routes/pantry.js";
import mealPlanRoutes from "./routes/mealPlan.js";
import shoppingListRoutes from "./routes/shoppingList.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Cooking King ");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/pantry", pantryRoutes);
app.use("/api/meal-plan", mealPlanRoutes);
app.use("/api/shopping-list", shoppingListRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Enviroment : ${process.env.NODE_ENV || "development"}`);
});