import express from "express"
import protectRoute from "../middleware/protectRoute.js"
import { getUserProfile, updateUser, followUnfollowUser, getSuggestedUsers } from "../controllers/user.cotroller.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/suggested", protectRoute ,getSuggestedUsers);
router.post("/follow/:id", protectRoute ,followUnfollowUser);
router.post("/update", protectRoute ,updateUser);

export default router;