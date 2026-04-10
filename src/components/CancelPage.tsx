import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function CancelPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-md w-full border-zinc-800 bg-zinc-900 text-white text-center p-6">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <CardTitle className="text-3xl font-black uppercase italic tracking-tight">Payment Cancelled</CardTitle>
            <CardDescription className="text-zinc-400">
              Your payment was not processed. No charges were made.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-zinc-500">
              If you encountered an issue, feel free to try again or contact support.
            </p>
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="w-full border-zinc-700 text-white hover:bg-zinc-800 font-bold h-12 rounded-xl"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
