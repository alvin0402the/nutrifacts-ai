import React, { useState, useEffect } from "react";
import { Search, Loader2, Info, History, Star, Crown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Droplets, Flame, Zap, Plus, Minus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { FoodData, UserProfile, PlanTier, FoodCategory } from "../types";
import { getFoodNutrition } from "../services/geminiService";
import { MacroChart } from "./MacroChart";
import { NutrientTable } from "./NutrientTable";
import { CustomFoodDialog } from "./CustomFoodDialog";
import { ProfileManager } from "./ProfileManager";
import { ScientificStudies } from "./ScientificStudies";
import { PricingPlans } from "./PricingPlans";
import { FoodEncyclopedia } from "./FoodEncyclopedia";
import { HealthReports } from "./HealthReports";
import { NutritionSkeleton } from "./NutritionSkeleton";
import { UpgradeModal } from "./UpgradeModal";
import { motion, AnimatePresence } from "motion/react";

const CATEGORIES: FoodCategory[] = ["Vegetables", "Fruit", "Meat", "Dairy", "Grains", "Other"];

const COMMON_FOODS: Record<FoodCategory, string[]> = {
  Vegetables: ["Broccoli", "Spinach", "Sweet Potato", "Kale", "Carrots"],
  Fruit: ["Blueberries", "Apple", "Banana", "Avocado", "Strawberries"],
  Meat: ["Chicken Breast", "Salmon", "Beef Liver", "Eggs", "Turkey"],
  Dairy: ["Greek Yogurt", "Cottage Cheese", "Milk", "Cheese", "Kefir"],
  Grains: ["Quinoa", "Oats", "Brown Rice", "Lentils", "Chickpeas"],
  Other: ["Almonds", "Walnuts", "Chia Seeds", "Olive Oil", "Dark Chocolate"]
};

const DEFAULT_PROFILE: UserProfile = {
  name: "Nathan",
  weight: 70,
  height: 175,
  age: 25,
  lastUpdated: new Date().toISOString(),
  isPremium: false,
  plan: 'Free',
  dailyTargets: {
    calories: 2500,
    protein: 150,
    water: 3000
  }
};

export default function NutritionDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [foodData, setFoodData] = useState<FoodData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customFoods, setCustomFoods] = useState<FoodData[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>("Vegetables");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
  // Daily Tracking State
  const [dailyIntake, setDailyIntake] = useState({
    calories: 0,
    protein: 0,
    water: 0
  });

  useEffect(() => {
    const savedFoods = localStorage.getItem("custom_foods");
    if (savedFoods) {
      setCustomFoods(JSON.parse(savedFoods));
    }

    const savedProfile = localStorage.getItem("user_profile");
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }

    const savedIntake = localStorage.getItem("daily_intake");
    if (savedIntake) {
      setDailyIntake(JSON.parse(savedIntake));
    }

    // Handle Stripe Success
    const handleStripeSuccess = async () => {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get('session_id');
      const plan = params.get('plan') as PlanTier;

      if (sessionId && user && userProfile.plan !== plan) {
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            plan: plan || 'Pro',
            isPremium: true,
            lastUpdated: new Date().toISOString()
          });

          const updatedProfile = {
            ...userProfile,
            plan: plan || 'Pro',
            isPremium: true
          };
          setUserProfile(updatedProfile);
          localStorage.setItem("user_profile", JSON.stringify(updatedProfile));
          
          // Clear params from URL
          navigate('/dashboard', { replace: true });
        } catch (error) {
          console.error("Error updating premium status:", error);
        }
      }
    };

    handleStripeSuccess();
  }, [location.search, user, userProfile.plan]);

  const updateDailyIntake = (update: Partial<typeof dailyIntake>) => {
    const newIntake = { ...dailyIntake, ...update };
    setDailyIntake(newIntake);
    localStorage.setItem("daily_intake", JSON.stringify(newIntake));
  };

  const addFoodToIntake = (food: FoodData) => {
    updateDailyIntake({
      calories: dailyIntake.calories + food.calories,
      protein: dailyIntake.protein + food.macros.protein
    });
  };

  const saveCustomFood = (food: FoodData) => {
    const updated = [...customFoods, food];
    setCustomFoods(updated);
    localStorage.setItem("custom_foods", JSON.stringify(updated));
    setFoodData(food);
  };

  const updateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem("user_profile", JSON.stringify(profile));
  };

  const handleSelectPlan = (plan: PlanTier) => {
    const isPremium = plan !== 'Free';
    updateProfile({ ...userProfile, plan, isPremium });
  };

  const handleSearch = async (query: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = query.trim();
    if (!q) return;

    // Check custom foods first
    const custom = customFoods.find(f => f.name.toLowerCase() === q.toLowerCase());
    if (custom) {
      setFoodData(custom);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getFoodNutrition(q);
      setFoodData(data);
    } catch (err) {
      setError("Failed to fetch nutritional data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header & Search */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 italic uppercase">
              NutriFacts <span className="text-blue-600">AI</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              Welcome back, <span className="text-blue-600 dark:text-blue-400 font-bold">{user?.displayName || userProfile.name}</span>! Your intelligent nutritional encyclopedia
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
            <form onSubmit={(e) => handleSearch(searchQuery, e)} className="flex flex-1 gap-2 w-full sm:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search chicken, broccoli..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-zinc-900 h-11"
                />
              </div>
              <Button type="submit" disabled={loading} className="h-11 px-6">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyze"}
              </Button>
            </form>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div onClick={() => !userProfile.isPremium && navigate('/upgrade')}>
                <HealthReports profile={userProfile} onUpdate={updateProfile} />
              </div>
              <FoodEncyclopedia />
              <PricingPlans currentPlan={userProfile.plan} onSelectPlan={handleSelectPlan} />
              <CustomFoodDialog onAdd={saveCustomFood} />
              <ProfileManager profile={userProfile} onUpdate={updateProfile} />
              <Button variant="ghost" size="sm" onClick={signOut} className="text-zinc-500 hover:text-red-500">
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Daily Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-950/30 rounded-lg">
                  <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Daily Calories</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-black tabular-nums">{dailyIntake.calories}</h3>
                  <span className="text-xs text-zinc-500">/ {userProfile.dailyTargets?.calories} kcal</span>
                </div>
                <Progress value={(dailyIntake.calories / (userProfile.dailyTargets?.calories || 2500)) * 100} className="h-2 bg-zinc-100 dark:bg-zinc-800" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Daily Protein</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-black tabular-nums">{dailyIntake.protein}g</h3>
                  <span className="text-xs text-zinc-500">/ {userProfile.dailyTargets?.protein}g</span>
                </div>
                <Progress value={(dailyIntake.protein / (userProfile.dailyTargets?.protein || 150)) * 100} className="h-2 bg-zinc-100 dark:bg-zinc-800" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-cyan-100 dark:bg-cyan-950/30 rounded-lg">
                  <Droplets className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full"
                    onClick={() => updateDailyIntake({ water: Math.max(0, dailyIntake.water - 250) })}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full bg-cyan-50 dark:bg-cyan-950/50"
                    onClick={() => updateDailyIntake({ water: dailyIntake.water + 250 })}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-black tabular-nums">{dailyIntake.water}ml</h3>
                  <span className="text-xs text-zinc-500">/ {userProfile.dailyTargets?.water}ml</span>
                </div>
                <Progress value={(dailyIntake.water / (userProfile.dailyTargets?.water || 3000)) * 100} className="h-2 bg-zinc-100 dark:bg-zinc-800" />
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
            <CardContent className="pt-6">
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
            </CardContent>
          </Card>
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <NutritionSkeleton />
            </motion.div>
          ) : foodData ? (
            <motion.div
              key={foodData.id || foodData.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Summary Card */}
              <Card className="lg:col-span-1 shadow-sm border-zinc-200 dark:border-zinc-800 overflow-hidden">
                {foodData.imageUrl && (
                  <div className="h-48 w-full overflow-hidden relative">
                    <img 
                      src={foodData.imageUrl} 
                      alt={foodData.visualDescription || foodData.name}
                      title={foodData.visualDescription}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-blue-500 border-none text-[10px] uppercase tracking-wider">
                          {foodData.category}
                        </Badge>
                        <Badge variant="secondary" className="bg-white/20 backdrop-blur-md text-white border-none text-[10px]">
                          {foodData.servingSize}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
                <CardHeader className={foodData.imageUrl ? "pt-4" : ""}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{foodData.name}</CardTitle>
                    {!foodData.imageUrl && (
                      <Badge variant={foodData.isCustom ? "outline" : "secondary"}>
                        {foodData.isCustom ? "Custom" : foodData.servingSize}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>Nutritional summary per serving</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                    <div className="text-center flex-1 border-r border-zinc-200 dark:border-zinc-800">
                      <p className="text-2xl font-bold">{foodData.calories}</p>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider">Calories</p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-2xl font-bold">{foodData.macros.protein}g</p>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider">Protein</p>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/20"
                    onClick={() => addFoodToIntake(foodData)}
                  >
                    Add to Daily Intake
                  </Button>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Macronutrient Ratio</h4>
                    <MacroChart 
                      protein={foodData.macros.protein} 
                      fat={foodData.macros.fat} 
                      carbs={foodData.macros.carbs} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                      <p className="text-sm text-zinc-500">Total Fat</p>
                      <p className="text-lg font-semibold">{foodData.macros.fat}g</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                      <p className="text-sm text-zinc-500">Total Carbs</p>
                      <p className="text-lg font-semibold">{foodData.macros.carbs}g</p>
                    </div>
                  </div>

                  {userProfile.isPremium ? (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <Crown className="h-4 w-4 fill-amber-500" />
                        <span className="text-sm font-bold uppercase tracking-wider">Premium Insight</span>
                      </div>
                      <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                        Based on your profile ({userProfile.weight}kg, {userProfile.age}y), this serving provides 
                        <strong> {((foodData.macros.protein / (userProfile.weight * 0.8)) * 100).toFixed(1)}%</strong> of your minimum 
                        daily protein requirement.
                      </p>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/10 text-amber-700 dark:text-amber-400 gap-2"
                      onClick={() => navigate('/upgrade')}
                    >
                      <Crown className="h-4 w-4" />
                      Unlock Premium Insights
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Detailed Breakdown */}
              <Card className="lg:col-span-2 shadow-sm border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle>Nutrient Breakdown</CardTitle>
                  <CardDescription>Detailed list of vitamins, minerals, and other compounds</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="vitamins" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 mb-6">
                      <TabsTrigger value="vitamins">Vitamins</TabsTrigger>
                      <TabsTrigger value="minerals">Minerals</TabsTrigger>
                      <TabsTrigger 
                        value={userProfile.isPremium ? "protein" : "locked"} 
                        onClick={() => !userProfile.isPremium && navigate('/upgrade')}
                      >
                        {userProfile.isPremium ? "Protein" : "🔒 Protein"}
                      </TabsTrigger>
                      <TabsTrigger 
                        value={userProfile.isPremium ? "fats" : "locked"}
                        onClick={() => !userProfile.isPremium && navigate('/upgrade')}
                      >
                        {userProfile.isPremium ? "Fats" : "🔒 Fats"}
                      </TabsTrigger>
                      <TabsTrigger 
                        value={userProfile.isPremium ? "enzymes" : "locked"}
                        onClick={() => !userProfile.isPremium && navigate('/upgrade')}
                      >
                        {userProfile.isPremium ? "Enzymes" : "🔒 Enzymes"}
                      </TabsTrigger>
                      <TabsTrigger value="other">Other</TabsTrigger>
                      <TabsTrigger 
                        value={userProfile.isPremium ? "studies" : "locked"}
                        onClick={() => !userProfile.isPremium && navigate('/upgrade')}
                      >
                        {userProfile.isPremium ? "Studies" : "🔒 Studies"}
                      </TabsTrigger>
                    </TabsList>
                    <ScrollArea className="h-[500px] pr-4">
                      <TabsContent value="vitamins" className="mt-0">
                        <NutrientTable title="Vitamins" nutrients={foodData.vitamins} />
                      </TabsContent>
                      <TabsContent value="minerals" className="mt-0">
                        <NutrientTable title="Minerals" nutrients={foodData.minerals} />
                      </TabsContent>
                      <TabsContent value="protein" className="mt-0">
                        <NutrientTable title="Protein Breakdown (Amino Acids)" nutrients={foodData.proteinBreakdown || []} />
                      </TabsContent>
                      <TabsContent value="fats" className="mt-0">
                        <NutrientTable title="Fat Breakdown (Fatty Acids)" nutrients={foodData.fatBreakdown || []} />
                      </TabsContent>
                      <TabsContent value="enzymes" className="mt-0">
                        <NutrientTable title="Natural Enzymes" nutrients={foodData.enzymes || []} />
                      </TabsContent>
                      <TabsContent value="other" className="mt-0">
                        <NutrientTable title="Other Nutrients" nutrients={foodData.other} />
                      </TabsContent>
                      <TabsContent value="studies" className="mt-0">
                        <ScientificStudies studies={foodData.studies || []} />
                      </TabsContent>
                    </ScrollArea>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-12 py-10">
              <section className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                    <h2 className="text-xl font-bold">Explore Categories</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <Button
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(cat)}
                        className="rounded-full"
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {COMMON_FOODS[selectedCategory].map(food => (
                    <Button
                      key={food}
                      variant="outline"
                      className="h-auto py-4 flex flex-col gap-1 bg-white dark:bg-zinc-900 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all border-zinc-200 dark:border-zinc-800"
                      onClick={() => handleSearch(food)}
                    >
                      <span className="font-semibold">{food}</span>
                    </Button>
                  ))}
                </div>
              </section>

              {customFoods.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <History className="h-5 w-5 text-zinc-500" />
                    <h2 className="text-xl font-bold">Your Custom Foods</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {customFoods.map(food => (
                      <Button
                        key={food.id}
                        variant="outline"
                        className="h-auto py-4 flex flex-col gap-1 bg-white dark:bg-zinc-900 border-dashed"
                        onClick={() => setFoodData(food)}
                      >
                        <span className="font-semibold">{food.name}</span>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Custom</span>
                      </Button>
                    ))}
                  </div>
                </section>
              )}

              <div className="flex flex-col items-center justify-center py-10 text-zinc-400">
                <Search className="h-12 w-12 mb-4 opacity-20" />
                <p>Search for a food item to see its nutritional profile</p>
              </div>
            </div>
          )}
        </AnimatePresence>

        <footer className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 text-xs text-zinc-400">
          <Info className="h-3 w-3" />
          <p>Nutritional values are estimates generated by AI. Always consult with a professional for dietary advice.</p>
        </footer>

        <UpgradeModal 
          isOpen={isUpgradeModalOpen} 
          onClose={() => setIsUpgradeModalOpen(false)} 
        />
      </div>
    </div>
  );
}
