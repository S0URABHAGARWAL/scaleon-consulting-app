
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { DiscoveryWizard } from './components/DiscoveryWizard';
import { ResearchLoader } from './components/ResearchLoader';
import { ReportView } from './components/ReportView';
import { LanguageSelector } from './components/LanguageSelector';
import { ProspectData, StrategicReport } from './types';
import { generateConsultingReport, performMarketResearch } from './services/geminiService';
import { LanguageProvider } from './context/LanguageContext';
import { firebaseFunctions } from './services/api.service';
import { subscribeToOperationStatus } from './services/firestore.service';
import { onSnapshot } from 'firebase/firestore';


enum AppState {
  LANDING,
  LANGUAGE_SELECT,
  DISCOVERY,
  RESEARCHING,
  REPORT,
  SUBMITTED
}

const AppContent: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [prospectData, setProspectData] = useState<ProspectData | null>(null);
  const [report, setReport] = useState<StrategicReport | null>(null);

  const startFlow = () => setAppState(AppState.LANGUAGE_SELECT);
  
  const handleLanguageSelected = () => setAppState(AppState.DISCOVERY);

  const handleDiscoveryComplete = async (data: ProspectData) => {
    setProspectData(data);
    setAppState(AppState.RESEARCHING);
    
        try {
      const { data: sessionData } = await firebaseFunctions.initSession();
      const sessionId = sessionData.sessionId;
      
      const { data: enrichData } = await firebaseFunctions.enrichCompany({
        sessionId,
        company: data.companyName,
      });
      const enrichmentOpId = enrichData.operationId;
      
      subscribeToOperationStatus(sessionId, enrichmentOpId, (operation) => {
        if (operation?.status === 'completed') {
          firebaseFunctions.generateAudit({
            sessionId,
            prospectData: { ...data, enrichmentData: operation.data },
          });
        } else if (operation?.status === 'failed') {
          alert('Error: ' + operation.error);
          setAppState(AppState.DISCOVERY);
        }
      });
      
      setAppState(AppState.RESEARCHING);
    } catch (error) {
      console.error('Error:', error);
      alert('Please try again.');
      setAppState(AppState.DISCOVERY);
    }

  const submitToTeam = () => {
    setAppState(AppState.SUBMITTED);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-foreground bg-background">
      <Header />
      
      <main className="flex-grow flex flex-col">
        {appState === AppState.LANDING && (
          <Hero onStart={startFlow} />
        )}

        {appState === AppState.LANGUAGE_SELECT && (
          <div className="flex-grow bg-background">
            <LanguageSelector onComplete={handleLanguageSelected} />
          </div>
        )}

        {appState === AppState.DISCOVERY && (
          <div className="flex-grow bg-background">
              <DiscoveryWizard onComplete={handleDiscoveryComplete} />
          </div>
        )}

        {appState === AppState.RESEARCHING && (
          <ResearchLoader prospectName={prospectData?.companyName || "Your Company"} />
        )}

        {appState === AppState.REPORT && report && (
          <ReportView 
            report={report} 
            prospectData={prospectData!} 
            onSubmit={submitToTeam} 
          />
        )}

        {appState === AppState.SUBMITTED && (
          <div className="flex-grow flex items-center justify-center bg-background">
            <div className="text-center p-8 max-w-lg">
              <h2 className="text-3xl font-serif font-bold mb-4">Discovery Submitted</h2>
              <p className="text-muted-foreground mb-8">
                Thank you. Our senior partners at ScaleOn Consulting have received your strategic profile.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="text-accent font-semibold underline"
              >
                Return to Home
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-popover text-popover-foreground py-6 text-center text-sm font-sans">
        <p>© {new Date().getFullYear()} ScaleOn Consulting. All rights reserved.</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
