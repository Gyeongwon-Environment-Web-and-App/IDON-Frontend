import React from 'react';

interface Tab {
  label: string;
  value: string;
}

interface PageLayoutProps {
  title: string;
  icon: React.ReactNode;
  tabs: Tab[];
  activeTab: string;
  onTabClick: (value: string) => void;
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, icon, tabs, activeTab, onTabClick, children }) => {
  return (
    <div className="flex">
      <aside className="w-[160px] min-h-screen border-r">
        <div className="bg-green-500 text-white font-bold text-center py-3">
          {title}
        </div>
        {tabs.map((tab) => (
          <div
            key={tab.value}
            className={`text-center py-2 cursor-pointer border-b ${activeTab === tab.value ? 'text-green-600 font-bold' : ''}`}
            onClick={() => onTabClick(tab.value)}
          >
            {tab.label}
          </div>
        ))}
      </aside>

      {/* 우측 콘텐츠 */}
      <main className="flex-1 p-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          {title} {icon}
        </h2>
        <hr className="my-2 border-gray-300" />
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
