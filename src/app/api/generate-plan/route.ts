import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { Ingredient, NutritionGoals, WeekPlan, DayPlan, Meal } from "@/lib/types";
import { DAYS, generateId, computeDayTotals } from "@/lib/utils";

const INDIAN_MEAL_IDEAS = {
  breakfast: [
    "Masala Oats Upma", "Moong Dal Chilla", "Besan Chilla", "Aloo Paratha",
    "Methi Thepla", "Poha with Peas & Peanuts", "Rava Upma (Semolina Upma)",
    "Idli with Sambar", "Vegetable Dosa", "Egg Bhurji with Toast",
    "Paneer Paratha", "Dal Cheela", "Sabudana Khichdi", "Ragi Porridge",
  ],
  lunch: [
    "Dal Tadka with Roti", "Rajma Chawal", "Chana Masala with Bhatura",
    "Palak Paneer with Roti", "Aloo Gobi Sabzi with Chapati",
    "Chicken Curry with Rice", "Fish Curry with Rice", "Bhindi Masala with Dal & Rice",
    "Mixed Dal Khichdi", "Methi Matar Malai with Roti", "Egg Curry with Rice",
    "Lauki Chana Dal", "Mutton Curry with Roti", "Tofu Matar with Rice",
  ],
  dinner: [
    "Dal Makhani with Tandoori Roti", "Paneer Butter Masala with Naan",
    "Chicken Tikka Masala with Rice", "Baingan Bharta with Rotis",
    "Egg Anda Curry with Rice", "Palak Dal with Jeera Rice",
    "Rajma Curry with Brown Rice", "Aloo Matar with Chapati",
    "Tarka Dal with Ghee Rice", "Fish Masala with Roti",
    "Khichdi with Kadhi", "Mutton Rogan Josh with Roti",
    "Mixed Vegetable Curry with Rice",
  ],
  snack: [
    "Roasted Makhana (Fox Nuts)", "Moong Dal Sprouts Chaat",
    "Peanut Chikki", "Roasted Chana", "Fruit Chaat with Chaat Masala",
    "Curd with Banana", "Besan Ladoo", "Poha Chivda",
    "Dahi with Jaggery", "Boiled Egg with Chaat Masala",
    "Makhana Namkeen", "Peanut-Banana Smoothie",
  ],
};

