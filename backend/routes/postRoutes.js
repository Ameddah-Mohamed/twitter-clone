import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { createPost, deletePost, commentOnPost, deleteComment, likeUnlikePost, getAllPosts, getLikedPosts, getFollowingPosts, getUserPosts } from "../controllers/post.controller.js";

const router = express.Router();

router.get("/all", protectRoute, getAllPosts);
router.get("/likes/:id", protectRoute,getLikedPosts); //id => user._id  since liked posts of user.
router.get("/following",protectRoute ,getFollowingPosts); //get the posts of people that the current user follow.
router.get("/user/:username", protectRoute, getUserPosts);

router.post("/create", protectRoute,createPost);
router.post("/like/:id", protectRoute,likeUnlikePost); // id => post._id
router.post("/comment/:id", protectRoute, commentOnPost); // id => post._id

router.delete("/delete/:id", protectRoute, deletePost); // id => post._id
router.delete('/delete/:postId/comments/:commentId', protectRoute, deleteComment);


export default router;