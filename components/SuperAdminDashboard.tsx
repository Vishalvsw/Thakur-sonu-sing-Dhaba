
import React, { useState } from 'react';
import { Icons } from './IconSet';
import { Button } from './Components';
import { BusinessUnit, StaffMember } from '../types';

// --- Sub Components ---

const KPICard = ({ title, value, icon: Icon, colorClass, trend }: { title: string, value: string, icon: any, colorClass: string, trend?: string }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between h-full relative overflow-hidden group hover:shadow-md transition-shadow">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 ${colorClass.replace('text-', 'bg-')}`} />
    <div className="flex justify-between items-start mb-4 relative z-10">
       <div className={`p-3 rounded-2xl ${colorClass.replace('text-', 'bg-').replace('600', '50').replace('700', '50')} ${colorClass}`}>
          <Icon className="w-6 h-6" />
       </div>
       {trend && (
         <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
           <Icons.Trending className="w-3 h-3" /> {trend}
         </span>
       )}
    </div>
    <div>
      <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
    </div>
  </div>
);

const InsightCard = ({ type, text }: { type: 'alert' | 'info' | 'success', text: string }) => {
  const styles = {
    alert: "bg-red-50 border-red-100 text-red-700",
    info: "bg-blue-50 border-blue-100 text-blue-700",
    success: "bg-green-50 border-green-100 text-green-700"
  };
  const icons = {
    alert: Icons.Warning,
    info: Icons.Help,
    success: Icons.CheckCircle
  };
  const Icon = icons[type];

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 ${styles[type]}`}>
       <Icon className="w-5 h-5 shrink-0 mt-0.5" />
       <p className="font-bold text-sm leading-relaxed">{text}</p>
    </div>
  );
};

const SimpleBarChart = ({ data, color }: { data: { label: string, value: number, max: number }[], color: string }) => (
  <div className="flex items-end gap-2 h-32 pt-6">
    {data.map((d, i) => (
      <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
        <div className="relative w-full flex justify-center">
            <span className="absolute -top-8 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                ₹{d.value}
            </span>
            <div 
                className={`w-full md:w-8 rounded-t-lg transition-all duration-1000 ${color}`} 
                style={{ height: `${(d.value / d.max) * 100}px` }} 
            />
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase">{d.label}</span>
      </div>
    ))}
  </div>
);

// --- TABS ---

const HomeTab = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    {/* Global KPIs */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <KPICard title="Total Revenue" value="₹42,500" icon={Icons.Wallet} colorClass="text-emerald-600" trend="+12%" />
      <KPICard title="Net Profit" value="₹18,200" icon={Icons.Trending} colorClass="text-blue-600" />
      <KPICard title="Staff Working" value="39" icon={Icons.User} colorClass="text-purple-600" />
      <KPICard title="Expenses" value="₹24,300" icon={Icons.Activity} colorClass="text-orange-600" />
      <KPICard title="Pending" value="₹3,200" icon={Icons.Clock} colorClass="text-red-600" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Revenue Split */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
           <Icons.Pie className="text-slate-400" /> Revenue Split
        </h3>
        <div className="flex flex-col gap-4">
           {[
             { label: 'Dhaba', val: '24,000', pct: 56, color: 'bg-orange-500' },
             { label: 'Bar', val: '12,500', pct: 29, color: 'bg-blue-600' },
             { label: 'Lodge', val: '4,800', pct: 11, color: 'bg-purple-600' },
             { label: 'Snooker', val: '1,200', pct: 4, color: 'bg-emerald-500' },
           ].map((item, i) => (
             <div key={i}>
                <div className="flex justify-between text-sm font-bold mb-1">
                   <span className="text-slate-600">{item.label}</span>
                   <span className="text-slate-900">₹{item.val}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                   <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
         <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
           <Icons.Help className="text-slate-400" /> Quick Insights
        </h3>
        <div className="space-y-3">
           <InsightCard type="alert" text="Paneer wastage is 22% higher than usual today." />
           <InsightCard type="alert" text="Bar evening shift had a ₹300 cash variance yesterday." />
           <InsightCard type="info" text="Dhaba lunch peak was at 1:06 PM with 38 orders." />
           <InsightCard type="info" text="Lodge occupancy low: 2/7 rooms booked." />
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
         <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
           <Icons.Warning className="text-red-500" /> Alerts
        </h3>
        <div className="space-y-4">
           <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-red-500 shadow-sm font-bold text-xs">LOW</div>
                 <div>
                    <p className="font-bold text-slate-900">Rice & Oil</p>
                    <p className="text-xs text-slate-500">8kg / 1.2L left</p>
                 </div>
              </div>
              <Button size="sm" className="bg-red-600 text-white h-8 text-xs">Restock</Button>
           </div>
           
           <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-orange-500 shadow-sm font-bold text-xs">EXP</div>
                 <div>
                    <p className="font-bold text-slate-900">Milk & Paneer</p>
                    <p className="text-xs text-slate-500">Expires in 2 days</p>
                 </div>
              </div>
              <Button size="sm" className="bg-orange-600 text-white h-8 text-xs">Check</Button>
           </div>

           <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-500 shadow-sm font-bold text-xs">USAGE</div>
                 <div>
                    <p className="font-bold text-slate-900">Chicken Spike</p>
                    <p className="text-xs text-slate-500">Used 12kg (Avg 9kg)</p>
                 </div>
              </div>
              <Button size="sm" className="bg-blue-600 text-white h-8 text-xs">Logs</Button>
           </div>
        </div>
      </div>
    </div>
  </div>
);

const DhabaTab = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
     {/* Dhaba KPIs */}
     <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
       <KPICard title="Dhaba Revenue" value="₹24,000" icon={Icons.Food} colorClass="text-orange-600" />
       <KPICard title="Total Orders" value="156" icon={Icons.Grid} colorClass="text-slate-600" />
       <KPICard title="Avg Order Val" value="₹154" icon={Icons.Chart} colorClass="text-emerald-600" />
       <KPICard title="Inventory Spent" value="₹7,800" icon={Icons.Wallet} colorClass="text-red-600" />
       <KPICard title="Staff on Shift" value="14" icon={Icons.User} colorClass="text-blue-600" />
     </div>

     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Best Sellers */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
           <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Icons.Trending className="text-orange-500" /> Best Sellers</h3>
           <div className="space-y-4">
              {[
                { name: 'Chicken Fry', count: 38, pct: 80 },
                { name: 'Veg Meals', count: 27, pct: 60 },
                { name: 'Paneer Butter', count: 19, pct: 40 },
              ].map((item, i) => (
                <div key={i}>
                   <div className="flex justify-between text-sm font-bold mb-1">
                      <span className="text-slate-700">{i+1}. {item.name}</span>
                      <span className="text-orange-600">{item.count} orders</span>
                   </div>
                   <div className="w-full h-2 bg-orange-50 rounded-full">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${item.pct}%` }} />
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Kitchen Stats & Inventory */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                 <p className="text-xs font-bold text-slate-400 uppercase">Avg Prep Time</p>
                 <p className="text-3xl font-black text-slate-800">11 <span className="text-lg text-slate-500 font-medium">min</span></p>
              </div>
              <div className="text-right">
                 <p className="text-xs font-bold text-slate-400 uppercase">Delayed Orders</p>
                 <p className="text-3xl font-black text-red-500">4</p>
              </div>
           </div>

           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Icons.Warning className="text-red-500" /> Inventory Health</h3>
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-sm border-b border-dashed border-slate-200 pb-2">
                    <span className="text-slate-600 font-medium">Low Stock</span>
                    <span className="font-bold text-red-600">Onion (2kg), Oil (1.2L)</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-medium">Wastage Today</span>
                    <span className="font-bold text-slate-900">₹480 <span className="text-xs text-slate-400 font-normal">(Paneer)</span></span>
                 </div>
              </div>
           </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-2">Revenue Trend (Hourly)</h3>
            <SimpleBarChart 
               color="bg-orange-500"
               data={[
                 { label: '10 AM', value: 1800, max: 8000 },
                 { label: '12 PM', value: 6400, max: 8000 },
                 { label: '1 PM', value: 7200, max: 8000 },
                 { label: '3 PM', value: 2100, max: 8000 },
               ]}
            />
        </div>
     </div>
  </div>
);

