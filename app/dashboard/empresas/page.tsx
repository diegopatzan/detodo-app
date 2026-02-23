import { DataTable } from '@/components/ui/DataTable';
import { fetchFromApi } from '@/lib/api';

async function getEmpresas(page: number, pageSize: number) {
  const { data, total } = await fetchFromApi('empresas', page, pageSize);
  return { data: data as EmpresaRow[], total };
}

interface EmpresaRow {
  Id_Empresa: number;
  Descripcion: string | null;
}

export default async function EmpresasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const pageSize = 20;

  const { data, total } = await getEmpresas(page, pageSize);
  const totalPages = Math.ceil(total / pageSize);

  const columns = [
    { header: 'ID', accessorKey: 'Id_Empresa' as keyof EmpresaRow, className: 'w-24' },
    { header: 'Descripción', accessorKey: 'Descripcion' as keyof EmpresaRow },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        title="Listado de Empresas"
        currentPage={page}
        totalPages={totalPages}
        baseUrl="/dashboard/empresas"
      />
    </div>
  );
}