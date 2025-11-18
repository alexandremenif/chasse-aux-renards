
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

// Manually set the environment variables to point to the running emulators.
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

// Initialize the admin SDK.
initializeApp({
  projectId: 'la-chasse-aux-renards',
});

// Get the Auth service and the NAMED Firestore database instance.
const auth = getAuth();
const db = getFirestore('chasse-aux-renards');

async function seedDatabase() {
  console.log('Attempting to seed database with users and data...');

  const usersData = [
    {
      uid: 'parent-uid',
      googleUid: 'google-uid-parent',
      email: 'john.doe@example.com',
      displayName: 'John Doe',
    },
    {
      uid: 'child1-uid',
      googleUid: 'google-uid-child1',
      email: 'jane.doe@example.com',
      displayName: 'Jane Doe',
    },
    {
      uid: 'child2-uid',
      googleUid: 'google-uid-child2',
      email: 'jimmy.doe@example.com',
      displayName: 'Jimmy Doe',
    }
  ];

  const usersToImport = usersData.map(user => ({
    uid: user.uid,
    email: user.email,
    emailVerified: true,
    displayName: user.displayName,
    providerData: [
      {
        uid: user.googleUid,
        email: user.email,
        displayName: user.displayName,
        providerId: 'google.com',
      },
    ],
  }));

  try {
    const result = await auth.importUsers(usersToImport, {
      hash: { algorithm: 'HMAC_SHA256', key: Buffer.from('secret') },
    });
    console.log(`Successfully imported ${result.successCount} users.`);
    if (result.failureCount > 0) {
      console.error('Failed to import some users:', result.errors);
    }
  } catch (error) {
    console.error('Error importing users (they might already exist):', error.message);
  }

  const [parentUser, child1User, child2User] = usersData;

  // --- Create Firestore User Documents ---
  const parentRef = db.collection('users').doc(parentUser.uid);
  await parentRef.set({
    isParent: true,
    boardIds: [child1User.uid, child2User.uid]
  });
  console.log(`Created Firestore document for parent: ${parentUser.displayName}`);

  const child1Ref = db.collection('users').doc(child1User.uid);
  await child1Ref.set({
    isParent: false,
    boardIds: [child1User.uid]
  });
  console.log(`Created Firestore document for child: ${child1User.displayName}`);

  const child2Ref = db.collection('users').doc(child2User.uid);
  await child2Ref.set({
    isParent: false,
    boardIds: [child2User.uid]
  });
  console.log(`Created Firestore document for child: ${child2User.displayName}`);

  // --- Create Boards ---
  const board1Ref = db.collection('boards').doc(child1User.uid);
  await board1Ref.set({
    owner: child1User.displayName,
    totalToken: 25,
    rewards: {
      [uuidv4()]: { name: 'Une glace', cost: 10, pending: false, icon: '🍦' },
      [uuidv4()]: { name: 'Un nouveau jouet', cost: 50, pending: false, icon: '🎁' },
      [uuidv4()]: { name: 'Regarder un film', cost: 15, pending: true, icon: '🎬' },
    }
  });
  console.log(`Created board for ${child1User.displayName}`);

  const board2Ref = db.collection('boards').doc(child2User.uid);
  await board2Ref.set({
    owner: child2User.displayName,
    totalToken: 5,
    rewards: {
      [uuidv4()]: { name: 'Aller au parc', cost: 5, pending: false, icon: '🌳' },
      [uuidv4()]: { name: 'Une heure de jeu vidéo', cost: 20, pending: false, icon: '🎮' },
      [uuidv4()]: { name: 'Une nouvelle peluche', cost: 15, pending: false, icon: '🧸' },
    }
  });
  console.log(`Created board for ${child2User.displayName}`);

  console.log('Database seeding completed successfully!');
}

seedDatabase().catch(error => {
  console.error("An unexpected error occurred during seeding:", error);
  process.exit(1);
});
