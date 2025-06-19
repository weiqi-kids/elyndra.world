import React from 'react';
import Sidebar from '@/components/Sidebar';
import ChatList from '@/components/ChatList';
import ChatContent from '@/components/ChatContent';

const App: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 overflow-hidden">
        <ChatList />
        <ChatContent />
      </div>
    </div>
  );
};

export default App;
