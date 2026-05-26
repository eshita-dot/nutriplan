import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { Ingredient, NutritionGoals, WeekPlan, DayPlan, Meal } from "@/lib/types";
import { DAYS, generateId, computeDayTotals } from "@/lib/utils";

// Simple, quick everyday Indian meals — not restaurant dishes
const MEAL_IDEAS = {
  breakfast: [
    "Poha with Peas and Peanuts",
    "Besan Chilla with Curd",
    "Moong Dal Chilla",
    "Aloo Paratha with Curd",
    "Rava Upma with Coconut",
    "Masala Oats",
    "Egg Bhurji with Roti",
    "Methi Thepla with Curd",
    "Sabudana Khichdi",
    "Ragi Porridge with Banana",
    "Idli with Sambar",
    "Paneer Paratha with Pickle",
    "Banana Oats Porridge",
    "Vegetable Dosa",
  ],
  lunch: [
    "Moong Dal + Aloo Gobi Sabzi + Roti",
    "Toor Dal + Bhindi Masala + Rice",
    "Masoor Dal + Palak Sabzi + Chapati",
    "Rajma Chawal with Onion Salad",
    "Chana Masala + Roti",
    "Egg Curry + Rice",
    "Chicken Curry + Roti",
    "Toor Dal + Lauki Sabzi + Rice",
    "Moong Dal Khichdi with Ghee",
    "Paneer Bhurji + Roti",
    "Fish Curry + Rice",
    "Aloo Matar + Dal + Chapati",
    "Mixed Veg Sabzi + Dal + Roti",
    "Chole + Rice",
  ],
  dinner: [
    "Toor Dal + Aloo Sabzi + Roti",
    "Moong Dal + Bottle Gourd Sabzi + Chapati",
    "Egg Bhurji + Roti",
    "Masoor Dal + Mixed Veg + Rice",
    "Simple Khichdi with Ghee",
    "Paneer Sabzi + Roti",
    "Chicken + Roti",
    "Fish + Rice",
    "Dal + Bhindi Sabzi + Chapati",
    "Rajma + Roti",
    "Besan Chilla + Curd",
    "Aloo Paratha + Curd",
    "Dal + Lauki Sabzi + Rice",
  ],
  snack: [
    "Roasted Makhana",
    "Roasted Chana",
    "Banana with Peanut Butter",
    "Curd with Fruit",
    "Fruit Chaat",
    "Peanuts and Jaggery",
    "Boiled Egg",
    "Moong Sprouts",
    "Dates and Almonds",
    "Poha Chivda",
  ],
};

function hydrateMeal(
  raw: Record<string, unknown> | null,
  type: string,
  ingredients: Ingredient[]
): Meal | null {
  if (!raw) return null;
  return {
    id: generateId(),
    name: String(raw.name ?? "Unnamed"),
    type: type as Meal["type"],
    description: String(raw.description ?? ""),
    calories: Number(raw.calories ?? 0),
    protein: Number(raw.protein ?? 0),
    carbs: Number(raw.carbs ?? 0),
    fat: Number(raw.fat ?? 0),
    prepTime: Number(raw.prepTime ?? 20),
    instructions: Array.isArray(raw.instructions) ? raw.instructions.map(String) : [],
    ingredients: Array.isArray(raw.ingredients)
      ? (raw.ingredients as Record<string, unknown>[]).map((i) => ({
          ingredient: ingredients.find((x) => x.name === i.name) ?? {
            id: generateId(),
            name: String(i.name),
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            unit: String(i.unit ?? "g"),
            servingSize: 100,
          },
          amount: Number(i.amount ?? 0),
        }))
      : [],
  };
}

