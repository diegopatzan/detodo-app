
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { fetchSingleFromApi } from '@/lib/api';


interface ApiProducto {
  Id_Empresa: number;
  Id_Sucursal: number;
  Id_Familia: number;
  Id_Producto: string;
  Id_ProductoPadre: string | null;
  Nombre: string | null;
  Descripcion: string | null;
  NombreChino: string | null;
  DescripcionChina: string | null;
  ImagenNombre: string | null;
  PrecioCosto: number | string | null;
  PrecioVentaBase: number | string | null;
  CantidaParaQuitarIncremento: number | null;
  PorcentajeIncremento: number | string | null;
  CantidaParaAplicarAPorcentajeDescuentoPorCompra: number | null;
  PorcentajeDescuentoPorCompra: number | string | null;
  CantidaParaAplicarAPorcentajeDescuentoPorCompraDos: number | null;
  PorcentajeDescuentoPorCompraDos: number | string | null;
  CantidaParaAplicarAPorcentajeDescuentoPorCompraTres: number | null;
  PorcentajeDescuentoPorCompraTres: number | string | null;
  idarticulo: number | null;
  repeticion: number | null;
  Id_Producto_Tipo: string | null;
  StockMinimo: number | null;
  InventarioActivo: boolean | null;
  Id_Rack: string | null;
  Id_Columna: string | null;
  Id_Fila: string | null;
  Estado: boolean;
  swcreatedby: number | null;
  swdatecreated: string | null;
  swupdatedby: number | null;
  swdateupdated: string | null;
  Entidades: {
    Empresa: string | number;
    Sucursal: string | number;
    Familia: string | number;
    UsuarioCreacion?: string | number | null;
    UsuarioActualizacion?: string | number | null;
  };
}

async function getProducto(id: string) {

  
  const encodedId = encodeURIComponent(decodeURIComponent(id)); 

  
  const producto = await fetchSingleFromApi(`inventario/${encodedId}`);

  if (!producto || producto.error) return null;

  const raw = producto as ApiProducto;

  // Helper to serialize Decimals and Dates
  return {
    ...raw,
    PrecioCosto: Number(raw.PrecioCosto) || 0,
    PrecioVentaBase: Number(raw.PrecioVentaBase) || 0,
    PorcentajeIncremento: Number(raw.PorcentajeIncremento) || 0,
    PorcentajeDescuentoPorCompra: Number(raw.PorcentajeDescuentoPorCompra) || 0,
    PorcentajeDescuentoPorCompraDos: Number(raw.PorcentajeDescuentoPorCompraDos) || 0,
    PorcentajeDescuentoPorCompraTres: Number(raw.PorcentajeDescuentoPorCompraTres) || 0,
    swdatecreated: raw.swdatecreated ? new Date(raw.swdatecreated).toLocaleString() : '-',
    swdateupdated: raw.swdateupdated ? new Date(raw.swdateupdated).toLocaleString() : '-',
  };
}

// Helper to style section headers consistently
function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-[#714B67] uppercase text-xs font-bold tracking-wider border-b border-gray-100 pb-2 mb-4 mt-6 first:mt-0">
      {title}
    </h3>
  );
}

function DetailRow({ label, value, className = "" }: { label: string, value: React.ReactNode, className?: string }) {
  return (
    <div className={`py-2 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-50 last:border-0 ${className}`}>
      <dt className="text-sm font-semibold text-gray-600">{label}</dt>
      <dd className="text-sm text-gray-900 sm:col-span-2 mt-1 sm:mt-0 break-words">{value ?? '-'}</dd>
    </div>
  );
}

