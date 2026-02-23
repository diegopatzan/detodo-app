import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

async function getSucursal(id: string) {
  try {
    const sucursalId = parseInt(id);

    // Fetch Sucursal and relations
    const [sucursal, empresas] = await Promise.all([
      prisma.sucursal.findUnique({
        where: { Id_Sucursal: sucursalId }
      }),
      prisma.empresa.findMany()
    ]);

    if (!sucursal) return null;

    // Create maps for quick lookup of foreign keys
    const empresaMap = new Map(empresas.map(e => [e.Id_Empresa, e.Descripcion]));

    // Format Data
    return {
      ...sucursal,
      Empresa: empresaMap.get(sucursal.Id_Empresa) || `ID: ${sucursal.Id_Empresa}`,
      Telefono: sucursal.Telefono ? sucursal.Telefono.toString() : '-',
      PorcentajeCobroPorTarjeta: sucursal.PorcentajeCobroPorTarjeta ? `${sucursal.PorcentajeCobroPorTarjeta.toNumber()}%` : '-',
      AplicaDescuento: sucursal.AplicaDescuentoPorMembresia ? 'Sí' : 'No',
      ManejaInventario: sucursal.ManejaInventario ? 'Sí' : 'No',
    };
  } catch (error) {
    console.error("Error fetching sucursal:", error);
    return null;
  }
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

export default async function SucursalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sucursal = await getSucursal(id);

  if (!sucursal) {
    notFound();
  }

  return (
    <div className="max-w-screen-xl mx-auto">
      {/* Header / Breadcrumb Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Link 
            href="/dashboard/sucursales" 
            className="p-2 -ml-2 text-gray-500 hover:text-[#714B67] hover:bg-white rounded-md transition-colors"
            >
            <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex flex-col">
                <span className="text-sm text-gray-500">Sucursales</span>
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-[#714B67]">
                        {sucursal.NombreSucursal || 'Sin Nombre'}
                    </h1>
                     <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#714B67]/10 text-[#714B67] border border-[#714B67]/20">
                         #{sucursal.Id_Sucursal}
                    </span>
                </div>
            </div>
        </div>
         <div className="flex gap-3">
             {/* <button className="px-4 py-2 bg-[#714B67] text-white text-sm font-medium rounded hover:bg-[#5d3d54] transition-colors shadow-sm">
                Editar
             </button> */}
        </div>
      </div>

      {/* Main Form Sheet */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-sm p-6 md:p-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            
            <div>
                <SectionHeader title="Información General" />
                <dl className="space-y-1">
                     <DetailRow label="Nombre" value={sucursal.NombreSucursal} className="font-medium" />
                    <DetailRow label="Nombre (Español)" value={sucursal.NombreEnEspa_ol} />
                    <DetailRow label="Dirección" value={sucursal.Direccion} />
                    <DetailRow label="Teléfono" value={sucursal.Telefono} />
                    <DetailRow label="NIT" value={sucursal.Nit} />
                    <DetailRow label="Email" value={sucursal.Email} />
                </dl>
            </div>

            <div>
                 <SectionHeader title="Configuración Operativa" />
                <dl className="space-y-1">
                     <DetailRow label="Empresa" value={sucursal.Empresa} />
                     <DetailRow label="Establecimiento No." value={sucursal.Numero_Establecimiento} />
                     <DetailRow 
                      label="Maneja Inventario" 
                      value={
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${sucursal.ManejaInventario === 'Sí' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {sucursal.ManejaInventario}
                        </span>
                      } 
                    />
                    <DetailRow 
                      label="Aplica Membresía" 
                      value={
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${sucursal.AplicaDescuento === 'Sí' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {sucursal.AplicaDescuento}
                        </span>
                      } 
                    />
                    <DetailRow label="% Cobro Tarjeta" value={sucursal.PorcentajeCobroPorTarjeta} />
                    <DetailRow label="ID Sist. Anterior" value={sucursal.Id_SucursalSistemaAnterior} />
                </dl>
            </div>
        </div>
      </div>
    </div>
  );
}
