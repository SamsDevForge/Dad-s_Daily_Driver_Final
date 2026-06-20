import { apiFetch } from './api';

const STORAGE_KEY = 'dads_daily_documents';

const initStorage = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
};

const formDataToDocument = (formData) => {
  const file = formData.get('file');
  const fileName = file?.name || '';
  const fileType = file?.type?.includes('pdf') ? 'pdf' : file?.type?.startsWith('image/') ? 'image' : 'file';

  return {
    id: formData.get('id') || undefined,
    name: formData.get('name') || fileName || 'Document',
    category: formData.get('category') || 'Other',
    tags: String(formData.get('tags') || '').split(',').map((tag) => tag.trim()).filter(Boolean),
    description: formData.get('description') || '',
    type: fileType,
    fileType,
    url: '',
    uploadDate: new Date().toISOString().split('T')[0],
  };
};

export const getDocuments = async (search = '') => {
  try {
    const path = search ? `/api/documents?search=${encodeURIComponent(search)}` : '/api/documents';
    const documents = await apiFetch(path);
    if (!search) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    }
    return documents;
  } catch {
    initStorage();
    const documents = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!search) return documents;
    const query = search.toLowerCase();
    return documents.filter(d => [
      d.name,
      d.category,
      d.description,
      d.type,
      ...(d.tags || []),
    ].join(' ').toLowerCase().includes(query));
  }
};

export const saveDocument = async (document) => {
  try {
    const isFormData = document instanceof FormData;
    const id = isFormData ? document.get('id') : document.id;
    const saved = await apiFetch(id ? `/api/documents/${id}` : '/api/documents', {
      method: id ? 'PUT' : 'POST',
      body: isFormData ? document : JSON.stringify(document),
    });
    const documents = await getDocuments();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    return saved;
  } catch {
    const documents = await getDocuments();
    const nextDocument = document instanceof FormData ? formDataToDocument(document) : document;
    let updated;
    if (nextDocument.id) {
      updated = documents.map(d => d.id === nextDocument.id ? nextDocument : d);
    } else {
      nextDocument.id = Date.now().toString();
      nextDocument.uploadDate = new Date().toISOString().split('T')[0];
      updated = [...documents, nextDocument];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return nextDocument;
  }
};
