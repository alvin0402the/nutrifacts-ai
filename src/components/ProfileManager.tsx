import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Crown, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { UserProfile } from "../types";
import { Badge } from "@/components/ui/badge";

interface ProfileManagerProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

export function ProfileManager({ profile, onUpdate }: ProfileManagerProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(profile.name);
  const [weight, setWeight] = useState(profile.weight.toString());
  const [height, setHeight] = useState(profile.height.toString());
  const [age, setAge] = useState(profile.age.toString());

  useEffect(() => {
    setName(profile.name);
    setWeight(profile.weight.toString());
    setHeight(profile.height.toString());
    setAge(profile.age.toString());
  }, [profile]);

  const lastUpdatedDate = new Date(profile.lastUpdated);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastUpdatedDate.getTime()) / (1000 * 60 * 60 * 24));
  const needsRefresh = diffDays >= 7;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...profile,
      name,
      weight: Number(weight),
      height: Number(height),
      age: Number(age),
      lastUpdated: new Date().toISOString(),
    });
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Profile Trigger */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger 
          render={
            <Button variant="ghost" size="icon" className="relative rounded-full border border-zinc-200 dark:border-zinc-800">
              <User className="h-5 w-5" />
              {needsRefresh && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </Button>
          }
        />
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                User Profile
                {profile.isPremium && <Badge className="bg-amber-500">PRO</Badge>}
              </DialogTitle>
              <DialogDescription>
                Keep your stats updated weekly for accurate nutritional tracking.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-6">
              <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">{profile.plan}</Badge>
                  <span className="text-sm font-medium">Subscription Plan</span>
                </div>
                {profile.isPremium && (
                  <div className="flex items-center gap-1 text-amber-600">
                    <Crown className="h-4 w-4 fill-amber-500" />
                    <span className="text-xs font-bold">PREMIUM</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  {needsRefresh ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  <div className="text-sm">
                    <p className="font-medium">{needsRefresh ? "Update Required" : "Stats Current"}</p>
                    <p className="text-zinc-500 text-xs">Last updated {diffDays} days ago</p>
                  </div>
                </div>
                {needsRefresh && <Badge variant="destructive" className="text-[10px]">STALE</Badge>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input 
                    id="name" 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="e.g. Nathan"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input 
                    id="weight" 
                    type="number" 
                    value={weight} 
                    onChange={(e) => setWeight(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input 
                    id="height" 
                    type="number" 
                    value={height} 
                    onChange={(e) => setHeight(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="age">Age</Label>
                  <Input 
                    id="age" 
                    type="number" 
                    value={age} 
                    onChange={(e) => setAge(e.target.value)} 
                    required 
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full gap-2">
                <RefreshCw className="h-4 w-4" />
                Update Stats
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
