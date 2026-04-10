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
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { Activity, Plus, History, TrendingUp, Scale, Ruler, Trash2 } from "lucide-react";
import { UserProfile, HealthReport } from "../types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HealthReportsProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

export function HealthReports({ profile, onUpdate }: HealthReportsProps) {
  const [newWeight, setNewWeight] = useState(profile.weight.toString());
  const [newHeight, setNewHeight] = useState(profile.height.toString());

  const addReport = () => {
    const w = parseFloat(newWeight);
    const h = parseFloat(newHeight);
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return;

    const bmi = w / ((h / 100) ** 2);
    const newReport: HealthReport = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      weight: w,
      height: h,
      bmi: parseFloat(bmi.toFixed(1))
    };

    const updatedHistory = [newReport, ...(profile.healthHistory || [])];
    onUpdate({
      ...profile,
      weight: w,
      height: h,
      healthHistory: updatedHistory,
      lastUpdated: new Date().toISOString()
    });
  };

  const deleteReport = (id: string) => {
    const updatedHistory = (profile.healthHistory || []).filter(r => r.id !== id);
    onUpdate({
      ...profile,
      healthHistory: updatedHistory
    });
  };

  const chartData = [...(profile.healthHistory || [])]
    .reverse()
    .map(r => ({
      ...r,
      displayDate: new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }));

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-500" };
    if (bmi < 25) return { label: "Normal", color: "text-green-500" };
    if (bmi < 30) return { label: "Overweight", color: "text-yellow-500" };
    return { label: "Obese", color: "text-red-500" };
  };

  const latestBMI = profile.healthHistory?.[0]?.bmi || (profile.weight / ((profile.height / 100) ** 2));
  const bmiInfo = getBMICategory(latestBMI);

  return (
    <Dialog>
      <DialogTrigger render={
        <Button variant="outline" size="sm" className="gap-2 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900">
          <Activity className="h-4 w-4 text-emerald-500" />
          <span className="font-bold text-emerald-700 dark:text-emerald-400">Health Reports</span>
        </Button>
      } />
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black italic uppercase tracking-tight">
            Growth & <span className="text-emerald-600">Health History</span>
          </DialogTitle>
          <DialogDescription>
            Track your physical evolution and body metrics over time.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-6 mt-4">
          <div className="space-y-8 pb-6">
            {/* Quick Add */}
            <Card className="border-emerald-100 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Log New Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-end gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-500 uppercase">Weight (kg)</label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input 
                      type="number" 
                      value={newWeight} 
                      onChange={(e) => setNewWeight(e.target.value)}
                      className="pl-10 w-32 h-10"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-500 uppercase">Height (cm)</label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input 
                      type="number" 
                      value={newHeight} 
                      onChange={(e) => setNewHeight(e.target.value)}
                      className="pl-10 w-32 h-10"
                    />
                  </div>
                </div>
                <Button onClick={addReport} className="h-10 bg-emerald-600 hover:bg-emerald-700">
                  Update History
                </Button>

                <div className="ml-auto text-right">
                  <p className="text-xs text-zinc-500 uppercase font-bold">Current BMI</p>
                  <p className={`text-2xl font-black ${bmiInfo.color}`}>{latestBMI.toFixed(1)}</p>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-tighter">{bmiInfo.label}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" /> Weight Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[250px] pt-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="displayDate" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500" /> BMI History
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[250px] pt-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="displayDate" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis fontSize={10} tickLine={false} axisLine={false} domain={[15, 35]} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="bmi" 
                        stroke="#10b981" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} 
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* History List */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <History className="h-5 w-5 text-zinc-400" /> Detailed History
              </h3>
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-[10px] text-zinc-500">Date</th>
                      <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-[10px] text-zinc-500">Weight</th>
                      <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-[10px] text-zinc-500">Height</th>
                      <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-[10px] text-zinc-500">BMI</th>
                      <th className="px-4 py-3 text-right font-bold uppercase tracking-wider text-[10px] text-zinc-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {(profile.healthHistory || []).map((report) => (
                      <tr key={report.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          {new Date(report.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">{report.weight} kg</td>
                        <td className="px-4 py-3">{report.height} cm</td>
                        <td className="px-4 py-3">
                          <span className={`font-bold ${getBMICategory(report.bmi).color}`}>
                            {report.bmi}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-zinc-400 hover:text-red-500"
                            onClick={() => deleteReport(report.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {(!profile.healthHistory || profile.healthHistory.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-zinc-400 italic">
                          No health reports logged yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
