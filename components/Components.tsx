
import React, { useState } from 'react';
import { Icons } from './IconSet';
import { Product, BusinessUnit } from '../types';
import { COLORS, TEXT_COLORS } from '../constants';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  bu?: BusinessUnit;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  bu = BusinessUnit.DHABA, 
  className = '', 
  icon,
  fullWidth = false,
  ...props 
}) => {
  const baseClass = "inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm";
  
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-5 py-3 text-base",
    lg: "px-6 py-4 text-lg",
    xl: "px-8 py-5 text-xl min-h-[72px]" // Accessibility target
  };

  const widthClass = fullWidth ? "w-full" : "";

  const bg = COLORS[bu] || 'bg-slate-800';
  
  const variants = {
    primary: `${bg} text-white hover:brightness-110`,
    secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
    outline: `bg-transparent border-2 ${TEXT_COLORS[bu]} border-current hover:bg-opacity-10`,
    danger: "bg-red-600 text-white hover:bg-red-700"
  };

  return (
    <button className={`${baseClass} ${sizeClasses[size]} ${variants[variant]} ${widthClass} ${className}`} {...props}>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export const DietaryBadge: React.FC<{ isVeg?: boolean }> = ({ isVeg }) => {
  if (isVeg === undefined) return null;
  return (
    <div className={`w-3 h-3 md:w-4 md:h-4 border flex items-center justify-center rounded-sm ${isVeg ? 'border-green-600' : 'border-red-600'}`}>
      <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
    </div>
  );
};

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, quantity, onAdd, onRemove }) => {
  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Use window.speechSynthesis for immediate feedback, prioritizing Hindi
    const msg = new SpeechSynthesisUtterance(product.localName);
    msg.lang = 'hi-IN';
    window.speechSynthesis.speak(msg);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col h-full border border-gray-100 ${!product.isAvailable ? 'opacity-60 grayscale' : ''}`}>
      {/* Image Section - Compact Aspect Ratio */}
      <div className="relative aspect-[3/2] w-full bg-gray-100 group">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
             <span className="bg-red-600 text-white px-2 py-1 font-bold rounded uppercase text-[10px]">Out of Stock</span>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
           <div className="bg-white/95 p-0.5 rounded shadow-sm">
              <DietaryBadge isVeg={product.isVeg} />
           </div>
           {product.isRecommended && (
             <div className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center shadow-sm">
                ⭐
             </div>
           )}
        </div>

        <button 
          onClick={playAudio}
          className="absolute bottom-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm text-slate-800 hover:bg-white transition-colors opacity-90"
          aria-label="Play name"
        >
          <Icons.Audio className="w-3 h-3" />
        </button>
      </div>
      
      {/* Content Section - Compact Padding */}
      <div className="p-3 flex-1 flex flex-col">
        <div className="mb-2">
          <h3 className="text-sm font-bold text-slate-900 leading-tight line-clamp-1">{product.name}</h3>
          <p className="text-xs text-slate-500 font-medium line-clamp-1">{product.localName}</p>
        </div>
        
        <div className="mt-auto flex items-center justify-between">
          <span className="text-sm font-bold text-slate-800">₹{product.price}</span>
          
          {quantity === 0 ? (
             <button 
               onClick={onAdd}
               disabled={!product.isAvailable}
               className="bg-white border border-gray-200 text-orange-600 px-3 py-1 rounded-lg text-xs font-bold uppercase hover:bg-orange-50 hover:border-orange-200 transition-colors shadow-sm active:scale-95"
             >
               Add
             </button>
          ) : (
            <div className="flex items-center bg-orange-50 rounded-lg p-0.5 border border-orange-100">
               <button 
                 onClick={onRemove}
                 className="w-6 h-6 flex items-center justify-center bg-white rounded-md text-orange-600 shadow-sm active:bg-orange-100"
               >
                 <Icons.Minus className="w-3 h-3" />
               </button>
               <span className="w-6 text-center font-bold text-orange-700 text-xs">{quantity}</span>
               <button 
                 onClick={onAdd}
                 className="w-6 h-6 flex items-center justify-center bg-white rounded-md text-orange-600 shadow-sm active:bg-orange-100"
               >
                 <Icons.Plus className="w-3 h-3" />
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const TrainerOverlay: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Tap to Listen / सुनें",
      desc: "Tap the speaker icon to hear the item name.",
      icon: <Icons.Audio className="w-16 h-16 text-blue-500 mb-4" />
    },
    {
      title: "Big Buttons / बड़े बटन",
      desc: "Use large + and - buttons to change quantity.",
      icon: <Icons.Plus className="w-16 h-16 text-green-500 mb-4" />
    },
    {
      title: "Speak Order / बोलें",
      desc: "Tap the microphone to speak the order directly.",
      icon: <Icons.Mic className="w-16 h-16 text-orange-500 mb-4" />
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else onDismiss();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-8 flex flex-col items-center text-center">
        {steps[step].icon}
        <h2 className="text-2xl font-bold mb-2">{steps[step].title}</h2>
        <p className="text-gray-600 mb-8 text-lg">{steps[step].desc}</p>
        
        <div className="flex gap-2 w-full">
          <Button onClick={handleNext} className="w-full" size="lg">
            {step === steps.length - 1 ? "Start Working" : "Next"}
          </Button>
        </div>
        <div className="flex gap-2 mt-4">
            {steps.map((_, i) => (
                <div key={i} className={`h-2 w-2 rounded-full ${i === step ? 'bg-slate-900' : 'bg-gray-300'}`} />
            ))}
        </div>
      </div>
    </div>
  );
};
