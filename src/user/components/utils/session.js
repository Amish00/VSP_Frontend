const SESSION_ID_KEY = 'anonymous_session_id';

export const getSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};