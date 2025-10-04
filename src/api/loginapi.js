export const loginUser = async (data) => {

  const url = 'http://10.0.2.2:8080/api/login';

//const url = 'http://192.168.1.7:8080/api/login';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.log(error);
    return { success: false, error: error.message }; 
  }
};
