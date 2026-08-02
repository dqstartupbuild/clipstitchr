'use client';
import { FC, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export const MenuItem: FC<{ label: string; icon: ReactNode; path: string; onClick?: () => void }> = ({
  label,
  icon,
  path,
  onClick,
}) => {
  const currentPath = usePathname();
  const isActive = currentPath.indexOf(path) === 0;

  const className = [
    'group flex h-12 w-full flex-col items-center justify-center gap-1 rounded-[3px] px-1.5 py-2 font-semibold transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]',
    isActive
      ? 'bg-[var(--surface-muted)] text-[var(--text-primary)]'
      : 'text-[var(--text-tertiary)]',
  ].join(' ');

  const inner = (
    <>
      <div>{icon}</div>
      <div className="text-center text-[10px] leading-[1.1]">
        {label}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} title={label} className={className}>
        {inner}
      </button>
    );
  }

  return (
    <Link
      prefetch={true}
      href={path}
      title={label}
      {...path.indexOf('http') === 0 && { target: '_blank' }}
      className={className}
    >
      {inner}
    </Link>
  );
};
