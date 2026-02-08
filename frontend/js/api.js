/**
 * Cliente API - Peticiones al backend
 * Comunicación por fetch con el Web API en C#
 */
const api = {
    async get(endpoint) {
        const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        return this._handleResponse(response);
    },
    async post(endpoint, data) {
        const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return this._handleResponse(response);
    },
    async put(endpoint, data) {
        const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return this._handleResponse(response);
    },
    async delete(endpoint) {
        const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
            method: 'DELETE'
        });
        return this._handleResponse(response);
    },
    _handleResponse(response) {
        if (!response.ok) {
            throw new Error(`Error API: ${response.status} ${response.statusText}`);
        }
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        }
        return response.text();
    }
};
