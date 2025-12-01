const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");

setGlobalOptions({ region: "europe-west9" });

initializeApp();
const db = getFirestore();

// Helper function to verify authentication and board access
async function getUserAndVerifyBoardAccess(uid, boardId) {
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        throw new HttpsError('unauthenticated', 'User not found.');
    }

    const userData = userDoc.data();
    if (!userData.boardIds || !userData.boardIds.includes(boardId)) {
        throw new HttpsError('permission-denied', 'User does not have access to this board.');
    }

    return userData;
}

exports.addToken = onCall(async (request) => {
    // Authentication check
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const { boardId, sequence } = request.data;
    console.log(`[addToken] Called with boardId: ${boardId}, User: ${request.auth.uid}`);

    if (!boardId) {
        throw new HttpsError('invalid-argument', 'The function must be called with a boardId.');
    }

    // Authorization check
    const user = await getUserAndVerifyBoardAccess(request.auth.uid, boardId);
    if (!user.isParent) {
        throw new HttpsError('permission-denied', 'Only parents can add tokens.');
    }

    const boardRef = db.collection('boards').doc(boardId);

    // Transaction to ensure atomicity
    return db.runTransaction(async (transaction) => {
        const boardDoc = await transaction.get(boardRef);
        if (!boardDoc.exists) {
            console.error(`[addToken] Board ${boardId} not found`);
            throw new HttpsError('not-found', 'Board not found');
        }

        const data = boardDoc.data();
        const currentTokens = data.totalToken || 0;
        console.log(`[addToken] Current tokens: ${currentTokens}, New tokens: ${currentTokens + 1}`);

        transaction.update(boardRef, {
            totalToken: currentTokens + 1,
            totalToken: currentTokens + 1,
            lastTokenUpdateTime: FieldValue.serverTimestamp(),
            [`lastActionSequences.${request.auth.uid}`]: sequence || 0
        });

        return { success: true, newTotal: currentTokens + 1 };
    });
});

exports.toggleReward = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const { boardId, rewardId, sequence } = request.data;
    if (!boardId || !rewardId) {
        throw new HttpsError('invalid-argument', 'The function must be called with a boardId and rewardId.');
    }

    // Authorization check (Access only)
    await getUserAndVerifyBoardAccess(request.auth.uid, boardId);

    const boardRef = db.collection('boards').doc(boardId);

    return db.runTransaction(async (transaction) => {
        const boardDoc = await transaction.get(boardRef);
        if (!boardDoc.exists) {
            throw new HttpsError('not-found', 'Board not found');
        }

        const boardData = boardDoc.data();
        const reward = boardData.rewards[rewardId];

        if (!reward) {
            throw new HttpsError('not-found', 'Reward not found');
        }

        const newTotalToken = reward.pending
            ? boardData.totalToken + reward.cost
            : boardData.totalToken - reward.cost;

        if (newTotalToken < 0 && !reward.pending) {
            throw new HttpsError('failed-precondition', 'Not enough tokens');
        }

        const newRewards = {
            ...boardData.rewards,
            [rewardId]: { ...reward, pending: !reward.pending }
        };

        transaction.update(boardRef, {
            rewards: newRewards,
            rewards: newRewards,
            totalToken: newTotalToken,
            [`lastActionSequences.${request.auth.uid}`]: sequence || 0
        });

        return { success: true };
    });
});

exports.confirmReward = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const { boardId, rewardId, sequence } = request.data;
    if (!boardId || !rewardId) {
        throw new HttpsError('invalid-argument', 'The function must be called with a boardId and rewardId.');
    }

    // Authorization check
    const user = await getUserAndVerifyBoardAccess(request.auth.uid, boardId);
    if (!user.isParent) {
        throw new HttpsError('permission-denied', 'Only parents can confirm rewards.');
    }

    const boardRef = db.collection('boards').doc(boardId);
    const rewardPendingField = `rewards.${rewardId}.pending`;

    await boardRef.update({
        [rewardPendingField]: false,
        [`lastActionSequences.${request.auth.uid}`]: sequence || 0
    });

    return { success: true };
});
