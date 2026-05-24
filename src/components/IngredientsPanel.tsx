"use client";
import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Ingredient } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  ingredients: Ingredient[];
  onAdd: (item: Omit<Ingredient, "id">) => void;
  onRemove: (id: string) => void;
}

const EMPTY: Omit<Ingredient, "id"> = {
  name: "",
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  servingSize: 100,
  unit: "g",
};

interface IngredientGroup {
  label: string;
  items: Omit<Ingredient, "id">[];
}

const QUICK_ADD_GROUPS: IngredientGroup[] = [
  {
    label: "Staples",
    items: [
      { name: "Whole Wheat Flour (Atta)", calories: 340, protein: 13, carbs: 71, fat: 2.5, servingSize: 100, unit: "g" },
      { name: "Basmati Rice", calories: 350, protein: 7, carbs: 78, fat: 0.6, servingSize: 100, unit: "g" },
      { name: "Poha (Flattened Rice)", calories: 350, protein: 6, carbs: 77, fat: 1, servingSize: 100, unit: "g" },
      { name: "Semolina (Sooji/Rava)", calories: 360, protein: 13, carbs: 72, fat: 1, servingSize: 100, unit: "g" },
      { name: "Oats (Rolled)", calories: 389, protein: 17, carbs: 66, fat: 7, servingSize: 100, unit: "g" },
      { name: "Idli Rice (Parboiled)", calories: 349, protein: 7, carbs: 78, fat: 0.5, servingSize: 100, unit: "g" },
      { name: "Besan (Chickpea Flour)", calories: 387, protein: 22, carbs: 58, fat: 6, servingSize: 100, unit: "g" },
    ],
  },
  {
    label: "Dals & Legumes",
    items: [
      { name: "Toor Dal (Arhar)", calories: 343, protein: 22, carbs: 63, fat: 1.5, servingSize: 100, unit: "g" },
      { name: "Moong Dal (Yellow)", calories: 347, protein: 24, carbs: 63, fat: 1.2, servingSize: 100, unit: "g" },
      { name: "Masoor Dal (Red Lentil)", calories: 352, protein: 26, carbs: 60, fat: 1, servingSize: 100, unit: "g" },
      { name: "Chana Dal", calories: 360, protein: 22, carbs: 61, fat: 5, servingSize: 100, unit: "g" },
      { name: "Rajma (Kidney Beans)", calories: 333, protein: 24, carbs: 60, fat: 0.8, servingSize: 100, unit: "g" },
      { name: "Chickpeas (Kabuli Chana)", calories: 364, protein: 19, carbs: 61, fat: 6, servingSize: 100, unit: "g" },
      { name: "Urad Dal (Black Gram)", calories: 341, protein: 25, carbs: 60, fat: 1.4, servingSize: 100, unit: "g" },
      { name: "Whole Moong (Green Gram)", calories: 347, protein: 24, carbs: 63, fat: 1.2, servingSize: 100, unit: "g" },
    ],
  },
  {
    label: "Vegetables",
    items: [
      { name: "Potato (Aloo)", calories: 77, protein: 2, carbs: 17, fat: 0.1, servingSize: 100, unit: "g" },
      { name: "Onion", calories: 40, protein: 1.1, carbs: 9, fat: 0.1, servingSize: 100, unit: "g" },
      { name: "Tomato", calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, servingSize: 100, unit: "g" },
      { name: "Spinach (Palak)", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, servingSize: 100, unit: "g" },
      { name: "Cauliflower (Gobi)", calories: 25, protein: 1.9, carbs: 5, fat: 0.3, servingSize: 100, unit: "g" },
      { name: "Okra (Bhindi)", calories: 33, protein: 1.9, carbs: 7, fat: 0.2, servingSize: 100, unit: "g" },
      { name: "Peas (Matar)", calories: 81, protein: 5.4, carbs: 14, fat: 0.4, servingSize: 100, unit: "g" },
      { name: "Methi (Fenugreek Leaves)", calories: 49, protein: 4.4, carbs: 6, fat: 0.9, servingSize: 100, unit: "g" },
      { name: "Bottle Gourd (Lauki)", calories: 14, protein: 0.6, carbs: 3.4, fat: 0, servingSize: 100, unit: "g" },
      { name: "Bitter Gourd (Karela)", calories: 17, protein: 1, carbs: 3.7, fat: 0.2, servingSize: 100, unit: "g" },
      { name: "Brinjal (Baingan)", calories: 25, protein: 1, carbs: 6, fat: 0.2, servingSize: 100, unit: "g" },
      { name: "Capsicum (Shimla Mirch)", calories: 31, protein: 1, carbs: 6, fat: 0.3, servingSize: 100, unit: "g" },
    ],
  },
  {
    label: "Dairy & Fats",
    items: [
      { name: "Paneer", calories: 265, protein: 18, carbs: 1.2, fat: 21, servingSize: 100, unit: "g" },
      { name: "Curd (Dahi)", calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, servingSize: 100, unit: "g" },
      { name: "Milk", calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, servingSize: 100, unit: "ml" },
      { name: "Ghee", calories: 900, protein: 0, carbs: 0, fat: 100, servingSize: 100, unit: "g" },
      { name: "Butter", calories: 717, protein: 0.9, carbs: 0.1, fat: 81, servingSize: 100, unit: "g" },
      { name: "Coconut (Desiccated)", calories: 354, protein: 3.3, carbs: 15, fat: 33, servingSize: 100, unit: "g" },
    ],
  },
  {
    label: "Proteins",
    items: [
      { name: "Eggs", calories: 155, protein: 13, carbs: 1.1, fat: 11, servingSize: 100, unit: "g" },
      { name: "Chicken (Boneless)", calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: 100, unit: "g" },
      { name: "Fish (Rohu/Pomfret)", calories: 97, protein: 17, carbs: 0, fat: 2.7, servingSize: 100, unit: "g" },
      { name: "Mutton (Goat)", calories: 294, protein: 17, carbs: 0, fat: 25, servingSize: 100, unit: "g" },
      { name: "Tofu", calories: 76, protein: 8, carbs: 1.9, fat: 4.8, servingSize: 100, unit: "g" },
    ],
  },
  {
    label: "Fruits, Nuts & Seeds",
    items: [
      { name: "Banana", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, servingSize: 100, unit: "g" },
      { name: "Mango", calories: 60, protein: 0.8, carbs: 15, fat: 0.4, servingSize: 100, unit: "g" },
      { name: "Papaya", calories: 43, protein: 0.5, carbs: 11, fat: 0.3, servingSize: 100, unit: "g" },
      { name: "Guava (Amrood)", calories: 68, protein: 2.6, carbs: 14, fat: 1, servingSize: 100, unit: "g" },
      { name: "Peanuts (Moongphali)", calories: 567, protein: 26, carbs: 16, fat: 49, servingSize: 100, unit: "g" },
      { name: "Almonds (Badam)", calories: 579, protein: 21, carbs: 22, fat: 50, servingSize: 100, unit: "g" },
      { name: "Makhana (Fox Nuts)", calories: 347, protein: 9.7, carbs: 77, fat: 0.1, servingSize: 100, unit: "g" },
      { name: "Cashews (Kaju)", calories: 553, protein: 18, carbs: 30, fat: 44, servingSize: 100, unit: "g" },
    ],
  },
];

