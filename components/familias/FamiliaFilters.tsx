'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Search, Eraser } from 'lucide-react';

export function FamiliaFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isOpen, setIsOpen] = useState(false);
  
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (search) params.set('search', search); else params.delete('search');
    
    params.set('page', '1');
    
    router.push(`/dashboard/familias?${params.toString()}`);
  };

  const handleClear = () => {
    setSearch('');
    router.push('/dashboard/familias');
  };

  return (
    <div className="mb-6">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            isOpen 
              ? 'bg-[#714B67]/10 border-[#714B67]/20 text-[#714B67]' 
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          {isOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          {search && (
             <span className="ml-1 flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#714B67] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#714B67]"></span>
            </span>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
          
          {/* Search Input */}
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-medium text-gray-500">Buscar (Descripción)</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t border-gray-100 mt-2">
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Eraser className="w-4 h-4" />
              Limpiar
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-2 px-6 py-2 bg-[#714B67] text-white text-sm font-medium rounded-md hover:bg-[#5e3c54] transition-colors shadow-sm"
            >
              <Search className="w-4 h-4" />
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
