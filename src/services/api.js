
const API_URL = 'http://localhost:3000/api';

async function request(endpoint, options = {}) {
  const { method = 'GET', body = null, headers = {} } = options;

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro na requisição');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

export const login = (email, password) => {
  return request('/login', {
    method: 'POST',
    body: { email, password },
  });
};

export const register = (userData, userType) => {
  return request(`/register/${userType}`, {
    method: 'POST',
    body: userData,
  });
};

export const getStatus = () => {
    return request('/status');
};

export const sendMessage = (senderId, receiverId, content) => {
    return request('/messages', {
        method: 'POST',
        body: { senderId, receiverId, content },
    });
};

export const getMessages = (senderId, receiverId) => {
    return request(`/messages/${senderId}/${receiverId}`);
};

export const getUsers = (userType) => {
    return request(`/users/${userType}`);
};
