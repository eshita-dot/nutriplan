"use client";
import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Search } from "lucide-react";
import { Ingredient } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  ingredients: Ingredient[];
  onAdd: (item: Omit<Ingredient, "id">) => void;
  onRemove: (id: string) => void;
}

const EMPTY: Omit<Ingredient, "id"> = { name: "", calories: 0, protein: 0, carbs: 0, fat: 0, servingSize: 100, unit: "g" };

interface IngredientGroup { label: string; emoji: string; items: Omit<Ingredient, "id">[]; }

const QUICK_ADD_GROUPS: IngredientGroup[] = [
  {
    label: "Grains & Staples", emoji: "🌾",
    items: [
      { name: "Whole Wheat Flour (Atta)", calories: 340, protein: 13, carbs: 71, fat: 2.5, servingSize: 100, unit: "g" },
      { name: "Basmati Rice", calories: 350, protein: 7, carbs: 78, fat: 0.6, servingSize: 100, unit: "g" },
      { name: "Brown Rice", calories: 370, protein: 8, carbs: 77, fat: 2.7, servingSize: 100, unit: "g" },
      { name: "Poha (Flattened Rice)", calories: 350, protein: 6, carbs: 77, fat: 1, servingSize: 100, unit: "g" },
      { name: "Semolina (Sooji/Rava)", calories: 360, protein: 13, carbs: 72, fat: 1, servingSize: 100, unit: "g" },
      { name: "Oats (Rolled)", calories: 389, protein: 17, carbs: 66, fat: 7, servingSize: 100, unit: "g" },
      { name: "Besan (Chickpea Flour)", calories: 387, protein: 22, carbs: 58, fat: 6, servingSize: 100, unit: "g" },
      { name: "Maida (All-purpose Flour)", calories: 364, protein: 10, carbs: 76, fat: 1, servingSize: 100, unit: "g" },
      { name: "Idli Rice (Parboiled)", calories: 349, protein: 7, carbs: 78, fat: 0.5, servingSize: 100, unit: "g" },
      { name: "Rice Flour", calories: 366, protein: 6, carbs: 80, fat: 0.5, servingSize: 100, unit: "g" },
      { name: "Bread (Whole Wheat)", calories: 247, protein: 13, carbs: 41, fat: 4, servingSize: 100, unit: "g" },
    ],
  },
  {
    label: "Millets", emoji: "🌱",
    items: [
      { name: "Jowar (Sorghum)", calories: 349, protein: 11, carbs: 73, fat: 2, servingSize: 100, unit: "g" },
      { name: "Bajra (Pearl Millet)", calories: 361, protein: 11, carbs: 67, fat: 5, servingSize: 100, unit: "g" },
      { name: "Ragi (Finger Millet)", calories: 336, protein: 7, carbs: 73, fat: 1.5, servingSize: 100, unit: "g" },
      { name: "Foxtail Millet (Kangni)", calories: 351, protein: 12, carbs: 67, fat: 4, servingSize: 100, unit: "g" },
      { name: "Barnyard Millet (Sama)", calories: 342, protein: 11, carbs: 66, fat: 2.7, servingSize: 100, unit: "g" },
      { name: "Kuttu (Buckwheat)", calories: 343, protein: 13, carbs: 72, fat: 3.4, servingSize: 100, unit: "g" },
      { name: "Sabudana (Tapioca)", calories: 352, protein: 0.2, carbs: 87, fat: 0.2, servingSize: 100, unit: "g" },
    ],
  },
  {
    label: "Dals & Legumes", emoji: "🫘",
    items: [
      { name: "Toor Dal (Arhar)", calories: 343, protein: 22, carbs: 63, fat: 1.5, servingSize: 100, unit: "g" },
      { name: "Moong Dal (Yellow)", calories: 347, protein: 24, carbs: 63, fat: 1.2, servingSize: 100, unit: "g" },
      { name: "Masoor Dal (Red Lentil)", calories: 352, protein: 26, carbs: 60, fat: 1, servingSize: 100, unit: "g" },
      { name: "Chana Dal", calories: 360, protein: 22, carbs: 61, fat: 5, servingSize: 100, unit: "g" },
      { name: "Rajma (Kidney Beans)", calories: 333, protein: 24, carbs: 60, fat: 0.8, servingSize: 100, unit: "g" },
      { name: "Chickpeas (Kabuli Chana)", calories: 364, protein: 19, carbs: 61, fat: 6, servingSize: 100, unit: "g" },
      { name: "Urad Dal (Black Gram)", calories: 341, protein: 25, carbs: 60, fat: 1.4, servingSize: 100, unit: "g" },
      { name: "Whole Moong (Green Gram)", calories: 347, protein: 24, carbs: 63, fat: 1.2, servingSize: 100, unit: "g" },
      { name: "Lobia (Black-eyed Peas)", calories: 336, protein: 24, carbs: 60, fat: 1.3, servingSize: 100, unit: "g" },
      { name: "Matki (Moth Beans)", calories: 343, protein: 23, carbs: 62, fat: 1.6, servingSize: 100, unit: "g" },
      { name: "Soy Chunks (Nutrela)", calories: 345, protein: 52, carbs: 33, fat: 0.5, servingSize: 100, unit: "g" },
    ],
  },
  {
    label: "Vegetables", emoji: "🥬",
    items: [
      { name: "Potato (Aloo)", calories: 77, protein: 2, carbs: 17, fat: 0.1, servingSize: 100, unit: "g" },
      { name: "Sweet Potato (Shakarkand)", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, servingSize: 100, unit: "g" },
      { name: "Onion", calories: 40, protein: 1.1, carbs: 9, fat: 0.1, servingSize: 100, unit: "g" },
      { name: "Tomato", calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, servingSize: 100, unit: "g" },
      { name: "Spinach (Palak)", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, servingSize: 100, unit: "g" },
      { name: "Cauliflower (Gobi)", calories: 25, protein: 1.9, carbs: 5, fat: 0.3, servingSize: 100, unit: "g" },
      { name: "Okra (Bhindi)", calories: 33, protein: 1.9, carbs: 7, fat: 0.2, servingSize: 100, unit: "g" },
      { name: "Peas (Matar)", calories: 81, protein: 5.4, carbs: 14, fat: 0.4, servingSize: 100, unit: "g" },
      { name: "Methi (Fenugreek Leaves)", calories: 49, protein: 4.4, carbs: 6, fat: 0.9, servingSize: 100, unit: "g" },
      { name: "Bottle Gourd (Lauki)", calories: 14, protein: 0.6, carbs: 3.4, fat: 0, servingSize: 100, unit: "g" },
      { name: "Brinjal (Baingan)", calories: 25, protein: 1, carbs: 6, fat: 0.2, servingSize: 100, unit: "g" },
      { name: "Capsicum (Shimla Mirch)", calories: 31, protein: 1, carbs: 6, fat: 0.3, servingSize: 100, unit: "g" },
      { name: "Bitter Gourd (Karela)", calories: 17, protein: 1, carbs: 3.7, fat: 0.2, servingSize: 100, unit: "g" },
      { name: "Carrot (Gajar)", calories: 41, protein: 0.9, carbs: 10, fat: 0.2, servingSize: 100, unit: "g" },
      { name: "Beetroot", calories: 43, protein: 1.6, carbs: 10, fat: 0.2, servingSize: 100, unit: "g" },
      { name: "Drumstick (Sahjan)", calories: 37, protein: 2.1, carbs: 8.5, fat: 0.2, servingSize: 100, unit: "g" },
      { name: "Pumpkin (Kaddu)", calories: 26, protein: 1, carbs: 6.5, fat: 0.1, servingSize: 100, unit: "g" },
      { name: "Radish (Mooli)", calories: 16, protein: 0.7, carbs: 3.4, fat: 0.1, servingSize: 100, unit: "g" },
      { name: "French Beans", calories: 31, protein: 1.8, carbs: 7, fat: 0.1, servingSize: 100, unit: "g" },
      { name: "Mushroom", calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, servingSize: 100, unit: "g" },
      { name: "Corn (Makka)", calories: 86, protein: 3.2, carbs: 19, fat: 1.2, servingSize: 100, unit: "g" },
      { name: "Raw Banana (Kaccha Kela)", calories: 89, protein: 1.3, carbs: 23, fat: 0.3, servingSize: 100, unit: "g" },
    ],
  },
  {
    label: "Dairy & Fats", emoji: "🥛",
    items: [
      { name: "Paneer", calories: 265, protein: 18, carbs: 1.2, fat: 21, servingSize: 100, unit: "g" },
      { name: "Curd (Dahi)", calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, servingSize: 100, unit: "g" },
      { name: "Milk (Full Fat)", calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, servingSize: 100, unit: "ml" },
      { name: "Milk (Toned)", calories: 44, protein: 3.5, carbs: 5, fat: 1.5, servingSize: 100, unit: "ml" },
      { name: "Ghee", calories: 900, protein: 0, carbs: 0, fat: 100, servingSize: 100, unit: "g" },
      { name: "Butter", calories: 717, protein: 0.9, carbs: 0.1, fat: 81, servingSize: 100, unit: "g" },
      { name: "Coconut Oil", calories: 862, protein: 0, carbs: 0, fat: 100, servingSize: 100, unit: "g" },
      { name: "Coconut (Desiccated)", calories: 354, protein: 3.3, carbs: 15, fat: 33, servingSize: 100, unit: "g" },
      { name: "Coconut Milk", calories: 230, protein: 2.3, carbs: 6, fat: 24, servingSize: 100, unit: "ml" },
      { name: "Cream (Malai)", calories: 340, protein: 2.8, carbs: 4, fat: 36, servingSize: 100, unit: "g" },
      { name: "Khoa (Mawa)", calories: 421, protein: 20, carbs: 26, fat: 26, servingSize: 100, unit: "g" },
    ],
  },
  {
    label: "Proteins", emoji: "🍗",
    items: [
      { name: "Eggs", calories: 155, protein: 13, carbs: 1.1, fat: 11, servingSize: 100, unit: "g" },
      { name: "Chicken (Boneless)", calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: 100, unit: "g" },
      { name: "Chicken (With Bone)", calories: 239, protein: 27, carbs: 0, fat: 14, servingSize: 100, unit: "g" },
      { name: "Fish (Rohu)", calories: 97, protein: 17, carbs: 0, fat: 2.7, servingSize: 100, unit: "g" },
      { name: "Fish (Pomfret)", calories: 93, protein: 18, carbs: 0, fat: 2.2, servingSize: 100, unit: "g" },
      { name: "Prawns/Shrimp", calories: 99, protein: 24, carbs: 0.2, fat: 0.3, servingSize: 100, unit: "g" },
      { name: "Mutton (Goat)", calories: 294, protein: 17, carbs: 0, fat: 25, servingSize: 100, unit: "g" },
      { name: "Tofu", calories: 76, protein: 8, carbs: 1.9, fat: 4.8, servingSize: 100, unit: "g" },
    ],
  },
  {
    label: "Fruits, Nuts & Seeds", emoji: "🍎",
    items: [
      { name: "Banana", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, servingSize: 100, unit: "g" },
      { name: "Mango", calories: 60, protein: 0.8, carbs: 15, fat: 0.4, servingSize: 100, unit: "g" },
      { name: "Apple", calories: 52, protein: 0.3, carbs: 14, fat: 0.2, servingSize: 100, unit: "g" },
      { name: "Papaya", calories: 43, protein: 0.5, carbs: 11, fat: 0.3, servingSize: 100, unit: "g" },
      { name: "Guava (Amrood)", calories: 68, protein: 2.6, carbs: 14, fat: 1, servingSize: 100, unit: "g" },
      { name: "Pomegranate (Anar)", calories: 83, protein: 1.7, carbs: 19, fat: 1.2, servingSize: 100, unit: "g" },
      { name: "Dates (Khajoor)", calories: 282, protein: 2.5, carbs: 75, fat: 0.4, servingSize: 100, unit: "g" },
      { name: "Peanuts (Moongphali)", calories: 567, protein: 26, carbs: 16, fat: 49, servingSize: 100, unit: "g" },
      { name: "Almonds (Badam)", calories: 579, protein: 21, carbs: 22, fat: 50, servingSize: 100, unit: "g" },
      { name: "Cashews (Kaju)", calories: 553, protein: 18, carbs: 30, fat: 44, servingSize: 100, unit: "g" },
      { name: "Walnuts (Akhrot)", calories: 654, protein: 15, carbs: 14, fat: 65, servingSize: 100, unit: "g" },
      { name: "Makhana (Fox Nuts)", calories: 347, protein: 9.7, carbs: 77, fat: 0.1, servingSize: 100, unit: "g" },
      { name: "Flaxseeds (Alsi)", calories: 534, protein: 18, carbs: 29, fat: 42, servingSize: 100, unit: "g" },
      { name: "Sesame Seeds (Til)", calories: 573, protein: 17, carbs: 23, fat: 50, servingSize: 100, unit: "g" },
      { name: "Chia Seeds", calories: 486, protein: 17, carbs: 42, fat: 31, servingSize: 100, unit: "g" },
    ],
  },
];

