
import React, { useEffect, useState } from 'react';
import { EnrichedCompanyProfile } from '../types';

interface SocialEnrichmentProgressProps {
  isLoading: boolean;
  data: EnrichedCompanyProfile | null;
}

export const SocialEnrichmentProgress: React.FC<SocialEnrichmentProgressProps> = ({ isLoading, data }) => {
  const [statuses, setStatuses] = useState({
    linkedin: 'waiting',
    instagram: 'waiting',
    facebook: 'waiting',
    twitter: 'waiting',
    website: 'waiting',
    registry: 'waiting'
  });

  useEffect(() => {
    if (isLoading) {
      // Simulate parallel discovery sequence
      const timeouts = [
        setTimeout(() => setStatuses(s => ({...s, website: 'searching'})), 100),
        setTimeout(() => setStatuses(s => ({...s, linkedin: 'searching'})), 500),
        setTimeout(() => setStatuses(s => ({...s, instagram: 'searching', facebook: 'searching'})), 1000),
        setTimeout(() => setStatuses(s => ({...s, twitter: 'searching', registry: 'searching'})), 1500),
        
        // Simulating completion based on "isLoading" prop not changing yet, 
        // effectively these just stay "searching" until parent passes data and isLoading=false
      ];
      return () => timeouts.forEach(clearTimeout);
    } else if (data) {
        // When data arrives, set to found/not found
        setStatuses({
            linkedin: data.socialPresence?.linkedin?.active ? 'found' : 'not_found',
            instagram: data.socialPresence?.instagram?.active ? 'found' : 'not_found',
            facebook: data.socialPresence?.facebook?.active ? 'found' : 'not_found',
            twitter: data.socialPresence?.twitter?.active ? 'found' : 'not_found',
            website: data.website ? 'found' : 'not_found',
            registry: 'found' // Assumed for valid response
        });
    }
  }, [isLoading, data]);

  const renderStatus = (key: string, label: string, icon: string) => {
    const status = statuses[key as keyof typeof statuses];
    let statusIcon = <span className="text-gray-300">○</span>;
    let statusClass = "text-muted-foreground";
    let statusText = "Pending";

    if (status === 'searching') {
        statusIcon = <span className="animate-spin inline-block">⟳</span>;
        statusClass = "text-primary font-bold";
        statusText = "Searching...";
    } else if (status === 'found') {
        statusIcon = <span className="text-green-500">✓</span>;
        statusClass = "text-green-700 font-bold";
        statusText = "Data Found";
    } else if (status === 'not_found') {
        statusIcon = <span className="text-gray-400">✕</span>;
        statusClass = "text-gray-400";
        statusText = "Not Found";
    }

    return (
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-border shadow-sm">
            <div className="flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <span className="font-medium text-foreground">{label}</span>
            </div>
            <div className={`text-sm flex items-center gap-2 ${statusClass}`}>
                {statusText} {statusIcon}
            </div>
        </div>
    );
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 animate-fadeIn">
       {renderStatus('linkedin', 'LinkedIn Corp', '👔')}
       {renderStatus('website', 'Website Analytics', '🌐')}
       {renderStatus('instagram', 'Instagram', '📸')}
       {renderStatus('facebook', 'Facebook', '📘')}
       {renderStatus('twitter', 'Twitter / X', '🐦')}
       {renderStatus('registry', 'Legal Registry', '⚖️')}
    </div>
  );
};
