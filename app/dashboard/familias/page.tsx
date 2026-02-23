
import { DataTable } from '@/components/ui/DataTable';
import { fetchFromApi } from '@/lib/api';
import { FamiliaFilters } from '@/components/familias/FamiliaFilters';

interface FamiliaRow {
  Id_Familia: number;
  Descripcion: string | null;
}

async function getFamilias(searchParams: { [key: string]: string | string[] | undefined }) {
  const page = Number(searchParams.page) || 1;
  const pageSize = 20;

  const filters: Record<string, string> = {};
  if (typeof searchParams.search === 'string') filters.search = searchParams.search;

  const { data, total } = await fetchFromApi('familias', page, pageSize, filters);

  return { data: data as FamiliaRow[], total };
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

  const columns: {
    header: string;
    accessorKey: keyof FamiliaRow;
    className?: string;
  }[] = [
    { header: 'ID', accessorKey: 'Id_Familia', className: 'w-24' },
    { header: 'Descripción', accessorKey: 'Descripcion', className: 'font-medium text-gray-900' },
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