function baseSystemPrompt(): string {
  return `You are an expert in everyday Indian home cooking for busy working professionals. You know that:
- Indians ALWAYS eat dal/curry WITH roti or rice — never a sabzi alone
- Lunch and dinner must include: a grain (roti/chapati/rice/paratha) + a dal or sabzi
- Meals should be quick (under 30 minutes) — everyday home cooking, NOT restaurant dishes
- NO elaborate dishes: no Dal Makhani, no Biryani, no Kadhi, no Rogan Josh, no Butter Chicken
- The evening snack is a light chai-time snack between lunch and dinner (4-5pm)
- Return only valid JSON, no markdown fences`;
}

function buildFullPrompt(ingredients: Ingredient[], goals: NutritionGoals, numDays: number, dayNames: string[]): string {
  const ingredientList = ingredients
    .map((i) => `- ${i.name}: ${i.calories}kcal, ${i.protein}g P, ${i.carbs}g C, ${i.fat}g F per ${i.servingSize}${i.unit}`)
    .join("\n");
  const restrictions = goals.dietaryRestrictions.length > 0
    ? `STRICT dietary restrictions: ${goals.dietaryRestrictions.join(", ")}.`
    : "No dietary restrictions.";

  return `Create a ${numDays}-day Indian meal plan for a busy professional using ONLY these ingredients:

${ingredientList}

You may add: turmeric, cumin, coriander, mustard seeds, garam masala, chilli powder, hing, curry leaves, ginger, garlic, salt, oil — these are always available.

CALORIE TARGET: ~${goals.dailyCalories} kcal/day | ${restrictions}
${goals.includeSnacks ? "Include 1 evening snack per day (light, 4-5pm)." : "No snacks."}

MEAL STRUCTURE (critical):
- Breakfast: a filling Indian breakfast dish (poha, paratha, chilla, upma, idli, dosa, oats, etc.)
- Lunch: MUST = grain (roti/rice) + dal/curry + sabzi. Name it fully e.g. "Moong Dal + Aloo Gobi + Roti"
- Dinner: MUST = grain + dal/sabzi. Lighter than lunch.
- Each day must be different. Vary proteins (dal, egg, paneer, chicken, fish) across days.

INSPIRATION: ${MEAL_IDEAS.breakfast.slice(0, 5).join(" | ")} / ${MEAL_IDEAS.lunch.slice(0, 5).join(" | ")} / ${MEAL_IDEAS.dinner.slice(0, 4).join(" | ")}

Days to generate: ${dayNames.join(", ")}

JSON format:
{"days":[{"day":"Monday","breakfast":{"name":"Poha with Peas","description":"Light fluffy poha with crunchy peanuts and a squeeze of lemon","calories":350,"protein":10,"carbs":58,"fat":8,"prepTime":15,"instructions":["Rinse poha, heat oil and add mustard seeds and curry leaves","Add onion, peas and peanuts, stir in poha with turmeric and salt","Garnish with coriander and lemon juice"],"ingredients":[{"name":"Poha (Flattened Rice)","amount":80,"unit":"g"}]},"lunch":{...},"dinner":{...},"snacks":[]}]}`;
}

function buildMealPrompt(
  ingredients: Ingredient[],
  goals: NutritionGoals,
  dayName: string,
  mealType: string,
  existingMeals: string[]
): string {
  const ingredientList = ingredients
    .map((i) => `- ${i.name}: ${i.calories}kcal per ${i.servingSize}${i.unit}`)
    .join("\n");
  const restrictions = goals.dietaryRestrictions.length > 0
    ? `Restrictions: ${goals.dietaryRestrictions.join(", ")}.`
    : "";
  const avoidList = existingMeals.length > 0
    ? `Already on this day: ${existingMeals.join(", ")} — make something different.`
    : "";

  const mealGuidance = (mealType === "lunch" || mealType === "dinner")
    ? "MUST include a grain (roti/rice) + dal or sabzi. Name it fully."
    : mealType === "breakfast"
    ? "A quick filling Indian breakfast (poha, paratha, chilla, upma, idli, etc.)"
    : "A light evening snack (makhana, chana, fruit, curd, etc.) — under 200 kcal";

  return `Generate ONE ${mealType} for ${dayName}. ${avoidList}
Available ingredients: ${ingredientList}
Calorie target for this meal: ~${Math.round(goals.dailyCalories / (goals.includeSnacks ? 4 : 3))} kcal
${restrictions}
${mealGuidance}

Return JSON: {"meal":{"name":"...","description":"...","calories":0,"protein":0,"carbs":0,"fat":0,"prepTime":0,"instructions":["step1","step2"],"ingredients":[{"name":"...","amount":0,"unit":"g"}]}}`;
}

