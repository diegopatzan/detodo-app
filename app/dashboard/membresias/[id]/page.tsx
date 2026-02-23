import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
// import { formatCurrency } from '@/lib/utils';

// Helper to manually fetch relations and format data
async function getMembresia(id: string) {
  try {
    const membresiaId = parseInt(id);

    // Fetch Membresia and concurrent related data
    const [membresia, types, sucursales, empresas, usuarios] = await Promise.all([
      prisma.membresia.findUnique({
        where: { Id_Membresia: membresiaId }
      }),
      prisma.membresiaTipo.findMany(),
      prisma.sucursal.findMany(),
      prisma.empresa.findMany(),
      prisma.usuario.findMany() // To map SwCreatedBy
    ]);

    if (!membresia) return null;

    // Create maps for quick lookup of foreign keys
    const typeMap = new Map(types.map(t => [t.Id_MembresiaTipo, t.Descripcion]));
    const sucursalMap = new Map(sucursales.map(s => [s.Id_Sucursal, s.NombreSucursal]));
    const empresaMap = new Map(empresas.map(e => [e.Id_Empresa, e.Descripcion]));
    const usuarioMap = new Map(usuarios.map(u => [u.Id_Usuario, u.Usuario]));

    // Format Data
    const vendedorId = membresia.Vendedor_id ? membresia.Vendedor_id : membresia.Id_Vendedor;
    return {
      ...membresia,
      Empresa: empresaMap.get(membresia.Id_Empresa) || `ID: ${membresia.Id_Empresa}`,
      Sucursal: sucursalMap.get(membresia.Id_Sucursal) || `ID: ${membresia.Id_Sucursal}`,
      TipoMembresia: typeMap.get(membresia.Id_MembresiaTipo) || `ID: ${membresia.Id_MembresiaTipo}`,
      Id_FacturaTemporal: membresia.Id_FacturaTemporal ? membresia.Id_FacturaTemporal.toString() : '-',
      CreadoPor: membresia.swcreatedby ? usuarioMap.get(membresia.swcreatedby) || `ID: ${membresia.swcreatedby}` : '-',
      FechaCreacion: membresia.swdatecreated ? new Date(membresia.swdatecreated).toLocaleString() : '-',
      FechaVencimiento: new Date(membresia.FechaVencimiento).toLocaleDateString(),
      EstadoDescripcion: membresia.Id_Estado ? 'Activo' : 'Inactivo',
      Vendedor: vendedorId ? (usuarioMap.get(vendedorId) || `ID: ${vendedorId}`) : '-'
    };
  } catch (error) {
    console.error("Error fetching membresia:", error);
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

export default async function MembresiaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const membresia = await getMembresia(id);

  if (!membresia) {
    notFound();
  }

  return (
    <div className="max-w-screen-xl mx-auto">
      {/* Header / Breadcrumb Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Link 
            href="/dashboard/membresias" 
            className="p-2 -ml-2 text-gray-500 hover:text-[#714B67] hover:bg-white rounded-md transition-colors"
            >
            <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex flex-col">
                <span className="text-sm text-gray-500">Membresías</span>
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-[#714B67]">
                        {membresia.Nombre || 'Sin Nombre'}
                    </h1>
                     <span className={`px-2 py-0.5 rounded text-xs font-medium border ${membresia.EstadoDescripcion === 'Activo' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                         {membresia.EstadoDescripcion}
                    </span>
                </div>
            </div>
        </div>
         <div className="flex gap-3">
             {/* <button className="px-4 py-2 bg-[#714B67] text-white text-sm font-medium rounded hover:bg-[#5d3d54] transition-colors shadow-sm">
                Editar
             </button>
             <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 text-sm font-medium rounded hover:bg-gray-50 transition-colors shadow-sm">
                Renovar
             </button> */}
        </div>
      </div>

      {/* Main Form Sheet */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-sm p-6 md:p-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            
            <div>
                <SectionHeader title="Datos del Cliente" />
                <dl className="space-y-1">
                     <DetailRow label="Nombre" value={membresia.Nombre} className="font-medium" />
                    <DetailRow label="Teléfono" value={membresia.Telefono} />
                    <DetailRow label="Teléfono 2" value={membresia.Telefono_Secundario} />
                    <DetailRow label="No. Tarjeta" value={<span className="font-mono bg-gray-50 px-2 py-0.5 rounded">{membresia.NoTarjetaMembresia}</span>} />
                </dl>
            </div>

            <div>
                 <SectionHeader title="Detalles de Membresía" />
                <dl className="space-y-1">
                    <DetailRow label="Tipo" value={membresia.TipoMembresia} />
                    <DetailRow label="Vence el" value={<span className="font-bold text-gray-900">{membresia.FechaVencimiento}</span>} />
                    <DetailRow label="Factura" value={membresia.Id_FacturaTemporal !== '-' ? (
                      <Link href={`/dashboard/facturas/${membresia.Id_FacturaTemporal}`} className="text-[#714B67] hover:underline font-medium">
                         #{membresia.Id_FacturaTemporal}
                      </Link>
                    ) : '-'} />
                     <DetailRow label="Empresa" value={membresia.Empresa} />
                     <DetailRow label="Sucursal" value={membresia.Sucursal} />
                </dl>
            </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
             <SectionHeader title="Información de Sistema" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <dl className="space-y-1">
                     <DetailRow label="ID Interno" value={membresia.Id_Membresia} />
                     <DetailRow label="Vendedor" value={membresia.Vendedor} />
                 </dl>
                 <dl className="space-y-1">
                     <DetailRow label="Creado Por" value={membresia.CreadoPor} />
                     <DetailRow label="Fecha Creación" value={membresia.FechaCreacion} />
                 </dl>
             </div>
        </div>

      </div>
    </div>
  );
}
