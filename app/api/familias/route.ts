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

  const search = searchParams.get('search');
  // Filters for date and status are not applicable here

  const conditions: Prisma.FamiliaWhereInput[] = [];

  if (search) {
     conditions.push({
       OR: [
        { Descripcion: { contains: search } },
       ]
     });
  }

  const where: Prisma.FamiliaWhereInput = { AND: conditions };

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

    return NextResponse.json({
      data: JSON.parse(JSON.stringify(familias, replacer)),
      total
    });
  } catch (error) {
    console.error('Error fetching familias:', error);
    return NextResponse.json({ error: 'Error fetching familias' }, { status: 500 });
  }
}
