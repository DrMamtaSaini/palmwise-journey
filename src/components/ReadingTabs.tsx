
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { useState } from "react";

interface ReadingTabsProps {
  readingContent?: Record<string, any>;
  content?: Record<string, any>;
  isPremium: boolean;
  isPremiumTest?: boolean;
}

const ReadingTabs = ({ readingContent, content, isPremium, isPremiumTest = false }: ReadingTabsProps) => {
  const [activeTab, setActiveTab] = useState("lifeLine");
  
  // Use whichever content is provided
  const tabContent = content || readingContent;

  const getFilteredTabs = () => {
    if (!tabContent) return [];
    
    return Object.keys(tabContent).filter(key => 
      !tabContent[key].premium || isPremium || isPremiumTest
    );
  };

  const filteredTabs = getFilteredTabs();
  
  return (
    <Tabs defaultValue="lifeLine" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="flex flex-wrap mb-8 border-b border-gray-100 bg-transparent p-0 w-full justify-start overflow-x-auto">
        {filteredTabs.map((key) => (
          <TabsTrigger
            key={key}
            value={key}
            className={`px-4 py-3 font-medium transition-colors rounded-none flex items-center whitespace-nowrap ${
              activeTab === key
                ? "text-palm-purple border-b-2 border-palm-purple"
                : "text-gray-500 hover:text-palm-purple"
            }`}
          >
            {tabContent[key].premium && (
              <span className="w-2 h-2 bg-palm-purple rounded-full mr-2"></span>
            )}
            {tabContent[key].title}
          </TabsTrigger>
        ))}
      </TabsList>

      {filteredTabs.map((key) => (
        <TabsContent key={key} value={key} className="animate-fade-in mt-4">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            {tabContent[key].title}
            {tabContent[key].premium && (
              <span className="ml-2 text-xs bg-palm-purple text-white px-2 py-1 rounded-full">
                Premium
              </span>
            )}
          </h2>
          
          <div className="space-y-6">
            {tabContent[key].content.map((paragraph: string, index: number) => (
              <p key={index} className="text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}

            {tabContent[key].insights && (
              <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="font-semibold text-lg mb-3">Key Insights:</h3>
                <ul className="list-disc list-inside space-y-2">
                  {tabContent[key].insights.map((insight: string, idx: number) => (
                    <li key={idx} className="text-gray-700">{insight}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default ReadingTabs;