const BarTab = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
     <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
       <KPICard title="Bar Revenue" value="₹12,500" icon={Icons.Bar} colorClass="text-blue-600" />
       <KPICard title="Drinks Served" value="89" icon={Icons.Grid} colorClass="text-purple-600" />
       <KPICard title="Avg Drink Val" value="₹140" icon={Icons.Chart} colorClass="text-emerald-600" />
       <KPICard title="Inv Cost" value="₹4,200" icon={Icons.Wallet} colorClass="text-red-600" />
       <KPICard title="Bar Staff" value="6" icon={Icons.User} colorClass="text-slate-600" />
     </div>

     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
           <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Icons.Trending className="text-blue-500" /> Top Drinks</h3>
           <div className="space-y-4">
              {[
                { name: 'Royal Stag 60ml', count: 23, pct: 90 },
                { name: 'Beer (Kingfisher)', count: 18, pct: 70 },
                { name: 'Old Monk 60ml', count: 14, pct: 50 },
              ].map((item, i) => (
                <div key={i}>
                   <div className="flex justify-between text-sm font-bold mb-1">
                      <span className="text-slate-700">{i+1}. {item.name}</span>
                      <span className="text-blue-600">{item.count} sold</span>
                   </div>
                   <div className="w-full h-2 bg-blue-50 rounded-full">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.pct}%` }} />
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
               <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Icons.Bar className="text-purple-500" /> Bottle Health</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 p-3 rounded-xl">
                     <p className="text-xs font-bold text-red-400 uppercase">Low Stock</p>
                     <p className="text-2xl font-black text-red-600">5 <span className="text-sm font-medium text-red-400">btls</span></p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                     <p className="text-xs font-bold text-slate-400 uppercase">Empty Today</p>
                     <p className="text-2xl font-black text-slate-600">2 <span className="text-sm font-medium text-slate-400">btls</span></p>
                  </div>
               </div>
               <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-500">Pour Accuracy</span>
                  <span className="text-lg font-black text-emerald-500">94%</span>
               </div>
           </div>

           <div className="bg-slate-900 p-6 rounded-3xl border border-slate-700 shadow-sm text-white">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Icons.Cash className="text-orange-500" /> Settlement Preview</h3>
              <div className="space-y-2 text-sm">
                 <div className="flex justify-between"><span>Cash</span> <span className="font-bold">₹7,500</span></div>
                 <div className="flex justify-between"><span>UPI</span> <span className="font-bold">₹4,800</span></div>
                 <div className="w-full h-px bg-slate-700 my-2" />
                 <div className="flex justify-between text-red-400"><span className="font-bold">Variance</span> <span className="font-black">₹-300</span></div>
              </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-2">Peak Time</h3>
            <div className="h-full flex flex-col justify-center items-center text-center">
               <Icons.Clock className="w-12 h-12 text-blue-200 mb-2" />
               <p className="text-4xl font-black text-blue-600">8 PM</p>
               <p className="text-sm text-slate-400 font-bold uppercase">Highest Sales (₹4,300)</p>
            </div>
        </div>
     </div>
  </div>
);

const SnookerTab = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
       <KPICard title="Bookings Today" value="6" icon={Icons.Calendar} colorClass="text-emerald-600" />
       <KPICard title="Food Orders" value="12" icon={Icons.Food} colorClass="text-orange-600" />
       <KPICard title="Revenue" value="₹1,200" icon={Icons.Wallet} colorClass="text-slate-600" />
       <KPICard title="Staff" value="3" icon={Icons.User} colorClass="text-blue-600" />
     </div>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
           <h3 className="font-bold text-slate-800 mb-4">Snooker Insights</h3>
           <div className="space-y-4">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center"><Icons.Clock className="w-5 h-5" /></div>
                 <div>
                    <p className="font-bold text-slate-800">Peak Time</p>
                    <p className="text-sm text-slate-500">5 PM – 7 PM</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center"><Icons.Food className="w-5 h-5" /></div>
                 <div>
                    <p className="font-bold text-slate-800">Most Ordered</p>
                    <p className="text-sm text-slate-500">Chicken Roll (4 orders)</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="bg-emerald-900 p-8 rounded-3xl shadow-lg flex flex-col items-center justify-center text-center text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1595603038670-6f4b75248c08?w=800')] opacity-20 bg-cover bg-center" />
            <div className="relative z-10">
               <Icons.Snooker className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
               <h2 className="text-2xl font-black mb-2">Advanced Booking & Ordering</h2>
               <p className="text-emerald-200 font-bold uppercase tracking-widest text-sm bg-emerald-800/50 px-4 py-1 rounded-full inline-block">Coming Soon</p>
            </div>
        </div>
     </div>
  </div>
);

const LodgeTab = () => (
   <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
     <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
       <KPICard title="Rooms Engaged" value="2/7" icon={Icons.Room} colorClass="text-purple-600" />
       <KPICard title="Room Revenue" value="₹4,800" icon={Icons.Wallet} colorClass="text-emerald-600" />
       <KPICard title="Room Service" value="9" icon={Icons.Food} colorClass="text-orange-600" />
       <KPICard title="Avg Spend" value="₹534" icon={Icons.Chart} colorClass="text-blue-600" />
       <KPICard title="Lodge Staff" value="6" icon={Icons.User} colorClass="text-slate-600" />
     </div>

     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
           <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Icons.Grid className="text-purple-500" /> Room Status</h3>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                 <p className="text-xs font-bold text-green-600 uppercase">Available</p>
                 <p className="text-3xl font-black text-green-700">5</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                 <p className="text-xs font-bold text-purple-600 uppercase">Engaged</p>
                 <p className="text-3xl font-black text-purple-700">2</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 opacity-50">
                 <p className="text-xs font-bold text-blue-600 uppercase">Cleaning</p>
                 <p className="text-3xl font-black text-blue-700">0</p>
              </div>
              <div className="bg-red-50 p-4 rounded-2xl border border-red-100 opacity-50">
                 <p className="text-xs font-bold text-red-600 uppercase">Maintenance</p>
                 <p className="text-3xl font-black text-red-700">0</p>
              </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
           <h3 className="font-bold text-slate-800 mb-6">Live Room Insights</h3>
           <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center font-bold">102</div>
                    <span className="font-bold text-slate-700">Occupied</span>
                 </div>
                 <span className="font-black text-emerald-600">₹1,900</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center font-bold">104</div>
                    <span className="font-bold text-slate-700">Occupied</span>
                 </div>
                 <span className="font-black text-emerald-600">₹1,200</span>
              </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
           <h3 className="font-bold text-slate-800 mb-2">Revenue Trend</h3>
           <SimpleBarChart 
               color="bg-purple-500"
               data={[
                 { label: 'Yesterday', value: 3700, max: 5000 },
                 { label: 'Today', value: 4800, max: 5000 },
               ]}
            />
        </div>
     </div>
   </div>
);

// --- STAFF & SALARY TAB ---

const INITIAL_STAFF: StaffMember[] = [
  { id: 'S1', name: 'Rahul Kumar', role: 'Head Chef', bu: BusinessUnit.DHABA, phone: '9876543210', salary: 25000, salaryPaid: 25000, status: 'Active', attendance: 26, joinDate: '2023-01-15' },
  { id: 'S2', name: 'Amit Singh', role: 'Waiter', bu: BusinessUnit.DHABA, phone: '9876543211', salary: 12000, salaryPaid: 0, status: 'Active', attendance: 24, joinDate: '2023-03-10' },
  { id: 'S3', name: 'Vikram', role: 'Bartender', bu: BusinessUnit.BAR, phone: '9876543212', salary: 18000, salaryPaid: 10000, status: 'Active', attendance: 25, joinDate: '2023-02-01' },
  { id: 'S4', name: 'Suresh', role: 'Cleaner', bu: BusinessUnit.ROOMS, phone: '9876543213', salary: 10000, salaryPaid: 0, status: 'On Leave', attendance: 12, joinDate: '2023-06-20' },
];

const StaffTab = () => {
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [showPayModal, setShowPayModal] = useState<StaffMember | null>(null);
  const [payAmount, setPayAmount] = useState('');

  const totalPayroll = staff.reduce((acc, s) => acc + s.salary, 0);
  const paidThisMonth = staff.reduce((acc, s) => acc + s.salaryPaid, 0);
  const pending = totalPayroll - paidThisMonth;

  const handlePaySalary = () => {
    if (!showPayModal || !payAmount) return;
    const amount = parseInt(payAmount);
    
    setStaff(prev => prev.map(s => 
      s.id === showPayModal.id ? { ...s, salaryPaid: s.salaryPaid + amount } : s
    ));
    
    setShowPayModal(null);
    setPayAmount('');
    alert(`Payment of ₹${amount} recorded for ${showPayModal.name}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Total Staff" value={staff.length.toString()} icon={Icons.User} colorClass="text-blue-600" />
          <KPICard title="Total Payroll" value={`₹${totalPayroll.toLocaleString()}`} icon={Icons.Wallet} colorClass="text-slate-600" />
          <KPICard title="Paid" value={`₹${paidThisMonth.toLocaleString()}`} icon={Icons.CheckCircle} colorClass="text-green-600" />
          <KPICard title="Pending" value={`₹${pending.toLocaleString()}`} icon={Icons.Clock} colorClass="text-red-600" />
       </div>

       <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
             <h3 className="font-bold text-slate-800 text-lg">Staff Directory & Salary</h3>
             <Button size="sm" icon={<Icons.Plus className="w-4 h-4"/>}>Add Staff</Button>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                   <tr>
                      <th className="p-4">Name</th>
                      <th className="p-4">Role / Unit</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Attendance</th>
                      <th className="p-4">Salary Status</th>
                      <th className="p-4 text-right">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                   {staff.map(s => {
                      const isPaid = s.salaryPaid >= s.salary;
                      const progress = (s.salaryPaid / s.salary) * 100;
                      return (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                           <td className="p-4">
                              <p className="font-bold text-slate-900">{s.name}</p>
                              <p className="text-xs text-slate-500">{s.phone}</p>
                           </td>
                           <td className="p-4">
                              <span className="font-medium text-slate-700">{s.role}</span>
                              <span className="block text-[10px] uppercase font-bold text-slate-400">{s.bu}</span>
                           </td>
                           <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                 {s.status}
                              </span>
                           </td>
                           <td className="p-4 font-mono font-bold text-slate-600">
                              {s.attendance} / 30 Days
                           </td>
                           <td className="p-4">
                              <div className="flex justify-between text-xs mb-1 font-bold">
                                 <span>₹{s.salaryPaid}</span>
                                 <span className="text-slate-400">of ₹{s.salary}</span>
                              </div>
                              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                 <div className={`h-full rounded-full ${isPaid ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                              </div>
                           </td>
                           <td className="p-4 text-right">
                              <button 
                                disabled={isPaid}
                                onClick={() => setShowPayModal(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isPaid ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 shadow-sm'}`}
                              >
                                 {isPaid ? 'Paid' : 'Pay Salary'}
                              </button>
                           </td>
                        </tr>
                      );
                   })}
                </tbody>
             </table>
          </div>
       </div>

       {/* Pay Modal */}
       {showPayModal && (
          <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
             <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                <h3 className="text-xl font-bold mb-1">Pay Salary</h3>
                <p className="text-slate-500 text-sm mb-6">To: <span className="font-bold text-slate-900">{showPayModal.name}</span></p>
                
                <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100">
                   <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500">Monthly Salary</span>
                      <span className="font-bold">₹{showPayModal.salary}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Already Paid</span>
                      <span className="font-bold text-green-600">₹{showPayModal.salaryPaid}</span>
                   </div>
                   <div className="h-px bg-slate-200 my-3" />
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Remaining</span>
                      <span className="font-bold text-red-600">₹{showPayModal.salary - showPayModal.salaryPaid}</span>
                   </div>
                </div>

                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Amount to Pay</label>
                <input 
                  type="number" 
                  autoFocus
                  className="w-full p-4 text-2xl font-black border-2 border-slate-200 rounded-xl mb-6 outline-none focus:border-green-500" 
                  placeholder="0"
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                />

                <div className="flex gap-3">
                   <Button variant="secondary" fullWidth onClick={() => setShowPayModal(null)}>Cancel</Button>
                   <Button fullWidth onClick={handlePaySalary} disabled={!payAmount}>Confirm Pay</Button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};

// --- MAIN COMPONENT ---

export const SuperAdminDashboard = ({ onExit }: { onExit: () => void }) => {
  const [activeTab, setActiveTab] = useState<'HOME' | 'DHABA' | 'BAR' | 'SNOOKER' | 'LODGE' | 'STAFF'>('HOME');

  const tabs = [
    { id: 'HOME', label: 'Dashboard', icon: Icons.Grid },
    { id: 'DHABA', label: 'Dhaba', icon: Icons.Food },
    { id: 'BAR', label: 'Bar', icon: Icons.Bar },
    { id: 'SNOOKER', label: 'Snooker', icon: Icons.Snooker },
    { id: 'LODGE', label: 'Lodge', icon: Icons.Room },
    { id: 'STAFF', label: 'Staff & Salary', icon: Icons.User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       {/* Top Navigation */}
       <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-xl">
          <div className="max-w-7xl mx-auto px-4">
             <div className="flex justify-between items-center h-16 border-b border-slate-800">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="font-serif font-bold text-lg">T</span>
                   </div>
                   <div>
                      <h1 className="font-bold text-lg leading-none">Super Admin</h1>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Thakur’s Grandpoint</p>
                   </div>
                </div>
                <button 
                  onClick={onExit}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
                >
                   <Icons.Logout className="w-4 h-4" /> Exit
                </button>
             </div>
             
             {/* Tabs */}
             <div className="flex gap-1 overflow-x-auto no-scrollbar py-2">
                {tabs.map(tab => (
                   <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as any)}
                     className={`flex items-center gap-2 px-4 py-3 rounded-t-lg border-b-2 transition-all shrink-0 ${activeTab === tab.id ? 'border-orange-500 text-orange-500 bg-slate-800' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                   >
                      <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'animate-bounce-slow' : ''}`} />
                      <span className="font-bold text-sm">{tab.label}</span>
                   </button>
                ))}
             </div>
          </div>
       </header>

       {/* Main Content Area */}
       <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
          {activeTab === 'HOME' && <HomeTab />}
          {activeTab === 'DHABA' && <DhabaTab />}
          {activeTab === 'BAR' && <BarTab />}
          {activeTab === 'SNOOKER' && <SnookerTab />}
          {activeTab === 'LODGE' && <LodgeTab />}
          {activeTab === 'STAFF' && <StaffTab />}
       </main>
    </div>
  );
};
