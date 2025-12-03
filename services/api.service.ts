import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase.config';

export const firebaseFunctions = {
  initSession: httpsCallable(functions, 'initSession'),
  enrichCompany: httpsCallable(functions, 'enrichCompany'),
  generateAudit: httpsCallable(functions, 'generateAudit'),
  storeProspect: httpsCallable(functions, 'storeProspect'),
  getOperationStatus: httpsCallable(functions, 'getOperationStatus'),
};
