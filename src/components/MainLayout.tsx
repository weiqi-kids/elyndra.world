import React, { useState } from 'react';
import Sidebar, { Page } from './Sidebar';
import AboutMePage from '../pages/AboutMePage';
import CampusAnnouncementsPage from '../pages/CampusAnnouncementsPage';
import ChatPage from '../pages/ChatPage';
import NewChatPage from '../pages/NewChatPage';
import SwitchRolePage from '../pages/SwitchRolePage';

const MainLayout: React.FC = () => {
  const [active, setActive] = useState<Page>('chats');

  const renderContent = () => {
    switch (active) {
      case 'me':
        return <AboutMePage />;
      case 'ann':
        return <CampusAnnouncementsPage />;
      case 'chats':
        return <ChatPage />;
      case 'new-chat':
        return <NewChatPage />;
      case 'switch-role':
        return <SwitchRolePage />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar active={active} onChange={setActive} />
      <div className="flex-1 overflow-hidden">{renderContent()}</div>
    </div>
  );
};

export default MainLayout;