export function IngredientsPanel({ ingredients, onAdd, onRemove }: Props) {
  const [form, setForm] = useState({ ...EMPTY });
  const [showForm, setShowForm] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const [activeGroup, setActiveGroup] = useState(QUICK_ADD_GROUPS[0].label);

  const add = () => {
    if (!form.name.trim()) return;
    onAdd(form);
    setForm({ ...EMPTY });
    setShowForm(false);
  };

  const quickAdd = (item: Omit<Ingredient, "id">) => {
    if (ingredients.find((i) => i.name === item.name)) return;
    onAdd(item);
  };

  const addGroup = (group: IngredientGroup) => {
    group.items
      .filter((item) => !ingredients.find((i) => i.name === item.name))
      .forEach((item) => onAdd(item));
  };

  const field = (key: keyof typeof EMPTY, label: string, type = "text") => (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <input
        type={type}
        value={form[key] as string | number}
        onChange={(e) =>
          setForm({ ...form, [key]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value })
        }
        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
      />
    </div>
  );

  const currentGroup = QUICK_ADD_GROUPS.find((g) => g.label === activeGroup) ?? QUICK_ADD_GROUPS[0];

  return (
    <div className="space-y-4">
      {/* Quick Add */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <button
          onClick={() => setShowQuick(!showQuick)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700/50 transition-colors"
        >
          <span>Quick-add Indian pantry staples</span>
          {showQuick ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showQuick && (
          <div className="px-4 pb-4 space-y-3">
            {/* Category tabs */}
            <div className="flex gap-1 flex-wrap">
              {QUICK_ADD_GROUPS.map((g) => (
                <button
                  key={g.label}
                  onClick={() => setActiveGroup(g.label)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                    activeGroup === g.label
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-700 text-slate-400 hover:text-slate-200"
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>
            {/* Items in selected category */}
            <div className="flex flex-wrap gap-2">
              {currentGroup.items.map((item) => {
                const added = ingredients.some((i) => i.name === item.name);
                return (
                  <button
                    key={item.name}
                    onClick={() => quickAdd(item)}
                    disabled={added}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                      added
                        ? "border-emerald-600 bg-emerald-900/40 text-emerald-400 cursor-default"
                        : "border-slate-600 bg-slate-700 text-slate-300 hover:border-emerald-500 hover:text-emerald-300"
                    )}
                  >
                    {added ? "✓ " : "+ "}{item.name}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => addGroup(currentGroup)}
              className="text-xs text-emerald-500 hover:text-emerald-300 transition-colors"
            >
              + Add all {currentGroup.label.toLowerCase()}
            </button>
          </div>
        )}
      </div>

      {/* Custom add */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700/50 transition-colors"
        >
          <span className="flex items-center gap-2"><Plus size={16} /> Add custom ingredient</span>
          {showForm ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showForm && (
          <div className="px-4 pb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">{field("name", "Food name")}</div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Serving size</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={form.servingSize}
                    onChange={(e) => setForm({ ...form, servingSize: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="bg-slate-800 border border-slate-600 rounded-lg px-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option>g</option><option>ml</option><option>oz</option><option>cup</option><option>piece</option>
                  </select>
                </div>
              </div>
              {field("calories", "Calories (kcal)", "number")}
              {field("protein", "Protein (g)", "number")}
              {field("carbs", "Carbs (g)", "number")}
              {field("fat", "Fat (g)", "number")}
            </div>
            <button
              onClick={add}
              disabled={!form.name.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg py-2 text-sm font-medium transition-colors"
            >
              Add ingredient
            </button>
          </div>
        )}
      </div>

      {/* Ingredient list */}
      {ingredients.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium px-1">
            Your pantry ({ingredients.length} items)
          </p>
          {ingredients.map((ing) => (
            <div
              key={ing.id}
              className="flex items-center justify-between bg-slate-800/40 border border-slate-700 rounded-lg px-4 py-2.5 group"
            >
              <div>
                <p className="text-sm font-medium text-white">{ing.name}</p>
                <p className="text-xs text-slate-500">
                  {ing.calories} kcal · {ing.protein}g protein · {ing.carbs}g carbs · {ing.fat}g fat
                  {" "}per {ing.servingSize}{ing.unit}
                </p>
              </div>
              <button
                onClick={() => onRemove(ing.id)}
                className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
