import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, PartyPopper } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';

export default function SuccessPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(true);

  useEffect(() => {
    const updateStatus = async () => {
      if (user) {
        try {
          const params = new URLSearchParams(window.location.search);
          const plan = params.get('plan') || 'Pro';
          
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            plan: plan,
            isPremium: true,
            lastUpdated: new Date().toISOString()
          });
          
          // Also update local storage profile if it exists
          const savedProfile = localStorage.getItem("user_profile");
          if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            localStorage.setItem("user_profile", JSON.stringify({
              ...profile,
              plan: plan,
              isPremium: true
            }));
          }
        } catch (error) {
          console.error("Error updating user status:", error);
        } finally {
          setUpdating(false);
        }
      }
    };

    updateStatus();
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-md w-full border-zinc-800 bg-zinc-900 text-white text-center p-6">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <CardTitle className="text-3xl font-black uppercase italic tracking-tight">Payment Successful!</CardTitle>
            <CardDescription className="text-zinc-400">
              Welcome to NutriFacts Pro. Your account has been upgraded.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <PartyPopper className="h-12 w-12 text-amber-500 animate-bounce" />
            </div>
            
            {updating ? (
              <div className="flex items-center justify-center gap-2 text-zinc-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Activating your Pro features...</span>
              </div>
            ) : (
              <Button 
                onClick={() => navigate('/dashboard')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl"
              >
                Go to Dashboard
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
