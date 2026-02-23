'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Search, Eraser } from 'lucide-react';

export function MembresiaFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isOpen, setIsOpen] = useState(false);
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (search) params.set('search', search); else params.delete('search');
    if (startDate) params.set('startDate', startDate); else params.delete('startDate');
    if (endDate) params.set('endDate', endDate); else params.delete('endDate');
    if (status) params.set('status', status); else params.delete('status');
    
    params.set('page', '1');
    
    router.push(`/dashboard/membresias?${params.toString()}`);
  };

  const handleClear = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setStatus('');
    router.push('/dashboard/membresias');
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
          {(search || startDate || endDate || status) && (
             <span className="ml-1 flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#714B67] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#714B67]"></span>
            </span>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
          
          {/* Search Input */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Buscar (Nombre, Tarjeta, Teléfono)</label>
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

          {/* Start Date */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Fecha Creación (Desde)</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Fecha Creación (Hasta)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            />
          </div>

          {/* Status Select */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Estado Membresía</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#714B67] bg-white"
            >
              <option value="">Todos</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-2 pt-2 border-t border-gray-100 mt-2">
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
