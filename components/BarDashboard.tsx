
import React, { useState, useMemo } from 'react';
import { Icons } from './IconSet';
import { Button } from './Components';
import { BusinessUnit, Order, Product, CartItem, PaymentMethod, OrderStatus, StaffMember } from '../types';
import { parseVoiceOrder } from '../services/geminiService';

// --- Types specific to Bar ---
type PourSize = '30ml' | '60ml' | '90ml' | 'Btl';

interface BarDashboardProps {
  menu: Product[];
  orders: Order[];
  onPlaceOrder: (items: CartItem[], tableId: string, payment: PaymentMethod) => void;
  onUpdateMenu: (newMenu: Product[]) => void;
}

// --- Components ---

const PINModal = ({ onSuccess, onCancel, varianceAmount }: { onSuccess: (reason?: string) => void, onCancel: () => void, varianceAmount: number }) => {
  const [pin, setPin] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleKey = (key: string) => {
    if (key === 'C') setPin('');
    else if (key === '<') setPin(prev => prev.slice(0, -1));
    else if (pin.length < 4) setPin(prev => prev + key);
  };

  const verify = () => {
    if (pin === '1234') { // Mock PIN
      if (!reason) {
        setError('Please provide a reason for the variance');
        return;
      }
      onSuccess(reason);
    } else {
      setError('Invalid Manager PIN');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in zoom-in-95">
      <div className="bg-slate-900 p-8 rounded-3xl w-full max-w-sm border border-slate-800 shadow-2xl">
        <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Icons.Warning className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-white">Variance Detected</h3>
            <p className="text-red-400 font-bold text-lg mt-1">{varianceAmount > 0 ? '+' : ''}{varianceAmount}</p>
            <p className="text-slate-500 text-sm mt-2">Manager approval required to close shift.</p>
        </div>

        <input 
            type="text" 
            placeholder="Reason (e.g. Spillage, Theft)" 
            className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white mb-6 outline-none focus:border-orange-500 transition-colors"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            autoFocus
        />

        <div className="flex justify-center mb-6">
          <div className="flex gap-4">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${pin.length > i ? 'bg-orange-500 scale-110' : 'bg-slate-700'}`} />
            ))}
          </div>
        </div>
        
        {error && <p className="text-red-500 text-center mb-4 font-bold bg-red-500/10 py-2 rounded-lg text-sm">{error}</p>}
        
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '<'].map(k => (
            <button 
              key={k} 
              onClick={() => handleKey(k.toString())}
              className={`h-14 rounded-xl font-bold text-xl flex items-center justify-center active:scale-90 transition-transform ${
                typeof k === 'number' 
                  ? 'bg-slate-800 text-white hover:bg-slate-700' 
                  : k === 'C' ? 'bg-red-900/20 text-red-500' : 'bg-slate-800 text-orange-500'
              }`}
            >
              {k === '<' ? <Icons.Minus className="w-5 h-5" /> : k}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="secondary" onClick={onCancel} className="bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700">Cancel</Button>
          <Button onClick={verify} bu={BusinessUnit.BAR} className="bg-orange-600 hover:bg-orange-500 text-white">Authorize</Button>
        </div>
      </div>
    </div>
  );
};

const StockModal = ({ product, onClose, onConfirm }: { product: Product, onClose: () => void, onConfirm: (qty: number) => void }) => {
  const [qty, setQty] = useState('');
  
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 p-8 rounded-3xl w-full max-w-sm border border-slate-800 shadow-2xl">
         <h3 className="text-2xl font-bold text-white mb-2">Restock Inventory</h3>
         <p className="text-slate-400 mb-8 text-sm">Adding bottles to <span className="text-white font-bold text-base block mt-1">{product.name}</span></p>
         
         <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8 flex items-center gap-4">
            <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block tracking-wider">Quantity to Add</label>
                <input 
                    type="number" 
                    autoFocus
                    value={qty}
                    onChange={e => setQty(e.target.value)}
                    className="w-full bg-transparent text-white text-5xl font-black outline-none placeholder:text-slate-600"
                    placeholder="0"
                />
            </div>
            <div className="text-slate-500 font-bold text-xl rotate-90">Btls</div>
         </div>
         
         <div className="grid grid-cols-2 gap-4">
            <Button variant="secondary" onClick={onClose} className="bg-slate-800 text-white border-transparent hover:bg-slate-700 h-14">Cancel</Button>
            <Button onClick={() => onConfirm(Number(qty))} bu={BusinessUnit.BAR} disabled={!qty || Number(qty) <= 0} className="bg-emerald-600 hover:bg-emerald-500 h-14">Update Stock</Button>
         </div>
      </div>
    </div>
  );
};

const SuccessOverlay = () => (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-900 p-10 rounded-[2rem] border border-emerald-500/30 shadow-2xl shadow-emerald-500/20 flex flex-col items-center animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 transform scale-100">
         <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/50 animate-[bounce_1s_infinite]">
            <Icons.Check className="w-12 h-12 text-slate-900 stroke-[4]" />
         </div>
         <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Payment Success!</h2>
         <p className="text-slate-400 text-lg font-medium mb-6">Transaction Recorded.</p>
         
         <div className="flex items-center gap-3 bg-slate-800/80 px-6 py-3 rounded-xl border border-slate-700/50">
            <div className="bg-emerald-500/20 p-1.5 rounded-full">
                <Icons.CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-left">
                <p className="text-emerald-400 font-bold text-sm leading-none">Stock Updated</p>
                <p className="text-slate-500 text-xs font-medium">Inventory deducted automatically</p>
            </div>
         </div>
      </div>
    </div>
);

interface ShiftRecord {
    id: string;
    date: string;
    totalRevenue: number;
    cashCollected: number;
    upiCollected: number;
    variance: number;
}

export const BarDashboard: React.FC<BarDashboardProps> = ({ menu, orders, onPlaceOrder, onUpdateMenu }) => {
  const [view, setView] = useState<'POS' | 'INVENTORY' | 'SETTLEMENT' | 'REPORTS' | 'MANAGE' | 'HISTORY' | 'TEAM'>('POS');
  const [activeTable, setActiveTable] = useState('Table-1');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPinModal, setShowPinModal] = useState<{ action: string, data?: any } | null>(null);
  const [stockUpdatedToast, setStockUpdatedToast] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  // Stock Modal State
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showMobileCart, setShowMobileCart] = useState(false);
  
  // Local History State
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [stockHistory, setStockHistory] = useState<{name: string, added: number, date: string}[]>([]);
  const [shiftHistory, setShiftHistory] = useState<ShiftRecord[]>([]);

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Filter only Bar items
  const barItems = menu.filter(p => p.bu === BusinessUnit.BAR);

  // Categories
  const categories = useMemo(() => ['All', ...Array.from(new Set(barItems.map(i => i.subCategory || 'Other')))], [barItems]);

  // --- Sort Items Logic ---
  const filteredItems = useMemo(() => {
    let items = barItems;
    
    // 1. Filter Category
    if (selectedCategory !== 'All') {
        items = items.filter(i => (i.subCategory || 'Other') === selectedCategory);
    }

    // 2. Filter Search
    if (searchQuery) {
        const lowerQ = searchQuery.toLowerCase();
        items = items.filter(p => p.name.toLowerCase().includes(lowerQ) || p.localName.includes(lowerQ));
    }

    return items;
  }, [barItems, searchQuery, selectedCategory]);

  const getPrice = (product: Product, size: PourSize) => {
    if (product.variantPrices && product.variantPrices[size]) {
      return product.variantPrices[size]!;
    }
    const base = product.price;
    switch (size) {
      case '30ml': return base;
      case '60ml': return base * 2;
      case '90ml': return base * 3;
      case 'Btl': return base * 12;
    }
  };

  const addToCart = (product: Product, size: PourSize, qty: number = 1) => {
    const price = getPrice(product, size);
    const id = `${product.id}-${size}`;
    
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, { ...product, id, price, quantity: qty, variant: size }];
    });
    // Haptic feedback if available
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const handleVoiceCommand = () => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice features are not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; 
    recognition.continuous = false; 
    recognition.interimResults = false;

    setIsListening(true);
    setVoiceTranscript('Listening...');

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceTranscript(`Thinking: "${transcript}"`);
      
      try {
        const parsedItems = await parseVoiceOrder(transcript, barItems);
        
        if (parsedItems.length > 0) {
          let addedNames: string[] = [];
          parsedItems.forEach(pi => {
            const product = barItems.find(p => p.id === pi.id);
            if (product) {
              // Default to 'Btl' for Beer, '30ml' for others for voice commands
              let size: PourSize = '30ml';
              if (product.subCategory === 'Beer') size = 'Btl';
              
              addToCart(product, size, pi.quantity);
              addedNames.push(`${product.name} (${size})`);
            }
          });
          setVoiceTranscript(`Added: ${addedNames.join(', ')}`);
        } else {
          setVoiceTranscript("Could not find item");
        }
      } catch (e) {
        console.error(e);
        setVoiceTranscript("Error");
      }
      setIsListening(false);
      setTimeout(() => setVoiceTranscript(''), 3000);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error", event.error);
      setVoiceTranscript("Could not hear");
      setIsListening(false);
      setTimeout(() => setVoiceTranscript(''), 3000);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Helper to finalize shift
  const finalizeShift = (data: any, reason: string) => {
      const newShift: ShiftRecord = {
          id: Math.random().toString(36).substr(2, 6),
          date: new Date().toLocaleString(),
          totalRevenue: data.totalSales,
          cashCollected: data.cashCollected,
          upiCollected: data.upiSales,
          variance: data.variance
      };
      setShiftHistory(prev => [newShift, ...prev]);
      setOrderHistory([]); 
      alert(`Shift Closed Successfully.\nVariance: ${data.variance}\nNote: ${reason}`);
      setShowPinModal(null);
      setView('POS'); // Return to POS
  };

  const handlePinSuccess = (reason?: string) => {
    if (!showPinModal) return;

    if (showPinModal.action === 'SETTLE_VARIANCE') {
        finalizeShift(showPinModal.data, reason || 'Manager Authorized');
    }
  };

  const handlePlaceOrder = (method: PaymentMethod) => {
    onPlaceOrder(cart, activeTable, method);
    
    // --- 1. Deduct Stock (Auto Stock Deduction Step) ---
    const stockUpdates = new Map<string, number>();
    
    cart.forEach(item => {
        let deduction = 0;
        const variant = item.variant as PourSize; 
        
        if (variant === 'Btl') deduction = 1.0;
        else if (variant === '30ml') deduction = 0.04;
        else if (variant === '60ml') deduction = 0.08;
        else if (variant === '90ml') deduction = 0.12;
        
        const productId = item.id.split('-')[0]; 
        const totalDeduction = deduction * item.quantity;
        
        stockUpdates.set(productId, (stockUpdates.get(productId) || 0) + totalDeduction);
    });

    const updatedMenu = menu.map(p => {
        if (stockUpdates.has(p.id)) {
            const currentStock = p.stock || 0;
            const deduction = stockUpdates.get(p.id) || 0;
            const newStock = Math.max(0, currentStock - deduction);
            return { ...p, stock: Number(newStock.toFixed(2)) };
        }
        return p;
    });
    onUpdateMenu(updatedMenu);

    // Show Success Popup (Flash Message)
    setOrderSuccess(true);
    setTimeout(() => setOrderSuccess(false), 2500);

    // --- 2. Add to History ---
    const newOrder: Order = {
        id: Math.random().toString(36).substr(2, 5).toUpperCase(),
        tableId: activeTable,
        source: 'BAR',
        items: [...cart],
        status: OrderStatus.READY as any,
        paymentStatus: method,
        totalAmount: cart.reduce((a,b) => a + (b.price * b.quantity), 0),
        timestamp: Date.now(),
        bu: BusinessUnit.BAR
    };
    
    setOrderHistory(prev => [newOrder, ...prev]);
    setCart([]);
    setShowMobileCart(false);
  };

  const handleConfirmStock = (qty: number) => {
     if (stockModalProduct && qty > 0) {
        const product = stockModalProduct;
        const newMenu = menu.map(p => 
          p.id === product.id ? { ...p, stock: (p.stock || 0) + qty } : p
        );
        onUpdateMenu(newMenu);
        setStockHistory(prev => [{
          name: product.name,
          added: qty,
          date: new Date().toLocaleString()
        }, ...prev]);
        setStockModalProduct(null);
     }
  };

  const cartTotal = cart.reduce((a,b) => a + (b.price * b.quantity), 0);

  // --- Sub-Components ---

  const Sidebar = () => (
    <div className="hidden md:flex flex-col w-20 lg:w-24 bg-slate-950 border-r border-slate-800 items-center py-6 gap-2 z-20 h-full">
       <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-serif font-black text-xl mb-6 shadow-lg shadow-orange-900/50">
          B
       </div>
       {[
         { id: 'POS', icon: Icons.Grid, label: 'Menu' },
         { id: 'INVENTORY', icon: Icons.Search, label: 'Stock' },
         { id: 'SETTLEMENT', icon: Icons.Cash, label: 'Close' },
         { id: 'REPORTS', icon: Icons.Chart, label: 'Stats' },
         { id: 'MANAGE', icon: Icons.Edit, label: 'Edit' },
         { id: 'TEAM', icon: Icons.User, label: 'Team' },
         { id: 'HISTORY', icon: Icons.History, label: 'Logs' },
       ].map(item => (
         <button 
           key={item.id}
           onClick={() => setView(item.id as any)}
           className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 group ${view === item.id ? 'bg-slate-800 text-orange-500 shadow-inner' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'}`}
         >
           <item.icon className={`w-5 h-5 lg:w-6 lg:h-6 transition-transform group-hover:scale-110 ${view === item.id ? 'scale-110' : ''}`} />
           <span className="text-[9px] font-bold uppercase tracking-wide">{item.label}</span>
         </button>
       ))}
    </div>
  );

  const MobileNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 flex justify-around p-2 z-50 pb-safe">
       {[
         { id: 'POS', icon: Icons.Grid },
         { id: 'INVENTORY', icon: Icons.Search },
         { id: 'SETTLEMENT', icon: Icons.Cash },
         { id: 'TEAM', icon: Icons.User },
       ].map(item => (
         <button 
           key={item.id}
           onClick={() => setView(item.id as any)}
           className={`p-3 rounded-xl transition-colors ${view === item.id ? 'bg-slate-800 text-orange-500' : 'text-slate-500'}`}
         >
           <item.icon className="w-6 h-6" />
         </button>
       ))}
    </div>
  );

  const CartDrawer = ({ isMobile = false }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = (method: PaymentMethod) => {
        if (method === PaymentMethod.UPI) {
            setIsProcessing(true);
            setTimeout(() => {
                handlePlaceOrder(method);
                setIsProcessing(false);
            }, 3000);
        } else {
            handlePlaceOrder(method);
        }
    };

    return (
    <div className={`flex flex-col h-full bg-slate-900 ${isMobile ? '' : 'border-l border-slate-800'}`}>
         {/* Cart Header */}
         <div className="p-5 border-b border-slate-800 bg-slate-950">
           <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-3">
                <div className="bg-slate-800 p-2 rounded-lg text-orange-500"><Icons.Bar className="w-5 h-5" /></div>
                <div>
                    <h2 className="text-lg font-black text-white leading-none">Order</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{cart.length} Items</p>
                </div>
             </div>
             {isMobile && <button onClick={() => setShowMobileCart(false)} className="bg-slate-800 p-2 rounded-full text-white"><Icons.Close /></button>}
           </div>
           
           <div className="relative">
             <select 
                value={activeTable}
                onChange={(e) => setActiveTable(e.target.value)}
                className="w-full bg-slate-800 text-white font-bold p-3 pl-10 rounded-xl outline-none appearance-none border border-slate-700 focus:border-orange-500 transition-colors cursor-pointer"
             >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={`Table-${num}`}>Table {num}</option>
                ))}
             </select>
             <Icons.User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
             <Icons.ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
           </div>
         </div>

         {/* Content Area with Loading State */}
         <div className="flex-1 overflow-y-auto p-4 space-y-3 relative">
            {isProcessing && (
                <div className="absolute inset-0 z-20 bg-slate-900/90 backdrop-blur flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <h3 className="text-white font-bold text-lg">Verifying Payment</h3>
                    <p className="text-slate-400 text-sm mb-6">Please wait...</p>
                    <div className="bg-white p-4 rounded-xl">
                        <Icons.QR className="w-32 h-32 text-slate-900" />
                    </div>
                    <p className="text-orange-500 font-bold text-xs mt-3 animate-pulse">Processing UPI...</p>
                </div>
            )}

            {cart.map((item, idx) => (
               <div key={`${item.id}-${idx}`} className="bg-slate-800 p-3 rounded-2xl flex gap-3 group border border-transparent hover:border-slate-700 transition-all">
                  <img src={item.image} className="w-16 h-16 rounded-xl object-cover bg-slate-900" />
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                     <p className="text-white font-bold text-sm truncate">{item.name}</p>
                     <p className="text-slate-500 text-xs truncate">{item.localName}</p>
                     <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black bg-slate-700 text-orange-400 px-1.5 py-0.5 rounded uppercase tracking-wide">{item.variant}</span>
                        <span className="text-xs font-bold text-slate-300">₹{item.price * item.quantity}</span>
                     </div>
                  </div>
                  <div className="flex flex-col items-end justify-between py-1">
                     <button onClick={() => removeFromCart(item.id)} className="text-slate-600 hover:text-red-500 p-1">
                        <Icons.Close className="w-4 h-4" />
                     </button>
                     <span className="bg-slate-950 text-white text-xs font-black px-2 py-1 rounded-lg border border-slate-800">x{item.quantity}</span>
                  </div>
               </div>
            ))}
            {cart.length === 0 && (
               <div className="flex flex-col items-center justify-center h-64 text-slate-700">
                  <Icons.Bar className="w-16 h-16 mb-4 opacity-50" />
                  <p className="font-bold text-sm">Cart Empty</p>
                  <p className="text-xs mt-1">Select items to start pouring</p>
               </div>
            )}
         </div>

         {/* Checkout Area */}
         <div className="p-5 bg-slate-950 border-t border-slate-800 pb-8 md:pb-5">
            <div className="flex justify-between items-end mb-6">
               <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Payable</p>
                  <p className="text-slate-600 text-[10px] font-medium mt-0.5">Incl. Taxes</p>
               </div>
               <p className="text-4xl font-black text-white tracking-tight">₹{cartTotal}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Button 
                   fullWidth 
                   disabled={cart.length === 0}
                   onClick={() => handlePayment(PaymentMethod.CASH)}
                   className="bg-emerald-600 hover:bg-emerald-500 h-14 text-base rounded-xl font-bold"
                   icon={<Icons.Cash className="w-5 h-5" />}
                >
                   Cash
                </Button>
                <Button 
                   fullWidth 
                   disabled={cart.length === 0}
                   onClick={() => handlePayment(PaymentMethod.UPI)}
                   className="bg-blue-600 hover:bg-blue-500 h-14 text-base rounded-xl font-bold"
                   icon={<Icons.Phone className="w-5 h-5" />}
                >
                   UPI
                </Button>
            </div>
         </div>
    </div>
    );
  };

  const POSView = () => (
    <div className="flex flex-col md:flex-row h-full overflow-hidden bg-slate-900">
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header Bar */}
        <div className="p-4 md:p-6 pb-2 bg-slate-950/95 sticky top-0 z-10 border-b border-slate-800">
           <div className="flex gap-4 mb-4">
              <div className="relative flex-1 group">
                 <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors w-5 h-5" />
                 <input 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Search brands..." 
                   className="w-full bg-slate-900 text-white pl-12 pr-4 py-3.5 rounded-2xl border border-slate-800 focus:border-orange-500 focus:bg-slate-800 outline-none font-medium transition-all"
                 />
              </div>
              <button 
                onClick={handleVoiceCommand}
                className={`bg-slate-900 border border-slate-800 hover:border-orange-500/50 w-14 rounded-2xl flex items-center justify-center transition-all ${isListening ? 'text-red-500 border-red-500 animate-pulse' : 'text-orange-500'}`}
              >
                 <Icons.Mic className="w-6 h-6" />
              </button>
           </div>

           {/* Voice Transcript Overlay */}
           {voiceTranscript && (
             <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-6 py-2 rounded-full backdrop-blur z-30 shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in zoom-in-95">
                <Icons.Mic className="w-4 h-4 text-orange-400" />
                <span className="font-medium text-sm whitespace-nowrap">{voiceTranscript}</span>
             </div>
           )}

           {/* Category Pills */}
           <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {categories.map(cat => (
                 <button
                   key={cat}
                   onClick={() => setSelectedCategory(cat)}
                   className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                     selectedCategory === cat 
                       ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-900/20' 
                       : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                   }`}
                 >
                   {cat}
                 </button>
              ))}
           </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32 md:pb-6">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {filteredItems.map(item => (
                 <div key={item.id} className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden flex flex-col group hover:border-slate-700 transition-all shadow-sm">
                    {/* Image Area */}
                    <div className="h-40 relative bg-slate-900 overflow-hidden">
                       <img src={item.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" loading="lazy" />
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                       
                       {/* Floating Badges */}
                       <div className="absolute top-3 left-3">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md border ${
                             (item.stock || 0) > 10 
                               ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                               : 'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}>
                             {(item.stock || 0) > 0 ? `${item.stock?.toFixed(1)} Left` : 'Out of Stock'}
                          </span>
                       </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 pt-2 flex-1 flex flex-col">
                       <div className="mb-4">
                          <h3 className="text-white font-bold text-lg leading-tight mb-1 truncate">{item.name}</h3>
                          <p className="text-slate-500 text-xs font-medium">{item.localName}</p>
                       </div>

                       {/* Action Buttons Grid */}
                       <div className="grid grid-cols-4 gap-1 mt-auto bg-slate-900 p-1 rounded-xl border border-slate-800">
                          {(['30ml', '60ml', '90ml', 'Btl'] as PourSize[]).map((size, idx) => (
                             <button
                               key={size}
                               disabled={!item.isAvailable}
                               onClick={() => addToCart(item, size)}
                               className={`flex flex-col items-center justify-center py-2 rounded-lg transition-all active:scale-90 active:bg-orange-600 active:text-white group/btn ${idx === 3 ? 'bg-slate-800' : 'hover:bg-slate-800'}`}
                             >
                                <span className="text-[9px] font-bold text-slate-500 group-hover/btn:text-slate-300 uppercase">{size.replace('ml','')}</span>
                                <span className="text-xs font-bold text-slate-200 group-hover/btn:text-white">₹{getPrice(item, size)}</span>
                             </button>
                          ))}
                       </div>
                    </div>
                 </div>
              ))}
           </div>
           
           {filteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-600">
                 <Icons.Search className="w-12 h-12 mb-3 opacity-20" />
                 <p>No spirits found.</p>
              </div>
           )}
        </div>
      </div>

      {/* Desktop Cart Sidebar */}
      <div className="hidden lg:block w-96 xl:w-[420px] bg-slate-900 border-l border-slate-800 shrink-0 z-20 shadow-2xl">
         <CartDrawer />
      </div>

      {/* Mobile Cart Floating Button */}
      {cart.length > 0 && (
         <div className="lg:hidden fixed bottom-20 left-4 right-4 z-40">
            <button 
              onClick={() => setShowMobileCart(true)}
              className="w-full bg-orange-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border-t border-orange-400 animate-in slide-in-from-bottom"
            >
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white text-orange-600 rounded-full flex items-center justify-center font-black text-lg">
                     {cart.reduce((a,b) => a + b.quantity, 0)}
                  </div>
                  <div className="text-left leading-tight">
                     <p className="font-bold text-lg">View Cart</p>
                     <p className="text-orange-200 text-xs font-medium">Tap to checkout</p>
                  </div>
               </div>
               <p className="text-2xl font-black">₹{cartTotal}</p>
            </button>
         </div>
      )}

      {/* Mobile Cart Modal */}
      {showMobileCart && (
         <div className="fixed inset-0 z-50 lg:hidden animate-in slide-in-from-bottom duration-300">
            <CartDrawer isMobile={true} />
         </div>
      )}
    </div>
  );

  // --- ADDITIONAL VIEWS IMPLEMENTATION ---

  const InventoryView = () => (
      <div className="p-8 h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
              <div>
                  <h2 className="text-2xl font-black text-white">Stock Inventory</h2>
                  <p className="text-slate-500">Track and restock bottles</p>
              </div>
              <Button onClick={() => setView('MANAGE')} bu={BusinessUnit.BAR} icon={<Icons.Plus className="w-4 h-4"/>}>Add New Brand</Button>
          </div>

          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left">
                  <thead className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wider font-bold">
                      <tr>
                          <th className="p-4">Brand</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Stock Level</th>
                          <th className="p-4 text-right">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                      {barItems.map(item => (
                          <tr key={item.id} className="hover:bg-slate-900/50 transition-colors group">
                              <td className="p-4 flex items-center gap-3">
                                  <img src={item.image} className="w-10 h-10 rounded-lg object-cover bg-slate-800" />
                                  <div>
                                      <p className="text-white font-bold">{item.name}</p>
                                      <p className="text-xs text-slate-500">{item.localName}</p>
                                  </div>
                              </td>
                              <td className="p-4"><span className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-400">{item.subCategory}</span></td>
                              <td className="p-4">
                                  <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${(item.stock || 0) < 5 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                                      <span className="text-lg font-bold text-white">{item.stock?.toFixed(1) || 0}</span>
                                      <span className="text-xs text-slate-500">btls</span>
                                  </div>
                              </td>
                              <td className="p-4 text-right">
                                  <button 
                                    onClick={() => setStockModalProduct(item)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-orange-600 hover:text-white rounded-lg text-xs font-bold transition-all"
                                  >
                                      Restock
                                  </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
  );

  const TeamView = () => {
    const [staff, setStaff] = useState<StaffMember[]>([
        { id: 'S3', name: 'Vikram', role: 'Bartender', bu: BusinessUnit.BAR, phone: '9876543212', salary: 18000, salaryPaid: 10000, status: 'Active', attendance: 25, joinDate: '2023-02-01' },
    ]);
    
    const [showPayModal, setShowPayModal] = useState<StaffMember | null>(null);
    const [payAmount, setPayAmount] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newStaff, setNewStaff] = useState({ name: '', role: 'Bartender', phone: '', salary: '' });

    const totalPayroll = staff.reduce((acc, s) => acc + s.salary, 0);
    const paidAmount = staff.reduce((acc, s) => acc + s.salaryPaid, 0);

    const toggleStatus = (id: string) => {
        setStaff(prev => prev.map(s => {
          if (s.id === id) {
            const newStatus = s.status === 'Active' ? 'On Leave' : 'Active';
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
            bu: BusinessUnit.BAR,
            phone: newStaff.phone || '-',
            salary: parseInt(newStaff.salary),
            salaryPaid: 0,
            status: 'Active',
            attendance: 0,
            joinDate: new Date().toISOString().split('T')[0]
        };
        setStaff(prev => [newMember, ...prev]);
        setShowAddModal(false);
        setNewStaff({ name: '', role: 'Bartender', phone: '', salary: '' });
    };

    return (
        <div className="p-8 h-full overflow-y-auto">
            <h2 className="text-2xl font-black text-white mb-8">Bar Staff Management</h2>
            
            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-500 font-bold uppercase">Total Payroll</p>
                    <p className="text-2xl font-black text-white">₹{totalPayroll}</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-500 font-bold uppercase">Paid This Month</p>
                    <p className="text-2xl font-black text-emerald-500">₹{paidAmount}</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase">Active Staff</p>
                        <p className="text-2xl font-black text-orange-500">{staff.filter(s => s.status === 'Active').length}</p>
                    </div>
                    <Button size="sm" bu={BusinessUnit.BAR} onClick={() => setShowAddModal(true)} icon={<Icons.Plus className="w-4 h-4"/>}>Add Staff</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {staff.map(s => {
                    const percentPaid = Math.min((s.salaryPaid / s.salary) * 100, 100);
                    return (
                    <div key={s.id} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-700 transition-all">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-400 text-lg border border-slate-700">
                                {s.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-white text-lg">{s.name}</p>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{s.role} • {s.phone}</p>
                            </div>
                        </div>

                        <div className="flex-1 w-full md:px-8">
                            <div className="flex justify-between text-xs font-bold mb-2">
                                <span className="text-slate-500">Salary Paid</span>
                                <span className="text-emerald-400">₹{s.salaryPaid} / <span className="text-slate-600">₹{s.salary}</span></span>
                            </div>
                            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${percentPaid}%` }} />
                            </div>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <button 
                                onClick={() => toggleStatus(s.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-1 md:flex-none ${s.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}
                            >
                                {s.status}
                            </button>
                            <Button 
                                size="sm" 
                                bu={BusinessUnit.BAR}
                                disabled={s.salaryPaid >= s.salary}
                                onClick={() => setShowPayModal(s)}
                                className={`flex-1 md:flex-none ${s.salaryPaid >= s.salary ? 'opacity-50' : ''}`}
                            >
                                {s.salaryPaid >= s.salary ? 'Paid' : 'Pay'}
                            </Button>
                        </div>
                    </div>
                )})}
            </div>

            {/* Pay Modal */}
            {showPayModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-slate-900 p-8 rounded-3xl w-full max-w-sm border border-slate-800 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-1">Pay Salary</h3>
                        <p className="text-slate-500 text-sm mb-6">To <span className="font-bold text-white">{showPayModal.name}</span></p>
                        
                        <input 
                            type="number" 
                            value={payAmount} 
                            onChange={e => setPayAmount(e.target.value)} 
                            placeholder="Enter Amount" 
                            className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white text-xl font-bold mb-6 focus:border-orange-500 outline-none placeholder:text-slate-600"
                            autoFocus 
                        />
                        
                        <div className="flex gap-3">
                            <Button variant="secondary" fullWidth onClick={() => setShowPayModal(null)} className="bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700">Cancel</Button>
                            <Button fullWidth onClick={handlePay} bu={BusinessUnit.BAR} disabled={!payAmount} className="bg-emerald-600 hover:bg-emerald-500 text-white">Confirm Pay</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Staff Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-slate-900 p-8 rounded-3xl w-full max-w-sm border border-slate-800 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-6">Add New Staff</h3>
                        <div className="space-y-4 mb-8">
                            <input value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} placeholder="Name" className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-orange-500" />
                            <input value={newStaff.phone} onChange={e => setNewStaff({...newStaff, phone: e.target.value})} placeholder="Phone" className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-orange-500" />
                            <select value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-orange-500">
                                <option>Bartender</option>
                                <option>Waiter</option>
                                <option>Security</option>
                                <option>Cleaner</option>
                            </select>
                            <input type="number" value={newStaff.salary} onChange={e => setNewStaff({...newStaff, salary: e.target.value})} placeholder="Monthly Salary (₹)" className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-orange-500" />
                        </div>
                        <div className="flex gap-3">
                            <Button variant="secondary" fullWidth onClick={() => setShowAddModal(false)} className="bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700">Cancel</Button>
                            <Button fullWidth onClick={handleAddStaff} bu={BusinessUnit.BAR} disabled={!newStaff.name || !newStaff.salary} className="bg-orange-600 hover:bg-orange-500 text-white">Add Staff</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
  };

  const SettlementView = () => {
     // Calculate stats from current orders
     const sessionOrders = orderHistory; 
     const totalSales = sessionOrders.reduce((a, b) => a + b.totalAmount, 0);
     const cashSales = sessionOrders.filter(o => o.paymentStatus === PaymentMethod.CASH).reduce((a, b) => a + b.totalAmount, 0);
     const upiSales = sessionOrders.filter(o => o.paymentStatus === PaymentMethod.UPI).reduce((a, b) => a + b.totalAmount, 0);
     
     const [countedCash, setCountedCash] = useState('');
     
     const variance = countedCash ? Number(countedCash) - cashSales : 0;
     const isVariance = variance !== 0;

     const handleCloseShift = () => {
        const data = { totalSales, cashSales, upiSales, cashCollected: Number(countedCash), variance };
        
        if (isVariance) {
            // Require PIN if mismatch
            setShowPinModal({ 
                action: 'SETTLE_VARIANCE', 
                data: data
            });
        } else {
            // Direct Close if Exact Match
            if(window.confirm("Cash count matches exactly. Close Shift?")) {
                finalizeShift(data, "Exact Match - Auto Verified");
            }
        }
     };

     return (
         <div className="p-8 h-full flex flex-col max-w-2xl mx-auto">
             <div className="text-center mb-8">
                 <h2 className="text-3xl font-black text-white mb-2">Shift Settlement</h2>
                 <p className="text-slate-500">Close your register and verify cash</p>
             </div>

             <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 mb-6">
                 <div className="grid grid-cols-2 gap-8 mb-6">
                     <div>
                         <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total Sales</p>
                         <p className="text-3xl font-black text-white">₹{totalSales}</p>
                     </div>
                     <div>
                         <p className="text-slate-500 text-xs font-bold uppercase mb-1">Orders Count</p>
                         <p className="text-3xl font-black text-white">{sessionOrders.length}</p>
                     </div>
                 </div>
                 <div className="h-px bg-slate-800 my-4" />
                 <div className="space-y-3">
                     <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-400 font-bold"><Icons.Phone className="inline w-4 h-4 mr-2"/> Online / UPI</span>
                         <span className="text-emerald-400 font-mono font-bold">₹{upiSales}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-400 font-bold"><Icons.Cash className="inline w-4 h-4 mr-2"/> Expected Cash</span>
                         <span className="text-orange-400 font-mono font-bold">₹{cashSales}</span>
                     </div>
                 </div>
             </div>

             <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 mb-8">
                 <label className="block text-slate-400 text-xs font-bold uppercase mb-3">Enter Cash in Drawer</label>
                 <div className="flex gap-4">
                     <input 
                        type="number" 
                        value={countedCash}
                        onChange={(e) => setCountedCash(e.target.value)}
                        className="flex-1 bg-slate-900 border-2 border-slate-600 rounded-xl p-4 text-2xl text-white font-bold outline-none focus:border-orange-500 transition-colors"
                        placeholder="0"
                     />
                 </div>
                 {countedCash && (
                     <div className={`mt-4 p-3 rounded-xl border flex justify-between items-center ${!isVariance ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-400' : 'bg-red-900/30 border-red-500/30 text-red-400'}`}>
                         <span className="font-bold text-sm">{isVariance ? 'Variance Detected' : 'Perfect Match'}</span>
                         <span className="font-black font-mono text-lg">{variance > 0 ? '+' : ''}{variance}</span>
                     </div>
                 )}
             </div>

             <Button 
                onClick={handleCloseShift} 
                disabled={!countedCash}
                size="xl" 
                bu={BusinessUnit.BAR} 
                fullWidth
                className={isVariance ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'}
             >
                 {isVariance ? 'Verify & Close Shift' : 'Close Shift'}
             </Button>
         </div>
     );
  };

  const ReportsView = () => (
      <div className="p-8 h-full overflow-y-auto">
          <h2 className="text-2xl font-black text-white mb-8">Bar Performance</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 mb-4"><Icons.Wallet /></div>
                  <p className="text-slate-500 text-xs font-bold uppercase">Total Revenue</p>
                  <p className="text-3xl font-black text-white mt-1">₹42,500</p>
                  <p className="text-emerald-500 text-xs font-bold mt-2">+12% from yesterday</p>
              </div>
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 mb-4"><Icons.Bar /></div>
                  <p className="text-slate-500 text-xs font-bold uppercase">Drinks Poured</p>
                  <p className="text-3xl font-black text-white mt-1">186</p>
                  <p className="text-slate-600 text-xs font-bold mt-2">Avg 30ml per order</p>
              </div>
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 mb-4"><Icons.User /></div>
                  <p className="text-slate-500 text-xs font-bold uppercase">Top Bartender</p>
                  <p className="text-3xl font-black text-white mt-1">Rahul</p>
                  <p className="text-purple-400 text-xs font-bold mt-2">64 Orders Processed</p>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
                  <h3 className="font-bold text-white mb-6">Top Spirits</h3>
                  <div className="space-y-4">
                      {[{n:'Royal Stag', v:45}, {n:'Kingfisher', v:32}, {n:'Old Monk', v:28}].map((d, i) => (
                          <div key={i}>
                              <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                                  <span>{d.n}</span>
                                  <span>{d.v} sold</span>
                              </div>
                              <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                                  <div className="h-full bg-orange-600" style={{ width: `${(d.v/50)*100}%` }} />
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
                  <h3 className="font-bold text-white mb-6">Sales Type</h3>
                  <div className="flex gap-4 items-center justify-center h-40">
                      <div className="flex flex-col items-center">
                          <div className="w-20 h-20 rounded-full border-8 border-emerald-500 flex items-center justify-center text-xl font-bold text-white">65%</div>
                          <span className="text-xs font-bold text-slate-500 mt-2 uppercase">Cash</span>
                      </div>
                      <div className="flex flex-col items-center">
                          <div className="w-20 h-20 rounded-full border-8 border-blue-500 flex items-center justify-center text-xl font-bold text-white">35%</div>
                          <span className="text-xs font-bold text-slate-500 mt-2 uppercase">Online</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );

  const ManageView = () => {
     const [name, setName] = useState('');
     const [price, setPrice] = useState('');
     
     const handleSave = () => {
         // This is a mock function, realistically updates the menu state
         alert(`Added ${name} with base price ${price}`);
         setName('');
         setPrice('');
     };

     return (
         <div className="p-8 max-w-2xl mx-auto">
             <h2 className="text-2xl font-black text-white mb-8">Manage Menu</h2>
             <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800">
                 <h3 className="text-lg font-bold text-white mb-6">Add New Liquor</h3>
                 <div className="space-y-4">
                     <div>
                         <label className="text-xs font-bold text-slate-500 uppercase">Brand Name</label>
                         <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white mt-1 outline-none focus:border-orange-500" placeholder="e.g. Black Label" />
                     </div>
                     <div>
                         <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                         <select className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white mt-1 outline-none">
                             <option>Whisky</option>
                             <option>Rum</option>
                             <option>Vodka</option>
                             <option>Beer</option>
                             <option>Gin</option>
                         </select>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase">30ml Price</label>
                             <input value={price} onChange={e => setPrice(e.target.value)} type="number" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white mt-1 outline-none focus:border-orange-500" placeholder="0" />
                         </div>
                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase">Stock (Bottles)</label>
                             <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white mt-1 outline-none focus:border-orange-500" placeholder="0" />
                         </div>
                     </div>
                     <div className="pt-4">
                         <Button onClick={handleSave} fullWidth bu={BusinessUnit.BAR} size="lg">Add to Menu</Button>
                     </div>
                 </div>
             </div>
         </div>
     );
  };

  const HistoryView = () => (
      <div className="p-8 h-full overflow-y-auto">
          <h2 className="text-2xl font-black text-white mb-8">Order Log</h2>
          <div className="space-y-4">
              {orderHistory.length === 0 && <p className="text-slate-600 text-center py-10">No orders in this session.</p>}
              {orderHistory.map(order => (
                  <div key={order.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                          <div className="bg-slate-800 p-3 rounded-xl font-mono font-bold text-slate-400">
                              {new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                          <div>
                              <p className="text-white font-bold text-sm">Table {order.tableId}</p>
                              <p className="text-slate-500 text-xs">{order.items.length} Items • {order.items.map(i => i.name).join(', ')}</p>
                          </div>
                      </div>
                      <div className="text-right">
                          <p className="text-white font-bold">₹{order.totalAmount}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${order.paymentStatus === 'CASH' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                              {order.paymentStatus}
                          </span>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-950 text-slate-200 relative overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 h-full overflow-hidden bg-slate-900 relative rounded-l-3xl shadow-2xl border-l border-slate-800 md:ml-0">
         {view === 'POS' && <POSView />}
         {view === 'INVENTORY' && <InventoryView />}
         {view === 'SETTLEMENT' && <SettlementView />}
         {view === 'REPORTS' && <ReportsView />}
         {view === 'MANAGE' && <ManageView />}
         {view === 'TEAM' && <TeamView />}
         {view === 'HISTORY' && <HistoryView />}
      </div>
      <MobileNav />

      {/* Success Flash Message (Payment & Stock) */}
      {orderSuccess && <SuccessOverlay />}

      {/* Stock Updated Toast (Small backup if needed, but Overlay covers it now) */}
      {stockUpdatedToast && !orderSuccess && (
          <div className="fixed top-24 right-8 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl font-bold animate-in slide-in-from-right fade-in duration-300 z-[100] flex items-center gap-2">
              <Icons.CheckCircle className="w-5 h-5" />
              Stock Auto-Deducted
          </div>
      )}

      {/* Modals */}
      {showPinModal && <PINModal onCancel={() => setShowPinModal(null)} onSuccess={handlePinSuccess} varianceAmount={showPinModal.data?.variance || 0} />}
      {stockModalProduct && <StockModal product={stockModalProduct} onClose={() => setStockModalProduct(null)} onConfirm={handleConfirmStock} />}
    </div>
  );
};
