
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { Icons } from './components/IconSet';
import { Button, ProductCard, TrainerOverlay } from './components/Components';
import { DhabaDashboard } from './components/DhabaDashboard';
import { BarDashboard } from './components/BarDashboard';
import { RoomsDashboard } from './components/RoomsDashboard';
import { SnookerDashboard } from './components/SnookerDashboard'; 
import { SuperAdminDashboard } from './components/SuperAdminDashboard'; // New Import
import { parseVoiceOrder } from './services/geminiService';
import { 
  UserRole, 
  BusinessUnit, 
  Order, 
  Product, 
  CartItem,
  Staff,
  OrderStatus,
  PaymentMethod
} from './types';
import { SAMPLE_MENU, UI_TEXT, COLORS } from './constants';

// --- Sub-Page Components (Defined inline for single-file XML structure simplicity, but cleanly separated) ---

// 1. Homepage
const Homepage = ({ setView, setBU }: { setView: (v: string) => void, setBU: (b: BusinessUnit) => void }) => {
  const [hoveredSlide, setHoveredSlide] = useState<number | null>(null);

  const slides = [
    { 
      id: 1, 
      label: 'DHABA', 
      title: 'Authentic Flavors', 
      subtitle: 'Clay oven cooking & rustic vibes.', 
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2000&auto=format&fit=crop', 
      bu: BusinessUnit.DHABA,
      icon: Icons.Food,
      accent: 'border-orange-500',
      bg: 'bg-orange-950'
    },
    { 
      id: 2, 
      label: 'LODGE', 
      title: 'Luxury Rooms', 
      subtitle: 'Elegant suites for your comfort.', 
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2000&auto=format&fit=crop', 
      bu: BusinessUnit.ROOMS,
      icon: Icons.Room,
      accent: 'border-purple-500',
      bg: 'bg-purple-950'
    },
    { 
      id: 3, 
      label: 'SNOOKER', 
      title: 'Pro Arena', 
      subtitle: 'Professional tables & tournaments.', 
      image: 'https://images.unsplash.com/photo-1585869272332-901a1d13f563?q=80&w=2000&auto=format&fit=crop', 
      bu: BusinessUnit.SNOOKER,
      icon: Icons.Snooker,
      accent: 'border-emerald-500',
      bg: 'bg-emerald-950'
    },
    { 
      id: 4, 
      label: 'THE BAR', 
      title: 'Lounge & Drinks', 
      subtitle: 'Premium spirits. 18+ Only.', 
      image: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=2000&auto=format&fit=crop', 
      bu: BusinessUnit.BAR,
      isAdult: true,
      icon: Icons.Bar,
      accent: 'border-blue-500',
      bg: 'bg-slate-950'
    },
  ];

  return (
    <div className="h-[calc(100vh-6rem)] w-full flex flex-col md:flex-row bg-black font-serif">
      {slides.map((slide) => (
        <div 
          key={slide.id} 
          className={`relative flex-1 group cursor-pointer overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${hoveredSlide === slide.id ? 'flex-[2]' : 'flex-1'} border-b md:border-b-0 md:border-r border-white/10`}
          onMouseEnter={() => setHoveredSlide(slide.id)}
          onMouseLeave={() => setHoveredSlide(null)}
          onClick={() => { setBU(slide.bu); setView('menu'); }}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src={slide.image} 
              alt={slide.title} 
              className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 opacity-50 group-hover:opacity-40" 
            />
            <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-black/90 mix-blend-multiply`} />
            <div className={`absolute inset-0 ${slide.bg} opacity-30 mix-blend-overlay`} />
          </div>

          {/* Border Animation */}
          <div className={`absolute inset-4 border border-white/20 z-10 transition-all duration-500 ${hoveredSlide === slide.id ? 'border-white/60 scale-95' : 'scale-100'}`}>
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent transform -translate-x-full transition-transform duration-1000 ${hoveredSlide === slide.id ? 'translate-x-full' : ''}`} />
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-20">
             
             {/* Icon */}
             <div className={`mb-6 p-4 rounded-full border-2 border-white/20 backdrop-blur-md transition-all duration-500 ${hoveredSlide === slide.id ? 'bg-white/20 scale-110 ' + slide.accent.replace('border', 'border') : 'bg-transparent'}`}>
                <slide.icon className="w-8 h-8 md:w-12 md:h-12 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
             </div>

             {/* Label (The "Sign") */}
             <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase mb-2 drop-shadow-2xl">
               {slide.label}
             </h2>

             {/* Dynamic Subtitle */}
             <div className={`overflow-hidden transition-all duration-500 ${hoveredSlide === slide.id ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 md:max-h-20 md:opacity-70'}`}>
                <p className="text-lg md:text-xl text-white/90 font-sans font-light tracking-wide mt-2">
                  {slide.title}
                </p>
                <div className={`h-1 w-12 mx-auto mt-4 rounded-full ${slide.accent.replace('border', 'bg')}`} />
                {hoveredSlide === slide.id && (
                  <p className="text-sm text-white/70 mt-4 max-w-xs mx-auto animate-in fade-in slide-in-from-bottom-2">
                     {slide.subtitle}
                  </p>
                )}
             </div>

             {slide.isAdult && (
               <div className="absolute top-8 right-8 border border-red-500 bg-red-500/20 text-red-500 px-2 py-1 text-xs font-bold rounded uppercase tracking-widest backdrop-blur-sm">
                  18+
               </div>
             )}
          </div>
        </div>
      ))}
    </div>
  );
};

