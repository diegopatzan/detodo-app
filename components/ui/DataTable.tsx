import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
  header: string;
  accessorKey: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  currentPage?: number;
  totalPages?: number;
  baseUrl?: string;
  currentPageSize?: number;
  totalItems?: number;
}

export function DataTable<T>({ 
  columns, 
  data, 
  title,
  currentPage = 1,
  currentPageSize = 20, 
  totalItems = 0,
  totalPages = 1,
  baseUrl = ''
}: DataTableProps<T>) {
  
 // Pagination items
  const startItem = (currentPage - 1) * currentPageSize + 1;
  const endItem = Math.min(currentPage * currentPageSize, totalItems);


  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-sm overflow-hidden">
      {/*  Tables data */}
      {title && (
        <div className="px-4 py-3 border-b border-gray-200 bg-white flex justify-between items-center">
          <h3 className="text-base font-bold text-[#714B67]">{title}</h3>
          
          {/* Paginitaion items */}
          {totalItems > 0 && (
            <div className="text-sm text-gray-600 font-medium">
               <span className="font-bold text-gray-900">{startItem}-{endItem}</span>
               <span className="mx-1 text-gray-400">/</span>
               <span className="text-gray-900">{totalItems}</span>
            </div>
          )}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 border-b-2 border-[#714B67]/20">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`px-4 py-3 text-left text-sm font-bold text-gray-700 ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500 italic">
                  No hay registros para mostrar
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-[#714B67]/5 transition-colors group">
                  {columns.map((column, colIndex) => (
                     <td key={colIndex} className="px-4 py-3 whitespace-nowrap max-w-xs truncate text-sm text-gray-700 group-hover:text-gray-900" title={typeof item[column.accessorKey] === 'string' ? item[column.accessorKey] : ''}>
                      {column.cell 
                        ? column.cell(item) 
                        : (typeof column.accessorKey === 'function'
                          ? column.accessorKey(item)
                          : (item[column.accessorKey] as React.ReactNode))} {/* Fix strict type access */}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-end border-t border-gray-200 gap-2">
            <Link 
              href={currentPage > 1 ? `${baseUrl}?page=${currentPage - 1}` : '#'}
              className={`p-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-[#714B67] hover:text-white hover:border-[#714B67] transition-all ${currentPage <= 1 ? 'opacity-30 pointer-events-none' : ''}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <div className="text-sm font-medium text-gray-700 px-2 cursor-default">
              <span className="text-gray-900">{currentPage}</span>
              <span className="mx-1 text-gray-400">/</span>
              <span className="text-gray-600">{totalPages}</span>
            </div>
            <Link 
              href={currentPage < totalPages ? `${baseUrl}?page=${currentPage + 1}` : '#'}
              className={`p-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-[#714B67] hover:text-white hover:border-[#714B67] transition-all ${currentPage >= totalPages ? 'opacity-30 pointer-events-none' : ''}`}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
        </div>
      )}
    </div>
  );
}
