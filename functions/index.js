const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors')({ origin: true });

admin.initializeApp();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Analyze data with Gemini
exports.analyzeData = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = data.prompt || 'Analyze the following data';
    const payload = data.payload || {};

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Store analysis in Realtime Database
    const dbRef = admin.database().ref('analyses');
    const newAnalysis = await dbRef.push();
    await newAnalysis.set({
      uid: context.auth.uid,
      input: payload,
      output: text,
      timestamp: admin.database.ServerValue.TIMESTAMP,
      type: data.type || 'general'
    });

    return { success: true, analysis: text, id: newAnalysis.key };
  } catch (error) {
    console.error('Analysis error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Get recent insights
exports.getInsights = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const snapshot = await admin.database()
      .ref('analyses')
      .orderByChild('timestamp')
      .limitToLast(10)
      .once('value');

    return snapshot.val() || {};
  } catch (error) {
    console.error('Get insights error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Process batch analysis
exports.processBatchAnalysis = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const items = data.items || [];
    const results = [];
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    for (const item of items) {
      const result = await model.generateContent(item.prompt);
      const response = await result.response;
      results.push({
        item: item,
        analysis: response.text()
      });
    }

    return { success: true, results: results, count: results.length };
  } catch (error) {
    console.error('Batch analysis error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// User profile initialization
exports.initializeUserProfile = functions.auth.user().onCreate(async (user) => {
  try {
    const userRef = admin.database().ref(`users/${user.uid}`);
    await userRef.set({
      email: user.email,
      displayName: user.displayName || 'User',
      photoURL: user.photoURL || '',
      role: 'consultant',
      createdAt: admin.database.ServerValue.TIMESTAMP,
      lastLogin: admin.database.ServerValue.TIMESTAMP
    });
  } catch (error) {
    console.error('Error initializing user profile:', error);
  }
});

console.log('ScaleOn Consulting Cloud Functions initialized');
