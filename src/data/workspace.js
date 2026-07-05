// =====================================================
// MAXX FORGE STUDIO™ — Workspace Data Layer
// =====================================================

import { v4 as uuidv4 } from 'uuid';

// ---- DOCS ----
export const getDocs = () => {
  const raw = localStorage.getItem('mfs_workspace_docs');
  return raw ? JSON.parse(raw) : [];
};

export const saveDoc = (doc) => {
  const docs = getDocs();
  const existing = docs.findIndex(d => d.id === doc.id);
  const updated = existing >= 0
    ? docs.map(d => d.id === doc.id ? { ...d, ...doc, updatedAt: new Date().toISOString() } : d)
    : [{ ...doc, id: `doc_${uuidv4().slice(0, 8)}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...docs];
  localStorage.setItem('mfs_workspace_docs', JSON.stringify(updated));
  return updated;
};

export const deleteDoc = (docId) => {
  const docs = getDocs().filter(d => d.id !== docId);
  localStorage.setItem('mfs_workspace_docs', JSON.stringify(docs));
};

// ---- DRIVE (Files) ----
export const getDriveFiles = () => {
  const raw = localStorage.getItem('mfs_workspace_drive');
  return raw ? JSON.parse(raw) : [];
};

export const saveDriveFile = (file) => {
  const files = getDriveFiles();
  const newFile = {
    id: `file_${uuidv4().slice(0, 8)}`,
    ...file,
    uploadedAt: new Date().toISOString(),
  };
  const updated = [newFile, ...files];
  localStorage.setItem('mfs_workspace_drive', JSON.stringify(updated));
  return newFile;
};

export const deleteDriveFile = (fileId) => {
  const files = getDriveFiles().filter(f => f.id !== fileId);
  localStorage.setItem('mfs_workspace_drive', JSON.stringify(files));
};

// ---- SLIDES ----
export const getSlideDecks = () => {
  const raw = localStorage.getItem('mfs_workspace_slides');
  return raw ? JSON.parse(raw) : [];
};

export const saveSlideDeck = (deck) => {
  const decks = getSlideDecks();
  const existing = decks.findIndex(d => d.id === deck.id);
  const updated = existing >= 0
    ? decks.map(d => d.id === deck.id ? { ...d, ...deck, updatedAt: new Date().toISOString() } : d)
    : [{ ...deck, id: `deck_${uuidv4().slice(0, 8)}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...decks];
  localStorage.setItem('mfs_workspace_slides', JSON.stringify(updated));
  return updated;
};

export const deleteSlideDeck = (deckId) => {
  const decks = getSlideDecks().filter(d => d.id !== deckId);
  localStorage.setItem('mfs_workspace_slides', JSON.stringify(decks));
};

// ---- MEDIA VAULT ----
export const getVaultItems = () => {
  const raw = localStorage.getItem('mfs_workspace_vault');
  return raw ? JSON.parse(raw) : [];
};

export const saveVaultItem = (item) => {
  const items = getVaultItems();
  const newItem = {
    id: `vault_${uuidv4().slice(0, 8)}`,
    ...item,
    uploadedAt: new Date().toISOString(),
  };
  const updated = [newItem, ...items];
  localStorage.setItem('mfs_workspace_vault', JSON.stringify(updated));
  return newItem;
};

export const deleteVaultItem = (itemId) => {
  const items = getVaultItems().filter(i => i.id !== itemId);
  localStorage.setItem('mfs_workspace_vault', JSON.stringify(items));
};
