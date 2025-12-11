
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icons } from './IconSet';
import { Button, ProductCard, DietaryBadge } from './Components';
import { BusinessUnit, Order, Product, CartItem, OrderStatus, PaymentMethod, UserRole, StaffMember } from '../types';
import { COLORS, UI_TEXT } from '../constants';
import { parseVoiceOrder } from '../services/geminiService';

interface DhabaDashboardProps {
  userRole: UserRole;
  activeOrders: Order[];
  onPlaceOrder: (items: CartItem[], tableId: string, payment: PaymentMethod) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  menu: Product[];
  onUpdateMenu: (newMenu: Product[]) => void;
}

// --- Inventory Types ---
interface InventoryLog {
  date: string;
  action: 'CREATE' | 'TOPUP' | 'TRANSFER_OUT' | 'TRANSFER_IN' | 'USED';
  amount: number;
  details: string;
}

interface InventoryItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  min: number;
  history: InventoryLog[];
}

// Initial Data
const INITIAL_RAW_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Basmati Rice', qty: 45, unit: 'kg', min: 10, history: [] },
  { id: '2', name: 'Atta (Flour)', qty: 30, unit: 'kg', min: 15, history: [] },
  { id: '3', name: 'Dal Arhar', qty: 25, unit: 'kg', min: 5, history: [] },
  { id: '4', name: 'Paneer Block', qty: 8, unit: 'kg', min: 5, history: [] },
  { id: '5', name: 'Chicken (Whole)', qty: 15, unit: 'kg', min: 8, history: [] },
  { id: '6', name: 'Refined Oil', qty: 40, unit: 'ltr', min: 20, history: [] },
  { id: '7', name: 'Spices Mix', qty: 5, unit: 'kg', min: 2, history: [] },
];

const INITIAL_KITCHEN_INVENTORY: InventoryItem[] = [
  { id: '11', name: 'Makhani Gravy', qty: 12, unit: 'ltr', min: 5, history: [] },
  { id: '12', name: 'Chopped Onions', qty: 4, unit: 'kg', min: 2, history: [] },
  { id: '13', name: 'Ginger Garlic Paste', qty: 3, unit: 'kg', min: 1, history: [] },
  { id: '14', name: 'Marinated Chicken', qty: 6, unit: 'kg', min: 5, history: [] },
  { id: '15', name: 'Boiled Potatoes', qty: 5, unit: 'kg', min: 2, history: [] },
  { id: '16', name: 'Dough (Atta)', qty: 10, unit: 'kg', min: 5, history: [] },
];

// Helper to get translation
const getT = (lang: 'en' | 'hi') => (key: keyof typeof UI_TEXT.en) => UI_TEXT[lang][key] || UI_TEXT.en[key];

// --- EXTRACTED COMPONENT: InventoryView ---
interface InventoryViewProps {
  rawInventory: InventoryItem[];
  setRawInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  kitchenInventory: InventoryItem[];
  setKitchenInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  language: 'en' | 'hi';
}

