import { DataTable } from '@/components/ui/DataTable';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { FamiliaFilters } from '@/components/familias/FamiliaFilters';

interface FamiliaRow {
  Id_Familia: number;
  Descripcion: string | null;
}

async function getFamilias(searchParams: { [key: string]: string | string[] | undefined }) {
  const page = Number(searchParams.page) || 1;
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (search) {
    where.Descripcion = { contains: search };
  }

  try {
    const [familias, total] = await Promise.all([
      prisma.familia.findMany({
        where,
        take: pageSize,
        skip: skip,
        orderBy: { Id_Familia: 'asc' }
      }),
      prisma.familia.count({ where })
    ]);

    const formattedData: FamiliaRow[] = familias.map(f => ({
      Id_Familia: f.Id_Familia,
      Descripcion: f.Descripcion
    }));

    return { data: formattedData, total };
  } catch (error) {
    console.error('Error fetching familias:', error);
    return { data: [], total: 0 };
  }
}

export default async function FamiliasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const pageSize = 20;
  
  const { data, total } = await getFamilias(resolvedSearchParams);
  const totalPages = Math.ceil(total / pageSize);

  const columns = [
    { header: 'ID', accessorKey: 'Id_Familia' as keyof FamiliaRow, className: 'w-24' },
    { header: 'Descripción', accessorKey: 'Descripcion' as keyof FamiliaRow, className: 'font-medium text-gray-900' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Familias</h1>
        </div>
      </div>
      
      <FamiliaFilters />

      <DataTable 
        columns={columns} 
        data={data} 
        title="Listado de Familias"
        currentPage={page}
        totalPages={totalPages}
        baseUrl="/dashboard/familias"
      />
    </div>
  );
}