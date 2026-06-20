import { apiFetch } from './api';

const STORAGE_KEY = 'dads_daily_medicines';

const initStorage = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
};

const timeToMinutes = (time = '00:00') => {
  const [hours, minutes] = String(time).split(':').map(Number);
  return (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0);
};

const markMissed = (medicines) => {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return medicines.map((medicine) => {
    if (medicine.status === 'Pending' && timeToMinutes(medicine.time) < nowMinutes) {
      return { ...medicine, status: 'Missed' };
    }
    return medicine;
  });
};

const formDataToMedicine = (formData) => ({
  id: formData.get('id') || undefined,
  alias: formData.get('alias') || '',
  name: formData.get('name') || '',
  description: formData.get('description') || '',
  time: formData.get('time') || '09:00',
  category: formData.get('category') || 'Custom',
  type: formData.get('category') || 'Custom',
  status: formData.get('status') || 'Pending',
  imageUrl: '',
});

export const getMedicines = async () => {
  try {
    const medicines = await apiFetch('/api/medicines');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(medicines));
    return medicines;
  } catch {
    initStorage();
    const medicines = markMissed(JSON.parse(localStorage.getItem(STORAGE_KEY)));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(medicines));
    return medicines;
  }
};

export const saveMedicine = async (medicine) => {
  try {
    const isFormData = medicine instanceof FormData;
    const id = isFormData ? medicine.get('id') : medicine.id;
    const saved = await apiFetch(id ? `/api/medicines/${id}` : '/api/medicines', {
      method: id ? 'PUT' : 'POST',
      body: isFormData ? medicine : JSON.stringify(medicine),
    });
    const medicines = await getMedicines();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(medicines));
    return saved;
  } catch {
    const medicines = await getMedicines();
    const nextMedicine = medicine instanceof FormData ? formDataToMedicine(medicine) : medicine;
    let updated;
    if (nextMedicine.id) {
      updated = medicines.map(m => m.id === nextMedicine.id ? nextMedicine : m);
    } else {
      nextMedicine.id = Date.now().toString();
      updated = [...medicines, nextMedicine];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return nextMedicine;
  }
};

export const toggleMedicineStatus = async (id) => {
  try {
    const updatedMedicine = await apiFetch(`/api/medicines/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({}),
    });
    const medicines = await getMedicines();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(medicines));
    return updatedMedicine;
  } catch {
    const medicines = await getMedicines();
    const updated = medicines.map(m => {
      if (m.id === id) {
        return { ...m, status: m.status === 'Taken' ? 'Pending' : 'Taken' };
      }
      return m;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated.find(m => m.id === id);
  }
};
