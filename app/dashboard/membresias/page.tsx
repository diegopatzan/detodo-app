import { DataTable } from '@/components/ui/DataTable';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { MembresiaFilters } from '@/components/membresias/MembresiaFilters';
import { fetchFromApi } from '@/lib/api';

interface RawMembresia {
  Id_Membresia: number;
  Nombre: string | null;
  Telefono: string | null;
  Tipo: string; 
  FechaVencimiento: string | null | Date;
  Id_Estado: boolean;
  [key: string]: unknown;
}

interface MembresiaRow {
  Id_Membresia: number;
  Nombre: string | null;
  Telefono: string | null;
  Tipo: string;
  FechaVencimiento: string;
  Estado: boolean;
}

async function getMembresias(searchParams: { [key: string]: string | string[] | undefined }) {
  const page = Number(searchParams.page) || 1;
  const pageSize = 20;

  const filters: Record<string, string> = {};
  if (typeof searchParams.search === 'string') filters.search = searchParams.search;
  if (typeof searchParams.startDate === 'string') filters.startDate = searchParams.startDate;
  if (typeof searchParams.endDate === 'string') filters.endDate = searchParams.endDate;
  if (typeof searchParams.status === 'string') filters.status = searchParams.status;

  const { data, total } = await fetchFromApi('membresias', page, pageSize, filters);

  const formattedData: MembresiaRow[] = (data as RawMembresia[]).map(m => ({
    Id_Membresia: m.Id_Membresia,
    Nombre: m.Nombre,
    Telefono: m.Telefono,
    Tipo: m.Tipo || `Tipo ${m.Id_MembresiaTipo}`,
    FechaVencimiento: m.FechaVencimiento ? new Date(m.FechaVencimiento).toLocaleDateString() : '-',
    Estado: m.Id_Estado === true
  }));

  return { data: formattedData, total };
}

export default async function MembresiasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const pageSize = 20;
  
  const { data, total } = await getMembresias(resolvedSearchParams);
  const totalPages = Math.ceil(total / pageSize);

  const columns = [
    { header: 'ID', accessorKey: 'Id_Membresia' as keyof MembresiaRow, className: 'w-24' },
    { header: 'Nombre', accessorKey: 'Nombre' as keyof MembresiaRow, className: 'font-medium text-gray-900' },
    { header: 'Teléfono', accessorKey: 'Telefono' as keyof MembresiaRow },
    { header: 'Tipo', accessorKey: 'Tipo' as keyof MembresiaRow },
    { header: 'Vencimiento', accessorKey: 'FechaVencimiento' as keyof MembresiaRow },
    { 
      header: 'Estado', 
      accessorKey: 'Estado' as keyof MembresiaRow,
      cell: (row: MembresiaRow) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          row.Estado 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.Estado ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      header: 'Acciones',
      accessorKey: 'Id_Membresia' as keyof MembresiaRow,
      className: 'text-center',
      cell: (row: MembresiaRow) => (
        <Link 
          href={`/dashboard/membresias/${row.Id_Membresia}`}
          className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Ver Detalle"
        >
          <Eye size={18} />
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Membresías</h1>
        </div>
      </div>
      
      <MembresiaFilters />

      <DataTable 
        columns={columns} 
        data={data} 
        title="Listado de Membresías"
        currentPage={page}
        totalPages={totalPages}
        baseUrl="/dashboard/membresias"
      />
    </div>
  );
}