
import { DataTable } from '@/components/ui/DataTable';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { fetchFromApi } from '@/lib/api';
import { MembresiaFilters } from '@/components/membresias/MembresiaFilters';

interface RawMembresia {
  Id_Membresia: number;
  Nombre: string | null;
  Telefono: string | null;
  Tipo: string; // API provides this joined/mapped
  FechaVencimiento: string | null;
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
    Tipo: m.Tipo || '-',
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

  const columns: {
    header: string;
    accessorKey: keyof MembresiaRow;
    className?: string;
    cell?: (row: MembresiaRow) => React.ReactNode;
  }[] = [
    { header: 'ID', accessorKey: 'Id_Membresia', className: 'w-20' },
    { header: 'Nombre', accessorKey: 'Nombre', className: 'font-medium text-gray-900' },
    { header: 'Teléfono', accessorKey: 'Telefono' },
    { header: 'Tipo', accessorKey: 'Tipo' },
    { header: 'Vencimiento', accessorKey: 'FechaVencimiento' },
    { 
      header: 'Estado', 
      accessorKey: 'Estado',
      cell: (row) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800`}>
          {row.Estado ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      header: 'Acciones',
      accessorKey: 'Id_Membresia',
      className: 'text-center',
      cell: (row) => (
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
