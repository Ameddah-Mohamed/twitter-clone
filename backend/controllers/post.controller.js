import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js"
import {v2 as cloudinary} from "cloudinary"


export const createPost =  async (req, res) => {
    try {
        //get the user.
        const user = req.user;
        const userId = req.user._id.toString();

        //get the date.
        let { text, img } = req.body;
        
        if(!text && !img) return res.json({error: "A post must contain either an img or a text."});


        if(img){
            const response = await cloudinary.uploader.upload(img);
            img = response.secure_url;
        } 

        //create the post
        const newPost = new Post({
            user: userId,
            text: text,
            img: img
        })

        await newPost.save();
        return res.status(201).json({newPost});
        
    } catch (error) {
        console.log("ERROR in the post controller. error: ", error.message);
        return res.json({error: "Internal Server Error"});
    }
};

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) return res.status(404).json({error: "ERROR: Post Not Found"});

        //hack: permission Check
        if(req.user._id.toString() !== post.user.toString()) return res.status(401).json({error: "You are not authorized to delete this post."});

        //_: if the post has an image, delete it from cloudinary.
        if(post.img){

            //_: we need exactly the name to delete it.
            const imgName = post.img.split('/').pop().split('/')[0];
            await cloudinary.uploader.destroy(imgName);
        };

        await Post.findByIdAndDelete(req.params.id);
        return res.status(200).json({message: "Post Deleted Successfully !"})

        
    } catch (error) {

        console.log("ERROR in the post controller", error.message);
        return res.status(500).json({error: "Internal Server Error"});
    }

};

export const commentOnPost = async (req, res) => {
    const {text} = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    try {
        const post = await Post.findById(postId);
    
        if(!post) return res.status(404).json({error: "Can't find a post with the id."})
        if(!text) return res.status(400).json({error: "A comment can't be empty."});
    
        const comment = {
            text: text,
            user: userId
        };
    
        //_: Add the comment.
        await post.comments.push(comment);
        // or this :  await Post.findByIdAndUpdate(postId, {$push : {comments: comment}});


        await post.save();
        res.status(200).json(post);


        //todo_later: Check if the other $push and pull method works or not
        
    } catch (error) {
        console.log("ERROR in deletePost function in post.controller.js", error.message);
        return res.status(500).json({error: "Internal Server ERROR"});
    }



};

export const deleteComment = async (req, res) => {
    try {
        const postId = req.params.postId;
        const commentId = req.params.commentId;

        // Fetch the post
        const post = await Post.findById(postId); // Add await here
        if (!post) return res.status(400).json({ error: "Can't Find The Post" });

        // Update the post by removing the comment
        await Post.findByIdAndUpdate(
            postId, 
            { $pull: { comments: { _id: commentId } } }, 
            { new: true } // Optionally, return the updated post
        );

        return res.status(200).json({ message: "Comment deleted successfully." });

    } catch (error) {
        console.log("ERROR in deleteComment function in post.controller.js: ", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const likeUnlikePost = async (req, res)  => {
    try {

        const postId = req.params.id;
        const userId = req.user._id;
        const user = req.user;
        const post = await Post.findById(postId);

        if(!post) return res.status(404).json({error: "Error: Post Not Found"});

        //_: if post is already liked.
        if(post.likes.includes(userId)){
            //remove the post to the user's liked Posts.
            await user.likedPosts.pull(postId);
            await user.save();

            //remove the user from the post likes.
            await post.likes.pull(userId);
            post.save();

            return res.status(200).json("Post Unliked Successfully");

        } else{
            //add the post to the user's liked Posts.
            await user.likedPosts.push(postId);
            await user.save();
            
            //add the user from the post likes.
            await post.likes.push(userId);
            await post.save();

            //_: Send notfication to the user.
            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like"
            });
            await notification.save();

            return res.status(200).json(post);
        }
        
        
       

    } catch (error) {
        console.log("ERROR in likeUnlikePost.js in pos controller. : ", error.message);
        return res.status(500).json({error: "Internal Server Error."})
    }
};

export const getAllPosts = async (req, res) => {
    try {
        //_: We use the populate function to get all user fields for later use. (basically the user itself)
        const allPosts = await Post.find().sort({createdAt: -1}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        });

        if(allPosts.length == 0) return res.status(200).json([]);
        return res.status(200).json(allPosts);

    } catch (error) {
        console.log("ERROR in getAllPosts Controller in post.controller.js. : ", error.message);
        return res.json({error: "Internal Server Error"});
    }
};

//get posts liked by the user.
export const getLikedPosts = async (req, res) => {
    try {
        const userId = req.params.id;
        
        //_: Another way to do population. ( my way xD )
        // // popualte two times. to show posts and user.
        // const user = await User.findById(userId).populate({
        //     path: 'likedPosts',  // Path to the array you want to populate
        //     populate: [
        //         {
        //             path: 'user',  // Field inside each likedPost to populate
        //             select: '-password'  // Exclude password field
        //         },
        //         {
        //             path: 'comments.user',  // Nested field inside each likedPost to populate
        //             select: '-password'  // Exclude password field
        //         }
        //     ]
        // });
        
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "Can't Find User" });

        const likedPosts = await Post.find({_id: {$in : user.likedPosts}}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        }).populate({
            path: "likes",
            select: "-password"
        });

       
        if (!likedPosts || likedPosts.length === 0) return res.json([]);

        return res.json(likedPosts);

    } catch (error) {
        console.log("ERROR in getLikedPosts function in post.controller.js: ", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

//get the posts of people that the current user follow.
export const getFollowingPosts = async (req, res) => {
    const user = req.user;
    try {

        //_: go through each post in the db if the post writer is in the following list of the user then get that post.
        const followingPosts = await Post.find({user: {$in : user.following }})
        .sort({createdAt: -1})
        .populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        }).populate({
            path: "likes",
            select: "-password"
        });

        return res.status(200).json(followingPosts);


    } catch (error) {
        console.log("ERROR in getFollowingPosts function in post.controller.js: ", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

//get someone's posts.
export const getUserPosts = async (req, res) => {
    const { username } = req.params;
    const user = await User.findOne({username});

    try {
        const userPosts = await Post.find({ user })
            .populate({
                path: "user",
                select: "-password"
            })
            .populate({
                path: "comments.user",
                select: "-password"
            })
            .populate({
                path: "likes",
                select: "-password"
        });

        return res.status(200).json(userPosts);
    } catch (error) {
        console.log("ERROR in getUserPosts function in post.controller.js: ", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