export function IngredientsPanel({ ingredients, onAdd, onRemove }: Props) {
  const [form, setForm] = useState({ ...EMPTY });
  const [showForm, setShowForm] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const [activeGroup, setActiveGroup] = useState(QUICK_ADD_GROUPS[0].label);
  const [search, setSearch] = useState("");

  const add = () => {
    if (!form.name.trim()) return;
    onAdd(form);
    setForm({ ...EMPTY });
    setShowForm(false);
  };

  // Toggle: add if not present, remove if present
  const quickToggle = (item: Omit<Ingredient, "id">) => {
    const existing = ingredients.find((i) => i.name === item.name);
    if (existing) {
      onRemove(existing.id);
    } else {
      onAdd(item);
    }
  };

  const addGroup = (group: IngredientGroup) => {
    group.items
      .filter((item) => !ingredients.find((i) => i.name === item.name))
      .forEach((item) => onAdd(item));
  };

  const currentGroup = QUICK_ADD_GROUPS.find((g) => g.label === activeGroup) ?? QUICK_ADD_GROUPS[0];
  const filteredItems = search.trim()
    ? QUICK_ADD_GROUPS.flatMap((g) => g.items).filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      )
    : currentGroup.items;

  const field = (key: keyof typeof EMPTY, label: string, type = "text") => (
    <div>
      <label className="block text-xs text-stone-500 mb-1 font-medium">{label}</label>
      <input
        type={type}
        value={form[key] as string | number}
        onChange={(e) =>
          setForm({ ...form, [key]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value })
        }
        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-sm text-stone-800 focus:outline-none focus:border-teal-400 transition-colors"
      />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Quick Add */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <button
          onClick={() => setShowQuick(!showQuick)}
          className="w-full flex items-center justify-between px-5 py-4 text-sm font-bold text-stone-700 hover:bg-stone-50 transition-colors"
        >
          <span>🧺 Quick-add from pantry</span>
          {showQuick ? <ChevronUp size={16} className="text-stone-400" /> : <ChevronDown size={16} className="text-stone-400" />}
        </button>

        {showQuick && (
          <div className="px-5 pb-5 space-y-4 border-t border-stone-100">
            {/* Search */}
            <div className="relative mt-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search ingredients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-teal-400 transition-colors"
              />
            </div>

            {/* Category tabs */}
            {!search && (
              <div className="flex gap-2 flex-wrap">
                {QUICK_ADD_GROUPS.map((g) => (
                  <button
                    key={g.label}
                    onClick={() => setActiveGroup(g.label)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
                      activeGroup === g.label
                        ? "bg-teal-500 text-white border-teal-500"
                        : "bg-white text-stone-600 border-stone-200 hover:border-teal-300 hover:text-teal-700"
                    )}
                  >
                    {g.emoji} {g.label}
                  </button>
                ))}
              </div>
            )}

            {/* Items — click to toggle add/remove */}
            <div className="flex flex-wrap gap-2">
              {filteredItems.map((item) => {
                const added = ingredients.some((i) => i.name === item.name);
                return (
                  <button
                    key={item.name}
                    onClick={() => quickToggle(item)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      added
                        ? "border-teal-400 bg-teal-50 text-teal-800 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                        : "border-stone-200 bg-white text-stone-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"
                    )}
                    title={added ? "Click to remove" : "Click to add"}
                  >
                    {added ? "✓ " : "+ "}{item.name}
                  </button>
                );
              })}
              {filteredItems.length === 0 && (
                <p className="text-xs text-stone-400 py-2">No ingredients match.</p>
              )}
            </div>

            {!search && (
              <button
                onClick={() => addGroup(currentGroup)}
                className="text-xs text-teal-600 hover:text-teal-700 font-semibold transition-colors"
              >
                + Add all {currentGroup.label.toLowerCase()}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Custom ingredient */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center justify-between px-5 py-4 text-sm font-bold text-stone-700 hover:bg-stone-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Plus size={15} className="text-teal-600" /> Add custom ingredient
          </span>
          {showForm ? <ChevronUp size={16} className="text-stone-400" /> : <ChevronDown size={16} className="text-stone-400" />}
        </button>
        {showForm && (
          <div className="px-5 pb-5 space-y-3 border-t border-stone-100 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">{field("name", "Food name")}</div>
              <div>
                <label className="block text-xs text-stone-500 mb-1 font-medium">Serving size</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={form.servingSize}
                    onChange={(e) => setForm({ ...form, servingSize: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-sm text-stone-800 focus:outline-none focus:border-teal-400"
                  />
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="bg-stone-50 border border-stone-200 rounded-xl px-2 text-sm text-stone-800 focus:outline-none focus:border-teal-400"
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
              className="w-full bg-teal-500 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-2.5 text-sm font-bold transition-colors"
            >
              Add to pantry
            </button>
          </div>
        )}
      </div>

      {/* Pantry list */}
      {ingredients.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-stone-400 uppercase tracking-wider font-bold px-1">
            Your pantry — {ingredients.length} item{ingredients.length !== 1 ? "s" : ""}
          </p>
          {ingredients.map((ing) => (
            <div
              key={ing.id}
              className="flex items-center justify-between bg-white border border-stone-200 rounded-xl px-4 py-3 group hover:border-stone-300 transition-colors shadow-sm"
            >
              <div>
                <p className="text-sm font-semibold text-stone-800">{ing.name}</p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {ing.calories} kcal · {ing.protein}g P · {ing.carbs}g C · {ing.fat}g F per {ing.servingSize}{ing.unit}
                </p>
              </div>
              <button
                onClick={() => onRemove(ing.id)}
                className="text-stone-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg hover:bg-red-50"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
