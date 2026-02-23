
import { DataTable } from '@/components/ui/DataTable';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { MembresiaFilters } from '@/components/membresias/MembresiaFilters';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

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

// Helper to handle BigInt serialization
function replacer(key: string, value: unknown) {
  if (typeof value === 'bigint') return value.toString();
  return value;
}

async function getMembresias(searchParams: { [key: string]: string | string[] | undefined }) {
  const page = Number(searchParams.page) || 1;
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const filters: Record<string, string> = {};
  if (typeof searchParams.search === 'string') filters.search = searchParams.search;
  if (typeof searchParams.startDate === 'string') filters.startDate = searchParams.startDate;
  if (typeof searchParams.endDate === 'string') filters.endDate = searchParams.endDate;
  if (typeof searchParams.status === 'string') filters.status = searchParams.status;

  // Build where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conditions: any[] = [];

  if (filters.startDate) {
    conditions.push({ swdatecreated: { gte: new Date(filters.startDate) } });
  }
  if (filters.endDate) {
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);
    conditions.push({ swdatecreated: { lte: end } });
  }

  if (filters.search) {
     conditions.push({
       OR: [
         { Nombre: { contains: filters.search } },
         { NoTarjetaMembresia: { contains: filters.search } },
         { Telefono: { contains: filters.search } },
       ]
     });
  }

  if (filters.status) {
      if (filters.status === 'active') {
          conditions.push({ Id_Estado: true });
      } else if (filters.status === 'inactive') {
          conditions.push({
            OR: [
              { Id_Estado: false },
              { Id_Estado: null }
            ]
          });
      }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { AND: conditions };

  try {
    // Fetch types for mapping
    const tipos = await prisma.membresiaTipo.findMany();
    const tipoMap = new Map(tipos.map(t => [t.Id_MembresiaTipo, t.Descripcion]));

    const [membresias, total] = await Promise.all([
      prisma.membresia.findMany({
        where,
        take: pageSize,
        skip: skip,
        orderBy: { Id_Membresia: 'asc' }
      }),
      prisma.membresia.count({ where })
    ]);

    const formattedData: MembresiaRow[] = membresias.map(m => ({
      Id_Membresia: m.Id_Membresia,
      Nombre: m.Nombre,
      Telefono: m.Telefono,
      Tipo: tipoMap.get(m.Id_MembresiaTipo) || `Tipo ${m.Id_MembresiaTipo}`,
      FechaVencimiento: m.FechaVencimiento ? new Date(m.FechaVencimiento).toLocaleDateString() : '-',
      Estado: m.Id_Estado === true
    }));

    return { data: formattedData, total };

  } catch (error) {
    console.error('Error fetching membresias:', error);
    return { data: [], total: 0 };
  }
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
