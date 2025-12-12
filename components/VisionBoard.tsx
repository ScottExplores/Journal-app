import React, { useState, useEffect, useRef } from 'react';
import { VisionItem } from '../types';

const VisionBoard: React.FC = () => {
  const [items, setItems] = useState<VisionItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('vision_board');
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  const saveItems = (newItems: VisionItem[]) => {
    setItems(newItems);
    localStorage.setItem('vision_board', JSON.stringify(newItems));
  };

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 600; 
          const MAX_HEIGHT = 600;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (items.length >= 9) {
      return;
    }

    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        const file = e.target.files[0];
        const base64 = await resizeImage(file);
        
        // Random rotation between -3 and 3 degrees for a tighter grid
        const rotation = Math.floor(Math.random() * 6) - 3;

        const newItem: VisionItem = {
          id: Date.now().toString(),
          imageUrl: base64,
          caption: '',
          dateAdded: new Date().toISOString(),
          rotation: rotation,
        };

        saveItems([...items, newItem]);
      } catch (error) {
        console.error("Error processing image", error);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const updateCaption = (id: string, newCaption: string) => {
    const updated = items.map(item => 
      item.id === id ? { ...item, caption: newCaption } : item
    );
    saveItems(updated);
  };

  const deleteItem = (id: string) => {
    if (window.confirm("Remove this from your board?")) {
      const updated = items.filter(item => item.id !== id);
      saveItems(updated);
    }
  };

  // Create array of 9 slots
  const slots = [...items];
  while (slots.length < 9) {
    slots.push(null as any);
  }

  return (
    <div className="bg-[#e3cba5] rounded-xl p-4 sm:p-8 shadow-inner border-[8px] sm:border-[12px] border-[#8b5a2b] min-h-[500px] relative overflow-hidden flex flex-col">
      {/* Cork Texture Overlay effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#8b5a2b 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 relative z-10 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md max-w-2xl mx-auto w-full gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-serif text-[#8b5a2b] flex items-center gap-2">
             My Vision
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            {items.length} / 9 visions pinned
          </p>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileUpload}
        />
        
        {items.length < 9 && (
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full sm:w-auto px-4 py-2 rounded-full text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-sm bg-[#8b5a2b] hover:bg-[#6d4520] text-amber-50"
          >
            {isUploading ? 'Adding...' : 'Pin Photo'}
          </button>
        )}
      </div>

      {/* Grid: Always 3 columns */}
      <div className="grid grid-cols-3 gap-2 sm:gap-6 md:gap-8 relative z-10 flex-1 content-start">
        {slots.map((item, index) => (
          <div key={item ? item.id : `empty-${index}`} className="flex justify-center h-full">
            {item ? (
              <div 
                className="bg-white p-1.5 sm:p-3 pb-5 sm:pb-8 shadow-md sm:shadow-xl transition-transform duration-300 hover:scale-105 hover:z-20 relative w-full aspect-[4/5] flex flex-col"
                style={{ 
                  transform: `rotate(${item.rotation}deg)`,
                }}
              >
                {/* Pin - scaled down for mobile */}
                <div className="absolute -top-1.5 sm:-top-3 left-1/2 -translate-x-1/2 w-2 h-2 sm:w-4 sm:h-4 rounded-full bg-red-500 shadow-md border border-red-700 z-30"></div>
                <div className="absolute -top-1.5 sm:-top-3 left-1/2 -translate-x-1/2 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/30 rounded-full mt-0.5 sm:mt-1 ml-0.5"></div>

                <div className="aspect-square w-full overflow-hidden bg-slate-100 mb-1 sm:mb-3 border border-slate-100 shrink-0">
                  <img 
                    src={item.imageUrl} 
                    alt="Vision" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="relative group flex-1 flex items-end justify-center">
                   <input
                    type="text"
                    value={item.caption}
                    onChange={(e) => updateCaption(item.id, e.target.value)}
                    placeholder="..."
                    className="w-full bg-transparent border-none text-center font-handwriting text-slate-700 placeholder:text-slate-300 focus:ring-0 p-0 font-serif italic text-[10px] sm:text-lg leading-tight"
                    style={{ fontFamily: '"Merriweather", serif' }}
                  />
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="absolute -right-2 -bottom-2 sm:top-1/2 sm:-translate-y-1/2 text-slate-300 hover:text-red-400 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity p-2 sm:p-1 z-40 bg-white/80 rounded-full sm:bg-transparent"
                    title="Unpin"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4">
                      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              // Empty Slot
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[4/5] border-2 sm:border-4 border-dashed border-[#8b5a2b]/30 rounded-lg flex flex-col items-center justify-center gap-1 sm:gap-2 hover:bg-[#8b5a2b]/5 transition-colors group"
              >
                 <div className="w-6 h-6 sm:w-12 sm:h-12 rounded-full bg-[#8b5a2b]/10 flex items-center justify-center text-[#8b5a2b]/50 group-hover:bg-[#8b5a2b]/20 group-hover:text-[#8b5a2b] transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 sm:w-6 sm:h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                 </div>
                 <span className="text-[#8b5a2b]/50 font-serif italic text-[10px] sm:text-sm group-hover:text-[#8b5a2b]">Add</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisionBoard;