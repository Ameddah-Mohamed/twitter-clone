import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";

const CreatePost = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const imgRef = useRef(null);

  const data = {
    profileImg: "/avatars/boy1.png",
  };

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  //note: mutation function.
  const {
    mutate: createPost,
    isPending,
    isError,
  } = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch("/api/posts/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            img,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data;
      } catch (error) {
        console.log(error.message);
        throw new Error(error);
      }
    },
    onSuccess: () => {
      setText("");
      setImg(null);
      toast.success("Post Created Successfully!");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createPost();
  };

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImg(reader.result);
      };
      console.log(file);
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 p-5 border-b-[1px] border-slate-500">
        <div>
          <img
            className="w-9 h-9 object-cover rounded-full"
            src={authUser.profileImg || "/avatar-placeholder.png"}
            alt="profileImg"
          />
        </div>

        <form className="flex flex-col w-full" onSubmit={handleSubmit}>
          <textarea
            className="textarea w-full p-0 text-lg resize-none border-none focus:outline-none  border-gray-800"
            placeholder="What is happening?!"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />

          {img && (
            <span className="flex flex-col mx-auto">
              <IoCloseSharp
                onClick={() => {
                  setImg(null);
                  //note: imgRef.current refers to the file input element itself, not just its value. If you set imgRef.current = null;, you'd lose the reference to the DOM element.
                  //note:When you assign null to imgRef.current.value, you're clearing the file input field. This allows the user to re-select the same file again if they wish. If you don't do this, the input field will retain the previous file, and selecting the same file won't trigger the onChange event.
                  imgRef.current.value = null;
                }}
                size={23}
                className="self-end"
              />
              <img
                src={img}
                className="w-[350px] h-auto rounded-md"
                alt="post-img"
              />
            </span>
          )}

          <div className="flex flex-row justify-between w-full">
            <div className="flex gap-1 items-center">
              <CiImageOn
                className="fill-primary w-6 h-6 cursor-pointer"
                onClick={() => imgRef.current.click()}
              />
              <BsEmojiSmileFill className="fill-primary w-5 h-5 cursor-pointer" />
            </div>
            <input
              type="file"
              ref={imgRef}
              accept="image/*"
              hidden
              onChange={handleImgChange}
            />
            <button
              type="submit"
              className="bg-custom-blue hover:bg-hoverBlue active:bg-activeBlue text-white font-bold py-2 px-4 rounded-full transition duration-300 ease"
            >
              {isPending ? "Posting..." : "Post"}
            </button>
          </div>
          {isError && <div className="text-red-500">Something went wrong</div>}
        </form>
      </div>
    </>
  );
};
export default CreatePost;
