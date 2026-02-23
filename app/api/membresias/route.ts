import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

function replacer(key: string, value: unknown) {
  if (typeof value === 'bigint') return value.toString();
  return value;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
  const skip = (page - 1) * pageSize;

  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const search = searchParams.get('search');
  const status = searchParams.get('status');

  const conditions: Prisma.MembresiaWhereInput[] = [];

  if (startDate) {
    conditions.push({ swdatecreated: { gte: new Date(startDate) } });
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    conditions.push({ swdatecreated: { lte: end } });
  }

  if (search) {
     conditions.push({
       OR: [
         { Nombre: { contains: search } },
         { NoTarjetaMembresia: { contains: search } },
         { Telefono: { contains: search } },
       ]
     });
  }

  if (status) {
      if (status === 'active') {
          conditions.push({ Id_Estado: true });
      } else if (status === 'inactive') {
          conditions.push({
            OR: [
              { Id_Estado: false },
              { Id_Estado: null }
            ]
          });
      }
  }

  const where: Prisma.MembresiaWhereInput = { AND: conditions };

  try {
    // Fetch types for mapping
    const tipos = await prisma.membresiaTipo.findMany();
    const tipoMap = new Map(tipos.map(t => [t.Id_MembresiaTipo, t.Descripcion]));

    const [membresias, total] = await Promise.all([
      prisma.membresia.findMany({
        where,
        take: pageSize,
        skip: skip,
        orderBy: { Id_Membresia: 'asc' }
      }),
      prisma.membresia.count({ where })
    ]);

    const formattedData = membresias.map(m => ({
      ...m,
      Tipo: tipoMap.get(m.Id_MembresiaTipo) || `Tipo ${m.Id_MembresiaTipo}`,
    }));

    return NextResponse.json({
      data: JSON.parse(JSON.stringify(formattedData, replacer)),
      total
    });
  } catch (error) {
    console.error('Error fetching membresias:', error);
    return NextResponse.json({ error: 'Error fetching membresias' }, { status: 500 });
  }
}
