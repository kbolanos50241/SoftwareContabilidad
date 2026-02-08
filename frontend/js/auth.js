/**
 * Autenticación básica - sessionStorage
 */
const AUTH_KEY = 'usuario';

function getUsuario() {
    const json = sessionStorage.getItem(AUTH_KEY);
    return json ? JSON.parse(json) : null;
}

function setUsuario(usuario) {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(usuario));
}

function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    window.location.href = 'login.html';
}

function requireAuth() {
    if (!getUsuario()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}
