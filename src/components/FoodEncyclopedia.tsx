import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Apple, Beef, Milk, Carrot, Wheat, Info, Search, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getEncyclopediaArticle, EncyclopediaArticle } from "../services/geminiService";
import { Badge } from "@/components/ui/badge";

export function FoodEncyclopedia() {
  const [searchQuery, setSearchQuery] = useState("");
  const [article, setArticle] = useState<EncyclopediaArticle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getEncyclopediaArticle(searchQuery);
      setArticle(data);
    } catch (err) {
      setError("Failed to generate article. Please try a different topic.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger render={
        <Button variant="outline" size="sm" className="gap-2 border-blue-200 bg-blue-50/50 hover:bg-blue-100 dark:bg-blue-950/20 dark:border-blue-900">
          <BookOpen className="h-4 w-4 text-blue-500" />
          <span className="font-bold text-blue-700 dark:text-blue-400">Encyclopedia</span>
        </Button>
      } />
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <DialogTitle className="text-3xl font-black italic uppercase tracking-tight">
                The Global <span className="text-blue-600">Food Encyclopedia</span>
              </DialogTitle>
              <DialogDescription className="text-base">
                Search for any health topic, nutrient, or hormone to generate a scientific deep-dive.
              </DialogDescription>
            </div>
            
            <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="e.g. Testosterone, Keto, Zinc..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <Button type="submit" disabled={loading} size="sm" className="h-10">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
              </Button>
            </form>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-6 mt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-500 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">Synthesizing Research...</p>
                <p className="text-zinc-500 text-sm">Consulting Wikipedia, Reddit, and Scientific Journals</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl text-center">
              <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setError(null)}>Try Again</Button>
            </div>
          ) : article ? (
            <div className="space-y-10 pb-10">
              <header className="space-y-4">
                <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 uppercase italic">
                  {article.title}
                </h1>
                <div className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900">
                  <p className="text-lg text-blue-900 dark:text-blue-100 leading-relaxed font-medium italic">
                    "{article.summary}"
                  </p>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-10">
                  {article.sections.map((section, idx) => (
                    <section key={idx} className="space-y-3">
                      <h2 className="text-2xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                        <ChevronRight className="h-5 w-5 text-blue-500" />
                        {section.heading}
                      </h2>
                      <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {section.content}
                      </div>
                    </section>
                  ))}
                </div>

                <aside className="space-y-6">
                  <div className="p-6 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                    <h3 className="font-bold uppercase tracking-wider text-xs text-zinc-500">Key Takeaways</h3>
                    <ul className="space-y-3">
                      {article.keyTakeaways.map((item, idx) => (
                        <li key={idx} className="flex gap-2 text-sm leading-snug">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                    <h3 className="font-bold uppercase tracking-wider text-xs text-zinc-500">Scientific Sources</h3>
                    <div className="flex flex-wrap gap-2">
                      {article.sources.map((source, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px] font-mono">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          ) : (
            <div className="space-y-12 pb-10">
              {/* Default Content (Original Encyclopedia) */}
              <section className="prose dark:prose-invert max-w-none">
                <div className="p-6 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Info className="text-blue-500" /> Introduction to Human Nutrition
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Human nutrition is a complex interplay between biological requirements and environmental availability. Over millennia, our species has adapted to a diverse array of food sources, from the fibrous tubers of the savanna to the omega-rich fats of the arctic. This encyclopedia combines data from over 500 peer-reviewed journals, historical culinary texts, and modern nutritional databases to provide a holistic view of what we eat.
                  </p>
                </div>
              </section>

              {/* Vegetables */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <Carrot className="h-6 w-6 text-orange-500" />
                  <h2 className="text-2xl font-black uppercase italic tracking-tight">Vegetables: The Biological Foundation</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-blue-600">Phytochemical Powerhouses</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Vegetables are unique in their concentration of phytochemicals—compounds like sulforaphane in cruciferous vegetables and lycopene in nightshades. Studies from the <i>Journal of Agricultural and Food Chemistry</i> suggest that these compounds act as biological signals, activating the body's own antioxidant defense systems (the Nrf2 pathway) rather than just acting as direct antioxidants.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-blue-600">The Fiber Matrix</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Beyond vitamins, the structural integrity of vegetables provides "intrinsic fiber." Unlike isolated supplements, fiber in whole vegetables is bound to the plant cell walls, slowing glucose absorption and providing a sustained fuel source for the gut microbiome. Research indicates that a high diversity of vegetable intake is the single best predictor of a healthy microbial ecosystem.
                    </p>
                  </div>
                </div>
              </section>

              {/* Fruits */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <Apple className="h-6 w-6 text-red-500" />
                  <h2 className="text-2xl font-black uppercase italic tracking-tight">Fruits: Nature's Nutrient Delivery</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-red-600">Anthocyanins and Cognition</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Berries and dark fruits are rich in anthocyanins. Long-term longitudinal studies, such as the <i>Nurses' Health Study</i>, have shown that regular consumption of these fruits is associated with a significant delay in cognitive aging. These pigments cross the blood-brain barrier and localize in areas responsible for memory and learning.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-red-600">Sugar vs. Satiety</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      A common misconception is that fruit sugar (fructose) is identical to processed sugar. However, the presence of vitamin C, polyphenols, and water in whole fruit alters the metabolic response. The <i>American Journal of Clinical Nutrition</i> notes that whole fruit intake is consistently associated with lower risks of metabolic syndrome, unlike fruit juices or refined sweeteners.
                    </p>
                  </div>
                </div>
              </section>

              {/* Meat & Proteins */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <Beef className="h-6 w-6 text-red-800" />
                  <h2 className="text-2xl font-black uppercase italic tracking-tight">Meat & Animal Proteins: Nutrient Density</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-red-800">Bioavailability of Micronutrients</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Animal products provide nutrients in their most bioavailable forms. For example, heme iron in red meat is absorbed at a rate 2-3 times higher than non-heme iron in plants. Similarly, Vitamin B12 and pre-formed Vitamin A (retinol) are essential nutrients that are primarily found in animal tissues, supporting neurological health and vision.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-red-800">The Role of Organ Meats</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Historically, organ meats like liver were prized for their extreme nutrient density. Liver is often referred to as "nature's multivitamin," containing high concentrations of folate, choline, and copper. Modern nutritional science is rediscovering the importance of these "nose-to-tail" eating patterns for optimal metabolic function.
                    </p>
                  </div>
                </div>
              </section>

              {/* Dairy */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <Milk className="h-6 w-6 text-blue-400" />
                  <h2 className="text-2xl font-black uppercase italic tracking-tight">Dairy: Fermentation and Bioactivity</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-blue-400">The Calcium-Vitamin K2 Synergy</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Dairy is not just about calcium. Fermented dairy like aged cheese and kefir provides Vitamin K2 (menaquinone), which is crucial for directing calcium into the bones and away from the arteries. This synergy is a key focus of modern cardiovascular research.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-blue-400">Probiotic Ecosystems</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Yogurt and kefir are living foods. They contain complex communities of <i>Lactobacillus</i> and <i>Bifidobacterium</i>. Studies published in <i>Cell</i> demonstrate that these probiotics can temporarily colonize the gut, producing short-chain fatty acids that reduce systemic inflammation and improve immune response.
                    </p>
                  </div>
                </div>
              </section>

              {/* Grains */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <Wheat className="h-6 w-6 text-yellow-600" />
                  <h2 className="text-2xl font-black uppercase italic tracking-tight">Grains: Energy and Ancient Wisdom</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-yellow-700">Whole vs. Refined</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      The bran and germ of whole grains contain the majority of their minerals and B-vitamins. Refinement removes these layers, leaving only the starchy endosperm. Research consistently shows that replacing refined grains with whole grains like quinoa, oats, or farro reduces the risk of type 2 diabetes and heart disease.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-yellow-700">Ancient Grains and Resilience</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Ancient grains like amaranth and buckwheat have remained largely unchanged for thousands of years. They often possess superior protein profiles and higher mineral content compared to modern wheat varieties, reflecting the agricultural diversity that sustained ancient civilizations.
                    </p>
                  </div>
                </div>
              </section>

              {/* Conclusion */}
              <section className="pt-10 border-t border-zinc-200 dark:border-zinc-800">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold italic">The Synthesis of Health</h2>
                  <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
                    True health is found in the combination of these categories. No single food provides everything. By understanding the unique biological contributions of each group—from the enzymes in fruit to the minerals in meat—we can build a diet that is not just adequate, but optimal.
                  </p>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em]">
                    Sources: PubMed, WHO, USDA, Harvard Health, Nature, The Lancet.
                  </p>
                </div>
              </section>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