const InventoryView: React.FC<InventoryViewProps> = ({ 
  rawInventory, 
  setRawInventory, 
  kitchenInventory, 
  setKitchenInventory,
  language 
}) => {
  const t = getT(language);
  const [tab, setTab] = useState<'main' | 'kitchen'>('main');
  const items = tab === 'main' ? rawInventory : kitchenInventory;
  
  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [topUpItem, setTopUpItem] = useState<InventoryItem | null>(null);
  const [transferItem, setTransferItem] = useState<InventoryItem | null>(null);
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);

  // -- Sub-Components (Modals defined inside are fine as long as InventoryView is not re-created) --

  const CreateRawItemModal = () => {
    const [name, setName] = useState('');
    const [qty, setQty] = useState('');
    const [unit, setUnit] = useState('kg');

    const handleSave = () => {
      if(!name || !qty) return;
      const newItem: InventoryItem = {
        id: Math.random().toString(36).substr(2,9),
        name,
        qty: Number(qty),
        unit,
        min: 5,
        history: [{ date: new Date().toLocaleString(), action: 'CREATE', amount: Number(qty), details: 'Initial Stock' }]
      };
      setRawInventory(prev => [newItem, ...prev]);
      setShowCreateModal(false);
    };

    return (
      <div className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
             <h3 className="text-xl font-bold flex items-center gap-2">
                <div className="bg-orange-500 p-1.5 rounded-lg"><Icons.Plus className="w-5 h-5 text-white" /></div>
                New Inventory Item
             </h3>
             <button onClick={() => setShowCreateModal(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><Icons.Close /></button>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Item Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-800 transition-all" placeholder="e.g. Red Chilli" autoFocus />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Initial Stock</label>
                 <input type="number" value={qty} onChange={e => setQty(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-800 transition-all" placeholder="0" />
              </div>
              <div className="w-32">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Unit</label>
                 <div className="relative">
                    <select value={unit} onChange={e => setUnit(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl appearance-none font-bold text-slate-800 outline-none transition-all">
                      <option>kg</option>
                      <option>ltr</option>
                      <option>pcs</option>
                      <option>g</option>
                    </select>
                    <Icons.ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5" />
                 </div>
              </div>
            </div>
            <div className="pt-2 flex gap-3">
               <Button variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1">Cancel</Button>
               <Button onClick={handleSave} bu={BusinessUnit.DHABA} className="flex-1" size="lg">Create Item</Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TopUpModal = () => {
     const [amount, setAmount] = useState('');

     const handleVoice = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if(!SpeechRecognition) return alert("Browser not supported");
        const r = new SpeechRecognition();
        r.lang = 'en-US';
        r.start();
        r.onresult = (e: any) => {
           const txt = e.results[0][0].transcript;
           const num = txt.match(/\d+/);
           if(num) setAmount(num[0]);
        };
     };

     const handleConfirm = () => {
       if(!topUpItem || !amount) return;
       const qty = Number(amount);
       const updated = rawInventory.map(i => {
          if(i.id === topUpItem.id) {
             return {
               ...i,
               qty: i.qty + qty,
               history: [{ date: new Date().toLocaleString(), action: 'TOPUP', amount: qty, details: 'Manual Topup' }, ...i.history]
             };
          }
          return i;
       });
       setRawInventory(updated as InventoryItem[]);
       setTopUpItem(null);
     };

     return (
      <div className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
         <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 p-6 text-white">
                <h3 className="text-xl font-bold mb-1">Top Up Stock</h3>
                <p className="text-slate-400 text-sm">Adding to <span className="text-orange-400 font-bold">{topUpItem?.name}</span></p>
            </div>
            
            <div className="p-8">
                <div className="flex gap-3 mb-8">
                   <input 
                     type="number" 
                     value={amount} 
                     onChange={e => setAmount(e.target.value)} 
                     className="flex-1 p-5 text-4xl font-black text-center border-2 border-slate-200 rounded-2xl focus:border-orange-500 outline-none text-slate-800 placeholder:text-slate-200" 
                     placeholder="0"
                     autoFocus
                   />
                   <button onClick={handleVoice} className="bg-slate-100 hover:bg-orange-100 text-slate-500 hover:text-orange-600 px-6 rounded-2xl transition-colors border-2 border-transparent hover:border-orange-200">
                      <Icons.Mic className="w-8 h-8" />
                   </button>
                </div>

                <div className="flex gap-4">
                   <Button variant="secondary" onClick={() => setTopUpItem(null)} className="flex-1" size="lg">Cancel</Button>
                   <Button onClick={handleConfirm} bu={BusinessUnit.DHABA} className="flex-1" size="lg">Confirm Topup</Button>
                </div>
            </div>
         </div>
      </div>
     );
  };

  const TransferModal = () => {
      const [amount, setAmount] = useState('');

      const handleVoice = () => {
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          if(!SpeechRecognition) return alert("Browser not supported");
          const r = new SpeechRecognition();
          r.lang = 'en-US';
          r.start();
          r.onresult = (e: any) => {
             const txt = e.results[0][0].transcript;
             const num = txt.match(/\d+/);
             if(num) setAmount(num[0]);
          };
       };

       const handleConfirm = () => {
         if(!transferItem || !amount) return;
         const qty = Number(amount);
         if(qty > transferItem.qty) return alert("Insufficient Stock!");

         // 1. Update Raw Inventory (Decrease)
         const updatedRaw = rawInventory.map(i => {
            if(i.id === transferItem.id) {
               return {
                 ...i,
                 qty: i.qty - qty,
                 history: [{ date: new Date().toLocaleString(), action: 'TRANSFER_OUT', amount: qty, details: 'To Kitchen' }, ...i.history]
               };
            }
            return i;
         });
         setRawInventory(updatedRaw as InventoryItem[]);

         // 2. Update Kitchen Inventory (Increase or Create)
         let itemFound = false;
         const updatedKitchen = kitchenInventory.map(i => {
            if(i.name.toLowerCase() === transferItem.name.toLowerCase()) {
                itemFound = true;
                return {
                    ...i,
                    qty: i.qty + qty,
                    history: [{ date: new Date().toLocaleString(), action: 'TRANSFER_IN', amount: qty, details: 'From Main Inventory' }, ...i.history]
                };
            }
            return i;
         });

         if (itemFound) {
             setKitchenInventory(updatedKitchen as InventoryItem[]);
         } else {
             // Create new item in kitchen
             const newItem: InventoryItem = {
                 id: Math.random().toString(36).substr(2,9),
                 name: transferItem.name, 
                 qty: qty,
                 unit: transferItem.unit,
                 min: 5,
                 history: [{ date: new Date().toLocaleString(), action: 'TRANSFER_IN', amount: qty, details: 'From Main Inventory' }]
             };
             setKitchenInventory(prev => [newItem, ...prev]);
         }

         setTransferItem(null);
       };

       return (
        <div className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-slate-900 p-6 text-white">
                  <h3 className="text-xl font-bold mb-1">Transfer to Kitchen</h3>
                  <p className="text-slate-400 text-sm">Moving <span className="text-orange-400 font-bold">{transferItem?.name}</span></p>
              </div>
              
              <div className="p-8">
                 <div className="flex gap-3 mb-8">
                   <input 
                     type="number" 
                     value={amount} 
                     onChange={e => setAmount(e.target.value)} 
                     className="flex-1 p-5 text-4xl font-black text-center border-2 border-slate-200 rounded-2xl focus:border-orange-500 outline-none text-slate-800 placeholder:text-slate-200" 
                     placeholder="0"
                     autoFocus
                   />
                   <button onClick={handleVoice} className="bg-slate-100 hover:bg-orange-100 text-slate-500 hover:text-orange-600 px-6 rounded-2xl transition-colors border-2 border-transparent hover:border-orange-200">
                      <Icons.Mic className="w-8 h-8" />
                   </button>
                 </div>

                 <div className="flex gap-4">
                   <Button variant="secondary" onClick={() => setTransferItem(null)} className="flex-1" size="lg">Cancel</Button>
                   <Button onClick={handleConfirm} bu={BusinessUnit.DHABA} className="flex-1" size="lg">Transfer</Button>
                 </div>
              </div>
           </div>
        </div>
       );
  };

  const HistoryModal = () => {
      if (!historyItem) return null;

      return (
          <div className="fixed inset-0 z-[90] bg-black/60 flex justify-end backdrop-blur-sm animate-in slide-in-from-right duration-300">
              <div className="w-full md:w-[400px] bg-white h-full shadow-2xl flex flex-col">
                  <div className="bg-slate-900 p-6 text-white flex justify-between items-center shrink-0">
                      <div>
                         <h3 className="text-xl font-bold">{historyItem.name}</h3>
                         <p className="text-slate-400 text-sm">Stock History</p>
                      </div>
                      <button onClick={() => setHistoryItem(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><Icons.Close /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {historyItem.history.length === 0 && (
                          <p className="text-center text-gray-400 py-10">No history available.</p>
                      )}
                      {historyItem.history.map((log, i) => (
                          <div key={i} className="flex gap-4 items-start border-b border-gray-100 pb-4 last:border-0">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                  log.action === 'TOPUP' || log.action === 'CREATE' || log.action === 'TRANSFER_IN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                              }`}>
                                  {log.action === 'TOPUP' || log.action === 'CREATE' ? <Icons.Plus className="w-5 h-5" /> : 
                                   log.action === 'TRANSFER_IN' ? <Icons.ArrowRight className="w-5 h-5 rotate-90" /> :
                                   <Icons.Transfer className="w-5 h-5" />}
                              </div>
                              <div>
                                  <p className="text-sm font-bold text-slate-800">{log.action.replace('_', ' ')}</p>
                                  <p className="text-xs text-gray-500">{log.date}</p>
                                  <p className="text-xs text-gray-600 mt-1">{log.details}</p>
                              </div>
                              <div className="ml-auto font-bold text-slate-900">
                                  {log.action === 'TOPUP' || log.action === 'CREATE' || log.action === 'TRANSFER_IN' ? '+' : '-'}{log.amount}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in slide-in-from-right duration-500">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex gap-4 border-b border-gray-200">
              <button onClick={() => setTab('main')} className={`text-lg md:text-xl font-bold pb-4 px-2 border-b-4 transition-all ${tab === 'main' ? 'border-orange-500 text-slate-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                  {t('mainInventory')}
              </button>
              <button onClick={() => setTab('kitchen')} className={`text-lg md:text-xl font-bold pb-4 px-2 border-b-4 transition-all ${tab === 'kitchen' ? 'border-orange-500 text-slate-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                  {t('kitchenInventory')}
              </button>
          </div>
          {tab === 'main' && (
              <Button onClick={() => setShowCreateModal(true)} icon={<Icons.Plus className="w-5 h-5" />} bu={BusinessUnit.DHABA} className="shadow-lg">
                  Add Raw Item
              </Button>
          )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {items.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
                
                {/* History Button (Top Right) */}
                <button 
                  onClick={() => setHistoryItem(item)}
                  className="absolute top-4 right-4 p-2 text-gray-300 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors"
                >
                   <Icons.History className="w-5 h-5" />
                </button>

                <div className="flex justify-between items-start mb-4 pr-10">
                    <div>
                        <h4 className="text-lg font-bold text-slate-900">{item.name}</h4>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mt-1">{tab === 'main' ? 'Raw Material' : 'Prep Item'}</p>
                    </div>
                </div>
                
                <div className="flex items-end justify-between mb-4">
                    <div>
                        <span className="text-sm font-bold text-gray-400 block mb-1">{t('stockLevel')}</span>
                        <span className="text-4xl font-black text-slate-800 tracking-tight">{item.qty}</span>
                        <span className="text-gray-500 font-bold ml-1 text-lg">{item.unit}</span>
                    </div>
                    
                    {/* Action Buttons for Main Inventory */}
                    {tab === 'main' && (
                        <div className="flex gap-2">
                           <button 
                             onClick={() => setTopUpItem(item)}
                             className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 p-2 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 font-bold text-xs"
                           >
                              <Icons.Plus className="w-4 h-4" /> Top Up
                           </button>
                           <button 
                             onClick={() => setTransferItem(item)}
                             className="bg-orange-50 text-orange-600 hover:bg-orange-100 p-2 rounded-lg border border-orange-200 transition-colors flex items-center gap-1 font-bold text-xs"
                           >
                              <Icons.Transfer className="w-4 h-4" /> Kitchen
                           </button>
                        </div>
                    )}
                </div>

                {/* Visual Stock Bar */}
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ${item.qty <= item.min ? 'bg-red-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${Math.min((item.qty / (item.min * 3)) * 100, 100)}%` }}
                    />
                </div>
                {item.qty <= item.min && (
                    <p className="text-xs text-red-500 font-bold mt-2 animate-pulse flex items-center gap-1">
                      <Icons.Help className="w-3 h-3" /> Low Stock Warning
                    </p>
                )}
            </div>
        ))}
      </div>

      {/* Render Modals */}
      {showCreateModal && <CreateRawItemModal />}
      {topUpItem && <TopUpModal />}
      {transferItem && <TransferModal />}
      {historyItem && <HistoryModal />}
    </div>
  );
};

// --- EXTRACTED COMPONENT: StaffView ---
const StaffView = () => {
  const [staff, setStaff] = useState<StaffMember[]>([
    { id: 'S1', name: 'Rahul Kumar', role: 'Head Chef', bu: BusinessUnit.DHABA, phone: '9876543210', salary: 25000, salaryPaid: 25000, status: 'Active', attendance: 26, joinDate: '2023-01-15' },
    { id: 'S2', name: 'Amit Singh', role: 'Waiter', bu: BusinessUnit.DHABA, phone: '9876543211', salary: 12000, salaryPaid: 0, status: 'Active', attendance: 24, joinDate: '2023-03-10' },
  ]);
  
  const [showPayModal, setShowPayModal] = useState<StaffMember | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', role: 'Waiter', phone: '', salary: '', dept: 'Service' });

  const totalPayroll = staff.reduce((acc, s) => acc + s.salary, 0);
  const paidAmount = staff.reduce((acc, s) => acc + s.salaryPaid, 0);
  const pending = totalPayroll - paidAmount;

  const toggleStatus = (id: string) => {
    setStaff(prev => prev.map(s => {
      if (s.id === id) {
        let newStatus: any = 'Active';
        if (s.status === 'Active') newStatus = 'On Leave';
        else if (s.status === 'On Leave') newStatus = 'Terminated';
        else newStatus = 'Active';
        return { ...s, status: newStatus };
      }
      return s;
    }));
  };

  const handlePay = () => {
    if(!showPayModal || !payAmount) return;
    const amt = parseInt(payAmount);
    setStaff(prev => prev.map(s => s.id === showPayModal.id ? {...s, salaryPaid: s.salaryPaid + amt} : s));
    setShowPayModal(null);
    setPayAmount('');
    alert(`Paid ₹${amt} to ${showPayModal.name}`);
  };

  const handleAddStaff = () => {
    if(!newStaff.name || !newStaff.salary) return;
    const newMember: StaffMember = {
        id: Math.random().toString(36).substr(2,9),
        name: newStaff.name,
        role: newStaff.role,
        bu: BusinessUnit.DHABA, // Default to current unit context
        phone: newStaff.phone || '-',
        salary: parseInt(newStaff.salary),
        salaryPaid: 0,
        status: 'Active',
        attendance: 0,
        joinDate: new Date().toISOString().split('T')[0]
    };
    setStaff(prev => [newMember, ...prev]);
    setShowAddModal(false);
    setNewStaff({ name: '', role: 'Waiter', phone: '', salary: '', dept: 'Service' });
  };

  const statusColors = {
      'Active': 'bg-green-100 text-green-700 border-green-200',
      'On Leave': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Terminated': 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="space-y-6 animate-in fade-in">
       {/* Summary Header */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
             <div className="flex justify-between items-start mb-2">
                <div className="p-3 bg-slate-100 rounded-xl text-slate-600"><Icons.Wallet className="w-6 h-6" /></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Payroll</span>
             </div>
             <div>
                <p className="text-3xl font-black text-slate-900">₹{totalPayroll.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">Total commitments</p>
             </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
             <div className="flex justify-between items-start mb-2">
                <div className="p-3 bg-green-50 rounded-xl text-green-600"><Icons.CheckCircle className="w-6 h-6" /></div>
                <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Paid</span>
             </div>
             <div>
                <p className="text-3xl font-black text-green-600">₹{paidAmount.toLocaleString()}</p>
                <p className="text-xs text-green-700/60 mt-1 font-medium">Disbursed this month</p>
             </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -mr-8 -mt-8" />
             <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="p-3 bg-red-50 rounded-xl text-red-600"><Icons.Clock className="w-6 h-6" /></div>
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Pending</span>
             </div>
             <div className="relative z-10">
                <p className="text-3xl font-black text-red-600">₹{pending.toLocaleString()}</p>
                <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-red-700/60 font-medium">Remaining to pay</p>
                    <Button size="sm" onClick={() => setShowAddModal(true)} icon={<Icons.Plus className="w-4 h-4"/>} className="h-8 text-xs bg-slate-900 hover:bg-slate-800">Add Staff</Button>
                </div>
             </div>
          </div>
       </div>

       {/* Staff List */}
       <div className="grid grid-cols-1 gap-4">
          {staff.map(s => {
             const percentPaid = s.salary > 0 ? Math.min((s.salaryPaid / s.salary) * 100, 100) : 0;
             return (
             <div key={s.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow group">
                {/* Profile Info */}
                <div className="flex items-center gap-4 w-full md:w-auto min-w-[200px]">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-lg ${s.status === 'Active' ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 'bg-slate-300'}`}>
                      {s.name.charAt(0)}
                   </div>
                   <div>
                      <p className="font-bold text-slate-900 text-lg leading-none mb-1">{s.name}</p>
                      <div className="flex gap-2">
                          <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">{s.role}</span>
                          <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">{s.bu}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{s.phone}</p>
                   </div>
                </div>

                {/* Salary Progress */}
                <div className="flex-1 w-full md:px-8">
                   <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-slate-500 flex items-center gap-1"><Icons.Wallet className="w-3 h-3" /> Salary Paid</span>
                      <span className="text-slate-900">₹{s.salaryPaid.toLocaleString()} <span className="text-slate-400 font-normal">/ ₹{s.salary.toLocaleString()}</span></span>
                   </div>
                   <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
                      <div className={`h-full rounded-full transition-all duration-1000 ease-out ${s.salaryPaid >= s.salary ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${percentPaid}%` }} />
                      <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-500 mix-blend-multiply">
                          {Math.round(percentPaid)}% Paid
                      </div>
                   </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 w-full md:w-auto">
                    <button 
                        onClick={() => toggleStatus(s.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex-1 md:flex-none flex items-center justify-center gap-2 ${statusColors[s.status as keyof typeof statusColors]}`}
                    >
                        {s.status}
                    </button>
                    <Button 
                        size="sm" 
                        bu={BusinessUnit.DHABA}
                        disabled={s.salaryPaid >= s.salary}
                        onClick={() => setShowPayModal(s)}
                        className={`flex-1 md:flex-none min-w-[100px] ${s.salaryPaid >= s.salary ? 'bg-slate-100 text-slate-400 border border-slate-200' : 'bg-slate-900 text-white shadow-lg shadow-slate-200'}`}
                    >
                        {s.salaryPaid >= s.salary ? 'Paid Full' : 'Pay Salary'}
                    </Button>
                </div>
             </div>
          )})}
       </div>

       {/* Pay Modal */}
       {showPayModal && (
          <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
             <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-red-500" />
                <h3 className="text-2xl font-black text-slate-900 mb-1">Process Salary</h3>
                <p className="text-slate-500 text-sm mb-8">Paying to <span className="font-bold text-slate-900">{showPayModal.name}</span></p>
                
                <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500">Remaining Due</span>
                        <span className="font-bold text-red-600">₹{showPayModal.salary - showPayModal.salaryPaid}</span>
                    </div>
                    <div className="h-px bg-slate-200 my-2" />
                    <div className="flex gap-2">
                        <button onClick={() => setPayAmount((showPayModal.salary - showPayModal.salaryPaid).toString())} className="bg-white border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-lg hover:border-orange-500 hover:text-orange-600 transition-colors">Pay Full</button>
                        <button onClick={() => setPayAmount("5000")} className="bg-white border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-lg hover:border-orange-500 hover:text-orange-600 transition-colors">₹5000</button>
                    </div>
                </div>

                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Enter Amount</label>
                <div className="relative mb-8">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">₹</span>
                    <input 
                    type="number" 
                    value={payAmount} 
                    onChange={e => setPayAmount(e.target.value)} 
                    placeholder="0" 
                    className="w-full pl-10 p-4 border-2 border-slate-200 rounded-2xl text-2xl font-black text-slate-900 focus:border-orange-500 outline-none transition-colors placeholder:text-slate-300"
                    autoFocus 
                    />
                </div>
                
                <div className="flex gap-3">
                   <Button variant="secondary" fullWidth onClick={() => setShowPayModal(null)} className="h-14 rounded-xl">Cancel</Button>
                   <Button fullWidth onClick={handlePay} disabled={!payAmount} className="bg-green-600 hover:bg-green-700 h-14 rounded-xl shadow-lg shadow-green-200">Confirm Payment</Button>
                </div>
             </div>
          </div>
       )}

       {/* Add Staff Modal */}
       {showAddModal && (
          <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
             <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-slate-900" />
                <h3 className="text-2xl font-black text-slate-900 mb-6">Onboard Staff</h3>
                <div className="space-y-4 mb-8">
                   <div>
                       <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Full Name</label>
                       <input value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} placeholder="e.g. Amit Singh" className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:border-slate-900 font-bold text-slate-800 transition-colors" />
                   </div>
                   <div>
                       <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Mobile Number</label>
                       <input value={newStaff.phone} onChange={e => setNewStaff({...newStaff, phone: e.target.value})} placeholder="9876543210" className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:border-slate-900 font-bold text-slate-800 transition-colors" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                           <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Role</label>
                           <select value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})} className="w-full p-4 border border-slate-200 rounded-xl bg-white outline-none focus:border-slate-900 font-bold text-slate-800 transition-colors appearance-none">
                              <option>Waiter</option>
                              <option>Chef</option>
                              <option>Cleaner</option>
                              <option>Helper</option>
                              <option>Manager</option>
                           </select>
                       </div>
                       <div>
                           <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Department</label>
                           <select value={newStaff.dept} onChange={e => setNewStaff({...newStaff, dept: e.target.value})} className="w-full p-4 border border-slate-200 rounded-xl bg-white outline-none focus:border-slate-900 font-bold text-slate-800 transition-colors appearance-none">
                              <option>Service</option>
                              <option>Kitchen</option>
                              <option>Utility</option>
                              <option>Management</option>
                           </select>
                       </div>
                   </div>
                   <div>
                       <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Monthly Salary</label>
                       <input type="number" value={newStaff.salary} onChange={e => setNewStaff({...newStaff, salary: e.target.value})} placeholder="₹" className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:border-slate-900 font-bold text-slate-800 transition-colors" />
                   </div>
                </div>
                <div className="flex gap-3">
                   <Button variant="secondary" fullWidth onClick={() => setShowAddModal(false)} className="h-14 rounded-xl">Cancel</Button>
                   <Button fullWidth onClick={handleAddStaff} disabled={!newStaff.name || !newStaff.salary} className="bg-slate-900 hover:bg-slate-800 h-14 rounded-xl shadow-xl">Add & Active</Button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};

// --- EXTRACTED COMPONENT: ManageOrdersView ---
interface ManageOrdersViewProps {
  activeOrders: Order[];
  manageOrderTab: OrderStatus;
  setManageOrderTab: (s: OrderStatus) => void;
  onUpdateOrderStatus: (id: string, s: OrderStatus) => void;
  language: 'en' | 'hi';
}

const ManageOrdersView: React.FC<ManageOrdersViewProps> = ({
  activeOrders,
  manageOrderTab,
  setManageOrderTab,
  onUpdateOrderStatus,
  language
}) => {
   const t = getT(language);
   const ordersByStatus = activeOrders.filter(o => 
     o.bu === BusinessUnit.DHABA && o.status === manageOrderTab
   );
   
   const tabs = [
     { id: OrderStatus.INCOMING, label: t('incoming'), color: 'bg-red-500' },
     { id: OrderStatus.PREPARING, label: t('preparing'), color: 'bg-orange-500' },
     { id: OrderStatus.READY, label: t('ready'), color: 'bg-green-500' },
     { id: OrderStatus.PICKED_UP, label: t('pickedUp'), color: 'bg-gray-500' },
   ];

   return (
     <div className="h-full flex flex-col">
        {/* Tabs */}
        <div className="flex bg-white rounded-xl shadow-sm p-1 mb-6 overflow-x-auto">
           {tabs.map(tab => {
              const count = activeOrders.filter(o => o.bu === BusinessUnit.DHABA && o.status === tab.id).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setManageOrderTab(tab.id)}
                  className={`flex-1 min-w-[100px] py-3 rounded-lg font-bold text-sm flex flex-col md:flex-row items-center justify-center gap-2 transition-all ${manageOrderTab === tab.id ? 'bg-slate-800 text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                   {tab.label}
                   {count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${tab.color} text-white`}>{count}</span>
                   )}
                </button>
              );
           })}
        </div>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {ordersByStatus.map(order => (
             <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                         <span className="bg-slate-100 text-slate-800 font-bold px-3 py-1 rounded text-sm">{order.source} {order.tableId}</span>
                         <span className="text-xs text-gray-400">#{order.id}</span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">Placed 5m ago</p>
                   </div>
                   <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${order.paymentStatus === PaymentMethod.PENDING ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {order.paymentStatus}
                   </span>
                </div>
                
                <div className="space-y-3 mb-6">
                   {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                         <span className="text-gray-600"><span className="font-bold text-slate-900">{item.quantity}x</span> {language === 'hi' ? item.localName : item.name}</span>
                         <span className="font-medium text-gray-900">₹{item.price * item.quantity}</span>
                      </div>
                   ))}
                   <div className="pt-3 border-t border-gray-100 flex justify-between font-bold">
                      <span>{t('total')}</span>
                      <span>₹{order.totalAmount}</span>
                   </div>
                </div>

                <div className="flex gap-2">
                   {order.status === OrderStatus.INCOMING && (
                      <>
                         <Button onClick={() => onUpdateOrderStatus(order.id, OrderStatus.CANCELLED)} variant="secondary" className="flex-1" size="sm">{t('cancel')}</Button>
                         <Button onClick={() => onUpdateOrderStatus(order.id, OrderStatus.PREPARING)} className="flex-[2] bg-orange-600 hover:bg-orange-700" size="sm">{t('accept')}</Button>
                      </>
                   )}
                   {order.status === OrderStatus.PREPARING && (
                      <Button onClick={() => onUpdateOrderStatus(order.id, OrderStatus.READY)} className="w-full bg-green-600 hover:bg-green-700" size="sm">{t('markReady')}</Button>
                   )}
                   {order.status === OrderStatus.READY && (
                      <Button onClick={() => onUpdateOrderStatus(order.id, OrderStatus.PICKED_UP)} className="w-full bg-slate-800" size="sm">{t('markPicked')}</Button>
                   )}
                </div>
             </div>
           ))}
           {ordersByStatus.length === 0 && (
              <div className="col-span-full py-20 text-center text-gray-400">
                 <Icons.CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
                 <p>No orders in this stage</p>
              </div>
           )}
        </div>
     </div>
   );
};

// --- EXTRACTED COMPONENT: ManageMenuView ---
interface ManageMenuViewProps {
  menu: Product[];
  onUpdateMenu: (m: Product[]) => void;
  language: 'en' | 'hi';
}

const ManageMenuView: React.FC<ManageMenuViewProps> = ({ menu, onUpdateMenu, language }) => {
  const t = getT(language);
  const [newItemName, setNewItemName] = useState('');
  const [newItemLocal, setNewItemLocal] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemImage, setNewItemImage] = useState('https://images.unsplash.com/photo-1546833999-b9f5816029bd?w=500');
  const [newItemVeg, setNewItemVeg] = useState(true);

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItemName,
      localName: newItemLocal,
      price: Number(newItemPrice),
      image: newItemImage,
      category: 'food',
      bu: BusinessUnit.DHABA,
      subCategory: 'Starters', // Default for now
      isVeg: newItemVeg,
      isAvailable: true
    };
    onUpdateMenu([...menu, newProduct]);
    setNewItemName('');
    setNewItemLocal('');
    setNewItemPrice('');
    alert("Item Created!");
  };

  const toggleAvailability = (id: string) => {
    const updatedMenu = menu.map(p => 
      p.id === id ? { ...p, isAvailable: !p.isAvailable } : p
    );
    onUpdateMenu(updatedMenu);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Create Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
        <h3 className="text-xl font-bold mb-4 text-slate-800">{t('createItem')}</h3>
        <form onSubmit={handleCreateItem} className="space-y-4">
           <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('itemName')}</label>
             <input required value={newItemName} onChange={e => setNewItemName(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="e.g. Jeera Rice" />
           </div>
           <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('localName')}</label>
             <input required value={newItemLocal} onChange={e => setNewItemLocal(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="e.g. जीरा राइस" />
           </div>
           <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('price')}</label>
             <input required type="number" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="150" />
           </div>
           <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('image')}</label>
             <input required value={newItemImage} onChange={e => setNewItemImage(e.target.value)} className="w-full p-2 border rounded-lg text-xs" />
           </div>
           <div className="flex gap-4">
             <button type="button" onClick={() => setNewItemVeg(true)} className={`flex-1 py-2 rounded border ${newItemVeg ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200'}`}>{t('veg')}</button>
             <button type="button" onClick={() => setNewItemVeg(false)} className={`flex-1 py-2 rounded border ${!newItemVeg ? 'bg-red-50 border-red-500 text-red-700' : 'border-gray-200'}`}>{t('nonVeg')}</button>
           </div>
           <Button type="submit" fullWidth bu={BusinessUnit.DHABA}>{t('save')}</Button>
        </form>
      </div>

      {/* Existing Items List */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-xl font-bold text-slate-800">{t('manageMenu')}</h3>
        {menu.filter(p => p.bu === BusinessUnit.DHABA).map(p => (
          <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <img src={p.image} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
               <div>
                  <div className="flex items-center gap-2">
                    <DietaryBadge isVeg={p.isVeg} />
                    <h4 className="font-bold text-slate-800">{language === 'hi' ? p.localName : p.name}</h4>
                  </div>
                  <p className="text-sm text-gray-500">₹{p.price}</p>
               </div>
            </div>
            
            <div className="flex bg-gray-100 rounded-lg p-1">
               <button 
                 onClick={() => !p.isAvailable && toggleAvailability(p.id)}
                 className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${p.isAvailable ? 'bg-green-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 {t('available')}
               </button>
               <button 
                 onClick={() => p.isAvailable && toggleAvailability(p.id)}
                 className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${!p.isAvailable ? 'bg-red-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 {t('outOfStock')}
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DhabaDashboard: React.FC<DhabaDashboardProps> = ({ 
  userRole, 
  activeOrders, 
  onPlaceOrder, 
  onUpdateOrderStatus,
  menu,
  onUpdateMenu
}) => {
  // View State
  const [view, setView] = useState<'order' | 'manage' | 'inventory'>('order');
  const [manageSubView, setManageSubView] = useState<'orders' | 'menu' | 'staff'>('orders');
  
  // Inventory State
  const [rawInventory, setRawInventory] = useState<InventoryItem[]>(INITIAL_RAW_INVENTORY);
  const [kitchenInventory, setKitchenInventory] = useState<InventoryItem[]>(INITIAL_KITCHEN_INVENTORY);

  // LIFTED STATE: Fixes bug where tab resets on every order update
  const [manageOrderTab, setManageOrderTab] = useState<OrderStatus>(OrderStatus.INCOMING);
  
  // Language State
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  
  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartExpanded, setIsCartExpanded] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [tableId, setTableId] = useState('T-1');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dietaryFilter, setDietaryFilter] = useState<'ALL' | 'VEG' | 'NONVEG'>('ALL');
  
  // Voice
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Shift Timer
  const [shiftTime, setShiftTime] = useState("00:00:00");

  // Helper for text
  const t = getT(language);

  // Get Unique Categories
  const categories = useMemo(() => {
    const rawCategories = menu
      .filter(p => p.bu === BusinessUnit.DHABA)
      .map(p => p.subCategory || 'Other');
    return ['All', ...Array.from(new Set(rawCategories))];
  }, [menu]);

  // Recommended Items
  const recommendedItems = useMemo(() => {
    return menu.filter(p => p.bu === BusinessUnit.DHABA && p.isRecommended && p.isAvailable);
  }, [menu]);

  useEffect(() => {
    const start = new Date();
    start.setHours(start.getHours() - 2); 
    const timer = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - start.getTime();
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setShiftTime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Actions ---

  const addToCart = (product: Product, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + qty } : p);
      }
      return [...prev, { ...product, quantity: qty }];
    });
    
    // Localized Voice Feedback
    const msg = new SpeechSynthesisUtterance();
    if (language === 'hi') {
       msg.text = `${product.localName} ऐड किया`;
       msg.lang = 'hi-IN';
    } else {
       msg.text = `Added ${product.name}`;
       msg.lang = 'en-US';
    }
    window.speechSynthesis.speak(msg);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map(p => p.id === id ? { ...p, quantity: p.quantity - 1 } : p);
      }
      return prev.filter(p => p.id !== id);
    });
  };

  const handleVoiceCommand = () => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice features are not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    recognition.continuous = false; // We process one command at a time
    recognition.interimResults = false;

    setIsListening(true);
    setVoiceTranscript(t('listening'));

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceTranscript(`${t('processing')}: "${transcript}"`);
      
      try {
        // Pass the current dynamic MENU to the parser
        const parsedItems = await parseVoiceOrder(transcript, menu);
        
        if (parsedItems.length > 0) {
          let addedNames: string[] = [];
          parsedItems.forEach(pi => {
            const product = menu.find(p => p.id === pi.id);
            if (product) {
              addToCart(product, pi.quantity);
              addedNames.push(language === 'hi' ? product.localName : product.name);
            }
          });
          // Update transcript to show success
          setVoiceTranscript(language === 'hi' ? `${addedNames.join(', ')} ऐड किया` : `Added: ${addedNames.join(', ')}`);
        } else {
          setVoiceTranscript(language === 'hi' ? "कुछ समझ नहीं आया" : "Could not find item");
        }
      } catch (e) {
        console.error(e);
        setVoiceTranscript("Error");
      }
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error", event.error);
      setVoiceTranscript(language === 'hi' ? "सुनाई नहीं दिया" : "Could not hear");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // --- Render Helpers ---

  // Helper to filter items for search or specific category
  const getFilteredItems = (cat?: string) => {
    return menu.filter(p => {
        if (p.bu !== BusinessUnit.DHABA) return false;
        
        let matches = true;

        if (searchQuery) {
            matches = matches && (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.localName.includes(searchQuery));
        }
        
        if (cat && cat !== 'All') {
            matches = matches && (p.subCategory || 'Other') === cat;
        }

        // Dietary Filter Logic
        if (dietaryFilter === 'VEG') matches = matches && p.isVeg === true;
        if (dietaryFilter === 'NONVEG') matches = matches && p.isVeg === false;

        return matches;
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // --- Shared Components for Mobile & Desktop Cart ---

  const CartContent = ({ isMobile = false }) => (
    <div className={`flex flex-col h-full ${isMobile ? 'p-6' : 'p-4'}`}>
        {!isMobile && (
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-black text-lg relative">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                </div>
                <div>
                   <h3 className="text-lg font-black text-slate-900 leading-none">Current Order</h3>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-wide mt-1">Table {tableId}</p>
                </div>
            </div>
        )}

        {isMobile && <h3 className="text-lg font-bold text-gray-800 mb-4">{t('items')}</h3>}
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {cart.length === 0 && (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                    <Icons.Food className="w-12 h-12 mb-2 opacity-20" />
                    <p className="text-sm">Empty Cart</p>
                </div>
            )}
            {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                    <img src={item.image} className="w-12 h-12 rounded-lg object-cover bg-gray-200" alt={item.name} />
                    <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">{language === 'hi' ? item.localName : item.name}</h4>
                        <p className="font-bold text-emerald-600 text-xs mt-0.5">₹{item.price}</p>
                    </div>
                    </div>
                    <div className="flex items-center gap-2">
                    <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 rounded-lg bg-white shadow flex items-center justify-center text-gray-600 active:bg-gray-100">
                        <Icons.Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => addToCart(item)} className="w-8 h-8 rounded-lg bg-white shadow flex items-center justify-center text-gray-600 active:bg-gray-100">
                        <Icons.Plus className="w-3 h-3" />
                    </button>
                    </div>
                </div>
            ))}
        </div>
        
        <div className="mt-4 bg-orange-50 p-4 rounded-xl border border-orange-100 shrink-0">
            <div className="flex justify-between mb-1 text-xs text-gray-600 font-medium">
                <span>{t('subtotal')}</span>
                <span>₹{cartTotal}</span>
            </div>
            <div className="flex justify-between mb-2 text-xs text-gray-600 font-medium">
                <span>{t('tax')} (5%)</span>
                <span>₹{Math.round(cartTotal * 0.05)}</span>
            </div>
            <div className="h-px bg-orange-200 my-2" />
            <div className="flex justify-between text-lg font-black text-orange-800">
                <span>{t('grandTotal')}</span>
                <span>₹{Math.round(cartTotal * 1.05)}</span>
            </div>
        </div>

        <div className="mt-4 shrink-0">
            <Button 
                fullWidth 
                size="lg" 
                bu={BusinessUnit.DHABA}
                onClick={() => setShowCheckout(true)}
                disabled={cart.length === 0}
            >
                {t('confirm')}
            </Button>
        </div>
    </div>
  );

  const TopBar = () => (
    <div className="bg-orange-600 text-white p-4 shadow-md flex items-center justify-between sticky top-0 z-20 h-16 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full overflow-hidden border-2 border-white/50 hidden md:block">
          <Icons.User className="w-full h-full p-2" />
        </div>
        <div>
          <h2 className="font-bold text-lg leading-tight">Rahul Kumar</h2>
          {/* Updated Role per instruction */}
          <span className="text-xs uppercase opacity-80 font-semibold tracking-wider">Dhaba Manager</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
         <button 
           onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
           className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded font-bold text-sm uppercase tracking-wider"
         >
           {language === 'en' ? 'हिन्दी' : 'English'}
         </button>

         <div className="flex bg-black/20 rounded-lg p-1">
            <button 
              onClick={() => setView('order')}
              className={`px-4 py-1 rounded-md font-bold text-sm transition-all ${view === 'order' ? 'bg-white text-orange-600 shadow' : 'text-white/70 hover:bg-white/10'}`}
            >
              {t('orderFood')}
            </button>
            <button 
              onClick={() => setView('manage')}
              className={`px-4 py-1 rounded-md font-bold text-sm flex items-center gap-2 transition-all ${view === 'manage' ? 'bg-white text-orange-600 shadow' : 'text-white/70 hover:bg-white/10'}`}
            >
               {t('manage')}
               {activeOrders.filter(o => o.status === OrderStatus.INCOMING).length > 0 && (
                 <span className="bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                   {activeOrders.filter(o => o.status === OrderStatus.INCOMING).length}
                 </span>
               )}
            </button>
            <button 
              onClick={() => setView('inventory')}
              className={`px-4 py-1 rounded-md font-bold text-sm flex items-center gap-2 transition-all ${view === 'inventory' ? 'bg-white text-orange-600 shadow' : 'text-white/70 hover:bg-white/10'}`}
            >
               {t('inventory')}
            </button>
         </div>
      </div>
    </div>
  );

  const StickyCart = () => {
    if (cart.length === 0) return null;

    return (
      <>
        {isCartExpanded && (
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsCartExpanded(false)} />
        )}

        <div className={`fixed bottom-0 left-0 right-0 bg-white shadow-[0_-5px_25px_rgba(0,0,0,0.15)] z-50 transition-all duration-300 rounded-t-3xl ${isCartExpanded ? 'h-[80vh]' : 'h-20'}`}>
          <div 
             className="h-20 px-6 flex items-center justify-between cursor-pointer border-b border-gray-100"
             onClick={() => setIsCartExpanded(!isCartExpanded)}
          >
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 relative">
                   <Icons.Food className="w-6 h-6" />
                   <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                      {cart.reduce((a, b) => a + b.quantity, 0)}
                   </span>
                </div>
                <div>
                   <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">{t('total')}</p>
                   <p className="text-xl font-black text-slate-900">₹{cartTotal}</p>
                </div>
             </div>
             {/* Restored Toggle UI */}
             <div className="flex items-center gap-2">
                <div className="flex flex-col items-end mr-4 text-orange-600">
                    <span className="text-xs font-bold uppercase">{isCartExpanded ? 'Minimize' : 'View Order'}</span>
                    {isCartExpanded ? <Icons.ChevronDown className="w-4 h-4" /> : <Icons.ChevronUp className="w-4 h-4" />}
                </div>
                <Button 
                    onClick={(e) => { e.stopPropagation(); setShowCheckout(true); }}
                    bu={BusinessUnit.DHABA} 
                    className="ml-2 shadow-lg"
                >
                    {t('checkout')}
                </Button>
             </div>
          </div>

          {isCartExpanded && <CartContent isMobile={true} />}
        </div>
      </>
    );
  };

  const SidebarCart = () => (
      <div className="h-full flex flex-col bg-white">
          <CartContent isMobile={false} />
      </div>
  );

  const CheckoutModal = () => {
    const subtotal = cartTotal;
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = (method: PaymentMethod) => {
        if (method === PaymentMethod.UPI) {
            setIsProcessing(true);
            setTimeout(() => {
                onPlaceOrder(cart, tableId, method);
                setCart([]);
                setShowCheckout(false);
                setIsCartExpanded(false);
                setOrderSuccess(true);
                setIsProcessing(false);
            }, 3000); // Simulate API delay
        } else {
            onPlaceOrder(cart, tableId, method);
            setCart([]);
            setShowCheckout(false);
            setIsCartExpanded(false);
            setOrderSuccess(true);
        }
    };

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
           
           {/* Header */}
           <div className="bg-slate-900 p-6 text-white relative shrink-0">
              <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold">{t('checkout')}</h2>
                    <p className="text-slate-400 text-sm mt-1">Table {tableId} • {cart.reduce((a,b)=>a+b.quantity,0)} Items</p>
                </div>
                <button onClick={() => setShowCheckout(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                   <Icons.Close className="w-5 h-5" />
                </button>
              </div>
           </div>

           {/* Content */}
           <div className="p-6 overflow-y-auto flex-1 bg-gray-50 relative">
              {isProcessing ? (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
                      <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
                      <h3 className="text-lg font-bold text-slate-800">Processing Payment...</h3>
                      <p className="text-slate-500 text-sm">Please wait</p>
                      
                      {/* Fake QR for realism */}
                      <div className="mt-6 bg-white p-4 rounded-xl border border-gray-200 shadow-lg">
                          <Icons.QR className="w-32 h-32 text-slate-800" />
                      </div>
                      <p className="text-xs text-orange-600 font-bold mt-2 animate-pulse">Scanning...</p>
                  </div>
              ) : (
                  <>
                    {/* Order Summary Card */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Order Summary</h3>
                        <div className="space-y-3">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-start text-sm">
                                    <div className="flex gap-3">
                                        <span className="font-bold text-slate-700 bg-gray-100 px-2 py-0.5 rounded text-xs h-fit">x{item.quantity}</span>
                                        <span className="text-slate-600 font-medium leading-tight max-w-[160px]">{language === 'hi' ? item.localName : item.name}</span>
                                    </div>
                                    <span className="font-bold text-slate-800">₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>
                        
                        <div className="my-4 border-t-2 border-dashed border-gray-100" />
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Subtotal</span>
                                <span>₹{subtotal}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>CGST/SGST (5%)</span>
                                <span>₹{tax}</span>
                            </div>
                            <div className="flex justify-between text-xl font-black text-slate-900 pt-2 mt-2 border-t border-gray-100">
                                <span>Total</span>
                                <span>₹{total}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Select Payment Method</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {[
                        { label: 'Cash Payment', icon: Icons.Cash, method: PaymentMethod.CASH, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
                        { label: 'UPI / Online', icon: Icons.Phone, method: PaymentMethod.UPI, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                        { label: 'Room Charge', icon: Icons.Room, method: PaymentMethod.ROOM_CHARGE, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
                        ].map((opt) => (
                        <button 
                            key={opt.label}
                            onClick={() => handlePayment(opt.method)}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all active:scale-95 group ${opt.bg} ${opt.border} hover:border-current hover:shadow-md bg-white`}
                        >
                            <div className={`p-3 rounded-full bg-white shadow-sm ${opt.color}`}>
                                <opt.icon className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <span className={`block font-bold text-slate-800 text-lg group-hover:${opt.color}`}>{opt.label}</span>
                                <span className="text-xs text-slate-500 font-medium">Tap to confirm order</span>
                            </div>
                            <div className="ml-auto">
                                <Icons.ArrowRight className={`w-5 h-5 text-gray-300 group-hover:${opt.color}`} />
                            </div>
                        </button>
                        ))}
                    </div>
                  </>
              )}
           </div>
        </div>
      </div>
    );
  };

  const SuccessOverlay = () => (
    <div className="fixed inset-0 z-[70] bg-green-600 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="text-center text-white">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-bounce">
          <Icons.Check className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-4xl font-bold mb-4">{t('orderSuccess')}</h2>
        <p className="text-green-100 text-xl mb-8">{t('orderSuccessMsg')}</p>
        <Button 
          variant="secondary" 
          size="lg" 
          onClick={() => setOrderSuccess(false)}
          className="bg-white text-green-700 hover:bg-green-50"
        >
          OK
        </Button>
      </div>
    </div>
  );

  // --- Main Render ---

  if (view === 'manage') {
     return (
        <div className="min-h-screen bg-gray-50">
           <TopBar />
           <div className="p-4 md:p-8 max-w-7xl mx-auto">
              <div className="flex gap-4 mb-8">
                 <button onClick={() => setManageSubView('orders')} className={`text-xl font-bold pb-2 border-b-4 ${manageSubView === 'orders' ? 'border-orange-500 text-slate-900' : 'border-transparent text-gray-400'}`}>
                    {t('manageOrders')}
                 </button>
                 <button onClick={() => setManageSubView('menu')} className={`text-xl font-bold pb-2 border-b-4 ${manageSubView === 'menu' ? 'border-orange-500 text-slate-900' : 'border-transparent text-gray-400'}`}>
                    {t('manageMenu')}
                 </button>
                 <button onClick={() => setManageSubView('staff')} className={`text-xl font-bold pb-2 border-b-4 ${manageSubView === 'staff' ? 'border-orange-500 text-slate-900' : 'border-transparent text-gray-400'}`}>
                    Team & Payroll
                 </button>
              </div>
              
              {manageSubView === 'orders' ? (
                 <ManageOrdersView 
                   activeOrders={activeOrders} 
                   manageOrderTab={manageOrderTab}
                   setManageOrderTab={setManageOrderTab}
                   onUpdateOrderStatus={onUpdateOrderStatus}
                   language={language}
                 />
              ) : manageSubView === 'menu' ? (
                 <ManageMenuView 
                    menu={menu}
                    onUpdateMenu={onUpdateMenu}
                    language={language}
                 />
              ) : (
                 <StaffView />
              )}
           </div>
        </div>
     );
  }

  if (view === 'inventory') {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <InventoryView 
          rawInventory={rawInventory}
          setRawInventory={setRawInventory}
          kitchenInventory={kitchenInventory}
          setKitchenInventory={setKitchenInventory}
          language={language}
        />
      </div>
    );
  }

  // --- ORDER VIEW (Split Layout for Tablet) ---
  return (
    <div className="min-h-screen bg-slate-50 pb-24 lg:pb-0 h-screen flex flex-col overflow-hidden">
      {orderSuccess && <SuccessOverlay />}
      <TopBar />

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
          
          {/* Top Search Area */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
             <div className="flex-1 relative">
                <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none shadow-sm text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             <button 
               onClick={handleVoiceCommand}
               className={`flex items-center justify-center px-6 rounded-xl font-bold gap-2 transition-all shrink-0 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-900 text-white shadow-lg hover:bg-slate-800'}`}
             >
               <Icons.Mic className="w-5 h-5" />
               {isListening ? t('listening') : t('sayOrder')}
             </button>
          </div>

          {voiceTranscript && (
             <div className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-6 py-3 rounded-full backdrop-blur z-30 shadow-xl flex items-center gap-3">
                <Icons.Mic className="w-4 h-4 text-orange-400" />
                <span className="font-medium">{voiceTranscript}</span>
             </div>
          )}

          {/* Sticky Filters */}
          <div className="sticky top-0 z-10 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 bg-slate-50/95 backdrop-blur-md pt-2 pb-4 mb-4 space-y-3 shadow-sm border-b border-gray-100/50">
             {/* Dietary Filters */}
             <div className="flex gap-2 overflow-x-auto no-scrollbar">
                <button 
                  onClick={() => setDietaryFilter(prev => prev === 'VEG' ? 'ALL' : 'VEG')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm border transition-all ${dietaryFilter === 'VEG' ? 'bg-green-50 border-green-500 text-green-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${dietaryFilter === 'VEG' ? 'bg-green-600' : 'bg-gray-400'}`} />
                  Pure Veg
                </button>
                <button 
                  onClick={() => setDietaryFilter(prev => prev === 'NONVEG' ? 'ALL' : 'NONVEG')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm border transition-all ${dietaryFilter === 'NONVEG' ? 'bg-red-50 border-red-500 text-red-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${dietaryFilter === 'NONVEG' ? 'bg-red-600' : 'bg-gray-400'}`} />
                  Non-Veg
                </button>
                {dietaryFilter !== 'ALL' && (
                  <button 
                    onClick={() => setDietaryFilter('ALL')} 
                    className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 underline"
                  >
                    Clear
                  </button>
                )}
             </div>

             {/* Category Pills */}
             {!searchQuery && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                   {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm transition-all border ${
                          selectedCategory === cat 
                            ? 'bg-slate-800 text-white border-slate-800 shadow-md transform scale-105' 
                            : 'bg-white text-slate-600 border-gray-200 hover:border-orange-200 hover:text-orange-600'
                        }`}
                      >
                        {cat}
                      </button>
                   ))}
                </div>
             )}
          </div>

          {/* Menu Content */}
          <div className="pb-10">
            {searchQuery || selectedCategory !== 'All' ? (
               // Single List (Filtered)
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                 {getFilteredItems(selectedCategory).map(product => (
                    <ProductCard 
                      key={product.id}
                      product={{...product, name: language === 'hi' ? product.localName : product.name}}
                      quantity={cart.find(c => c.id === product.id)?.quantity || 0}
                      onAdd={() => addToCart(product)}
                      onRemove={() => removeFromCart(product.id)}
                    />
                 ))}
                 {getFilteredItems(selectedCategory).length === 0 && (
                    <div className="col-span-full py-16 text-center text-gray-400">
                       <Icons.Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                       <p>No items found</p>
                    </div>
                 )}
               </div>
            ) : (
               <div className="space-y-8">
                  
                  {/* Most Recommended Section */}
                  {recommendedItems.length > 0 && (
                    <div className="bg-orange-50 rounded-3xl p-6 border border-orange-100 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Icons.Trending className="w-24 h-24 text-orange-500" />
                       </div>
                       <h3 className="text-xl font-black text-orange-800 mb-4 flex items-center gap-2 relative z-10">
                          🔥 Most Recommended
                       </h3>
                       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 relative z-10">
                          {recommendedItems.map(product => (
                              <ProductCard 
                                key={product.id}
                                product={{...product, name: language === 'hi' ? product.localName : product.name}}
                                quantity={cart.find(c => c.id === product.id)?.quantity || 0}
                                onAdd={() => addToCart(product)}
                                onRemove={() => removeFromCart(product.id)}
                              />
                          ))}
                       </div>
                    </div>
                  )}

                  {/* Grouped by Category */}
                  {categories.filter(c => c !== 'All').map(cat => {
                     const items = getFilteredItems(cat);
                     if (items.length === 0) return null;
                     return (
                        <div key={cat} className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-slate-100">
                           {/* Section Header */}
                           <div className="flex items-center justify-between mb-4 md:mb-6 pb-2 md:pb-4 border-b border-gray-50">
                             <h3 className="text-lg md:text-2xl font-black text-slate-800 flex items-center gap-3">
                                {cat} 
                             </h3>
                             <span className="bg-slate-100 text-slate-500 font-bold px-3 py-1 rounded-full text-[10px] md:text-xs uppercase tracking-wider">
                                {items.length} Items
                             </span>
                           </div>
                           
                           {/* Compact Grid */}
                           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                              {items.map(product => (
                                  <ProductCard 
                                    key={product.id}
                                    product={{...product, name: language === 'hi' ? product.localName : product.name}}
                                    quantity={cart.find(c => c.id === product.id)?.quantity || 0}
                                    onAdd={() => addToCart(product)}
                                    onRemove={() => removeFromCart(product.id)}
                                  />
                              ))}
                           </div>
                        </div>
                     );
                  })}
               </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Cart (Desktop/Tablet) */}
        <div className="hidden lg:flex w-[400px] border-l border-gray-200 bg-white z-20 shadow-xl flex-col">
           <SidebarCart />
        </div>

      </div>

      {/* Mobile Sticky Cart (Bottom) */}
      <div className="lg:hidden">
         <StickyCart />
      </div>

      {showCheckout && <CheckoutModal />}
    </div>
  );
};
