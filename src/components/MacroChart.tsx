import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface MacroChartProps {
  protein: number;
  fat: number;
  carbs: number;
}

export function MacroChart({ protein, fat, carbs }: MacroChartProps) {
  const data = [
    { name: "Protein", value: protein, color: "#ef4444" }, // red-500
    { name: "Fat", value: fat, color: "#eab308" }, // yellow-500
    { name: "Carbs", value: carbs, color: "#3b82f6" }, // blue-500
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e4e4e7' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
