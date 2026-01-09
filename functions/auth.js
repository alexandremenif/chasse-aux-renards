import { getFirestore } from "firebase-admin/firestore";

export const auth = async (req, res, next) => {
    const db = getFirestore();
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        console.error("Missing or invalid Authorization header");
        return res.status(401).json({ error: "Unauthorized: Missing Bearer token" });
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
            console.error("Invalid API Key");
            return res.status(401).send('Unauthorized: Invalid Token');
        }

        const tokenDoc = snapshot.docs[0];
        const tokenData = tokenDoc.data();

        // Check expiration
        if (tokenData.expiresAt) {
            const now = new Date();
            const expires = new Date(tokenData.expiresAt);
            if (now > expires) {
                 console.error("API Key Expired");
                 return res.status(401).send('Unauthorized: Token Expired');
            }
        }

        // Derive UID from path: users/{uid}/mcp_keys/{keyId}
        const userRef = tokenDoc.ref.parent.parent;
        if (!userRef) {
            console.error("Orphaned token document (no parent user)");
            return res.status(500).json({ error: "Internal Server Error: Invalid token structure" });
        }

        const uid = userRef.id;
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            console.error("User not found for this key");
            return res.status(403).json({ error: "Forbidden: User not found" });
        }

        const userData = userDoc.data();
        
        req.user = {
            uid: uid,
            isParent: userData.isParent || false,
            boardIds: userData.boardIds || [] 
        };
        
        next();
    } catch (error) {
        console.error("Auth Error:", error);
        return res.status(500).json({ error: "Internal Server Error during Auth" });
    }
};
