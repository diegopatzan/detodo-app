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

  const conditions: Prisma.ProductoWhereInput[] = [];

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
         { Id_Producto: { contains: search } },
         { NombreChino: { contains: search } },
       ]
     });
  }


  if (status) {
      if (status === 'active') {
          conditions.push({ InventarioActivo: true });
      } else if (status === 'inactive') {
          conditions.push({
            OR: [
              { InventarioActivo: false },
              { InventarioActivo: null }
            ]
          });
      }
  }

  const where: Prisma.ProductoWhereInput = { AND: conditions };

  try {
    const [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where,
        take: pageSize,
        skip: skip,
        orderBy: { Id_Producto: 'asc' }
      }),
      prisma.producto.count({ where })
    ]);

    return NextResponse.json({
      data: JSON.parse(JSON.stringify(productos, replacer)),
      total
    });
  } catch (error) {
    console.error('Error fetching inventario:', error);
    return NextResponse.json({ error: 'Error fetching inventario' }, { status: 500 });
  }
}
