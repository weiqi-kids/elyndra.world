import React from 'react';
import { Menu, X, User, Megaphone, MessageSquare, PlusSquare, SwitchCamera } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

const items = [
  { label: 'About Me', icon: User },
  { label: 'Campus Announcements', icon: Megaphone },
  { label: 'Chats', icon: MessageSquare, active: true },
  { label: 'Create Group', icon: PlusSquare },
  { label: 'Switch Role', icon: SwitchCamera },
];

const SidebarContent: React.FC = () => (
  <div className="flex flex-col w-56 h-full bg-gray-100 p-4 space-y-2">
    {items.map((item) => (
      <Button
        key={item.label}
        variant={item.active ? 'secondary' : 'ghost'}
        className="justify-start"
      >
        <item.icon className="mr-2 h-4 w-4" />
        {item.label}
      </Button>
    ))}
  </div>
);

const Sidebar: React.FC = () => {
  return (
    <>
      <div className="hidden md:block h-full">
        <SidebarContent />
      </div>
      <div className="md:hidden">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" className="m-2">
              <Menu />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="p-4">
            <SidebarContent />
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
};

export default Sidebar;
