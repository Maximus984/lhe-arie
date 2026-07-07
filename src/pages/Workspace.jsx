import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { getDocs, saveDoc, deleteDoc, getDriveFiles, saveDriveFile, deleteDriveFile, getSlideDecks, saveSlideDeck, deleteSlideDeck, getVaultItems, saveVaultItem, deleteVaultItem } from '../data/workspace.js';
import { FileText, FolderOpen, Presentation, Database, ArrowLeft, Plus, Save, Trash2, Eye, Play, PlusCircle, Layout, Image, Video, File, X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useLocation } from 'react-router-dom';
import LottiePlayer from '../components/LottiePlayer.jsx';

export default function Workspace() {
  const { currentUser, can } = useAuth();
  const [activeTab, setActiveTab] = useState('docs'); // docs, drive, slides, vault
  
  // Data States
  const [docs, setDocs] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);
  const [docTitle, setDocTitle] = useState('');
  const [docBody, setDocBody] = useState('');

  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  
  const [decks, setDecks] = useState([]);
  const [activeDeck, setActiveDeck] = useState(null);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [slideContent, setSlideContent] = useState('');

  const [vault, setVault] = useState([]);
  const [activeVaultItem, setActiveVaultItem] = useState(null);

  const location = useLocation();

  // Load Data
  useEffect(() => {
    setDocs(getDocs());
    setFiles(getDriveFiles());
    setDecks(getSlideDecks());
    setVault(getVaultItems());
  }, [activeTab]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const docId = params.get('docId');
    if (docId) {
      const allDocs = getDocs();
      const found = allDocs.find(d => d.id === docId);
      if (found) {
        setActiveDoc(found);
        setDocTitle(found.title);
        setDocBody(found.body);
        setActiveTab('docs');
      }
    }
  }, [location]);

  // ---- DOCS HANDLERS ----
  const handleCreateDoc = () => {
    if (!can('create_docs')) return toast.error('Permission denied.');
    const newDoc = { title: 'Untitled Document', body: '', author: currentUser.name };
    const updated = saveDoc(newDoc);
    setDocs(updated);
    // Find the newly created doc to open it
    const created = updated[0];
    setActiveDoc(created);
    setDocTitle(created.title);
    setDocBody(created.body);
    toast.success('Document created!');
  };

  const handleSaveDoc = () => {
    if (!activeDoc) return;
    if (!can('edit_docs')) return toast.error('Permission denied.');
    const updated = saveDoc({ ...activeDoc, title: docTitle, body: docBody });
    setDocs(updated);
    setActiveDoc({ ...activeDoc, title: docTitle, body: docBody });
    toast.success('Document saved!');
  };

  const handleDeleteDoc = (id) => {
    if (!can('delete_docs')) return toast.error('Permission denied.');
    deleteDoc(id);
    setDocs(getDocs());
    if (activeDoc?.id === id) {
      setActiveDoc(null);
    }
    toast.success('Document deleted!');
  };

  // ---- DRIVE HANDLERS ----
  const handleFileUpload = (e) => {
    if (!can('upload_drive')) return toast.error('Permission denied.');
    const file = e.target.files[0];
    if (!file) return;

    // Simulate upload reading metadata
    const reader = new FileReader();
    reader.onloadend = () => {
      const newFile = {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
        content: reader.result,
        uploader: currentUser.name
      };
      saveDriveFile(newFile);
      setFiles(getDriveFiles());
      toast.success('File uploaded to Drive!');
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteFile = (id) => {
    if (!can('manage_drive')) return toast.error('Permission denied.');
    deleteDriveFile(id);
    setFiles(getDriveFiles());
    toast.success('File deleted from Drive!');
  };

  // ---- SLIDES HANDLERS ----
  const handleCreateDeck = () => {
    if (!can('create_slides')) return toast.error('Permission denied.');
    const newDeck = {
      title: 'Untitled Presentation',
      slides: ['Welcome to Maxx Forge Presentation'],
      author: currentUser.name
    };
    const updated = saveSlideDeck(newDeck);
    setDecks(updated);
    const created = updated[0];
    setActiveDeck(created);
    setActiveSlideIdx(0);
    setSlideContent(created.slides[0]);
    toast.success('Presentation created!');
  };

  const handleUpdateSlide = (newText) => {
    if (!activeDeck) return;
    if (!can('edit_slides')) return toast.error('Permission denied.');
    const updatedSlides = [...activeDeck.slides];
    updatedSlides[activeSlideIdx] = newText;
    const updatedDeck = { ...activeDeck, slides: updatedSlides };
    saveSlideDeck(updatedDeck);
    setActiveDeck(updatedDeck);
    setDecks(getSlideDecks());
  };

  const handleAddSlide = () => {
    if (!activeDeck) return;
    const updatedSlides = [...activeDeck.slides, 'New Slide Content'];
    const updatedDeck = { ...activeDeck, slides: updatedSlides };
    saveSlideDeck(updatedDeck);
    setActiveDeck(updatedDeck);
    setActiveSlideIdx(updatedSlides.length - 1);
    setSlideContent('New Slide Content');
    setDecks(getSlideDecks());
  };

  const handleDeleteDeck = (id) => {
    if (!can('delete_slides')) return toast.error('Permission denied.');
    deleteSlideDeck(id);
    setDecks(getSlideDecks());
    if (activeDeck?.id === id) setActiveDeck(null);
    toast.success('Presentation deleted!');
  };

  // ---- VAULT HANDLERS ----
  const handleVaultUpload = (e) => {
    if (!can('upload_vault')) return toast.error('Permission denied.');
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newItem = {
        name: file.name,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        url: reader.result,
        uploader: currentUser.name
      };
      saveVaultItem(newItem);
      setVault(getVaultItems());
      toast.success('Media added to Vault!');
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteVaultItem = (id) => {
    if (!can('delete_vault')) return toast.error('Permission denied.');
    deleteVaultItem(id);
    setVault(getVaultItems());
    toast.success('Media deleted from Vault!');
  };

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
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]"></span>
              FORGE WORKSPACE
            </h1>
            <p className="text-[10px] font-mono text-white/30">Google Workspace Suite Integration</p>
          </div>
        </div>

        <div className="flex gap-2">
          {[
            { id: 'docs', label: 'Docs', icon: FileText },
            { id: 'drive', label: 'Drive', icon: FolderOpen },
            { id: 'slides', label: 'Slides', icon: Presentation },
            { id: 'vault', label: 'Media Vault', icon: Database },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setActiveDoc(null); setActiveDeck(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-white/3 border-transparent text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="flex-1 p-6 relative z-10 flex flex-col max-w-7xl mx-auto w-full gap-6">
        <AnimatePresence mode="wait">
          
          {/* Docs Section */}
          {activeTab === 'docs' && (
            <motion.div key="docs" className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
              {/* Sidebar list (4 cols) */}
              <div className="md:col-span-4 glass-panel rounded-2xl p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-mono text-white/40 uppercase tracking-widest font-bold">Documents</h3>
                  {can('create_docs') && (
                    <button onClick={handleCreateDoc} className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition">
                      <Plus size={14} />
                    </button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto flex flex-col gap-2">
                  {docs.length === 0 ? (
                    <p className="text-xs text-white/30 text-center py-8 font-mono">No documents found</p>
                  ) : (
                    docs.map(doc => (
                      <div
                        key={doc.id}
                        onClick={() => { setActiveDoc(doc); setDocTitle(doc.title); setDocBody(doc.body); }}
                        className={`p-3 rounded-xl border transition cursor-pointer flex justify-between items-center ${
                          activeDoc?.id === doc.id
                            ? 'bg-emerald-500/5 border-emerald-500/30 text-white'
                            : 'bg-white/2 border-transparent text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={15} className="text-emerald-400" />
                          <div className="text-left">
                            <p className="text-xs font-bold truncate max-w-[150px]">{doc.title}</p>
                            <p className="text-[9px] font-mono text-white/30">By {doc.author}</p>
                          </div>
                        </div>
                        {can('delete_docs') && (
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteDoc(doc.id); }} className="p-1 text-white/20 hover:text-red-400 rounded-lg hover:bg-white/5 transition">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Editor viewport (8 cols) */}
              <div className="md:col-span-8 glass-panel rounded-2xl p-6 flex flex-col gap-4 min-h-[500px]">
                {activeDoc ? (
                  <>
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <input
                        type="text"
                        value={docTitle}
                        onChange={e => setDocTitle(e.target.value)}
                        className="bg-transparent border-none text-lg font-bold text-white focus:outline-none w-full"
                        disabled={!can('edit_docs')}
                      />
                      {can('edit_docs') && (
                        <button onClick={handleSaveDoc} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 text-neutral-950 rounded-xl text-xs font-semibold hover:bg-emerald-400 transition">
                          <Save size={13} /> Save
                        </button>
                      )}
                    </div>
                    <textarea
                      value={docBody}
                      onChange={e => setDocBody(e.target.value)}
                      placeholder="Start typing..."
                      className="flex-1 w-full bg-transparent border-none resize-none focus:outline-none text-sm text-white/80 leading-relaxed"
                      disabled={!can('edit_docs')}
                    />
                  </>
                ) : (
                  <div className="flex-grow flex flex-col items-center justify-center text-center gap-3">
                    <FileText size={48} className="text-white/10" />
                    <p className="text-xs text-white/35 font-mono">Select a document from the sidebar to open the editor</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Drive Section */}
          {activeTab === 'drive' && (
            <motion.div key="drive" className="flex-grow flex flex-col gap-6"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
              
              {/* Drive top actions */}
              <div className="flex justify-between items-center glass-panel rounded-2xl p-4">
                <div>
                  <h3 className="text-xs font-mono text-white/40 uppercase tracking-widest font-bold">Drive Storage</h3>
                  <p className="text-[10px] text-white/20 mt-0.5">Keep track of templates and uploaded project guides</p>
                </div>
                {can('upload_drive') && (
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-neutral-950 rounded-xl text-xs font-semibold hover:bg-emerald-400 transition cursor-pointer">
                    <Upload size={14} /> Upload File
                    <input type="file" onChange={handleFileUpload} className="hidden" />
                  </label>
                )}
              </div>

              {/* Files Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {files.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-white/20 font-mono text-xs flex flex-col items-center justify-center gap-4">
                    <LottiePlayer
                      src="/animations/new-google-cloud-icon/animations/new-google-cloud-icon.json"
                      className="w-28 h-28 opacity-80 animate-pulse"
                      loop
                      autoplay
                    />
                    <span>Workspace Drive is currently empty.</span>
                  </div>
                ) : (
                  files.map(file => (
                    <div key={file.id} className="glass-panel rounded-2xl p-4 flex flex-col justify-between items-start gap-4 hover:border-emerald-500/30 transition group relative">
                      <div className="flex justify-between w-full items-start">
                        <div className="p-2.5 rounded-xl bg-white/5 text-emerald-400">
                          {file.type === 'image' ? <Image size={18} /> : file.type === 'video' ? <Video size={18} /> : <File size={18} />}
                        </div>
                        {can('manage_drive') && (
                          <button onClick={() => handleDeleteFile(file.id)} className="opacity-0 group-hover:opacity-100 p-1 text-white/30 hover:text-red-400 rounded-lg hover:bg-white/5 transition">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white truncate max-w-[130px]">{file.name}</p>
                        <p className="text-[9px] font-mono text-white/30 mt-0.5">{file.size} · {file.uploader}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Slides Section */}
          {activeTab === 'slides' && (
            <motion.div key="slides" className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
              {/* Slides Sidebar */}
              <div className="md:col-span-4 glass-panel rounded-2xl p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-mono text-white/40 uppercase tracking-widest font-bold">Presentations</h3>
                  {can('create_slides') && (
                    <button onClick={handleCreateDeck} className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition">
                      <Plus size={14} />
                    </button>
                  )}
                </div>
                <div className="flex-grow overflow-y-auto flex flex-col gap-2">
                  {decks.length === 0 ? (
                    <p className="text-xs text-white/30 text-center py-8 font-mono">No presentations found</p>
                  ) : (
                    decks.map(deck => (
                      <div
                        key={deck.id}
                        onClick={() => { setActiveDeck(deck); setActiveSlideIdx(0); setSlideContent(deck.slides[0]); }}
                        className={`p-3 rounded-xl border transition cursor-pointer flex justify-between items-center ${
                          activeDeck?.id === deck.id
                            ? 'bg-emerald-500/5 border-emerald-500/30 text-white'
                            : 'bg-white/2 border-transparent text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Presentation size={15} className="text-emerald-400" />
                          <div className="text-left">
                            <p className="text-xs font-bold truncate max-w-[150px]">{deck.title}</p>
                            <p className="text-[9px] font-mono text-white/30">{deck.slides.length} slides · By {deck.author}</p>
                          </div>
                        </div>
                        {can('delete_slides') && (
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteDeck(deck.id); }} className="p-1 text-white/20 hover:text-red-400 rounded-lg hover:bg-white/5 transition">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Slides Editor Area */}
              <div className="md:col-span-8 glass-panel rounded-2xl p-6 flex flex-col gap-5 min-h-[500px]">
                {activeDeck ? (
                  <>
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <h3 className="text-sm font-bold text-white">{activeDeck.title}</h3>
                      <div className="flex items-center gap-2">
                        <button onClick={handleAddSlide} className="px-3 py-1.5 border border-white/10 hover:bg-white/5 rounded-xl text-xs font-semibold transition">
                          Add Slide
                        </button>
                      </div>
                    </div>

                    {/* Active slide viewport */}
                    <div className="flex-1 relative aspect-video bg-neutral-900 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center p-8 text-center">
                      <div className="absolute top-4 left-4 text-[10px] font-mono text-white/20">Slide {activeSlideIdx + 1} of {activeDeck.slides.length}</div>
                      <textarea
                        value={slideContent}
                        onChange={e => { setSlideContent(e.target.value); handleUpdateSlide(e.target.value); }}
                        className="bg-transparent border-none w-full text-center text-lg font-semibold text-white/80 focus:outline-none resize-none leading-relaxed"
                        placeholder="Type slide text here..."
                        disabled={!can('edit_slides')}
                      />
                    </div>

                    {/* Slides navigation/carousel indicator */}
                    <div className="flex gap-2 justify-center">
                      {activeDeck.slides.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setActiveSlideIdx(idx); setSlideContent(activeDeck.slides[idx]); }}
                          className={`w-8 h-8 rounded-lg text-xs font-mono font-bold border transition ${
                            activeSlideIdx === idx
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-white/2 border-white/5 text-white/40 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex-grow flex flex-col items-center justify-center text-center gap-3">
                    <Presentation size={48} className="text-white/10" />
                    <p className="text-xs text-white/35 font-mono">Select a presentation to begin presenting or editing</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Vault Section */}
          {activeTab === 'vault' && (
            <motion.div key="vault" className="flex-grow flex flex-col gap-6"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
              <div className="flex justify-between items-center glass-panel rounded-2xl p-4">
                <div>
                  <h3 className="text-xs font-mono text-white/40 uppercase tracking-widest font-bold">Media Vault</h3>
                  <p className="text-[10px] text-white/20 mt-0.5">Secure storage vault for high resolution asset archives</p>
                </div>
                {can('upload_vault') && (
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-neutral-950 rounded-xl text-xs font-semibold hover:bg-emerald-400 transition cursor-pointer">
                    <Upload size={14} /> Add Media
                    <input type="file" accept="image/*,video/*" onChange={handleVaultUpload} className="hidden" />
                  </label>
                )}
              </div>

              {/* Vault grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {vault.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-white/20 font-mono text-xs">Media Vault is empty.</div>
                ) : (
                  vault.map(item => (
                    <div key={item.id} className="glass-panel rounded-2xl overflow-hidden hover:border-emerald-500/30 transition group relative aspect-square flex flex-col justify-end">
                      {/* Image/Video Visual representation */}
                      <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                        {item.type === 'image' ? (
                          <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-emerald-400">
                            <Video size={32} />
                            <span className="text-[10px] font-mono text-white/30">Video Asset</span>
                          </div>
                        )}
                      </div>

                      {/* Info overlay on hover */}
                      <div className="relative z-10 bg-gradient-to-t from-black/90 to-transparent p-3 flex justify-between items-end opacity-0 group-hover:opacity-100 transition duration-300">
                        <div className="text-left">
                          <p className="text-xs font-bold text-white truncate max-w-[120px]">{item.name}</p>
                          <p className="text-[8px] font-mono text-white/40 mt-0.5">{item.size} · {item.uploader}</p>
                        </div>
                        {can('delete_vault') && (
                          <button onClick={() => handleDeleteVaultItem(item.id)} className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
