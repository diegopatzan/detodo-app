import { DataTable } from '@/components/ui/DataTable';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { InventarioFilters } from '@/components/inventario/InventarioFilters';
import { fetchFromApi } from '@/lib/api';

interface ProductRow {
  Id_Producto: string;
  Nombre: string | null;
  PrecioVentaBase: number;
  StockMinimo: number | null;
  InventarioActivo: boolean | null;
  [key: string]: unknown;
}

interface RawProducto {
  Id_Producto: string;
  Nombre: string | null;
  PrecioVentaBase: string | number | null;
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

  const formattedData: ProductRow[] = (data as RawProducto[]).map(p => ({
      Id_Producto: p.Id_Producto,
      Nombre: p.Nombre,
      PrecioVentaBase: p.PrecioVentaBase ? Number(p.PrecioVentaBase) : 0,
      StockMinimo: p.StockMinimo,
      InventarioActivo: p.InventarioActivo
  }));

  return { data: formattedData, total };
}

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1; 
  const pageSize = 50;
  
  const { data, total } = await getProductos(resolvedSearchParams);
  const totalPages = Math.ceil(total / pageSize);

  const columns = [
    { header: 'Código', accessorKey: 'Id_Producto' as keyof ProductRow},
    { header: 'Nombre', accessorKey: 'Nombre' as keyof ProductRow, className: 'font-medium text-gray-900' },
    { 
      header: 'Precio Venta', 
      accessorKey: 'PrecioVentaBase' as keyof ProductRow,
      cell: (row: ProductRow) => (
        <span className="font-mono text-gray-900">
          {formatCurrency(row.PrecioVentaBase)}
        </span>
      )
    },
    { 
      header: 'Stock Mín.', 
      accessorKey: 'StockMinimo' as keyof ProductRow,
      cell: (row: ProductRow) => (
        <span className="text-gray-500">{row.StockMinimo ?? '-'}</span>
      )
    },
    { 
      header: 'Estado', 
      accessorKey: 'InventarioActivo' as keyof ProductRow,
      cell: (row: ProductRow) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          row.InventarioActivo 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.InventarioActivo ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      header: 'Acciones',
      accessorKey: 'Id_Producto' as keyof ProductRow,
      className: 'text-center',
      cell: (row: ProductRow) => (
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