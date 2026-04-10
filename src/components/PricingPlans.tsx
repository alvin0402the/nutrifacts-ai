import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PlanTier, UserProfile } from "../types";
import { Badge } from "@/components/ui/badge";
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../contexts/AuthContext';

const stripePromise = loadStripe((import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PricingPlansProps {
  currentPlan: PlanTier;
  onSelectPlan: (plan: PlanTier) => void;
}

const PLANS = [
  {
    name: "Free" as PlanTier,
    price: "0 kr",
    description: "Basic nutritional search",
    features: ["Standard AI Analysis", "5 Custom Food Entries", "Basic Macronutrients"],
    icon: Zap,
    color: "text-zinc-500",
  },
  {
    name: "Pro" as PlanTier,
    price: "99 kr",
    description: "For health enthusiasts",
    features: ["Unlimited Custom Foods", "Nutrient Benefit Tooltips", "Ad-free Experience", "Health Reports", "Detailed Macros"],
    icon: Sparkles,
    color: "text-blue-500",
  },
  {
    name: "Elite" as PlanTier,
    price: "199 kr",
    description: "Deep scientific insights",
    features: ["Scientific Study Access", "Amino Acid Breakdown", "Fatty Acid Profiles", "Advanced Health Reports"],
    icon: ShieldCheck,
    color: "text-purple-500",
  },
  {
    name: "Ultimate" as PlanTier,
    price: "299 kr",
    description: "Personalized performance",
    features: ["Profile-based Insights", "Priority AI Processing", "Weekly Health Reports", "Personal Nutritionist AI"],
    icon: Crown,
    color: "text-amber-500",
  },
];

export function PricingPlans({ currentPlan, onSelectPlan }: PricingPlansProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);

  const handleSubscribe = async (planName: string) => {
    if (planName === 'Free') {
      onSelectPlan('Free');
      return;
    }

    console.log(`Initiating ${planName} subscription for user:`, user?.uid);
    setLoadingPlan(planName);
    try {
      const publishableKey = (import.meta as any).env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!publishableKey) {
        throw new Error('Stripe publishable key is missing. Please check your environment variables.');
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.uid,
          plan: planName
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const session = await response.json();
      console.log('Checkout session created:', session.id);
      
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to initialize.');
      }
      
      const { error } = await (stripe as any).redirectToCheckout({
        sessionId: session.id,
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      alert(error.message || 'An error occurred during checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };
  
  return (
    <Dialog>
      <DialogTrigger 
        render={
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2 border-amber-200 bg-amber-50/50 hover:bg-amber-100 dark:bg-amber-950/20 dark:border-amber-900"
          >
            <Crown className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span className="font-bold text-amber-700 dark:text-amber-400">Upgrade</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center">Choose Your Plan</DialogTitle>
          <DialogDescription className="text-center text-lg">
            Unlock deeper insights and personalized tracking with our premium tiers.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-8">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = currentPlan === plan.name;
            
            return (
              <div 
                key={plan.name}
                className={`relative flex flex-col p-6 rounded-2xl border-2 transition-all ${
                  isCurrent 
                    ? "border-blue-500 bg-blue-50/30 dark:bg-blue-950/20" 
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                {isCurrent && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500">
                    Current Plan
                  </Badge>
                )}
                
                <div className="mb-4">
                  <Icon className={`h-8 w-8 ${plan.color} mb-2`} />
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black">{plan.price}</span>
                    <span className="text-zinc-500 text-sm">/mo</span>
                  </div>
                </div>
                
                <p className="text-sm text-zinc-500 mb-6">{plan.description}</p>
                
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                      <Check className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleSubscribe(plan.name)}
                  variant={isCurrent ? "outline" : (plan.name === 'Free' ? "outline" : "default")}
                  disabled={isCurrent || (loadingPlan !== null)}
                  className={`w-full ${plan.name !== 'Free' ? 'bg-blue-600 hover:bg-blue-700 text-white font-bold' : ''} ${plan.name === 'Ultimate' ? 'bg-gradient-to-r from-amber-500 to-orange-600 border-none' : ''}`}
                >
                  {loadingPlan === plan.name ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    isCurrent ? "Active" : (plan.name === 'Free' ? "Select Plan" : "Subscribe")
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
