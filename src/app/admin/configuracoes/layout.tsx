'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './configuracoes.css';

const TABS = [
  { href: '/admin/configuracoes/cores',      label: 'Cores'      },
  { href: '/admin/configuracoes/midia',      label: 'Mídia'      },
  { href: '/admin/configuracoes/textos',     label: 'Textos'     },
  { href: '/admin/configuracoes/auditoria',  label: 'Auditoria'  },
];

export default function ConfiguracoesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="layoutConfiguracoes">
      <nav className="tabsConfiguracoes">
        {TABS.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`tabLink${pathname.startsWith(tab.href) ? ' tabLinkAtivo' : ''}`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
