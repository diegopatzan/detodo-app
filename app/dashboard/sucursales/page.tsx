import { DataTable } from '@/components/ui/DataTable';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface SucursalRow {
  Id_Sucursal: number;
  NombreSucursal: string | null;
  Direccion: string | null;
  Telefono: string | null;
  Nit: string | null;
  Email: string | null;
}

async function getSucursales(page: number, pageSize: number) {
  const skip = (page - 1) * pageSize;

  try {
    const [sucursales, total] = await Promise.all([
      prisma.sucursal.findMany({
        take: pageSize,
        skip: skip,
        orderBy: { Id_Sucursal: 'asc' }
      }),
      prisma.sucursal.count()
    ]);

    const formattedData: SucursalRow[] = sucursales.map(s => ({
      Id_Sucursal: s.Id_Sucursal,
      NombreSucursal: s.NombreSucursal,
      Direccion: s.Direccion,
      Telefono: s.Telefono ? s.Telefono.toString() : null,
      Nit: s.Nit,
      Email: s.Email
    }));

    return { data: formattedData, total };

  } catch (error) {
    console.error('Error fetching sucursales:', error);
    return { data: [], total: 0 };
  }
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

  const columns = [
    { header: 'ID', accessorKey: 'Id_Sucursal' as keyof SucursalRow, className: 'w-24' },
    { header: 'Nombre', accessorKey: 'NombreSucursal' as keyof SucursalRow, className: 'font-medium text-gray-900' },
    { header: 'Dirección', accessorKey: 'Direccion' as keyof SucursalRow, className: 'hidden md:table-cell' },
    { header: 'Teléfono', accessorKey: 'Telefono' as keyof SucursalRow },
    { header: 'NIT', accessorKey: 'Nit' as keyof SucursalRow },
    { header: 'Email', accessorKey: 'Email' as keyof SucursalRow, className: 'hidden lg:table-cell' },
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