function buildPrompt(ingredients: Ingredient[], goals: NutritionGoals): string {
  const ingredientList = ingredients
    .map(
      (i) =>
        `- ${i.name}: ${i.calories} kcal, ${i.protein}g protein, ${i.carbs}g carbs, ${i.fat}g fat per ${i.servingSize}${i.unit}`
    )
    .join("\n");

  const restrictions =
    goals.dietaryRestrictions.length > 0
      ? `Dietary restrictions (STRICTLY follow): ${goals.dietaryRestrictions.join(", ")}.`
      : "No dietary restrictions.";

  return `You are an expert Indian nutritionist and home chef. Create an authentic, varied 7-day Indian meal plan using ONLY the ingredients listed below.

AVAILABLE INGREDIENTS:
${ingredientList}

IMPORTANT: You may freely use common Indian spices and condiments in your recipes (turmeric, cumin, coriander, mustard seeds, garam masala, chilli powder, asafoetida/hing, curry leaves, ginger, garlic, salt, oil) even if not listed — these are pantry staples. Do NOT use any other unlisted ingredient as a main component.

DAILY NUTRITION TARGETS:
- Calories: ${goals.dailyCalories} kcal
- Protein: ${goals.proteinGrams}g
- Carbs: ${goals.carbsGrams}g
- Fat: ${goals.fatGrams}g
- ${restrictions}
${goals.includeSnacks ? "- Include 1 snack per day" : "- No snacks needed"}

MEAL INSPIRATION (use these as guides for authentic Indian dishes, adapt to available ingredients):
Breakfast ideas: ${INDIAN_MEAL_IDEAS.breakfast.slice(0, 6).join(", ")}
Lunch ideas: ${INDIAN_MEAL_IDEAS.lunch.slice(0, 6).join(", ")}
Dinner ideas: ${INDIAN_MEAL_IDEAS.dinner.slice(0, 6).join(", ")}
${goals.includeSnacks ? `Snack ideas: ${INDIAN_MEAL_IDEAS.snack.slice(0, 5).join(", ")}` : ""}

Return a JSON object with exactly this structure (raw JSON only, no markdown fences):
{
  "days": [
    {
      "day": "Monday",
      "breakfast": {
        "name": "Indian meal name (e.g. Moong Dal Chilla)",
        "description": "One appetizing sentence describing the dish",
        "calories": 420,
        "protein": 18,
        "carbs": 55,
        "fat": 10,
        "prepTime": 15,
        "instructions": ["Step 1 with Indian cooking technique", "Step 2", "Step 3", "Step 4"],
        "ingredients": [
          { "name": "Exact ingredient name from list", "amount": 80, "unit": "g" }
        ]
      },
      "lunch": { ...same structure },
      "dinner": { ...same structure },
      "snacks": [{ ...same structure }]
    }
  ]
}

Rules:
1. All meal names must be authentic Indian dish names (Hindi/regional names preferred)
2. No two days should repeat the same meal
3. Vary regional cuisines across the week: North Indian, South Indian, Maharashtrian, Bengali, Gujarati
4. Keep daily nutrition totals close to targets (within 10%)
5. Instructions should reflect real Indian cooking (tadka, tempering, rolling rotis, etc.) — 3-6 steps
6. All numeric values must be realistic positive integers
7. Include all 7 days: Monday through Sunday
8. Ingredient names in the ingredients array must match the available ingredients list exactly
${goals.includeSnacks ? "9. Include exactly 1 snack per day" : "9. Set snacks to empty array []"}
10. Descriptions should be appetizing and mention key flavours (spicy, tangy, creamy, smoky, etc.)`;
}

export async function POST(req: NextRequest) {
  try {
    const { ingredients, goals }: { ingredients: Ingredient[]; goals: NutritionGoals } =
      await req.json();

    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json({ error: "No ingredients provided" }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
    }

    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 8000,
      messages: [
        {
          role: "system",
          content:
            "You are an expert Indian nutritionist and chef AI. You deeply understand Indian cuisine — dals, sabzis, rotis, rice dishes, regional variations. You return only valid JSON meal plans with authentic Indian meal names and cooking instructions. Never include markdown code fences or explanations — return raw JSON only.",
        },
        {
          role: "user",
          content: buildPrompt(ingredients, goals),
        },
      ],
    });

    const rawText = completion.choices[0]?.message?.content ?? "";

    let parsed: { days: unknown[] };
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No valid JSON in response");
      parsed = JSON.parse(jsonMatch[0]);
    }

    // Hydrate full Meal objects with generated IDs
    const dayPlans: DayPlan[] = (parsed.days as Record<string, unknown>[]).map(
      (d: Record<string, unknown>, idx: number) => {
        const hydrateMeal = (raw: Record<string, unknown> | null, type: string): Meal | null => {
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
            prepTime: Number(raw.prepTime ?? 15),
            instructions: Array.isArray(raw.instructions)
              ? raw.instructions.map(String)
              : [],
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
        };

        const rawSnacks = Array.isArray(d.snacks) ? (d.snacks as Record<string, unknown>[]) : [];
        const base: DayPlan = {
          day: DAYS[idx] ?? String(d.day),
          date: "",
          breakfast: hydrateMeal(d.breakfast as Record<string, unknown> | null, "breakfast"),
          lunch: hydrateMeal(d.lunch as Record<string, unknown> | null, "lunch"),
          dinner: hydrateMeal(d.dinner as Record<string, unknown> | null, "dinner"),
          snacks: rawSnacks.map((s) => hydrateMeal(s, "snack") as Meal).filter(Boolean),
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
        };
        return computeDayTotals(base);
      }
    );

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