export default async function ProductoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const producto = await getProducto(id);

  if (!producto) {
    notFound();
  }

  return (
    <div className="max-w-screen-xl mx-auto">
      {/* Header / Breadcrumb Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Link 
            href="/dashboard/inventario" 
            className="p-2 -ml-2 text-gray-500 hover:text-[#714B67] hover:bg-white rounded-md transition-colors"
            >
            <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex flex-col">
                <span className="text-sm text-gray-500">Inventario</span>
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-[#714B67]">
                        {producto.Nombre || 'Sin Nombre'}
                    </h1>
                     <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#714B67]/10 text-[#714B67] border border-[#714B67]/20">
                         #{producto.Id_Producto}
                    </span>
                </div>
            </div>
        </div>
        {/* Action Buttons Placeholder */}
        <div className="flex gap-3">
             {/* <button className="px-4 py-2 bg-[#714B67] text-white text-sm font-medium rounded hover:bg-[#5d3d54] transition-colors shadow-sm">
                Editar
             </button>
             <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 text-sm font-medium rounded hover:bg-gray-50 transition-colors shadow-sm">
                Imprimir
             </button> */}
        </div>
      </div>

      {/* Main Form Sheet */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-sm p-6 md:p-8">
        
        {/* Status Ribbon (Visual only) */}
        <div className="flex justify-end mb-4">
             <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${producto.Estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {producto.Estado ? 'Activo' : 'Inactivo'}
             </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            
            <div>
                <SectionHeader title="Información General" />
                <dl className="space-y-1">
                    <DetailRow label="Nombre" value={producto.Nombre} className="font-medium" />
                    <DetailRow label="Descripción" value={producto.Descripcion} />
                    <DetailRow label="Nombre Chino" value={producto.NombreChino} />
                    <DetailRow label="Desc. China" value={producto.DescripcionChina} />
                    <DetailRow label="Familia" value={producto.Entidades?.Familia || producto.Id_Familia} />
                    <DetailRow label="Tipo" value={producto.Id_Producto_Tipo} />
                </dl>
            </div>

            <div>
                 <SectionHeader title="Precios y Costos" />
                <dl className="space-y-1">
                    <DetailRow label="Precio Venta" value={<span className="text-[#714B67] font-bold text-lg">{formatCurrency(producto.PrecioVentaBase)}</span>} />
                    <DetailRow label="Costo" value={formatCurrency(producto.PrecioCosto)} />
                    <DetailRow label="Incremento" value={`${producto.PorcentajeIncremento}%`} />
                </dl>

                 <SectionHeader title="Ubicación" />
                 <div className="grid grid-cols-3 gap-2 py-2">
                    <div className="bg-gray-50 p-2 rounded border border-gray-100 text-center">
                        <span className="block text-[10px] uppercase text-gray-500 font-bold">Rack</span>
                        <span className="font-mono text-sm font-bold text-gray-700">{producto.Id_Rack || '-'}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border border-gray-100 text-center">
                        <span className="block text-[10px] uppercase text-gray-500 font-bold">Col</span>
                        <span className="font-mono text-sm font-bold text-gray-700">{producto.Id_Columna || '-'}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border border-gray-100 text-center">
                        <span className="block text-[10px] uppercase text-gray-500 font-bold">Fila</span>
                        <span className="font-mono text-sm font-bold text-gray-700">{producto.Id_Fila || '-'}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100">
             <SectionHeader title="Configuración Avanzada" />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <dl className="space-y-1">
                     <DetailRow label="Descuentos Volumen" value={
                        <div className="space-y-1 mt-1">
                             <div className="flex text-xs justify-between bg-gray-50 p-1 px-2 rounded"><span>Nivel 1 ({producto.CantidaParaAplicarAPorcentajeDescuentoPorCompra || 0})</span> <span className="font-bold">{producto.PorcentajeDescuentoPorCompra}%</span></div>
                             <div className="flex text-xs justify-between bg-gray-50 p-1 px-2 rounded"><span>Nivel 2 ({producto.CantidaParaAplicarAPorcentajeDescuentoPorCompraDos || 0})</span> <span className="font-bold">{producto.PorcentajeDescuentoPorCompraDos}%</span></div>
                             <div className="flex text-xs justify-between bg-gray-50 p-1 px-2 rounded"><span>Nivel 3 ({producto.CantidaParaAplicarAPorcentajeDescuentoPorCompraTres || 0})</span> <span className="font-bold">{producto.PorcentajeDescuentoPorCompraTres}%</span></div>
                        </div>
                     } />
                </dl>
                <dl className="space-y-1">
                    <DetailRow label="Datos de Sistema" value={
                        <div className="text-xs text-gray-500 space-y-1">
                            <p>Creado: {producto.swdatecreated}</p>
                            <p>Actualizado: {producto.swdateupdated}</p>
                            <p>Empresa: {producto.Entidades?.Empresa || producto.Id_Empresa}</p>
                            <p>Sucursal: {producto.Entidades?.Sucursal || producto.Id_Sucursal}</p>
                        </div>
                    } />
                </dl>
             </div>
        </div>

      </div>
    </div>
  );
}