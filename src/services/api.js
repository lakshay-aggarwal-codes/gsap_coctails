const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Unwraps the backend's {success, data} / {success, message} response
 * shape into just the data, throwing a readable Error on any failure
 * (network error, non-2xx status, or success:false).
 */
async function handleResponse(res) {
    const body = await res.json().catch(() => null);

    if (!res.ok || !body || body.success === false) {
        const message = body?.message || `Request failed with status ${res.status}`;
        throw new Error(message);
    }

    return body.data;
}

/**
 * Fetches cocktails from the backend.
 * @param {{category?: string, search?: string}} params - optional query filters
 */
export async function fetchCocktails(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/cocktails${query ? `?${query}` : ""}`;

    const res = await fetch(url);
    return handleResponse(res);
}

/**
 * Submits a new reservation.
 * @param {{name: string, email: string, phone: string, date: string, time: string, numberOfGuests: number, specialRequest?: string}} reservation
 */
export async function createReservation(reservation) {
    const res = await fetch(`${API_BASE_URL}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservation),
    });
    return handleResponse(res);
}

/**
 * Submits a contact/message form entry.
 * @param {{name: string, email: string, message: string}} contactMessage
 */
export async function sendContactMessage(contactMessage) {
    const res = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactMessage),
    });
    return handleResponse(res);
}