// 2. Generic POS Screen (For non-Dhaba units like Snooker for now)
const GenericPOSScreen = ({ bu, role }: { bu: BusinessUnit, role: UserRole }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const products = SAMPLE_MENU.filter(p => p.bu === bu);

  const addToCart = (product: Product) => {
    setCart(prev => [...prev, { ...product, quantity: 1 }]);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{bu} Menu</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
         {products.map(p => (
            <ProductCard 
              key={p.id} 
              product={p} 
              quantity={0} 
              onAdd={() => addToCart(p)} 
              onRemove={() => {}} 
            />
         ))}
      </div>
    </div>
  );
};

// 3. Kitchen Display System (KDS)
const KDS = ({ orders, onUpdateStatus }: { orders: Order[], onUpdateStatus: (id: string, status: OrderStatus) => void }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const kitchenOrders = orders.filter(o => 
      o.status === OrderStatus.PREPARING || 
      o.status === OrderStatus.INCOMING
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
      {kitchenOrders.map(order => {
        const elapsed = Math.floor((now - order.timestamp) / 1000 / 60);
        const isLate = elapsed > 15;

        return (
          <div key={order.id} className={`bg-white rounded-2xl shadow-lg border-l-8 overflow-hidden flex flex-col h-full ${isLate ? 'border-red-500' : 'border-blue-500'}`}>
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <div>
                <span className="text-3xl font-bold text-gray-800">#{order.tableId}</span>
                <span className="block text-sm text-gray-500 mt-1">ID: {order.id}</span>
              </div>
              <div className="text-right">
                {order.status === OrderStatus.INCOMING && <span className="inline-block bg-red-100 text-red-600 text-sm font-bold px-2 py-1 rounded mb-1">NEW</span>}
                <div className={`flex items-center font-mono font-bold text-2xl ${isLate ? 'text-red-600 animate-pulse' : 'text-gray-600'}`}>
                   {elapsed}m
                </div>
              </div>
            </div>
            <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[400px]">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-2 bg-gray-50 rounded-lg">
                   <div className="bg-white border border-gray-200 w-12 h-12 flex items-center justify-center text-xl font-black rounded-lg">
                      {item.quantity}
                   </div>
                   <div className="flex-1">
                      <span className="text-xl font-bold text-gray-900 leading-tight block">{item.localName}</span>
                      <span className="text-sm text-gray-500">{item.name}</span>
                   </div>
                </div>
              ))}
            </div>
            <div className="p-4 pt-0 mt-auto">
               {order.status === OrderStatus.INCOMING ? (
                 <Button onClick={() => onUpdateStatus(order.id, OrderStatus.PREPARING)} fullWidth size="xl" className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg">
                    Start Preparing
                 </Button>
               ) : (
                 <Button onClick={() => onUpdateStatus(order.id, OrderStatus.READY)} fullWidth size="xl" className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg">
                    {UI_TEXT.en.ready}
                 </Button>
               )}
            </div>
          </div>
        );
      })}
      {kitchenOrders.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
           <Icons.Check className="w-24 h-24 mb-4 opacity-20" />
           <h3 className="text-2xl font-bold">All orders complete</h3>
           <p>No active tickets</p>
        </div>
      )}
    </div>
  );
};

