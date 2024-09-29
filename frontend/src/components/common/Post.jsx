import {
  FaRegComment,
  FaRegHeart,
  FaRegBookmark,
  FaTrash,
} from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import BeatLoader from "react-spinners/BeatLoader";

const Post = ({ post, feedType }) => {
  const [comment, setComment] = useState("");

  const postOwner = post.user;
  const formattedDate = post.createdAt;

  // Fetch authenticated user data
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  const isMyPost = authUser?.username === postOwner?.username;

  const [isLiked, setisLiked] = useState(false);

  useEffect(() => {
    const checkLikes = () => {
      if (post?.likes?.includes(authUser?._id)) {
        setisLiked(true); // Update isLiked state
      } else {
        setisLiked(false);
      }
    };
    checkLikes(); // Call the function inside useEffect
  }, [post, authUser, feedType]);

  // Post deletion mutation
  const { mutate: deletePost, isLoading: isDeleting } = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/posts/delete/${post._id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      return data;
    },
    onSuccess: () => {
      toast.success("Post Deleted Successfully!");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  // Post liking mutation
  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/posts/like/${post._id}`,
          {
            method: "POST",
          }
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: postComment, isPending: isCommenting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/posts/comment/${post._id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: comment }),
          }
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setComment("");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleisLikedPost = (event) => {
    event.preventDefault();
    if (isLiking) return;
    likePost(post._id);
  };

  const handleDeletePost = () => {
    deletePost();
  };

  const handlePostComment = (event) => {
    event.preventDefault();
    postComment();
  };

  return (
    <>
      <div className="flex gap-2 p-8 w-full">
        {/* profile img */}
        <Link to={`/profile/${postOwner?.username}`}>
          <img
            src={postOwner?.profileImg || "/avatar-placeholder.png"}
            className="w-10 h-10 object-cover rounded-full"
            alt="profile"
          />
        </Link>

        <div className="flex flex-col gap-1 w-full">
          <div className="flex justify-between w-full">
            <div className="flex flex-row gap-2">
              <Link
                to={`/profile/${postOwner?.username}`}
                className="font-bold"
              >
                {postOwner?.fullName}
              </Link>
              <span className="text-gray-500 flex gap-1 text-sm">
                <Link to={`/profile/${postOwner?.username}`}>
                  @{postOwner?.username}
                </Link>
                <span>·</span>
                <span>{formattedDate}</span>
              </span>
            </div>

            {isMyPost && (
              <span className="flex justify-end">
                {isDeleting ? (
                  <BeatLoader color="rgb(18, 144, 230)" />
                ) : (
                  <FaTrash
                    className="cursor-pointer hover:text-red-500"
                    onClick={handleDeletePost}
                  />
                )}
              </span>
            )}
          </div>

          {post.text && <div>{post.text}</div>}

          {post.img && (
            <img
              className="h-80 object-contain rounded-lg border border-gray-700 w-full"
              src={post.img}
              alt="post-img"
            />
          )}

          <div className="flex justify-around mt-1 w-full">
            {/* like */}
            <div
              className="flex gap-1 items-center group cursor-pointer"
              onClick={handleisLikedPost}
            >
              {isLiking ? (
                <BeatLoader size={5} color="white" />
              ) : (
                <FaRegHeart
                  size={20}
                  className={`cursor-pointer group-hover:text-pink-500 ${
                    isLiked ? "text-pink-500 w-4 h-4" : "text-slate-500"
                  }`}
                />
              )}

              <span
                className={`text-sm text-slate-500 group-hover:text-pink-500 ${
                  isLiked ? "text-pink-500" : ""
                }`}
              >
                {post.likes?.length || 0}
              </span>
            </div>

            {/* comment */}
            <div
              className="flex gap-2 cursor-pointer group"
              onClick={() =>
                document.getElementById(`comments_modal${post._id}`).showModal()
              }
            >
              <FaRegComment size={20} className="text-slate-500" />
              <span className="text-slate-500">{post.comments.length}</span>
            </div>

            {/* repost */}
            <div className="flex gap-2 cursor-pointer group">
              <BiRepost
                size={20}
                className="text-slate-500 group-hover:text-green-500"
              />
              <span className="text-slate-500 group-hover:text-green-500">
                {post?.comments?.length}
              </span>
            </div>

            {/* save */}
            <div className="flex gap-2 cursor-pointer group">
              <FaRegBookmark
                className="text-slate-500 group-hover:text-slate-200"
                size={20}
              />
              <span className="text-slate-500 group-hover:text-slate-200">
                {post.comments.length}
              </span>
            </div>
          </div>

          {/* Modal */}
          <dialog
            id={`comments_modal${post._id}`}
            className="modal mx-2 shrink"
          >
            <div className="modal-box border-[1px] rounded-lg border-slate-500 w-full">
              <form method="dialog">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                  ✕
                </button>
              </form>
              <h3 className="font-bold text-lg">COMMENTS</h3>

              <div className="flex flex-col gap-3 max-h-60 overflow-auto w-full mt-2">
                {post.comments.length > 0 ? (
                  post.comments?.map((comment) => (
                    <div className="flex flex-col gap-3" key={comment._id}>
                      <div className="flex gap-2">
                        {/* img */}

                        <img
                          className="w-8 h-8 rounded-full"
                          src={
                            comment.user.profileImg || "/avatar-placeholder.png"
                          }
                        />

                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <span className="font-normal">
                              {comment.user.fullName}
                            </span>
                            <span className="text-slate-500 text-sm">
                              @{comment.user.username}
                            </span>
                          </div>

                          <div className="text-sm text-slate-400 w-full">
                            {comment.text}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No comments yet.</p>
                )}
              </div>

              {/* Text area and Submit button */}
              <form
                className="mt-4 flex items-center gap-4"
                onSubmit={handlePostComment}
              >
                <textarea
                  className="textarea textarea-bordered w-full"
                  placeholder="Write a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-primary rounded text-white"
                >
                  {isCommenting ? <BeatLoader /> : "Comment"}
                </button>
              </form>
            </div>
          </dialog>
        </div>
      </div>
    </>
  );
};

export default Post;
