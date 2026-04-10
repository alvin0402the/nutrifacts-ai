import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Loader2, Sparkles, ArrowLeft, ShieldCheck } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "motion/react";

const stripePromise = loadStripe((import.meta as any).env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function UpgradePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    console.log("Initiating subscription for user:", user?.uid);
    setLoading(true);
    try {
      const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      if (!publishableKey) {
        throw new Error("Stripe publishable key is missing. Please check your environment variables.");
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.uid,
          plan: "Pro",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const session = await response.json();
      console.log("Checkout session created:", session.id);

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to initialize.");
      }

      const { error } = await (stripe as any).redirectToCheckout({
        sessionId: session.id,
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      alert(error.message || "An error occurred during checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600 rounded-full blur-[120px]" />
      </div>

      <header className="relative z-10 p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="text-zinc-400 hover:text-white gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-blue-500" />
          <span className="font-black uppercase italic tracking-tighter text-xl">
            NutriFacts <span className="text-blue-500">Vault</span>
          </span>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center"
        >
          <div className="space-y-6">
            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-4 py-1 rounded-full font-bold uppercase tracking-widest text-xs">
              Premium Experience
            </Badge>
            <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
              Unlock the <span className="text-amber-500">Pro</span> <br /> Advantage
            </h1>
            <p className="text-zinc-400 text-lg max-w-md">
              Get access to clinical-grade nutritional insights, personalized health reports, and the latest
              scientific research.
            </p>

            <div className="space-y-4">
              {[
                { title: "Clinical Insights", desc: "Detailed macro & micronutrient breakdown" },
                { title: "Health Reports", desc: "Advanced BMI and metabolic health tracking" },
                { title: "Scientific Database", desc: "Direct links to peer-reviewed studies" },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-200">{item.title}</h4>
                    <p className="text-sm text-zinc-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="bg-zinc-900/50 backdrop-blur-xl border-zinc-800 shadow-2xl overflow-hidden">
            <CardHeader className="text-center pb-8 border-b border-zinc-800">
              <div className="mx-auto w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mb-4 rotate-3 shadow-lg shadow-amber-500/20">
                <Crown className="h-8 w-8 text-zinc-950" />
              </div>
              <CardTitle className="text-4xl font-black tabular-nums">
                99 kr<span className="text-lg text-zinc-500 font-medium">/man</span>
              </CardTitle>
              <CardDescription className="text-zinc-400">NutriFacts AI Pro Subscription</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <ul className="space-y-4">
                {[
                  "Unlimited AI Food Analysis",
                  "Detailed Micronutrient Data",
                  "Health & BMI Reports",
                  "Scientific Study Links",
                  "Custom Food Database",
                  "Priority Support",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-zinc-300">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black h-14 rounded-2xl text-xl uppercase italic tracking-tight shadow-lg shadow-amber-500/10 transition-all hover:scale-[1.02]"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Subscribe Now"}
              </Button>

              <p className="text-center text-[10px] text-zinc-500 uppercase tracking-widest">
                Secure payment via Stripe - Cancel anytime
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
