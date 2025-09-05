import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";

const chartData = [
  { month: "Jan", profit: 4000, loss: 2000 },
  { month: "Feb", profit: 3800, loss: 1800 },
  { month: "Mar", profit: 4200, loss: 2200 },
  { month: "Apr", profit: 4800, loss: 2400 },
  { month: "May", profit: 5200, loss: 2100 },
  { month: "Jun", profit: 4900, loss: 1900 },
];

export function DashboardContent() {
  return (
    <div className="flex-1 p-8 ml-20">

      <div className="mb-8">
        <h1 className="text-white text-3xl font-bold mb-2">Good morning, Sajibur</h1>
        <p className="text-white/60">Stay on top of your tasks, monitor progress, and track status.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-1">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-white/60 mb-1">
                  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMTRDMTEuMzEzNyAxNCA0IDExLjMxMzcgMTQgOEMxNCA0LjY4NjI5IDExLjMxMzcgMiA4IDJDNC42ODYyOSAyIDIgNC42ODYyOSAyIDhDMiAxMS4zMTM3IDQuNjg2MjkgMTQgOCAxNFoiIHN0cm9rZT0iIzAwRiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KPHBhdGggZD0iTTggNkw4IDEwIiBzdHJva2U9IiMwMEYiIHN0cm9rZS13aWR0aD0iMS41Ii8+CjxwYXRoIGQ9Ik04IDRWNCIgc3Ryb2tlPSIjMDBGIiBzdHJva2Utd2lkdGg9IjEuNSIvPgo8L3N2Zz4K" alt="USD" className="w-4 h-4" />
                  USD
                </div>
                <div className="text-2xl font-bold">$689,372.00</div>
                <div className="text-sm text-[#B3E240] flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  8% than last month
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Button className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                Transfer
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Request
              </Button>
            </div>

            <div className="mt-6 text-sm text-white/60">
              Wallets | Total 8 wallets
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4">

          <Card className="bg-[#ff6b35] p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Total Earnings</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold">$950</div>
            <div className="text-sm opacity-75">+27% this month</div>
          </Card>

          <Card className="bg-black/40 backdrop-blur-md border-white/20 p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">Total Spending</span>
              <ArrowDownRight className="w-4 h-4 text-white/60" />
            </div>
            <div className="text-2xl font-bold">$700</div>
            <div className="text-sm text-white/60">This month</div>
          </Card>

          <Card className="bg-black/40 backdrop-blur-md border-white/20 p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">Total Income</span>
              <ArrowUpRight className="w-4 h-4 text-white/60" />
            </div>
            <div className="text-2xl font-bold">$1,050</div>
            <div className="text-sm text-white/60">This month</div>
          </Card>

          <Card className="bg-black/40 backdrop-blur-md border-white/20 p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">Total Revenue</span>
              <ArrowUpRight className="w-4 h-4 text-white/60" />
            </div>
            <div className="text-2xl font-bold">$950</div>
            <div className="text-sm text-white/60">This month</div>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white text-lg font-semibold">Total Income</h3>
              <p className="text-white/60 text-sm">View your income for a certain period of time</p>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#B3E240] rounded"></div>
              <span className="text-white/60 text-sm">Profit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded"></div>
              <span className="text-white/60 text-sm">Loss</span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                <Bar dataKey="profit" fill="#B3E240" radius={[4, 4, 0, 0]} />
                <Bar dataKey="loss" fill="#6b7280" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
