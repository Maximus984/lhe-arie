import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Upload, Camera, Film, Send, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

const SEED_FEED_POSTS = [
  {
    id: 'as_post_1',
    author: 'Ariana Grande',
    avatar: '💋',
    badge: '👑 Artist',
    type: 'instagram',
    mediaUrl: '/survival_horror_concept.jpg', // Uses existing image as placeholder
    caption: 'eternal sunshine deluxe out now ☀️ we can\'t be friends (wait for your love) MV concept sketches. wabi-sabi aesthetics forever.',
    likes: 1240,
    liked: false,
    comments: [
      { author: 'Maxx', text: 'Stunning visual direction on this record! 🔥' },
      { author: 'Luna V.', text: 'The boy is mine is on repeat all day!' }
    ],
    createdAt: '2 hrs ago'
  },
  {
    id: 'as_post_2',
    author: 'Maxx Forge',
    avatar: '🔥',
    badge: '⚡ Systems',
    type: 'tiktok',
    mediaUrl: '/video/headliner_canvases/tall_animated_artwork_mobile.mp4',
    caption: 'Stage testing the DMX visualizers in the virtual arena. Live audio visualizer sync sweeps are absolute magic. 🕹️💡',
    likes: 582,
    liked: false,
    comments: [
      { author: 'DJ Em', text: 'This rig layout hits different on the big screens' }
    ],
    createdAt: '5 hrs ago'
  },
  {
    id: 'as_post_3',
    author: 'DJ Em',
    avatar: '🎸',
    badge: '🎧 Events',
    type: 'tiktok',
    mediaUrl: '/video/headliner_canvases/tall_animated_artwork_mobile_alt.mp4',
    caption: 'Testing alternative canvas visual streams for the upcoming 2026 tour showcase. Ariana Grande mix. 🎹🔊',
    likes: 412,
    liked: false,
    comments: [],
    createdAt: '1 day ago'
  }
];

