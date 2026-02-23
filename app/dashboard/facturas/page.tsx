import { DataTable } from '@/components/ui/DataTable';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { FacturaFilters } from '@/components/facturas/FacturaFilters';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface ApiFactura {
  Id_FacturaTemporal: string;
  TokenSesion: string | null;
  Id_Cotizacion: string;
  Total_Venta: string;
  swdatecreated: string | null;
  CertificacionRealizada: boolean | null;
  Nombre: string | null;
  No_NIT: string | null;
  [key: string]: unknown;
}

// Helper to handle BigInt serialization
function replacer(key: string, value: unknown) {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

// handle filters
async function getFacturas(searchParams: { [key: string]: string | string[] | undefined }) {
  const page = Number(searchParams.page) || 1;
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  // Extract valid string filters
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
         { No_NIT: { contains: filters.search } },
         { Factura_Numero: { contains: filters.search } },
       ]
     });
  }

  if (filters.status) {
      if (filters.status === 'certificated') {
          conditions.push({ CertificacionRealizada: true });
      } else if (filters.status === 'pending') {
          conditions.push({
            OR: [
              { CertificacionRealizada: false },
              { CertificacionRealizada: null }
            ]
          });
      }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { AND: conditions };

  try {
    const [facturas, total] = await Promise.all([
      prisma.factura.findMany({
        where,
        take: pageSize,
        skip: skip,
        orderBy: {
          swdatecreated: 'desc',
        },
      }),
      prisma.factura.count({ where })
    ]);

    // Use stringify/parse to simulate API serialization for Dates and BigInts
    const serializedData = JSON.parse(JSON.stringify(facturas, replacer));

    const formattedData = (serializedData as ApiFactura[]).map((f) => ({
      ...f,
      swdatecreated: f.swdatecreated ? new Date(f.swdatecreated).toLocaleDateString() : '-',
    }));
    
    return { data: formattedData, total };

  } catch (error) {
    console.error('Error fetching facturas:', error);
    return { data: [], total: 0 };
  }
}

interface FacturaRow {
  Id_FacturaTemporal: string;
  Nombre: string | null;
  No_NIT: string | null;
  swdatecreated?: string;
  Total_Venta?: string;
  CertificacionRealizada?: boolean | null;
}

export default async function FacturasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const pageSize = 20;
  
  // Pass all params to getFacturas
  const { data, total } = await getFacturas(resolvedSearchParams);
  const totalPages = Math.ceil(total / pageSize);

  const columns: {
    header: string;
    accessorKey: keyof FacturaRow;
    className?: string;
    cell?: (row: FacturaRow) => React.ReactNode;
  }[] = [
    { header: 'ID', accessorKey: 'Id_FacturaTemporal' }, // Mapped to string
    { header: 'Cliente', accessorKey: 'Nombre' },
    { header: 'NIT', accessorKey: 'No_NIT' },
    { header: 'Fecha', accessorKey: 'swdatecreated' },
    { header: 'Total', accessorKey: 'Total_Venta', 
      cell: (row) => <span className="font-bold text-gray-900">Q{row.Total_Venta}</span> 
    },
    { header: 'Estado', accessorKey: 'CertificacionRealizada',
      cell: (row) => (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
          {row.CertificacionRealizada ? 'Certificada' : 'Pendiente'}
        </span>
      )
    },
    {
      header: 'Acciones',
      accessorKey: 'Id_FacturaTemporal',
      className: 'text-center',
      cell: (row) => (
        <Link 
          href={`/dashboard/facturas/${row.Id_FacturaTemporal}`} 
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
          <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
        </div>
      </div>

      <FacturaFilters />

      <DataTable 
        columns={columns} 
        data={data} 
        title="Listado de Facturas"
        currentPage={page}
        totalPages={totalPages}
        baseUrl="/dashboard/facturas"
      />
    </div>
  );
}
