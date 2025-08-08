import React from "react";

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
  tabTitle: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  icon,
  tabs,
  activeTab,
  onTabClick,
  children,
  tabTitle,
}) => {
  return (
    <div className="flex max-w-screen mx-0 md:mx-[2rem] 2xl:mx-[19rem] xxs:-pt-5 xs:pt-7 w-full">
      <div className="max-h-[90vh] hidden 2xl:block 2xl:pt-3">
        <div className="rounded-t-[7px] bg-darker-green text-white font-bold text-lg text-center py-3">
          {title}
        </div>
        <aside className="w-[160px] bg-[#fdfdfd] box-border border border-[#9f9f9f] h-[90%]">
          {tabs.map((tab) => (
            <div
              key={tab.value}
              className={`text-center py-2 cursor-pointer border-b border-[#9f9f9f] ${activeTab === tab.value ? "text-green-600 font-bold" : ""}`}
              onClick={() => onTabClick(tab.value)}
            >
              {tab.label}
            </div>
          ))}
        </aside>
      </div>

      {/* 우측 콘텐츠 */}
      <main className="flex-1 px-5 md:px-6 md:py-6 ml-0 xl:ml-10 max-w-[120vh] w-full">
        <h2 className="hidden md:text-3xl font-bold md:flex items-center gap-2">
          {tabTitle} {icon}
        </h2>
        <hr className="hidden 2xl:w-[110%] md:block md:my-4 border-under border-[1.1px]" />
        <div className="md:mt-3">{children}</div>
      </main>
    </div>
  );
};

export default PageLayout;