export default function AllStarFeed() {
  const { currentUser } = useAuth();
  const [feedType, setFeedType] = useState('instagram'); // 'instagram' | 'tiktok'
  const [posts, setPosts] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);

  // Upload Form State
  const [caption, setCaption] = useState('');
  const [postType, setPostType] = useState('instagram');
  const [presetMedia, setPresetMedia] = useState('ariana_sketch');
  const [customFile, setCustomFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');

  // Comment helper states
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
  const [commentText, setCommentText] = useState('');

  // TikTok Volume State
  const [isMuted, setIsMuted] = useState(true);

  // Load feed from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mfs_allstar_hub_posts');
    if (saved) {
      try {
        setPosts(JSON.parse(saved));
      } catch (_) {
        setPosts(SEED_FEED_POSTS);
      }
    } else {
      setPosts(SEED_FEED_POSTS);
      localStorage.setItem('mfs_allstar_hub_posts', JSON.stringify(SEED_FEED_POSTS));
    }
  }, []);

  const savePostsToStore = (updated) => {
    setPosts(updated);
    localStorage.setItem('mfs_allstar_hub_posts', JSON.stringify(updated));
  };

  const handleLike = (id) => {
    const updated = posts.map(p => {
      if (p.id === id) {
        return {
          ...p,
          liked: !p.liked,
          likes: p.liked ? p.likes - 1 : p.likes + 1
        };
      }
      return p;
    });
    savePostsToStore(updated);
  };

  const handleAddComment = (e, postId) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const authorName = currentUser ? (currentUser.displayName || currentUser.name) : 'You (Member)';
    const authorId = currentUser ? currentUser.id : 'guest_temp';

    const updated = posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...p.comments, { author: authorName, authorId, text: commentText.trim(), timestamp: new Date().toISOString() }]
        };
      }
      return p;
    });

    savePostsToStore(updated);
    setCommentText('');
    toast.success('Comment posted!');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error('File size too large. Keep under 20MB.');
      return;
    }

    setCustomFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
      // Auto-detect post type based on file type
      if (file.type.startsWith('video/')) {
        setPostType('tiktok');
      } else {
        setPostType('instagram');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!caption.trim()) {
      toast.error('Please enter a caption.');
      return;
    }

    let mediaUrl = '';
    if (customFile) {
      mediaUrl = filePreview;
    } else {
      // Use premium presets
      if (presetMedia === 'ariana_sketch') mediaUrl = '/survival_horror_concept.jpg';
      else if (presetMedia === 'stage_laser') mediaUrl = '/video/headliner_canvases/tall_animated_artwork_mobile.mp4';
      else if (presetMedia === 'bio_stage') mediaUrl = '/video/headliner_canvases/tall_animated_artwork_mobile_alt.mp4';
    }

    const newPost = {
      id: `as_post_${Date.now()}`,
      author: 'You (Member)',
      avatar: '⭐',
      badge: '🔥 Creator',
      type: postType,
      mediaUrl,
      caption: caption.trim(),
      likes: 0,
      liked: false,
      comments: [],
      createdAt: 'Just now'
    };

    const updated = [newPost, ...posts];
    savePostsToStore(updated);
    
    // Clear form
    setCaption('');
    setCustomFile(null);
    setFilePreview('');
    setUploadOpen(false);
    toast.success('Post shared successfully to Hub! 🚀');
  };

  return (
    <div className="flex flex-col gap-6 w-full text-left">
      {/* Top action row */}
      <div className="flex justify-between items-center bg-black/30 p-2.5 rounded-2xl border border-white/5 backdrop-blur-sm">
        {/* Feed tab selections */}
        <div className="flex gap-1">
          <button
            onClick={() => { setFeedType('instagram'); setActiveCommentsPostId(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition flex items-center gap-1.5 ${
              feedType === 'instagram'
                ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400'
                : 'text-white/40 hover:text-white/70 border border-transparent'
            }`}
          >
            <Camera size={13} />
            Instagram Feed
          </button>
          <button
            onClick={() => { setFeedType('tiktok'); setActiveCommentsPostId(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition flex items-center gap-1.5 ${
              feedType === 'tiktok'
                ? 'bg-purple-500/15 border border-purple-500/30 text-purple-400'
                : 'text-white/40 hover:text-white/70 border border-transparent'
            }`}
          >
            <Film size={13} />
            TikTok Reels
          </button>
        </div>

        {/* Upload Trigger Button */}
        <button
          onClick={() => setUploadOpen(!uploadOpen)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-neutral-950 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
        >
          <Upload size={13} />
          Upload Media
        </button>
      </div>

      {/* Upload Dialog Form */}
      <AnimatePresence>
        {uploadOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel rounded-3xl border border-white/10 p-5 bg-[#0a0a0f] flex flex-col gap-4 overflow-hidden"
          >
            <h3 className="text-sm font-display font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              🚀 Publish to All-Star Hub
            </h3>

            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-3.5">
              {/* Type Select */}
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-xs text-white/75 font-mono cursor-pointer">
                  <input
                    type="radio"
                    name="postType"
                    checked={postType === 'instagram'}
                    onChange={() => setPostType('instagram')}
                    className="accent-cyan-400"
                  />
                  Instagram Image
                </label>
                <label className="flex items-center gap-1.5 text-xs text-white/75 font-mono cursor-pointer">
                  <input
                    type="radio"
                    name="postType"
                    checked={postType === 'tiktok'}
                    onChange={() => setPostType('tiktok')}
                    className="accent-purple-400"
                  />
                  TikTok Video
                </label>
              </div>

              {/* Caption */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono text-white/30 uppercase">Caption</span>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="What is the story behind this media drop?"
                  maxLength={180}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 resize-none h-16"
                />
              </div>

              {/* Media Selection (Presets vs Custom Upload) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="text-[10px] font-mono text-white/30 uppercase">Upload Media file</span>
                  <label className="w-full py-6 bg-white/3 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-cyan-500/40 transition">
                    <Upload size={20} className="text-white/40 mb-1" />
                    <span className="text-[10px] font-mono text-white/50">
                      {customFile ? customFile.name : 'Select file (img / video)'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <span className="text-[10px] font-mono text-white/30 uppercase">Or select an Aesthetic Preset</span>
                  <select
                    value={presetMedia}
                    disabled={!!customFile}
                    onChange={(e) => setPresetMedia(e.target.value)}
                    className="w-full p-3 bg-[#0a0a0f] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400/50"
                  >
                    <option value="ariana_sketch">Ariana Grande Sketch (Image)</option>
                    <option value="stage_laser">Stage Laser Rig Loop (Video)</option>
                    <option value="bio_stage">Bio Forge Arena Strobe (Video)</option>
                  </select>
                  {customFile && (
                    <span className="text-[9px] font-mono text-yellow-400">
                      Using custom uploaded file instead of preset.
                    </span>
                  )}
                </div>
              </div>

              {/* Preview */}
              {filePreview && (
                <div className="relative w-full max-h-36 rounded-xl overflow-hidden border border-white/15 bg-black flex justify-center items-center">
                  {customFile.type.startsWith('video/') ? (
                    <video src={filePreview} muted className="max-h-36 object-contain" />
                  ) : (
                    <img src={filePreview} alt="Preview" className="max-h-36 object-contain" />
                  )}
                  <button
                    type="button"
                    onClick={() => { setCustomFile(null); setFilePreview(''); }}
                    className="absolute top-2 right-2 p-1 bg-black/60 rounded-lg text-white/50 hover:text-white"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => { setUploadOpen(false); setCustomFile(null); setFilePreview(''); }}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-white/40 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-400 text-neutral-950 font-bold rounded-xl text-xs font-mono hover:bg-cyan-300 transition"
                >
                  Post to Hub
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Feed Content Panel */}
      <div className="w-full">
        {feedType === 'instagram' ? (
          /* INSTAGRAM GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts
              .filter(p => p.type === 'instagram')
              .map(post => (
                <div
                  key={post.id}
                  className="glass-panel rounded-3xl overflow-hidden border border-white/8 bg-neutral-950/40 flex flex-col justify-between"
                >
                  {/* Post Header */}
                  <div className="p-4 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg">
                        {post.avatar}
                      </div>
                      <div>
                        <h4 className="text-xs font-display font-bold text-white leading-tight flex items-center gap-1.5">
                          {post.author}
                          <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                            {post.badge}
                          </span>
                        </h4>
                        <span className="text-[9px] font-mono text-white/20">{post.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Media Area */}
                  <div className="relative aspect-square w-full bg-black flex items-center justify-center overflow-hidden border-b border-white/5">
                    {post.mediaUrl.startsWith('data:video/') || post.mediaUrl.endsWith('.mp4') ? (
                      <video src={post.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                    ) : (
                      <img src={post.mediaUrl} alt="Post content" className="w-full h-full object-cover" />
                    )}
                  </div>

                  {/* Caption & Actions */}
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-1 text-xs transition duration-300 ${
                            post.liked ? 'text-red-400 scale-110' : 'text-white/40 hover:text-red-400'
                          }`}
                        >
                          <Heart size={16} fill={post.liked ? 'currentColor' : 'none'} />
                          <span className="font-mono text-[10px]">{post.likes}</span>
                        </button>

                        <button
                          onClick={() => setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)}
                          className={`flex items-center gap-1 text-xs transition text-white/40 hover:text-cyan-400 ${
                            activeCommentsPostId === post.id ? 'text-cyan-400' : ''
                          }`}
                        >
                          <MessageCircle size={16} />
                          <span className="font-mono text-[10px]">{post.comments.length}</span>
                        </button>
                      </div>

                      <button onClick={() => toast.success('Link copied to clipboard!')} className="text-white/30 hover:text-white">
                        <Share2 size={15} />
                      </button>
                    </div>

                    <p className="text-xs text-white/70 leading-relaxed font-light break-words">
                      <span className="font-bold text-white mr-1.5">{post.author}</span>
                      {post.caption}
                    </p>
                  </div>

                  {/* Interactive Comments Section */}
                  {activeCommentsPostId === post.id && (
                    <div className="border-t border-white/5 bg-black/45 p-4 flex flex-col gap-3">
                      <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">
                        Comments ({post.comments.length})
                      </span>
                      
                      <div className="max-h-28 overflow-y-auto flex flex-col gap-2 pr-1">
                        {post.comments.length === 0 ? (
                          <div className="text-[10px] font-mono text-white/20 italic">No comments yet. Write one below!</div>
                        ) : (
                          post.comments.map((c, ci) => (
                            <div key={ci} className="text-xs">
                              <span className="font-bold text-cyan-400/90 mr-1">{c.author}:</span>
                              <span className="text-white/60 font-light">{c.text}</span>
                            </div>
                          ))
                        )}
                      </div>

                      <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Write a comment..."
                          className="flex-grow p-2 bg-white/5 border border-white/8 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none"
                        />
                        <button type="submit" className="p-2 bg-cyan-500 text-neutral-950 rounded-xl hover:bg-cyan-400 transition">
                          <Send size={12} />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
          </div>
        ) : (
          /* TIKTOK FEED (Vertical Reel Streams) */
          <div className="flex flex-col gap-8 max-w-sm mx-auto">
            {posts
              .filter(p => p.type === 'tiktok')
              .map(post => {
                return (
                  <TikTokReelCard
                    key={post.id}
                    post={post}
                    isMuted={isMuted}
                    toggleMute={() => setIsMuted(!isMuted)}
                    handleLike={() => handleLike(post.id)}
                    handleAddComment={handleAddComment}
                    commentText={commentText}
                    setCommentText={setCommentText}
                    activeCommentsPostId={activeCommentsPostId}
                    setActiveCommentsPostId={setActiveCommentsPostId}
                  />
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component for clean TikTok styling/video looping
function TikTokReelCard({
  post,
  isMuted,
  toggleMute,
  handleLike,
  handleAddComment,
  commentText,
  setCommentText,
  activeCommentsPostId,
  setActiveCommentsPostId
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 bg-[#060608] relative aspect-[9/16] w-full max-h-[580px] shadow-2xl flex flex-col justify-end">
      {/* Video element */}
      <video
        ref={videoRef}
        src={post.mediaUrl}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 cursor-pointer"
        onClick={togglePlay}
      />

      {/* Dark vignette gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none z-10" />

      {/* Right side floating controls */}
      <div className="absolute right-4 bottom-24 z-20 flex flex-col items-center gap-5">
        {/* Author Avatar bubble */}
        <div className="w-10 h-10 rounded-full bg-[#10B981]/15 border-2 border-cyan-400 flex items-center justify-center text-lg shadow-md">
          {post.avatar}
        </div>

        {/* Heart/Like */}
        <button
          onClick={handleLike}
          className="flex flex-col items-center gap-1.5 text-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
        >
          <div className={`p-2.5 rounded-full transition-transform duration-300 ${post.liked ? 'bg-red-500/20 text-red-400 scale-110' : 'bg-black/50 text-white/70 hover:text-red-400 hover:bg-black/80'}`}>
            <Heart size={18} fill={post.liked ? 'currentColor' : 'none'} />
          </div>
          <span className="text-[10px] font-mono font-bold leading-none">{post.likes}</span>
        </button>

        {/* Comment button */}
        <button
          onClick={() => setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)}
          className="flex flex-col items-center gap-1.5 text-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
        >
          <div className={`p-2.5 rounded-full transition-colors ${activeCommentsPostId === post.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-black/50 text-white/70 hover:text-cyan-400 hover:bg-black/80'}`}>
            <MessageCircle size={18} />
          </div>
          <span className="text-[10px] font-mono font-bold leading-none">{post.comments.length}</span>
        </button>

        {/* Mute indicator */}
        <button
          onClick={toggleMute}
          className="p-2.5 bg-black/50 hover:bg-black/80 rounded-full text-white/70 hover:text-cyan-400 transition"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {/* Bottom overlay: username, caption, music tag */}
      <div className="relative z-20 p-5 flex flex-col gap-2 text-left pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white font-display">@{post.author.replace(' ', '')}</span>
          <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 uppercase tracking-widest">
            {post.badge.split(' ')[1]}
          </span>
        </div>
        <p className="text-xs text-white/85 font-light leading-relaxed break-words pr-8 line-clamp-3">
          {post.caption}
        </p>

        {/* Rotating Music Track Tag */}
        <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-cyan-400/80">
          <span className="animate-spin text-xs" style={{ animationDuration: '3s' }}>💿</span>
          <span className="overflow-hidden whitespace-nowrap">
            Original Audio — Ariana Grande & Maxx Forge
          </span>
        </div>
      </div>

      {/* Play/Pause Center Indicator */}
      {!isPlaying && (
        <div onClick={togglePlay} className="absolute inset-0 z-10 flex items-center justify-center pointer-events-auto bg-black/10 cursor-pointer">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 0.8 }} className="p-5 rounded-full bg-black/60 text-white">
            <Play size={28} fill="currentColor" />
          </motion.div>
        </div>
      )}

      {/* Interactive Comments Dialog drawer inside TikTok widget */}
      <AnimatePresence>
        {activeCommentsPostId === post.id && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute inset-x-0 bottom-0 h-[65%] z-30 bg-[#0c0c10]/95 border-t border-white/10 rounded-t-3xl p-4 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-mono font-bold text-white uppercase">Comments ({post.comments.length})</span>
              <button
                onClick={() => setActiveCommentsPostId(null)}
                className="text-[10px] font-mono text-white/30 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="flex-grow overflow-y-auto flex flex-col gap-3 py-3 scrollbar-thin">
              {post.comments.length === 0 ? (
                <div className="text-[10px] font-mono text-white/20 italic text-center py-6">No comments yet. Write one below!</div>
              ) : (
                post.comments.map((c, ci) => (
                  <div key={ci} className="text-xs">
                    <span className="font-bold text-cyan-400 mr-1.5">{c.author}:</span>
                    <span className="text-white/70 font-light">{c.text}</span>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex items-center gap-2 pt-2 border-t border-white/5">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-grow p-2.5 bg-white/5 border border-white/8 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none"
              />
              <button type="submit" className="p-2.5 bg-cyan-500 text-neutral-950 rounded-xl hover:bg-cyan-400 transition">
                <Send size={12} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
