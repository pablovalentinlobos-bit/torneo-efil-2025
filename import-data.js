// Firebase Import Script for EFIL 2025 Tournament
// This script uploads tournament data to Firebase Firestore

// INSTRUCTIONS:
// 1. Install Firebase Admin SDK: npm install firebase-admin
// 2. Download your Firebase service account key from Firebase Console
// 3. Save it as 'serviceAccountKey.json' in this directory
// 4. Run: node import-data.js

const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
try {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized');
} catch (error) {
    console.error('❌ Error: Could not find serviceAccountKey.json');
    console.error('Please download it from Firebase Console:');
    console.error('Project Settings → Service Accounts → Generate new private key');
    process.exit(1);
}

const db = admin.firestore();

// Load tournament data
const tournamentData = JSON.parse(
    fs.readFileSync('./backup/tournament-data-backup.json', 'utf8')
);

async function uploadData() {
    try {
        console.log('📤 Uploading data to Firebase...');

        // Upload to efil_data/efil_data document
        await db.collection('efil_data').doc('efil_data').set(tournamentData);

        console.log('✅ Successfully uploaded tournament data!');
        console.log(`   - ${Object.keys(tournamentData.matches).length} matches`);
        console.log(`   - Data structure: matches, teams, groups, config, alerts`);

        // Verify the upload
        const doc = await db.collection('efil_data').doc('efil_data').get();
        if (doc.exists) {
            console.log('✅ Verification successful - data is in Firebase');
        } else {
            console.log('⚠️  Warning: Could not verify upload');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error uploading data:', error);
        process.exit(1);
    }
}

// Run the upload
uploadData();
