import { create } from 'zustand';

const useStore = create((set) => ({
  documents: [],
  documentName: '',
  setDocuments: (documents) => set({ documents }),
  setDocumentName: (documentName) => set({ documentName }),
}));

export { useStore };