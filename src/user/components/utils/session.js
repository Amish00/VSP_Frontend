export const getSessionId = () => {
  let sessionId = sessionStorage.getItem('anonymous_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem('anonymous_session_id', sessionId);
  }
  return sessionId;
};