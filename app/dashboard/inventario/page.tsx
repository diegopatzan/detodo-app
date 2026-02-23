
import { DataTable } from '@/components/ui/DataTable';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { fetchFromApi } from '@/lib/api';
import { InventarioFilters } from '@/components/inventario/InventarioFilters';

interface RawProducto {
  Id_Producto: string;
  Nombre: string | null;
  PrecioVentaBase: string | number | null;
  PrecioCosto: string | number | null;
  swdatecreated: string | null;
  StockMinimo: number | null;
  InventarioActivo: boolean | null;
  [key: string]: unknown;
}

async function getProductos(searchParams: { [key: string]: string | string[] | undefined }) {
  const page = Number(searchParams.page) || 1;
  const pageSize = 50;
  
  const filters: Record<string, string> = {};
  if (typeof searchParams.search === 'string') filters.search = searchParams.search;
  if (typeof searchParams.startDate === 'string') filters.startDate = searchParams.startDate;
  if (typeof searchParams.endDate === 'string') filters.endDate = searchParams.endDate;
  if (typeof searchParams.status === 'string') filters.status = searchParams.status;

  const { data, total } = await fetchFromApi('inventario', page, pageSize, filters);

  // Map and serialize
  const formattedData = (data as RawProducto[]).map(p => ({
    ...p,
    PrecioVentaBase: Number(p.PrecioVentaBase) || 0,
    PrecioCosto: Number(p.PrecioCosto) || 0,
    swdatecreated: p.swdatecreated ? new Date(p.swdatecreated).toLocaleString() : '-',
  }));

  return { data: formattedData, total };
}

// Defined interface to avoid 'any'
interface ProductRow {
  Id_Producto: string;
  Nombre: string | null;
  PrecioVentaBase: number;
  StockMinimo: number | null;
  InventarioActivo: boolean | null;
}

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1; // Used for DataTable pagination
  const pageSize = 50;
  
  const { data, total } = await getProductos(resolvedSearchParams);
  const totalPages = Math.ceil(total / pageSize);

  const columns: {
    header: string;
    accessorKey: keyof ProductRow;
    className?: string;
    cell?: (row: ProductRow) => React.ReactNode;
  }[] = [
    { header: 'Código', accessorKey: 'Id_Producto' },
    { header: 'Nombre', accessorKey: 'Nombre', className: 'font-medium text-gray-900' },
    { 
      header: 'Precio Venta', 
      accessorKey: 'PrecioVentaBase',
      cell: (row) => (
        <span className="font-mono text-gray-900">
          {formatCurrency(row.PrecioVentaBase)}
        </span>
      )
    },
    { 
      header: 'Stock Mín.', 
      accessorKey: 'StockMinimo',
      cell: (row) => (
        <span className="text-gray-500">{row.StockMinimo ?? '-'}</span>
      )
    },
    { 
      header: 'Estado', 
      accessorKey: 'InventarioActivo',
      cell: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
          {row.InventarioActivo ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      header: 'Acciones',
      accessorKey: 'Id_Producto',
      className: 'text-center',
      cell: (row) => (
        <Link 
          href={`/dashboard/inventario/${encodeURIComponent(row.Id_Producto)}`} 
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
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
        </div>
      </div>

      <InventarioFilters />

      <DataTable 
        columns={columns} 
        data={data} 
        title="Listado de Productos"
        currentPage={page}
        totalPages={totalPages}
        baseUrl="/dashboard/inventario"
      />
    </div>
  );
}