function buildDayPrompt(
  ingredients: Ingredient[],
  goals: NutritionGoals,
  dayName: string,
  otherDayMeals: string[]
): string {
  const ingredientList = ingredients
    .map((i) => `- ${i.name}: ${i.calories}kcal per ${i.servingSize}${i.unit}`)
    .join("\n");
  const restrictions = goals.dietaryRestrictions.length > 0
    ? `Restrictions: ${goals.dietaryRestrictions.join(", ")}.`
    : "";
  const avoidList = otherDayMeals.length > 0
    ? `Already planned on other days: ${otherDayMeals.join("; ")} — make this day different.`
    : "";

  const snackSchema = goals.includeSnacks
    ? `"snacks":[{"name":"<snack name>","description":"<1 line>","calories":<number>,"protein":<number>,"carbs":<number>,"fat":<number>,"prepTime":<minutes>,"instructions":["<step>"],"ingredients":[{"name":"<ingredient from list>","amount":<number>,"unit":"g"}]}]`
    : `"snacks":[]`;

  return `Generate ONE full day (${dayName}) of Indian home-cooked meals for a busy professional.
${avoidList}
Available ingredients:\n${ingredientList}
Calorie target: ~${goals.dailyCalories} kcal/day | ${restrictions}
${goals.includeSnacks ? "Include 1 light evening snack (under 200 kcal)." : "No snacks."}

Rules:
- Breakfast: quick Indian breakfast (poha, paratha, chilla, upma, idli, oats, etc.)
- Lunch: grain (roti/rice) + dal + sabzi, name e.g. "Masoor Dal + Gobhi Sabzi + Roti"
- Dinner: grain + dal/sabzi, lighter than lunch
- Use ONLY ingredients from the list above (plus common spices/oil/salt)
- Each meal must have 3-4 instruction steps and 2-4 ingredients

Respond with this JSON schema filled in with your generated meal (replace all <placeholders>):
{"day":{"day":"${dayName}","breakfast":{"name":"<breakfast name>","description":"<1 sentence>","calories":<kcal>,"protein":<g>,"carbs":<g>,"fat":<g>,"prepTime":<min>,"instructions":["<step1>","<step2>","<step3>"],"ingredients":[{"name":"<ingredient>","amount":<number>,"unit":"g"}]},"lunch":{"name":"<Dal + Sabzi + Grain>","description":"<1 sentence>","calories":<kcal>,"protein":<g>,"carbs":<g>,"fat":<g>,"prepTime":<min>,"instructions":["<step1>","<step2>","<step3>"],"ingredients":[{"name":"<ingredient>","amount":<number>,"unit":"g"},{"name":"<ingredient>","amount":<number>,"unit":"g"}]},"dinner":{"name":"<Dal + Sabzi + Grain>","description":"<1 sentence>","calories":<kcal>,"protein":<g>,"carbs":<g>,"fat":<g>,"prepTime":<min>,"instructions":["<step1>","<step2>","<step3>"],"ingredients":[{"name":"<ingredient>","amount":<number>,"unit":"g"}]},${snackSchema}}}`;
}

export const maxDuration = 60;

