const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function handleResponse(res) {
    const body = await res.json().catch(() => null);

    if (!res.ok || !body || body.success === false) {
        const message = body?.message || `Request failed with status ${res.status}`;
        throw new Error(message);
    }

    return body.data;
}

export async function fetchCocktails(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/cocktails${query ? `?${query}` : ""}`;

    const res = await fetch(url);
    return handleResponse(res);
}

export async function createReservation(reservation) {
    const res = await fetch(`${API_BASE_URL}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservation),
    });
    return handleResponse(res);
}

export async function sendContactMessage(contactMessage) {
    const res = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactMessage),
    });
    return handleResponse(res);
}

export async function loginAdmin(credentials) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });
    return handleResponse(res);
}
