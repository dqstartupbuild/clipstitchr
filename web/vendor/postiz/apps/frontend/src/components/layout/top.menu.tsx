'use client';

import { FC, ReactNode } from 'react';
import { MenuItem } from '../new-layout/menu-item';

interface MenuItemInterface {
  name: string;
  icon: ReactNode;
  path: string;
}

const calendarIcon = (
  <svg width="21" height="23" viewBox="0 0 21 23" fill="none">
    <path
      d="M19.5 9.5H1.5M14.5 1.5V5.5M6.5 1.5V5.5M6.3 21.5H14.7C16.38 21.5 17.22 21.5 17.86 21.17C18.43 20.89 18.89 20.43 19.17 19.86C19.5 19.22 19.5 18.38 19.5 16.7V8.3C19.5 6.62 19.5 5.78 19.17 5.14C18.89 4.57 18.43 4.11 17.86 3.83C17.22 3.5 16.38 3.5 14.7 3.5H6.3C4.62 3.5 3.78 3.5 3.14 3.83C2.57 4.11 2.11 4.57 1.83 5.14C1.5 5.78 1.5 6.62 1.5 8.3V16.7C1.5 18.38 1.5 19.22 1.83 19.86C2.11 20.43 2.57 20.89 3.14 21.17C3.78 21.5 4.62 21.5 6.3 21.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const listIcon = (
  <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
    <path
      d="M7 5.5H18M7 10.5H18M7 15.5H18M3 5.5H3.01M3 10.5H3.01M3 15.5H3.01"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const analyticsIcon = (
  <svg width="20" height="19" viewBox="0 0 20 19" fill="none">
    <path
      d="M18.5 18H3.01C2.48 18 2.22 18 2.02 17.9C1.84 17.81 1.69 17.66 1.6 17.48C1.5 17.28 1.5 17.02 1.5 16.49V1M18.5 4.78L13.37 9.91C13.18 10.1 13.09 10.19 12.98 10.23C12.88 10.26 12.78 10.26 12.69 10.23C12.58 10.19 12.49 10.1 12.3 9.91L10.53 8.15C10.35 7.96 10.25 7.86 10.15 7.83C10.05 7.8 9.95 7.8 9.85 7.83C9.75 7.86 9.65 7.96 9.47 8.15L5.28 12.33M18.5 4.78H14.72M18.5 4.78V8.56"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const integrationsIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M7.25 3.25A2.25 2.25 0 0 1 9.5 1v3h1V1a2.25 2.25 0 0 1 2.25 2.25V5H15a2 2 0 0 1 2 2v2.25h-3a2.25 2.25 0 0 0 0 4.5h3V16a2 2 0 0 1-2 2h-4.5v-3a2.25 2.25 0 0 0-4.5 0v3H3a2 2 0 0 1-2-2v-3.25h3a2.25 2.25 0 0 0 0-4.5H1V7a2 2 0 0 1 2-2h4.25V3.25Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const buildPublishingMenu = (
  basePath = '/dashboard/publishing'
): MenuItemInterface[] => [
  { name: 'Calendar', icon: calendarIcon, path: `${basePath}/calendar` },
  { name: 'Posts', icon: listIcon, path: `${basePath}/posts` },
  { name: 'Analytics', icon: analyticsIcon, path: `${basePath}/analytics` },
  {
    name: 'Integrations',
    icon: integrationsIcon,
    path: `${basePath}/integrations`,
  },
];

export const publishingMenu = buildPublishingMenu();

export const TopMenu: FC<{ basePath?: string }> = ({ basePath }) => (
  <nav aria-label="Publishing" className="flex flex-col gap-[12px]">
    {buildPublishingMenu(basePath).map((item) => (
      <MenuItem
        path={item.path}
        label={item.name}
        icon={item.icon}
        key={item.name}
      />
    ))}
  </nav>
);
