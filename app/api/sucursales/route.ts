import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function replacer(key: string, value: unknown) {
  if (typeof value === 'bigint') return value.toString();
  return value;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
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

    return NextResponse.json({
      data: JSON.parse(JSON.stringify(sucursales, replacer)),
      total
    });
  } catch (error) {
    console.error('Error fetching sucursales:', error);
    return NextResponse.json({ error: 'Error fetching sucursales' }, { status: 500 });
  }
}
