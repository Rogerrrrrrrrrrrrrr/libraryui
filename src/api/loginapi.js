import { BASE_URL } from './config';

export const loginUser = async (data) => {
  const url = `${BASE_URL}/api/login`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.log('Network Error:', error.message);
    return { success: false, error: error.message };
  }
};