// 4. Staff Onboarding (Manager) - Renamed to just OnboardingView
const OnboardingView = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera error", err);
      alert("Camera access denied or unavailable.");
    }
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      setPhoto(canvas.toDataURL('image/jpeg'));
      // Stop stream
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(t => t.stop());
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">{UI_TEXT.en.onboarding}</h2>
      
      <div className="space-y-6">
        {/* Photo Section */}
        <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative border-2 border-dashed border-gray-300 flex items-center justify-center">
          {!photo ? (
            <>
              <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
              <div className="z-10 text-center pointer-events-none">
                 {!videoRef.current?.srcObject && <Icons.Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />}
              </div>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center z-20 gap-2 px-4">
                 <Button type="button" onClick={startCamera} size="sm" variant="secondary" className="pointer-events-auto">Start Camera</Button>
                 <Button type="button" onClick={takePhoto} size="sm" bu={BusinessUnit.ADMIN} className="pointer-events-auto">Capture</Button>
              </div>
            </>
          ) : (
            <>
              <img src={photo} alt="Staff" className="w-full h-full object-cover" />
              <button 
                onClick={() => setPhoto(null)} 
                className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md"
              >
                <Icons.Close className="w-5 h-5 text-red-600" />
              </button>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name / नाम</label>
            <input type="text" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-lg" placeholder="e.g. Rahul Kumar" />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Mobile / मोबाइल</label>
             <input type="tel" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-lg" placeholder="+91 98765 43210" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select className="w-full p-3 border border-gray-300 rounded-xl bg-white">
                  <option>Waiter</option>
                  <option>Chef</option>
                  <option>Bartender</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select className="w-full p-3 border border-gray-300 rounded-xl bg-white">
                  <option>Dhaba</option>
                  <option>Bar</option>
                  <option>Snooker</option>
                </select>
             </div>
          </div>
        </div>

        <Button fullWidth size="lg" bu={BusinessUnit.ADMIN}>
          Send OTP & Register
        </Button>
      </div>
    </div>
  );
};


