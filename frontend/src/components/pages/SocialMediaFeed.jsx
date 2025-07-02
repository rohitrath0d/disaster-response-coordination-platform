import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardContent } from "../ui/card";
import { io } from "socket.io-client";

const baseUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("authToken") || import.meta.env.VITE_JWT_SECRET;

const socket = io(baseUrl, {
  withCredentials: true,
  transports: ["websocket", "polling"],
  extraHeaders: {
    Authorization: `Bearer ${token}`,
  },
});

const SocialMediaFeed = () => {
  const [posts, setPosts] = useState([]);
  // const [query, setQuery] = useState("flood");
  const [query, setQuery] = useState("disaster");
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${baseUrl}/api/bluesky/bluesky-posts?q=${query}`);
      setPosts(data.data || []);
    } catch (err) {
      console.error("Bluesky fetch failed", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    const handleNewPost = (event) => {
      if (!event?.data) return;
      setPosts((prev) => [event.data, ...prev]);
    };

    socket.on("social_media_updated", handleNewPost);
    return () => socket.off("social_media_updated", handleNewPost);
  }, []);

  return (
    <div className="p-5   space-y-4 max-w-7xl mx-auto">
      <h2 className="text-2xl text-center font-bold mb-4">📢 Social Media Feed </h2>

      <div className="flex gap-2 items-center mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border px-3 py-2 rounded w-full"
          placeholder="Search topic (e.g. flood, fire)"
        />
        <button
          onClick={fetchPosts}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          🔍 Fetch Posts
        </button>
      </div>

      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        posts.map((post, idx) => {
          const author = post.author?.displayName || post.author?.handle || "Unknown";
          const avatar = post.author?.avatar;
          const text = post.record?.text?.slice(0, 300) || "";
          const createdAt = new Date(post.record?.createdAt).toLocaleString();
          const embed = post.embed?.external;

          return (
            <Card key={idx} className="shadow-sm border">
              <CardHeader className="flex gap-3 items-start">
                {avatar && (
                  <img
                    src={avatar}
                    alt={author}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="font-semibold">{author}</div>
                  <div className="text-sm text-gray-500">{createdAt}</div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="mb-2 text-gray-800 whitespace-pre-line">{text}</p>

                {embed?.uri && (
                  <div className="mt-2 border rounded p-3 bg-gray-50 hover:bg-gray-100">
                    <a
                      href={embed.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-semibold underline"
                    >
                      {embed.title}
                    </a>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                      {embed.description?.replace(/<[^>]+>/g, "")}
                    </p>
                    {embed.thumb && (
                      <img
                        src={embed.thumb}
                        alt="thumb"
                        className="mt-2 rounded w-full max-h-48 object-cover"
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default SocialMediaFeed;
