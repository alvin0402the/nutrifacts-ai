import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Loader2, Sparkles } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../contexts/AuthContext';

const stripePromise = loadStripe((import.meta as any).env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.uid,
        }),
      });

      const session = await response.json();
      const stripe = await stripePromise;
      
      if (stripe) {
        const { error } = await (stripe as any).redirectToCheckout({
          sessionId: session.id,
        });
        if (error) console.error(error);
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-zinc-950 border-zinc-800 text-white">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
            <Crown className="h-6 w-6 text-amber-500" />
          </div>
          <DialogTitle className="text-2xl font-black text-center uppercase italic tracking-tight">
            Upgrade to <span className="text-amber-500">Pro</span>
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-center">
            Unlock the full potential of your nutritional intelligence.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4">
          <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2">
              <Badge className="bg-amber-500 text-zinc-950 font-bold">99 kr/mån</Badge>
            </div>
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Pro Plan Features
            </h4>
            <ul className="space-y-2">
              {[
                'Detailed Macro & Micronutrient Breakdown',
                'Advanced Health & BMI Reports',
                'Scientific Study Insights',
                'Custom Food Database',
                'Priority AI Analysis',
                'Ad-Free Experience'
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                  <Check className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button 
            onClick={handleSubscribe} 
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black h-12 rounded-xl text-lg uppercase italic tracking-tight"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Subscribe Now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
