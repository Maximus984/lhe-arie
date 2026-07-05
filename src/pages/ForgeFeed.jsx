import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { getChannels, getPosts, createPost, toggleReaction, deletePost, addChannel } from '../data/feed.js';
import { ArrowLeft, Hash, MessageSquare, Plus, Send, Smile, Image, Pin, Trash2, Shield, Radio, Volume2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const EMOJIS = ['🔥', '❤️', '🎵', '🎤', '😂', '😮', '👏', '👀'];

export default function ForgeFeed() {
  const { currentUser, can } = useAuth();
  
  // Data layers
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [posts, setPosts] = useState([]);

  // Form inputs
  const [newMsg, setNewMsg] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelEmoji, setNewChannelEmoji] = useState('💬');
  const [showAddChannel, setShowAddChannel] = useState(false);

  // Load channels on mount
  useEffect(() => {
    const isStaffOrFounder = can('post_channel') || can('manage_channels');
    const chs = getChannels(isStaffOrFounder);
    setChannels(chs);
    if (chs.length > 0 && !activeChannel) {
      setActiveChannel(chs[0]);
    }
  }, []);

  // Sync posts when active channel changes
  useEffect(() => {
    if (activeChannel) {
      setPosts(getPosts(activeChannel.id));
    }
  }, [activeChannel]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeChannel) return;

    // Check post permissions
    const isStaffOrFounder = can('post_channel') || can('manage_channels');
    if (!activeChannel.allowMemberPost && !isStaffOrFounder) {
      return toast.error('This channel is read-only for community members.');
    }

    const postData = {
      channelId: activeChannel.id,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorBadge: currentUser.badge,
      authorAvatar: currentUser.avatar,
      type: 'text',
      content: newMsg,
    };

    createPost(postData);
    setNewMsg('');
    setPosts(getPosts(activeChannel.id));
    toast.success('Message posted!');
  };

  const handleReact = (postId, emoji) => {
    if (!can('react_feed')) return toast.error('Permission denied.');
    const updated = toggleReaction(postId, emoji, currentUser.id);
    setPosts(getPosts(activeChannel.id));
  };

  const handleDelete = (postId) => {
    deletePost(postId);
    setPosts(getPosts(activeChannel.id));
    toast.success('Message removed');
  };

  const handleCreateChannel = (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    if (!can('manage_channels')) return toast.error('Only founder can manage channels.');

    const chanData = {
      name: newChannelName.toLowerCase().replace(/\s+/g, '-'),
      emoji: newChannelEmoji,
      description: `Discussions about ${newChannelName}`,
      isPublic: true,
      allowMemberPost: true,
      allowMemberReact: true,
      category: 'Community',
    };

    const newChan = addChannel(chanData);
    setChannels(getChannels(true));
    setActiveChannel(newChan);
    setNewChannelName('');
    setShowAddChannel(false);
    toast.success('Channel created!');
  };

  const isStaffOrFounder = can('post_channel') || can('manage_channels');
  const showChatInput = activeChannel?.allowMemberPost || isStaffOrFounder;

  // Group channels by category
  const categories = channels.reduce((acc, c) => {
    const cat = c.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(c);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col font-sans relative overflow-hidden">
      {/* Top Navbar */}
      <header className="px-6 py-4 bg-obsidian-void/60 backdrop-blur-md border-b border-white/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-base font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818CF8] animate-pulse"></span>
              THE FORGE FEED
            </h1>
            <p className="text-[10px] font-mono text-white/30">Community Channels & Announcements</p>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full relative z-10 px-4 py-6 gap-6">
        
        {/* Sidebar Channels (4 cols equivalent) */}
        <div className="w-64 glass-panel rounded-2xl p-4 flex flex-col gap-5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest font-bold">Channels</span>
            {can('manage_channels') && (
              <button
                onClick={() => setShowAddChannel(v => !v)}
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
              >
                <Plus size={14} />
              </button>
            )}
          </div>

          {/* Add Channel Form Popover */}
          <AnimatePresence>
            {showAddChannel && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreateChannel}
                className="p-3 bg-white/3 rounded-xl border border-white/5 flex flex-col gap-2 overflow-hidden"
              >
                <input
                  type="text"
                  placeholder="channel-name"
                  value={newChannelName}
                  onChange={e => setNewChannelName(e.target.value)}
                  className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs focus:outline-none focus:border-indigo-500/40 text-white placeholder-white/20"
                />
                <div className="flex justify-between gap-2">
                  <select
                    value={newChannelEmoji}
                    onChange={e => setNewChannelEmoji(e.target.value)}
                    className="bg-neutral-900 border border-white/10 rounded-lg text-xs px-2 py-1 text-white"
                  >
                    <option value="💬">💬 Chat</option>
                    <option value="📢">📢 Announce</option>
                    <option value="🎵">🎵 Music</option>
                    <option value="🚀">🚀 Release</option>
                  </select>
                  <button type="submit" className="px-3 py-1 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:bg-indigo-400 transition">
                    Create
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Channel Lists */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-4">
            {Object.entries(categories).map(([cat, chList]) => (
              <div key={cat} className="flex flex-col gap-1">
                <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest font-black text-left px-2 mb-1">{cat}</span>
                {chList.map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannel(ch)}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-left transition ${
                      activeChannel?.id === ch.id
                        ? 'bg-indigo-500/10 border border-indigo-500/25 text-white'
                        : 'bg-transparent border border-transparent text-white/50 hover:bg-white/3 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="text-sm">{ch.emoji}</span>
                      <span className="truncate">{ch.name}</span>
                    </span>
                    {!ch.allowMemberPost && <Shield size={10} className="text-white/20" />}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Post Stream (Main Chat) */}
        <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden relative">
          
          {/* Active Channel Header */}
          <div className="px-5 py-4 border-b border-white/5 bg-white/2 flex justify-between items-center">
            <div className="text-left">
              <h2 className="text-sm font-bold flex items-center gap-1.5">
                <span className="text-lg">{activeChannel?.emoji}</span>
                {activeChannel?.name}
              </h2>
              <p className="text-[10px] text-white/35 font-mono mt-0.5">{activeChannel?.description}</p>
            </div>
          </div>

          {/* Stream */}
          <div className="flex-grow overflow-y-auto px-5 py-4 flex flex-col-reverse gap-4">
            {posts.length === 0 ? (
              <div className="my-auto text-center flex flex-col items-center gap-2 text-white/20">
                <MessageSquare size={32} />
                <span className="text-xs font-mono">No messages in this channel yet.</span>
              </div>
            ) : (
              posts.map(post => (
                <div key={post.id} className="p-4 rounded-2xl border border-white/5 bg-white/2 hover:border-white/10 transition flex gap-3 items-start text-left relative group">
                  
                  {/* Author avatar */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/20 flex items-center justify-center font-bold text-sm text-indigo-400 flex-shrink-0">
                    {post.authorAvatar}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header line */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">{post.authorName}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold"
                        style={{ background: 'rgba(129,140,248,0.1)', color: '#818CF8', border: '1px solid rgba(129,140,248,0.2)' }}>
                        {post.authorBadge}
                      </span>
                      <span className="text-[9px] font-mono text-white/20">
                        {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="text-xs text-white/80 leading-relaxed mt-2 whitespace-pre-wrap">{post.content}</p>

                    {/* Reactions footer */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {EMOJIS.map(emoji => {
                        const reactCount = post.reactions[emoji]?.length || 0;
                        const hasReacted = post.reactions[emoji]?.includes(currentUser?.id);
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleReact(post.id, emoji)}
                            className={`px-2 py-1 rounded-lg border text-[10px] flex items-center gap-1.5 transition ${
                              hasReacted
                                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                                : 'bg-white/2 border-white/5 text-white/40 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <span>{emoji}</span>
                            {reactCount > 0 && <span className="font-mono font-bold">{reactCount}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions / Delete */}
                  {(can('moderate_feed') || (post.authorId === currentUser.id)) && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-white/25 hover:text-red-400 hover:bg-red-500/10 rounded-lg absolute top-3 right-3 transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}

                </div>
              ))
            )}
          </div>

          {/* Form Input footer */}
          {showChatInput ? (
            <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-white/2 flex gap-3 items-center">
              <input
                type="text"
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                placeholder={`Message #${activeChannel?.name || 'feed'}`}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-indigo-500/40 text-white placeholder-white/20"
              />
              <button
                type="submit"
                className="p-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl transition shadow-[0_0_15px_rgba(99,102,241,0.3)]"
              >
                <Send size={15} />
              </button>
            </form>
          ) : (
            <div className="p-4 border-t border-white/5 bg-white/2 text-center text-xs font-mono text-white/20">
              🔇 You do not have permissions to post in this channel.
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
