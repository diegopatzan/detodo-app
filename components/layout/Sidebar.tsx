import Link from 'next/link';
import { FileText, Settings, Building2, Package, Users, Store, CreditCard, Tags } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Facturas', href: '/dashboard/facturas', icon: FileText },
  { name: 'Inventario', href: '/dashboard/inventario', icon: Package },
  { name: 'Membresías', href: '/dashboard/membresias', icon: CreditCard },
  { name: 'Sucursales', href: '/dashboard/sucursales', icon: Store },
  { name: 'Familias', href: '/dashboard/familias', icon: Tags },
  { name: 'Usuarios', href: '/dashboard/usuarios', icon: Users },
  { name: 'Empresas', href: '/dashboard/empresas', icon: Building2 },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 text-gray-900 flex-shrink-0 min-h-screen">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold tracking-wider text-black1-700">
          CHINA DETODO LOGISTICS
        </h1>
      </div>

      <nav className="mt-6 px-3">
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-2">
              <Link
                href={item.href}
                className={clsx(
                  "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors group",
                  "text-gray-600 hover:bg-blue-50 hover:text-gray-700"
                )}
              >
                <item.icon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
