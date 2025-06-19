import React from 'react';
import {
  Menu,
  User,
  Megaphone,
  MessageSquare,
  PlusSquare,
  SwitchCamera,
  LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';

export type Page = 'me' | 'ann' | 'chats' | 'new-chat' | 'switch-role';

interface SidebarProps {
  active: Page;
  onChange: (page: Page) => void;
}

const items: { key: Page; label: string; icon: LucideIcon }[] = [
  { key: 'me', label: 'Me', icon: User },
  { key: 'ann', label: 'Ann.', icon: Megaphone },
  { key: 'chats', label: 'Chats', icon: MessageSquare },
  { key: 'new-chat', label: 'New Chat', icon: PlusSquare },
  { key: 'switch-role', label: 'Switch Role', icon: SwitchCamera },
];

const SidebarContent: React.FC<SidebarProps> = ({ active, onChange }) => (
  <div className="flex flex-col w-56 h-full bg-gray-100 p-4 space-y-2">
    {items.map((item) => (
      <Button
        key={item.key}
        variant={item.key === active ? 'secondary' : 'ghost'}
        className="justify-start"
        onClick={() => onChange(item.key)}
      >
        <item.icon className="mr-2 h-4 w-4" />
        {item.label}
      </Button>
    ))}
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ active, onChange }) => (
  <>
    <div className="hidden md:block h-full">
      <SidebarContent active={active} onChange={onChange} />
    </div>
    <div className="md:hidden">
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon" className="m-2">
            <Menu />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="p-4">
          <SidebarContent active={active} onChange={onChange} />
        </DrawerContent>
      </Drawer>
    </div>
  </>
);

export default Sidebar;
