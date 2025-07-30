import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Comment out useAuth for homepage-only flow
// import { useAuth } from './AuthContext';
import { HeartIcon, ChatBubbleLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API}/posts`, {
        content: content.trim(),
        image: image || undefined
      });
      
      onPostCreated(response.data);
      setContent('');
      setImage('');
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-gray-50 transition-colors"
        >
          <PlusIcon className="w-5 h-5 text-gray-400" />
          <span className="text-gray-600">Share what's on your mind...</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening in Iowa?"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            rows={3}
            required
          />
          
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          {image && (
            <div className="relative">
              <img src={image} alt="Preview" className="max-h-48 rounded-lg" />
              <button
                type="button"
                onClick={() => setImage('')}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setContent('');
                setImage('');
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const PostItem = ({ post, onLike }) => {
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.likes);

  const handleLike = async () => {
    try {
      const response = await axios.post(`${API}/posts/${post.id}/like`);
      const isLiked = response.data.liked;
      
      setLiked(isLiked);
      setLocalLikes(prev => isLiked ? prev + 1 : prev - 1);
      
      if (onLike) onLike(post.id, isLiked);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {post.user.profile_image ? (
            <img
              className="h-12 w-12 rounded-full object-cover"
              src={post.user.profile_image}
              alt={post.user.name}
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {post.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-grow">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">{post.user.name}</h3>
            <span className="text-sm text-gray-500">{formatDate(post.created_at)}</span>
          </div>
          
          <p className="mt-2 text-gray-800 whitespace-pre-wrap">{post.content}</p>
          
          {post.image && (
            <div className="mt-4">
              <img
                src={post.image}
                alt="Post content"
                className="max-w-full h-auto rounded-lg shadow-sm"
              />
            </div>
          )}
          
          <div className="flex items-center space-x-6 mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={handleLike}
              className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
            >
              {liked ? (
                <HeartIconSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
              <span className="text-sm">{localLikes}</span>
            </button>
            
            <button className="flex items-center space-x-2 text-gray-500 hover:text-indigo-500 transition-colors">
              <ChatBubbleLeftIcon className="w-5 h-5" />
              <span className="text-sm">{post.comments}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  // Comment out useAuth for homepage-only flow
  // const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API}/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleLike = (postId, liked) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes: liked ? post.likes + 1 : post.likes - 1 }
        : post
    ));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
            <div className="flex space-x-4">
              <div className="rounded-full bg-gray-200 h-12 w-12"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Activity Feed</h2>
      
      {/* {user && (
        <CreatePost onPostCreated={handlePostCreated} />
      )} */}
      
      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500 text-lg">No posts yet</p>
          <p className="text-gray-400 text-sm mt-2">Be the first to share something!</p>
        </div>
      ) : (
        <div>
          {posts.map(post => (
            <PostItem
              key={post.id}
              post={post}
              onLike={handleLike}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;