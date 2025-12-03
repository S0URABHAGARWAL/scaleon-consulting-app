import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase.config';

export function subscribeToOperationStatus(
  sessionId: string,
  operationId: string,
  callback: (data: any) => void
): () => void {
  const operationRef = doc(db, 'sessions', sessionId, 'operations', operationId);
  
  const unsubscribe = onSnapshot(operationRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    }
  }, (error) => {
    console.error('Firestore listener error:', error);
  });
  
  return unsubscribe;
}