async function geminiJSON(apiKey: string, systemPrompt: string, userPrompt: string): Promise<Record<string, unknown>> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: systemPrompt,
    generationConfig: { responseMimeType: "application/json" },
  });
  const result = await model.generateContent(userPrompt);
  const text = result.response.text();
  return JSON.parse(text);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ingredients, goals } = body as { ingredients: Ingredient[]; goals: NutritionGoals };

    if (!ingredients || ingredients.length === 0)
      return NextResponse.json({ error: "No ingredients provided" }, { status: 400 });
    if (!process.env.GEMINI_API_KEY)
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });

    const apiKey = process.env.GEMINI_API_KEY;
    const mode: string = body.mode ?? "full";

    // ── Single meal regeneration ──────────────────────────────────
    if (mode === "meal") {
      const { dayName, mealType, existingMeals = [] } = body as {
        dayName: string; mealType: string; existingMeals: string[];
      };
      const raw = await geminiJSON(apiKey, baseSystemPrompt(), buildMealPrompt(ingredients, goals, dayName, mealType, existingMeals));
      const meal = hydrateMeal(raw.meal as Record<string, unknown>, mealType, ingredients);
      if (!meal) throw new Error("Failed to generate meal");
      return NextResponse.json({ meal });
    }

    // ── Single day regeneration ───────────────────────────────────
    if (mode === "day") {
      const { dayName, otherDayMeals = [] } = body as { dayName: string; otherDayMeals: string[] };
      const raw = await geminiJSON(apiKey, baseSystemPrompt(), buildDayPrompt(ingredients, goals, dayName, otherDayMeals));
      const d = raw.day as Record<string, unknown>;
      if (!d) throw new Error("Failed to generate day");
      const rawSnacks = Array.isArray(d.snacks) ? (d.snacks as Record<string, unknown>[]) : [];
      const dayPlan: DayPlan = computeDayTotals({
        day: String(d.day ?? dayName), date: "",
        breakfast: hydrateMeal(d.breakfast as Record<string, unknown> | null, "breakfast", ingredients),
        lunch: hydrateMeal(d.lunch as Record<string, unknown> | null, "lunch", ingredients),
        dinner: hydrateMeal(d.dinner as Record<string, unknown> | null, "dinner", ingredients),
        snacks: rawSnacks.map((s) => hydrateMeal(s, "snack", ingredients) as Meal).filter(Boolean),
        totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0,
      });
      return NextResponse.json({ day: dayPlan });
    }

    // ── Full plan generation ──────────────────────────────────────
    const duration: string = body.duration ?? "7";
    const numDays = Math.min(7, Math.max(1, parseInt(duration) || 7));
    const dayNames = DAYS.slice(0, numDays);

    const dayPlans: DayPlan[] = [];

    for (const dayName of dayNames) {
      const otherDayMeals = dayPlans.map(
        (d) => `${d.day}: ${[d.breakfast?.name, d.lunch?.name, d.dinner?.name].filter(Boolean).join(", ")}`
      );
      const raw = await geminiJSON(apiKey, baseSystemPrompt(), buildDayPrompt(ingredients, goals, dayName, otherDayMeals));
      const d = raw.day as Record<string, unknown>;
      if (!d) throw new Error(`Failed to generate day: ${dayName}`);
      const rawSnacks = Array.isArray(d.snacks) ? (d.snacks as Record<string, unknown>[]) : [];
      dayPlans.push(computeDayTotals({
        day: dayName, date: "",
        breakfast: hydrateMeal(d.breakfast as Record<string, unknown> | null, "breakfast", ingredients),
        lunch: hydrateMeal(d.lunch as Record<string, unknown> | null, "lunch", ingredients),
        dinner: hydrateMeal(d.dinner as Record<string, unknown> | null, "dinner", ingredients),
        snacks: rawSnacks.map((s) => hydrateMeal(s, "snack", ingredients) as Meal).filter(Boolean),
        totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0,
      }));
    }

    const weekPlan: WeekPlan = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      goals,
      days: dayPlans,
    };

    return NextResponse.json({ plan: weekPlan });
  } catch (err) {
    console.error("generate-plan error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    );
  }
}
