import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Lightbulb } from "lucide-react";

interface Study {
  title: string;
  summary: string;
  keyFinding: string;
}

interface ScientificStudiesProps {
  studies: Study[];
}

export function ScientificStudies({ studies }: ScientificStudiesProps) {
  if (!studies || studies.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
        <BookOpen className="h-5 w-5 text-blue-500" />
        <h3 className="text-xl font-bold tracking-tight">Scientific Context & Studies</h3>
      </div>
      <div className="grid gap-4">
        {studies.map((study, index) => (
          <Card key={index} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                {study.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {study.summary}
              </p>
              <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900">
                <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">
                    Key Finding
                  </p>
                  <p className="text-sm text-blue-900 dark:text-blue-100 italic">
                    "{study.keyFinding}"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
