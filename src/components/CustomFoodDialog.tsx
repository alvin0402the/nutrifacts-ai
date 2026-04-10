import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { FoodData } from "../types";

interface CustomFoodDialogProps {
  onAdd: (food: FoodData) => void;
}

export function CustomFoodDialog({ onAdd }: CustomFoodDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [servingSize, setServingSize] = useState("100g");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [carbs, setCarbs] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFood: FoodData = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      servingSize,
      calories: Number(calories),
      macros: {
        protein: Number(protein),
        fat: Number(fat),
        carbs: Number(carbs),
      },
      vitamins: [],
      minerals: [],
      other: [],
      isCustom: true,
    };
    onAdd(newFood);
    setOpen(false);
    // Reset form
    setName("");
    setServingSize("100g");
    setCalories("");
    setProtein("");
    setFat("");
    setCarbs("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Custom Food
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Custom Food</DialogTitle>
            <DialogDescription>
              Manually enter nutritional values for a custom food item.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="serving" className="text-right">
                Serving
              </Label>
              <Input
                id="serving"
                value={servingSize}
                onChange={(e) => setServingSize(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="calories" className="text-right">
                Calories
              </Label>
              <Input
                id="calories"
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="protein" className="text-right">
                Protein (g)
              </Label>
              <Input
                id="protein"
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fat" className="text-right">
                Fat (g)
              </Label>
              <Input
                id="fat"
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="carbs" className="text-right">
                Carbs (g)
              </Label>
              <Input
                id="carbs"
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Food</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
