import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { DiscoveryWizard } from './components/DiscoveryWizard';
import { ResearchLoader } from './components/ResearchLoader';
import { ReportView } from './components/ReportView';
import { LanguageSelector } from './components/LanguageSelector';
import { ProspectData, StrategicReport } from './types';
import { LanguageProvider } from './context/LanguageContext';
import { firebaseFunctions } from './services/api.service';
import { subscribeToOperationStatus } from './services/firestore.service';

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
  const [error, setError] = useState<string | null>(null);

  const startFlow = () => setAppState(AppState.LANGUAGE_SELECT);
  
  const handleLanguageSelected = () => setAppState(AppState.DISCOVERY);

  const handleDiscoveryComplete = async (data: ProspectData) => {
    setProspectData(data);
    setAppState(AppState.RESEARCHING);
    setError(null);
    
    try {
      console.log('Initializing session...');
      const { data: sessionData } = await firebaseFunctions.initSession();
      const sessionId = sessionData.sessionId;
      
      console.log('Session initialized:', sessionId);
      console.log('Starting company enrichment for:', data.companyName);
      
      const { data: enrichData } = await firebaseFunctions.enrichCompany({
        sessionId,
        company: data.companyName,
      });
      const enrichmentOpId = enrichData.operationId;
      
      console.log('Enrichment operation started:', enrichmentOpId);
      
      // Subscribe to enrichment operation status
      const unsubscribe = subscribeToOperationStatus(sessionId, enrichmentOpId, async (operation) => {
        console.log('Operation status update:', operation?.status);
        
        if (operation?.status === 'completed') {
          try {
            console.log('Enrichment completed, generating audit report...');
            
            // Generate the strategic audit report
            const { data: auditData } = await firebaseFunctions.generateAudit({
              sessionId,
              prospectData: { ...data, enrichmentData: operation.data },
            });
            
            console.log('Audit report generated successfully');
            
            // Update state with the generated report
            setReport(auditData.report);
            setAppState(AppState.REPORT);
            
            // Unsubscribe from updates
            unsubscribe();
          } catch (auditError) {
            console.error('Error generating audit:', auditError);
            setError('Failed to generate report. Please try again.');
            setAppState(AppState.DISCOVERY);
            unsubscribe();
          }
        } else if (operation?.status === 'failed') {
          console.error('Enrichment failed:', operation.error);
          setError(operation.error || 'Enrichment failed. Please try again.');
          setAppState(AppState.DISCOVERY);
          unsubscribe();
        }
      });
      
    } catch (error) {
      console.error('Error in discovery flow:', error);
      setError('An error occurred. Please try again.');
      setAppState(AppState.DISCOVERY);
    }
  };

  const submitToTeam = () => {
    setAppState(AppState.SUBMITTED);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-foreground bg-background">
      <Header />
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
      )}
      
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
