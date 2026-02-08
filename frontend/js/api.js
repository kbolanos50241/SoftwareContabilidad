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
        return await this._handleResponse(response);
    },
    async post(endpoint, data) {
        const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await this._handleResponse(response);
    },
    async put(endpoint, data) {
        const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await this._handleResponse(response);
    },
    async delete(endpoint) {
        const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
            method: 'DELETE'
        });
        return await this._handleResponse(response);
    },
    async _handleResponse(response) {
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');

        if (!response.ok) {
            let mensaje = `${response.status} ${response.statusText}`;
            if (isJson) {
                try {
                    const body = await response.json();
                    if (body.mensaje) mensaje = body.mensaje;
                } catch (_) {}
            }
            throw new Error(mensaje);
        }

        if (isJson) return response.json();
        return response.text();
    }
};
