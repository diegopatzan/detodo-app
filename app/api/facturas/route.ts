import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Helper to handle BigInt serialization
function replacer(key: string, value: unknown) {
  if (typeof value === 'bigint') {
    return value.toString();
  }
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

  // Build where clause
  const conditions: Prisma.FacturaWhereInput[] = [];

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
         { No_NIT: { contains: search } },
         { Factura_Numero: { contains: search } },
       ]
     });
  }

  if (status) {
      if (status === 'certificated') {
          conditions.push({ CertificacionRealizada: true });
      } else if (status === 'pending') {
          conditions.push({
            OR: [
              { CertificacionRealizada: false },
              { CertificacionRealizada: null }
            ]
          });
      }
  }

  const where: Prisma.FacturaWhereInput = { AND: conditions };

  try {
    const [facturas, total] = await Promise.all([
      prisma.factura.findMany({
        where,

        take: pageSize,
        skip: skip,
        orderBy: {
          swdatecreated: 'desc',
        },
      }),
      prisma.factura.count({ where })
    ]);

    return NextResponse.json({
      data: JSON.parse(JSON.stringify(facturas, replacer)),
      total
    });
  } catch (error) {
    console.error('Error fetching facturas:', error);
    return NextResponse.json(
      { error: 'Error al obtener las facturas.' },
      { status: 500 }
    );
  }
}
