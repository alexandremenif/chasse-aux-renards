import { getFirestore } from "firebase-admin/firestore";

// Generic error to prevent information disclosure
const AUTH_ERROR = { error: "Unauthorized" };

export const auth = async (req, res, next) => {
    const db = getFirestore();
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        console.error("Auth failed: Missing or invalid Authorization header");
        return res.status(401).json(AUTH_ERROR);
    }

    const token = authHeader.split(' ')[1];

    try {
        // Query collectionGroup 'mcp_keys' by token field (requires Firestore index)
        // Structure: users/{uid}/mcp_keys/{keyId} with { token: "...", expiresAt: "..." }
        const snapshot = await db.collectionGroup("mcp_keys")
            .where("token", "==", token)
            .limit(1)
            .get();

        if (snapshot.empty) {
            console.error("Auth failed: Invalid API key");
            return res.status(401).json(AUTH_ERROR);
        }

        const tokenDoc = snapshot.docs[0];
        const tokenData = tokenDoc.data();

        // Check expiration
        if (tokenData.expiresAt) {
            const now = new Date();
            const expires = new Date(tokenData.expiresAt);
            if (now > expires) {
                 console.error("Auth failed: Expired API key");
                 return res.status(401).json(AUTH_ERROR);
            }
        }

        // Derive UID from path: users/{uid}/mcp_keys/{keyId}
        const userRef = tokenDoc.ref.parent.parent;
        if (!userRef) {
            console.error("Auth failed: Orphaned token document");
            return res.status(401).json(AUTH_ERROR);
        }

        const uid = userRef.id;
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            console.error("Auth failed: User not found for key");
            return res.status(401).json(AUTH_ERROR);
        }

        const userData = userDoc.data();
        
        req.user = {
            uid: uid,
            isParent: userData.isParent || false,
            boardIds: userData.boardIds || [] 
        };
        
        next();
    } catch (error) {
        console.error("Auth failed: Unexpected error", error);
        return res.status(401).json(AUTH_ERROR);
    }
};
