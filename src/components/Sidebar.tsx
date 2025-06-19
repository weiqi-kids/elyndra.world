import React from 'react';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
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

interface SidebarContentProps extends SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const items: { key: Page; label: string; icon: LucideIcon }[] = [
  { key: 'me', label: 'Me', icon: User },
  { key: 'ann', label: 'Ann.', icon: Megaphone },
  { key: 'chats', label: 'Chats', icon: MessageSquare },
  { key: 'new-chat', label: 'New Chat', icon: PlusSquare },
  { key: 'switch-role', label: 'Switch Role', icon: SwitchCamera },
];

const SidebarContent: React.FC<SidebarContentProps> = ({
  active,
  onChange,
  collapsed,
  onToggle,
}) => (
  <div
    className={`flex flex-col ${collapsed ? 'w-16' : 'w-56'} h-full bg-gray-100 p-4 space-y-2`}
  >
    {items.map((item) => (
      <Button
        key={item.key}
        variant={item.key === active ? 'secondary' : 'ghost'}
        className="flex items-center justify-start w-full space-x-2 hover:bg-gray-200 rounded-md transition-colors px-2 py-2"
        onClick={() => onChange(item.key)}
      >
        <item.icon className="h-4 w-4" />
        {!collapsed && item.label}
      </Button>
    ))}
    <Button
      variant="ghost"
      className="flex items-center justify-start w-full space-x-2 hover:bg-gray-200 rounded-md transition-colors mt-auto px-2 py-2"
      onClick={onToggle}
    >
      {collapsed ? (
        <ChevronRight className="h-4 w-4" />
      ) : (
        <>
          <ChevronLeft className="h-4 w-4" />
          <span>Close Sidebar</span>
        </>
      )}
    </Button>
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ active, onChange }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const toggle = () => setCollapsed((v) => !v);

  return (
    <>
      <div className="hidden md:block h-full">
        <SidebarContent
          active={active}
          onChange={onChange}
          collapsed={collapsed}
          onToggle={toggle}
        />
      </div>
      <div className="md:hidden">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" className="m-2">
              <Menu />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="p-4">
            <SidebarContent
              active={active}
              onChange={onChange}
              collapsed={false}
              onToggle={() => {}}
            />
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
};

export default Sidebar;
