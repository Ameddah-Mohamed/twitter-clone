import Post from "./Post";
import PostSkeleton from "../../skeletons/PostSkeleton.jsx";
import { useQuery } from "@tanstack/react-query";

const Posts = ({ feedType, username, userId }) => {
  const getPostEndpoint = async () => {
    switch (feedType) {
      case "forYou":
        return `${import.meta.env.VITE_API_BASE_URL}/posts/all`;
      case "following":
        return `${import.meta.env.VITE_API_BASE_URL}/posts/following`;
      case "posts":
        return `${import.meta.env.VITE_API_BASE_URL}/posts/user/${username}`;
      case "likes":
        return `${import.meta.env.VITE_API_BASE_URL}/posts/likes/${userId}`;
      default:
        return `${import.meta.env.VITE_API_BASE_URL}/posts/all`;
    }
  };

  const { data: posts, isLoading } = useQuery({
    //note: we put the feedType, so that the useQuery hook refetches the posts when the feedType Prop Changes.
    queryKey: ["posts", feedType, username],
    queryFn: async () => {
      try {
        const POST_ENDPOINT = await getPostEndpoint(); // Correct async behavior
        const res = await fetch(POST_ENDPOINT);

        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }

        const data = await res.json();
        if (data.error) throw new Error(data.error || "Something went wrong");

        return data;
      } catch (error) {
        console.log(error.message);
        throw error;
      }
    },
  });

  return (
    <>
      {isLoading && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && posts?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && posts && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} feedType={feedType} />
          ))}
        </div>
      )}
    </>
  );
};

export default Posts;
