
import { DataTable } from '@/components/ui/DataTable';
// import { Sucursal } from '@prisma/client';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { fetchFromApi } from '@/lib/api';

interface SucursalRow {
  Id_Sucursal: number;
  NombreSucursal: string | null;
  Direccion: string | null;
  Telefono: string | null;
  Nit: string | null;
  Email: string | null;
}

interface RawSucursal {
  Id_Sucursal: number;
  NombreSucursal: string | null;
  Direccion: string | null;
  Telefono: string | number | null; // API might return formatted string or number
  Nit: string | null;
  Email: string | null;
  [key: string]: unknown;
}

// Helper to handle BigInt serialization
// API handles serialization, so we just map format here if needed
const serializeSucursal = (sucursal: RawSucursal): SucursalRow => ({
  Id_Sucursal: sucursal.Id_Sucursal,
  NombreSucursal: sucursal.NombreSucursal,
  Direccion: sucursal.Direccion,
  Telefono: sucursal.Telefono ? sucursal.Telefono.toString() : null,
  Nit: sucursal.Nit,
  Email: sucursal.Email
});

async function getSucursales(page: number, pageSize: number) {
  const { data, total } = await fetchFromApi('sucursales', page, pageSize);
  
  // Map BigInt to string (already strings from API if BigInt originally)
  const formattedData = (data as RawSucursal[]).map(serializeSucursal);

  return { data: formattedData, total };
}

export default async function SucursalesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const pageSize = 20;
  
  const { data, total } = await getSucursales(page, pageSize);
  const totalPages = Math.ceil(total / pageSize);

  const columns: {
    header: string;
    accessorKey: keyof SucursalRow;
    className?: string;
    cell?: (row: SucursalRow) => React.ReactNode;
  }[] = [
    { header: 'ID', accessorKey: 'Id_Sucursal' },
    { header: 'Nombre', accessorKey: 'NombreSucursal', className: 'font-medium text-gray-900' },
    { header: 'Dirección', accessorKey: 'Direccion' },
    { header: 'Teléfono', accessorKey: 'Telefono' },
    { header: 'NIT', accessorKey: 'Nit' },
    { header: 'Email', accessorKey: 'Email' },
    {
      header: 'Acciones',
      accessorKey: 'Id_Sucursal',
      className: 'text-center',
      cell: (row) => (
        <Link 
          href={`/dashboard/sucursales/${row.Id_Sucursal}`} 
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
          <h1 className="text-2xl font-bold text-gray-900">Sucursales</h1>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        title="Listado de Sucursales"
        currentPage={page}
        totalPages={totalPages}
        baseUrl="/dashboard/sucursales"
      />
    </div>
  );
}
