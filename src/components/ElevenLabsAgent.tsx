
import React from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle } from 'lucide-react';

interface ElevenLabsAgentProps {
  palmReading: any;
}

const ElevenLabsAgent: React.FC<ElevenLabsAgentProps> = ({ palmReading }) => {
  // Simplified component that just displays reading highlights
  return (
    <div className="rounded-xl border border-palm-light bg-gradient-to-b from-white to-palm-light/30 shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-palm-purple/10 to-palm-purple/5 p-4 flex justify-between items-center border-b border-palm-light">
        <h3 className="text-lg font-medium flex items-center">
          <span className="font-serif">Palm Reading Highlights</span>
        </h3>
      </div>

      <div className="p-5">
        <div className="space-y-4">
          {palmReading && palmReading.results ? (
            <>
              <div className="bg-palm-light/30 rounded-lg p-4 border border-palm-light/50">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Sparkles size={16} className="text-palm-purple mr-2" />
                  Key Insights
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {palmReading.results.personalityTraits && palmReading.results.personalityTraits.length > 0 ? (
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <h5 className="text-xs font-medium text-gray-700 mb-2">Personality Traits</h5>
                      <div className="flex flex-wrap gap-2">
                        {palmReading.results.personalityTraits.map((trait: string, index: number) => (
                          <span key={index} className="text-xs bg-palm-purple/10 text-palm-purple px-2 py-1 rounded-full">
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  
                  {palmReading.results.elementalInfluences ? (
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <h5 className="text-xs font-medium text-gray-700 mb-2">Elemental Influences</h5>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5"></div>
                          <span className="text-xs text-gray-600">Fire: {palmReading.results.elementalInfluences.fire}%</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5"></div>
                          <span className="text-xs text-gray-600">Water: {palmReading.results.elementalInfluences.water}%</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-600 mr-1.5"></div>
                          <span className="text-xs text-gray-600">Earth: {palmReading.results.elementalInfluences.earth}%</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-1.5"></div>
                          <span className="text-xs text-gray-600">Air: {palmReading.results.elementalInfluences.air}%</span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  
                  {palmReading.results.lifeLine || palmReading.results.heartLine || palmReading.results.headLine ? (
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <h5 className="text-xs font-medium text-gray-700 mb-2">Line Strengths</h5>
                      <div className="space-y-2">
                        {palmReading.results.lifeLine && (
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-gray-600">Life Line</span>
                              <span className="text-xs font-medium">{palmReading.results.lifeLine.strength}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${palmReading.results.lifeLine.strength}%` }}></div>
                            </div>
                          </div>
                        )}
                        {palmReading.results.heartLine && (
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-gray-600">Heart Line</span>
                              <span className="text-xs font-medium">{palmReading.results.heartLine.strength}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${palmReading.results.heartLine.strength}%` }}></div>
                            </div>
                          </div>
                        )}
                        {palmReading.results.headLine && (
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-gray-600">Head Line</span>
                              <span className="text-xs font-medium">{palmReading.results.headLine.strength}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${palmReading.results.headLine.strength}%` }}></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-gray-100">
                <div className="flex items-start">
                  <div className="bg-palm-purple/10 rounded-full p-2 mr-3 flex-shrink-0">
                    <MessageCircle size={20} className="text-palm-purple" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Summary</p>
                    <p className="text-xs text-gray-600 line-clamp-3">
                      {palmReading.results.overallSummary ? 
                        palmReading.results.overallSummary.substring(0, 200) + "..." 
                        : "No summary available"}
                    </p>
                    <Button variant="link" className="text-xs p-0 h-auto text-palm-purple mt-1">
                      Read full analysis
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-4">
              <p className="text-gray-500">No reading data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElevenLabsAgent;