// Main App Component
const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.GUEST);
  const [activeBU, setActiveBU] = useState<BusinessUnit>(BusinessUnit.DHABA);
  
  // Login State
  const [showLogin, setShowLogin] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [selectedLoginBU, setSelectedLoginBU] = useState<BusinessUnit>(BusinessUnit.DHABA);
  
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // Global State (Lifted)
  const [menu, setMenu] = useState<Product[]>(SAMPLE_MENU);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '101', tableId: 'T-4', source: 'TABLE', status: OrderStatus.PREPARING, timestamp: Date.now() - 120000, bu: BusinessUnit.DHABA, paymentStatus: PaymentMethod.PENDING, totalAmount: 900,
      items: [{ ...SAMPLE_MENU[0], quantity: 2 }, { ...SAMPLE_MENU[2], quantity: 4 }]
    },
    {
      id: '102', tableId: 'T-1', source: 'TABLE', status: OrderStatus.INCOMING, timestamp: Date.now() - 30000, bu: BusinessUnit.DHABA, paymentStatus: PaymentMethod.PENDING, totalAmount: 250,
      items: [{ ...SAMPLE_MENU[1], quantity: 1 }]
    },
    {
      id: '103', tableId: 'T-5', source: 'TABLE', status: OrderStatus.READY, timestamp: Date.now() - 300000, bu: BusinessUnit.DHABA, paymentStatus: PaymentMethod.PENDING, totalAmount: 450,
      items: [{ ...SAMPLE_MENU[4], quantity: 2 }] // Mock Ready Order
    }
  ]);

  const addOrder = (items: CartItem[], tableId: string, payment: PaymentMethod) => {
     const newOrder: Order = {
        id: Math.floor(Math.random() * 1000).toString(),
        tableId,
        source: 'TABLE',
        status: OrderStatus.INCOMING,
        timestamp: Date.now(),
        bu: activeBU,
        paymentStatus: payment,
        items,
        totalAmount: items.reduce((acc, i) => acc + (i.price * i.quantity), 0)
     };
     setOrders(prev => [...prev, newOrder]);
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
     setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic Auth Simulation
    if (!loginId || !loginPassword) {
      alert("Please enter ID and Password");
      return;
    }

    // Role-based routing based on ID
    if (loginId.toLowerCase() === 'admin') {
       setUserRole(UserRole.MANAGER);
       setActiveBU(BusinessUnit.ADMIN);
       setCurrentView('onboarding');
    } else if (loginId.toLowerCase() === 'chef') {
       setUserRole(UserRole.CHEF);
       setActiveBU(BusinessUnit.DHABA);
       setCurrentView('kds');
    } else {
       // Default Staff Flow (Waiter/Bartender)
       // Go to the dashboard of the selected BU
       setUserRole(UserRole.WAITER); // Generic Staff role
       setActiveBU(selectedLoginBU);
       setCurrentView('menu');
    }
    
    // Reset and Close
    setShowLogin(false);
    setLoginId('');
    setLoginPassword('');
  };

  const handleLogout = () => {
    setUserRole(UserRole.GUEST);
    setActiveBU(BusinessUnit.DHABA);
    setCurrentView('home');
  };

  const renderContent = () => {
    // Priority Route: Super Admin Dashboard (Replaces standard layout)
    if (userRole === UserRole.SUPER_ADMIN) {
       return <SuperAdminDashboard onExit={handleLogout} />;
    }

    switch (currentView) {
      case 'home':
        return <Homepage setView={setCurrentView} setBU={setActiveBU} />;
      case 'menu':
        if (activeBU === BusinessUnit.DHABA) {
           return (
             <DhabaDashboard 
               userRole={userRole} 
               activeOrders={orders} 
               onPlaceOrder={addOrder}
               onUpdateOrderStatus={updateOrderStatus}
               menu={menu}
               onUpdateMenu={setMenu}
             />
           );
        } else if (activeBU === BusinessUnit.BAR) {
           return (
             <BarDashboard 
               menu={menu}
               orders={orders}
               onPlaceOrder={addOrder}
               onUpdateMenu={setMenu}
             />
           );
        } else if (activeBU === BusinessUnit.ROOMS) {
           return (
             <RoomsDashboard 
                menu={menu}
                onUpdateMenu={setMenu}
             />
           );
        } else if (activeBU === BusinessUnit.SNOOKER) {
           return <SnookerDashboard onGoHome={() => setCurrentView('home')} />;
        }
        return <GenericPOSScreen bu={activeBU} role={userRole} />;
      case 'kds':
        return <KDS orders={orders} onUpdateStatus={updateOrderStatus} />;
      case 'onboarding':
        return <OnboardingView />;
      default:
        return <Homepage setView={setCurrentView} setBU={setActiveBU} />;
    }
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-orange-600 z-[100] flex items-center justify-center">
        <div className="text-center animate-pulse px-4">
           <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
             <span className="font-serif font-bold text-4xl text-white">T</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-bold text-white tracking-widest uppercase font-serif">
             Thakur’s<br/>Grandpoint
           </h1>
        </div>
      </div>
    );
  }

  // If Super Admin, don't use the standard Layout (header/footer), use the dashboard full screen
  if (userRole === UserRole.SUPER_ADMIN) {
      return renderContent();
  }

  return (
    <Layout 
      activeBU={activeBU} 
      userRole={userRole}
      onLoginClick={() => setShowLogin(true)}
      onHomeClick={() => setCurrentView('home')}
      onLogoutClick={handleLogout}
    >
      {renderContent()}

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="bg-slate-900 p-8 text-center relative">
               <button 
                onClick={() => setShowLogin(false)}
                className="absolute top-4 right-4 p-2 text-white/50 hover:text-white"
               >
                 <Icons.Close className="w-6 h-6" />
               </button>
               <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                  <Icons.User className="w-8 h-8 text-white" />
               </div>
               <h2 className="text-3xl font-bold text-white">Staff Portal</h2>
               <p className="text-slate-400 text-sm mt-1">Enter your credentials to access the POS</p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleLogin} className="p-8 space-y-6">
              
              {/* Credentials */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Staff ID</label>
                  <input 
                    type="text" 
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-xl text-slate-800 transition-all placeholder:text-gray-300"
                    placeholder="ID"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">PIN / Password</label>
                  <input 
                    type="password" 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-xl text-slate-800 transition-all placeholder:text-gray-300"
                    placeholder="••••"
                  />
                </div>
              </div>

              {/* BU Toggle */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Login To</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Dhaba', val: BusinessUnit.DHABA },
                    { label: 'Bar', val: BusinessUnit.BAR },
                    { label: 'Rooms', val: BusinessUnit.ROOMS },
                    { label: 'Snooker', val: BusinessUnit.SNOOKER }
                  ].map((unit) => (
                    <button
                      key={unit.val}
                      type="button"
                      onClick={() => setSelectedLoginBU(unit.val)}
                      className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                        selectedLoginBU === unit.val 
                          ? 'border-orange-500 bg-orange-50 text-orange-700' 
                          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {unit.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <Button 
                type="submit"
                fullWidth 
                size="xl" 
                bu={selectedLoginBU} 
                className="mt-2 shadow-xl"
              >
                Access Dashboard
              </Button>

              {/* NEW SUPER ADMIN BUTTON */}
              <div className="mt-4 pt-2 border-t border-gray-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                        // Switch directly to Super Admin Role
                        setUserRole(UserRole.SUPER_ADMIN);
                        setActiveBU(BusinessUnit.ADMIN);
                        setShowLogin(false);
                    }}
                    className="text-xs font-bold text-slate-400 hover:text-orange-600 transition-colors uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
                  >
                    <Icons.Lock className="w-3 h-3" />
                    Super Admin Access
                  </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
