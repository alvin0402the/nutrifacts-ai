import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Nutrient } from "@/src/types";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface NutrientTableProps {
  title: string;
  nutrients: Nutrient[];
}

export function NutrientTable({ title, nutrients }: NutrientTableProps) {
  return (
    <TooltipProvider>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        <div className="rounded-md border border-zinc-200 dark:border-zinc-800">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50">
                <TableHead className="w-[200px]">Nutrient</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="w-[150px]">Daily Value (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nutrients.map((nutrient) => (
                <TableRow key={nutrient.name}>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{nutrient.name}</span>
                      {nutrient.benefit && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="text-zinc-400 hover:text-blue-500 transition-colors">
                              <Info className="h-3.5 w-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[250px] p-3">
                            <p className="text-xs leading-relaxed">{nutrient.benefit}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-600 dark:text-zinc-400">
                    {nutrient.amount}
                    {nutrient.unit}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={Math.min(nutrient.dailyValue, 100)} className="h-1.5 flex-1" />
                      <span className="text-[10px] font-mono text-zinc-500 w-8 text-right">{nutrient.dailyValue}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  );
}
