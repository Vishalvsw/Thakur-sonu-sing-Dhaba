
// ... (Imports stay the same)
import React, { useState, useMemo, useEffect } from 'react';
import { Icons } from './IconSet';
import { Button } from './Components';
import { BusinessUnit, Product, StaffMember } from '../types';

interface RoomsDashboardProps {
  menu: Product[];
  onUpdateMenu: (newMenu: Product[]) => void;
}

// Extracted Staff View specific to Rooms
const RoomsStaffView = () => {
    const [staff, setStaff] = useState<StaffMember[]>([
        { id: 'R1', name: 'Suresh', role: 'Cleaner', bu: BusinessUnit.ROOMS, phone: '9876543213', salary: 12000, salaryPaid: 0, status: 'Active', attendance: 28, joinDate: '2023-05-20' },
        { id: 'R2', name: 'Ramesh', role: 'Receptionist', bu: BusinessUnit.ROOMS, phone: '9876543214', salary: 18000, salaryPaid: 18000, status: 'Active', attendance: 29, joinDate: '2023-01-10' },
    ]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newStaff, setNewStaff] = useState({ name: '', role: 'Cleaner', phone: '', salary: '' });
    const [showPayModal, setShowPayModal] = useState<StaffMember | null>(null);
    const [payAmount, setPayAmount] = useState('');

    const handleAddStaff = () => {
        if (!newStaff.name || !newStaff.salary) return;
        setStaff(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 5),
            name: newStaff.name,
            role: newStaff.role,
            bu: BusinessUnit.ROOMS,
            phone: newStaff.phone,
            salary: Number(newStaff.salary),
            salaryPaid: 0,
            status: 'Active',
            attendance: 0,
            joinDate: new Date().toISOString().split('T')[0]
        }]);
        setShowAddModal(false);
    };

    const handlePay = () => {
        if (!showPayModal || !payAmount) return;
        const amt = Number(payAmount);
        setStaff(prev => prev.map(s => s.id === showPayModal.id ? {...s, salaryPaid: s.salaryPaid + amt} : s));
        setShowPayModal(null);
        setPayAmount('');
    };

    const toggleStatus = (id: string) => {
        setStaff(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'Active' ? 'On Leave' : 'Active' } : s));
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Room Service Team</h2>
                <Button onClick={() => setShowAddModal(true)} bu={BusinessUnit.ROOMS} icon={<Icons.Plus className="w-4 h-4"/>}>Add Staff</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staff.map(s => (
                    <div key={s.id} className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-xl">{s.name[0]}</div>
                            <div>
                                <h3 className="font-bold text-slate-900">{s.name}</h3>
                                <p className="text-xs text-slate-500 uppercase">{s.role}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-400">Salary Paid</p>
                            <p className={`font-bold ${s.salaryPaid >= s.salary ? 'text-green-600' : 'text-orange-500'}`}>₹{s.salaryPaid} / ₹{s.salary}</p>
                            <div className="flex gap-2 mt-2 justify-end">
                                <button onClick={() => toggleStatus(s.id)} className={`text-[10px] font-bold px-2 py-1 rounded ${s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{s.status}</button>
                                <button onClick={() => setShowPayModal(s)} disabled={s.salaryPaid >= s.salary} className="text-[10px] font-bold px-2 py-1 rounded bg-slate-900 text-white disabled:opacity-50">Pay</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modals */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
                        <h3 className="text-xl font-bold mb-4">Add Cleaner/Staff</h3>
                        <div className="space-y-3 mb-6">
                            <input value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} className="w-full p-3 border rounded-xl" placeholder="Name" />
                            <select value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})} className="w-full p-3 border rounded-xl">
                                <option>Cleaner</option>
                                <option>Receptionist</option>
                                <option>Maintenance</option>
                            </select>
                            <input value={newStaff.phone} onChange={e => setNewStaff({...newStaff, phone: e.target.value})} className="w-full p-3 border rounded-xl" placeholder="Phone" />
                            <input type="number" value={newStaff.salary} onChange={e => setNewStaff({...newStaff, salary: e.target.value})} className="w-full p-3 border rounded-xl" placeholder="Salary" />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="secondary" fullWidth onClick={() => setShowAddModal(false)}>Cancel</Button>
                            <Button fullWidth onClick={handleAddStaff} bu={BusinessUnit.ROOMS}>Add</Button>
                        </div>
                    </div>
                </div>
            )}

            {showPayModal && (
                <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
                        <h3 className="text-xl font-bold mb-4">Pay Salary</h3>
                        <p className="text-sm text-gray-500 mb-4">Paying {showPayModal.name}. Due: ₹{showPayModal.salary - showPayModal.salaryPaid}</p>
                        <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} className="w-full p-4 border-2 border-purple-200 rounded-xl text-2xl font-bold mb-6 outline-none focus:border-purple-600" placeholder="0" autoFocus />
                        <div className="flex gap-2">
                            <Button variant="secondary" fullWidth onClick={() => setShowPayModal(null)}>Cancel</Button>
                            <Button fullWidth onClick={handlePay} bu={BusinessUnit.ROOMS}>Confirm</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const RoomsDashboard: React.FC<RoomsDashboardProps> = ({ menu, onUpdateMenu }) => {
  // --- State ---
  const [view, setView] = useState<'ROOMS' | 'STAFF'>('ROOMS');
  const [filter, setFilter] = useState<'ALL' | 'AVAILABLE' | 'ENGAGED'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [undoState, setUndoState] = useState<{ id: string, prevStatus: boolean, timeout: ReturnType<typeof setTimeout> } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // --- Derived Data ---
  const rooms = useMemo(() => 
    menu.filter(p => p.bu === BusinessUnit.ROOMS),
    [menu]
  );
  
  const filteredRooms = useMemo(() => {
    if (filter === 'ALL') return rooms;
    if (filter === 'AVAILABLE') return rooms.filter(r => r.isAvailable);
    return rooms.filter(r => !r.isAvailable);
  }, [rooms, filter]);

  const stats = useMemo(() => ({
    total: rooms.length,
    available: rooms.filter(r => r.isAvailable).length,
    engaged: rooms.filter(r => !r.isAvailable).length
  }), [rooms]);

  // --- Audio Engine ---
  const speak = (text: string) => {
    // Cancel current speech to prevent queue buildup
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; 
    u.rate = 0.9; // Slightly slower for clarity
    window.speechSynthesis.speak(u);
  };

  const formatDigits = (str: string) => str.split('').join(' ');

  // --- Actions ---

  const handleToggleStatus = (e: React.MouseEvent, room: Product) => {
    e.stopPropagation(); // Prevent opening detail view
    
    // 1. Clear existing undo if any
    if (undoState) {
        clearTimeout(undoState.timeout);
        setUndoState(null);
    }

    // 2. Optimistic Update
    const newStatus = !room.isAvailable;
    const updated = menu.map(p => 
      p.id === room.id ? { ...p, isAvailable: newStatus } : p
    );
    onUpdateMenu(updated);

    // 3. Audio Feedback
    const statusText = newStatus ? 'Available' : 'Engaged';
    speak(`Room ${formatDigits(room.name)} — ${statusText}`);

    // 4. Set Undo State
    const timeout = setTimeout(() => {
        setUndoState(null);
    }, 3000);
    setUndoState({ id: room.id, prevStatus: !newStatus, timeout });
  };

  const handleUndo = () => {
      if (undoState) {
          clearTimeout(undoState.timeout);
          const updated = menu.map(p => 
            p.id === undoState.id ? { ...p, isAvailable: undoState.prevStatus } : p
          );
          onUpdateMenu(updated);
          setUndoState(null);
          speak("Action Undone");
      }
  };

  const handleDeleteRoom = () => {
    if (deleteTarget) {
      onUpdateMenu(menu.filter(p => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      setSelectedRoom(null); // Close details if open
      speak('Room Deleted');
      showToast('Room deleted successfully');
    }
  };

  const handleAddRoom = (number: string, image: string | null) => {
     if (rooms.find(r => r.name === number)) {
        speak("Room number exists");
        alert("Room number already exists!");
        return;
     }

     const newRoom: Product = {
        id: Math.random().toString(36).substr(2, 9),
        name: number,
        localName: number,
        price: 2000, 
        image: image || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500',
        category: 'room',
        bu: BusinessUnit.ROOMS,
        isAvailable: true 
     };

     onUpdateMenu([...menu, newRoom]);
     speak(`Room ${formatDigits(number)} Created`);
     setShowAddModal(false);
     showToast(`Room ${number} added`);
  };

  const showToast = (msg: string) => {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(null), 3000);
  };

  // --- Sub-Components (Keep existing AddRoomModal, DeleteConfirmModal, RoomDetailModal) ---
  // ... (Inlining them for brevity as they are unchanged from the input, but ensuring they exist in the output)
  const AddRoomModal = () => {
     const [input, setInput] = useState('');
     const [photo, setPhoto] = useState<string | null>(null);

     const handleKey = (k: string) => {
        if (k === 'C') setInput('');
        else if (k === '<') setInput(prev => prev.slice(0, -1));
        else if (input.length < 4) setInput(prev => prev + k);
     };

     return (
        <div className="fixed inset-0 z-[100] bg-purple-900/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="bg-purple-700 p-6 text-white text-center relative">
                 <h3 className="text-2xl font-bold">New Room</h3>
                 <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-white/70 hover:text-white">
                    <Icons.Close />
                 </button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                 <div className="mb-6 flex gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden shrink-0">
                       {photo ? <img src={photo} className="w-full h-full object-cover" /> : <Icons.Camera className="w-8 h-8 text-gray-400" />}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-2xl border-2 border-purple-100 flex items-center justify-center">
                       <span className="text-5xl font-black text-slate-800 tracking-widest">{input || '---'}</span>
                    </div>
                 </div>

                 {/* Keypad */}
                 <div className="grid grid-cols-3 gap-3 mb-6">
                    {[1,2,3,4,5,6,7,8,9].map(n => (
                       <button 
                         key={n} 
                         onClick={() => handleKey(n.toString())}
                         className="h-16 rounded-xl bg-slate-50 border-b-4 border-slate-200 text-3xl font-bold text-slate-700 active:bg-purple-100 active:border-purple-300 active:translate-y-[2px] active:border-b-0 transition-all"
                       >
                         {n}
                       </button>
                    ))}
                    <button onClick={() => handleKey('C')} className="h-16 rounded-xl bg-red-50 border-b-4 border-red-100 text-xl font-bold text-red-500 active:border-b-0 active:translate-y-[2px]">CLR</button>
                    <button onClick={() => handleKey('0')} className="h-16 rounded-xl bg-slate-50 border-b-4 border-slate-200 text-3xl font-bold text-slate-700 active:border-b-0 active:translate-y-[2px]">0</button>
                    <button onClick={() => handleKey('<')} className="h-16 rounded-xl bg-slate-50 border-b-4 border-slate-200 flex items-center justify-center active:border-b-0 active:translate-y-[2px]">
                        <Icons.Minus className="w-8 h-8" />
                    </button>
                 </div>

                 <Button 
                    bu={BusinessUnit.ROOMS} 
                    disabled={!input} 
                    onClick={() => handleAddRoom(input, photo)} 
                    size="xl"
                    fullWidth
                    className="shadow-xl"
                >
                    Create Room
                </Button>
              </div>
           </div>
        </div>
     );
  };

  const DeleteConfirmModal = () => (
      <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icons.Trash className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Delete Room {deleteTarget?.name}?</h3>
              <p className="text-slate-500 mb-8">This action cannot be undone.</p>
              <div className="grid grid-cols-2 gap-4">
                  <Button variant="secondary" size="lg" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                  <Button variant="danger" size="lg" onClick={handleDeleteRoom}>Delete</Button>
              </div>
          </div>
      </div>
  );

  const RoomDetailModal = () => {
     if (!selectedRoom) return null;
     return (
        <div className="fixed inset-0 z-[90] bg-black/60 flex justify-end backdrop-blur-sm animate-in slide-in-from-right duration-300">
           <div className="w-full md:w-[480px] bg-white h-full shadow-2xl flex flex-col">
              <div className="h-64 relative">
                  <img src={selectedRoom.image} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <button onClick={() => setSelectedRoom(null)} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
                      <Icons.Close className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-6 left-6 text-white">
                      <h2 className="text-4xl font-black mb-1">Room {selectedRoom.name}</h2>
                      <div className="flex gap-2">
                          <span className={`px-3 py-1 rounded-lg text-sm font-bold uppercase ${selectedRoom.isAvailable ? 'bg-green-500' : 'bg-orange-500'}`}>
                              {selectedRoom.isAvailable ? 'Available' : 'Engaged'}
                          </span>
                      </div>
                  </div>
              </div>
              
              <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Room Stats</h4>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-700 font-medium">Price per night</span>
                        <span className="text-xl font-bold text-purple-700">₹{selectedRoom.price}</span>
                    </div>
                 </div>

                 <div className="space-y-3">
                     <Button 
                        fullWidth size="xl" 
                        onClick={(e) => { handleToggleStatus(e as any, selectedRoom); }}
                        className={selectedRoom.isAvailable ? 'bg-slate-800' : 'bg-green-600'}
                     >
                        {selectedRoom.isAvailable ? 'Mark Engaged' : 'Mark Available'}
                     </Button>
                     <Button 
                        fullWidth size="lg" 
                        variant="danger" 
                        onClick={() => setDeleteTarget(selectedRoom)}
                     >
                        Delete Room
                     </Button>
                 </div>
              </div>
           </div>
        </div>
     );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
       
       {/* Sticky Header */}
       <div className="bg-purple-800 text-white sticky top-0 z-30 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row items-center justify-between gap-4">
             {/* User Info */}
             <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/20">
                   <Icons.Room className="w-6 h-6" />
                </div>
                <div>
                   <h2 className="font-bold text-xl leading-none">Rooms Manager</h2>
                   <p className="text-purple-200 text-xs font-bold uppercase tracking-wider mt-1">Dashboard</p>
                </div>
             </div>

             {/* Navigation Tabs */}
             <div className="flex bg-purple-900/50 p-1 rounded-xl">
                 <button onClick={() => setView('ROOMS')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${view === 'ROOMS' ? 'bg-white text-purple-800' : 'text-purple-200'}`}>Rooms</button>
                 <button onClick={() => setView('STAFF')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${view === 'STAFF' ? 'bg-white text-purple-800' : 'text-purple-200'}`}>Staff</button>
             </div>

             {/* Stats Cards (Only show in Rooms View) */}
             {view === 'ROOMS' && (
             <div className="flex gap-2 md:gap-4 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0">
                <div className="bg-white/10 backdrop-blur rounded-xl p-3 min-w-[110px] flex flex-col items-center border border-white/10">
                   <span className="text-[10px] text-purple-200 font-bold uppercase tracking-widest">Total</span>
                   <span className="text-3xl font-black">{stats.total}</span>
                </div>
                <div className="bg-green-500/20 backdrop-blur rounded-xl p-3 min-w-[110px] flex flex-col items-center border border-green-400/30">
                   <span className="text-[10px] text-green-200 font-bold uppercase tracking-widest">Free</span>
                   <span className="text-3xl font-black text-green-300">{stats.available}</span>
                </div>
                <div className="bg-orange-500/20 backdrop-blur rounded-xl p-3 min-w-[110px] flex flex-col items-center border border-orange-400/30">
                   <span className="text-[10px] text-orange-200 font-bold uppercase tracking-widest">Busy</span>
                   <span className="text-3xl font-black text-orange-300">{stats.engaged}</span>
                </div>
             </div>
             )}
          </div>
          
          {/* Controls Bar (Only in Rooms view) */}
          {view === 'ROOMS' && (
          <div className="bg-white px-4 py-3 shadow-sm border-b border-gray-200 flex items-center justify-between gap-4 overflow-x-auto">
             <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
                {(['ALL', 'AVAILABLE', 'ENGAGED'] as const).map(f => (
                   <button
                     key={f}
                     onClick={() => setFilter(f)}
                     className={`px-4 md:px-6 py-3 rounded-lg font-bold text-xs md:text-sm transition-all ${filter === f ? 'bg-purple-700 text-white shadow-lg scale-105' : 'text-slate-500 hover:text-slate-900'}`}
                   >
                     {f}
                   </button>
                ))}
             </div>
             
             <Button 
               bu={BusinessUnit.ROOMS} 
               onClick={() => setShowAddModal(true)}
               className="shrink-0 shadow-lg shadow-purple-200 min-w-[140px]"
               size="lg"
               icon={<Icons.Plus className="w-6 h-6" />}
             >
               Add Room
             </Button>
          </div>
          )}
       </div>

       {/* Main Content */}
       {view === 'STAFF' ? (
           <RoomsStaffView />
       ) : (
           <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                 {filteredRooms.map(room => (
                    <div 
                      key={room.id} 
                      onClick={() => setSelectedRoom(room)}
                      className={`relative rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border-2 cursor-pointer group ${room.isAvailable ? 'bg-white border-transparent' : 'bg-orange-50 border-orange-200'}`}
                    >
                       {/* Card Header */}
                       <div className="h-48 md:h-56 relative bg-gray-200 overflow-hidden">
                          <img 
                            src={room.image} 
                            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${!room.isAvailable ? 'grayscale opacity-60' : ''}`} 
                            loading="lazy" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          
                          {/* Big Room Number Overlay */}
                          <div className="absolute top-4 left-4">
                              <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl flex flex-col items-center border border-white/50">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Room</span>
                                 <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{room.name}</h3>
                              </div>
                          </div>

                          <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full font-bold text-xs uppercase shadow-lg flex items-center gap-1.5 border border-white/20 backdrop-blur-md ${room.isAvailable ? 'bg-green-500/90 text-white' : 'bg-orange-500/90 text-white'}`}>
                             {room.isAvailable ? <Icons.CheckCircle className="w-4 h-4" /> : <Icons.Lock className="w-4 h-4" />}
                             {room.isAvailable ? 'Available' : 'Engaged'}
                          </div>
                       </div>

                       {/* Card Body */}
                       <div className="p-4 md:p-5">
                          {/* Toggle Button - Massive Touch Target */}
                          <button 
                            onClick={(e) => handleToggleStatus(e, room)}
                            className={`w-full h-20 rounded-2xl flex items-center justify-between px-6 transition-all active:scale-95 shadow-lg border-b-4 ${room.isAvailable ? 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200' : 'bg-green-600 border-green-800 text-white hover:bg-green-500'}`}
                          >
                             <div className="flex items-center gap-3">
                                {room.isAvailable ? <Icons.Lock className="w-8 h-8" /> : <Icons.Unlock className="w-8 h-8" />}
                                <div className="text-left">
                                    <span className="block text-xs font-bold uppercase opacity-70">{room.isAvailable ? 'Check-In' : 'Check-Out'}</span>
                                    <span className="block text-xl font-black">{room.isAvailable ? 'Engage' : 'Vacate'}</span>
                                </div>
                             </div>
                             <Icons.ArrowRight className="w-6 h-6 opacity-50" />
                          </button>

                          <div className="mt-4 flex justify-between items-center px-2">
                             <button 
                               onClick={(e) => { e.stopPropagation(); speak(`Room ${formatDigits(room.name)} is ${room.isAvailable ? 'Available' : 'Engaged'}`); }}
                               className="w-12 h-12 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-purple-600 hover:border-purple-200 shadow-sm active:bg-purple-50"
                             >
                                <Icons.Audio className="w-6 h-6" />
                             </button>
                             <span className="text-slate-400 font-bold text-lg">₹{room.price}</span>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
              
              {filteredRooms.length === 0 && (
                 <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                    <Icons.Grid className="w-24 h-24 mb-6 opacity-10" />
                    <h3 className="text-2xl font-black text-slate-300">No rooms found</h3>
                    <p className="text-slate-400">Try changing the filter</p>
                 </div>
              )}
           </div>
       )}

       {/* Floating Undo Toast */}
       {undoState && (
           <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom duration-300">
               <span className="font-bold">Status Updated</span>
               <button onClick={handleUndo} className="bg-white text-slate-900 px-4 py-2 rounded-xl font-bold text-sm hover:bg-orange-100">
                   Undo
               </button>
           </div>
       )}

       {/* General Toast */}
       {toastMsg && (
           <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl font-bold animate-in fade-in duration-300">
               {toastMsg}
           </div>
       )}

       {/* Modals */}
       {showAddModal && <AddRoomModal />}
       {deleteTarget && <DeleteConfirmModal />}
       {selectedRoom && <RoomDetailModal />}
    </div>
  );
};
