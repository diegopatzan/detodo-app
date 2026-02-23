
import { DataTable } from '@/components/ui/DataTable';
import { UsuarioFilters } from '@/components/usuarios/UsuarioFilters';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface UsuarioRow {
  Id_Usuario: number | string;
  Nombre: string | null;
  Apellidos: string | null;
  Usuario: string | null;
  Email: string | null;
}

// Helper to handle BigInt serialization and avoid circular refs if any
function replacer(key: string, value: unknown) {
  if (typeof value === 'bigint') return value.toString();
  return value;
}

async function getUsuarios(searchParams: { [key: string]: string | string[] | undefined }) {
  const page = Number(searchParams.page) || 1;
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;

  // Build where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conditions: any[] = [];

  if (search) {
     conditions.push({
       OR: [
        { Nombre: { contains: search } },
        { Apellidos: { contains: search } },
        { Usuario: { contains: search } },
        { Email: { contains: search } },
       ]
     });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { AND: conditions };

  try {
    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        take: pageSize,
        skip: skip,
        orderBy: { Id_Usuario: 'asc' }
      }),
      prisma.usuario.count({ where })
    ]);

    const formattedData: UsuarioRow[] = usuarios.map(m => ({
      Id_Usuario: m.Id_Usuario,
      Nombre: m.Nombre,
      Apellidos: m.Apellidos,
      Usuario: m.Usuario || m.Email || '-', // Fallback to Email if Usuario is empty
      Email: m.Email,
    }));

    return { data: formattedData, total };
  } catch (error) {
    console.error('Error fetching usuarios:', error);
    return { data: [], total: 0 };
  }
}

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const pageSize = 20;
  
  const { data, total } = await getUsuarios(resolvedSearchParams);
  const totalPages = Math.ceil(total / pageSize);

  const columns: {
    header: string;
    accessorKey: keyof UsuarioRow;
    className?: string;
  }[] = [
    { header: 'ID', accessorKey: 'Id_Usuario', className: 'w-20' },
    { header: 'Usuario', accessorKey: 'Usuario', className: 'font-medium text-gray-900' },
    { header: 'Nombre', accessorKey: 'Nombre' },
    { header: 'Apellidos', accessorKey: 'Apellidos' },
    { header: 'Email', accessorKey: 'Email' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        </div>
      </div>

      <UsuarioFilters />

      <DataTable 
        columns={columns} 
        data={data} 
        title="Listado de Usuarios"
        currentPage={page}
        totalPages={totalPages}
        baseUrl="/dashboard/usuarios"
      />
    </div>
  );
}
