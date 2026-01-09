import { getFirestore } from "firebase-admin/firestore";


const getDb = () => getFirestore();


export class BoardService {
    static async listBoards(user) {
        if (user.boardIds.length === 0) return [];
        
        const refs = user.boardIds.map(id => getDb().collection("boards").doc(id));
        const boards = await getDb().getAll(...refs);
        
        return boards
            .filter(doc => doc.exists)
            .map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    owner: data.owner,
                    totalToken: data.totalToken
                };
            });
    }

    static async listRewards(user, boardId) {
        this.verifyBoardAccess(user, boardId);
        const rewardsSnap = await getDb().collection("boards").doc(boardId).collection("rewards").get();
        const rewards = [];
        rewardsSnap.forEach(doc => {
             rewards.push({ id: doc.id, ...doc.data() });
        });
        return rewards;
    }

    static async addReward(user, boardId, { name, cost, icon }) {
        this.verifyBoardAccess(user, boardId);
        const newReward = {
            name,
            cost,
            icon: icon || "🎁",
            pending: false,
            createdAt: new Date()
        };
        const docRef = await getDb().collection("boards").doc(boardId).collection("rewards").add(newReward);
        return docRef.id;
    }

    static async deleteReward(user, boardId, rewardId) {
        this.verifyBoardAccess(user, boardId);
        await getDb().collection("boards").doc(boardId).collection("rewards").doc(rewardId).delete();
    }

    static async updateReward(user, boardId, rewardId, { name, cost, icon }) {
        this.verifyBoardAccess(user, boardId);
        const boardRef = getDb().collection("boards").doc(boardId);
        const rewardRef = boardRef.collection("rewards").doc(rewardId);

        await getDb().runTransaction(async (transaction) => {
            const boardDoc = await transaction.get(boardRef);
            const rewardDoc = await transaction.get(rewardRef);

            if (!boardDoc.exists || !rewardDoc.exists) throw new Error("Board or Reward not found");

            const boardData = boardDoc.data();
            const rewardData = rewardDoc.data();
            const updates = {};

            if (name) updates.name = name;
            if (icon) updates.icon = icon;
            if (cost !== undefined) {
                updates.cost = cost;
                // Auto-approve logic if cost increases beyond totalToken logic
                if (cost > rewardData.cost && rewardData.pending) {
                     const allRewards = await transaction.get(boardRef.collection("rewards").where("pending", "==", true));
                     let pendingSum = 0;
                     allRewards.forEach(doc => {
                         if (doc.id === rewardId) return; 
                         pendingSum += doc.data().cost;
                     });
                     const newRequirement = pendingSum + cost;
                     if (boardData.totalToken < newRequirement) {
                         updates.pending = false; 
                     }
                }
            }
            transaction.update(rewardRef, updates);
        });
    }

    static verifyBoardAccess(user, boardId) {
        if (!user.boardIds.includes(boardId)) {
            throw new Error(`Access denied: User does not have access to board ${boardId}`);
        }
    }
}
