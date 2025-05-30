import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Debug from './components/Debug';
import Assistant from './components/Assistant';
import Onboarding from './components/Onboarding';
import Apps from './components/Apps';
import AppCreator from './components/AppCreator';
import AppRunner from './components/AppRunner';
import ImageGen from './components/ImageGen';
import Gallery from './components/Gallery';
import Help from './components/Help';
import NodeRegistryDebug from './debug/NodeRegistryDebug';
import ToolbarDebug from './debug/ToolbarDebug';
import { db } from './db';

function App() {
  const [activePage, setActivePage] = useState(() => localStorage.getItem('activePage') || 'dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const checkUserInfo = async () => {
      const info = await db.getPersonalInfo();
      if (!info || !info.name) {
        setShowOnboarding(true);
      } else {
        setShowOnboarding(false);
        setUserInfo({ name: info.name });
      }
    };
    checkUserInfo();
  }, []);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    const info = await db.getPersonalInfo();
    if (info) {
      setUserInfo({ name: info.name });
    }
  };
  
  useEffect(() => {
    if (activePage === 'app-creator' || activePage === 'app-runner') {
      const appId = localStorage.getItem('current_app_id');
      
      if (activePage === 'app-runner' && !appId) {
        setActivePage('apps');
      }
    }
  }, [activePage]);

  useEffect(() => {
    console.log('Storing activePage:', activePage);
    localStorage.setItem('activePage', activePage);
  }, [activePage]);

  

  const renderContent = () => {
    if (activePage === 'assistant') {
      return <Assistant onPageChange={setActivePage} />;
    }
    
    if (activePage === 'app-creator') {
      const appId = localStorage.getItem('current_app_id');
      return <AppCreator onPageChange={setActivePage} appId={appId || undefined} />;
    }
    
    if (activePage === 'app-runner') {
      const appId = localStorage.getItem('current_app_id');
      if (appId) {
        return <AppRunner appId={appId} onBack={() => setActivePage('apps')} />;
      } else {
        setActivePage('apps');
        return null;
      }
    }

    if (activePage === 'image-gen') {
      return <ImageGen onPageChange={setActivePage} />;
    }

    if (activePage === 'gallery') {
      return <Gallery onPageChange={setActivePage} />;
    }

    return (
      <div className="flex h-screen">
        <Sidebar activePage={activePage} onPageChange={setActivePage} />
        
        <div className="flex-1 flex flex-col">
          <Topbar userName={userInfo?.name} onPageChange={setActivePage} />
          
          <main className="flex-1 p-6 overflow-auto">
            {(() => {
              switch (activePage) {
                case 'settings':
                  return <Settings />;
                case 'debug':
                  return <Debug />;
                case 'apps':
                  return <Apps onPageChange={setActivePage} />;
                case 'help':
                  return <Help />;
                case 'dashboard':
                default:
                  return <Dashboard onPageChange={setActivePage} />;
              }
            })()}
            {import.meta.env.DEV && (
              <>
                <NodeRegistryDebug />
                <ToolbarDebug />
              </>
            )}
          </main>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-sakura-100 dark:from-gray-900 dark:to-sakura-100">
      {showOnboarding ? (
        <Onboarding onComplete={handleOnboardingComplete} />
      ) : (
        renderContent()
      )}
    </div>
  );
}

export default App;
