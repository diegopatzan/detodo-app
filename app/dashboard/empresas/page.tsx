import { DataTable } from '@/components/ui/DataTable';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface EmpresaRow {
  Id_Empresa: number;
  Descripcion: string | null;
}

async function getEmpresas(page: number, pageSize: number) {
  const skip = (page - 1) * pageSize;

  try {
    const [empresas, total] = await Promise.all([
      prisma.empresa.findMany({
        take: pageSize,
        skip: skip,
        orderBy: { Id_Empresa: 'asc' }
      }),
      prisma.empresa.count()
    ]);

    const formattedData: EmpresaRow[] = empresas.map(e => ({
      Id_Empresa: e.Id_Empresa,
      Descripcion: e.Descripcion,
    }));

    return { data: formattedData, total };
  } catch (error) {
    console.error('Error fetching empresas:', error);
    return { data: [], total: 0 };
  }
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