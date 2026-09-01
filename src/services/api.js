const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function handleResponse(res) {
    const body = await res.json().catch(() => null);

    if (!res.ok || !body || body.success === false) {
        const message = body?.message || `Request failed with status ${res.status}`;
        const error = new Error(message);
        error.status = res.status;
        throw error;
    }

    return body.data;
}

export async function fetchCocktails(params = {}, token) {
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/cocktails${query ? `?${query}` : ""}`;

    const res = await fetch(url, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(res);
}

export async function createReservation(reservation) {
    const res = await fetch(`${API_BASE_URL}/reservations`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(reservation),
    });
    return handleResponse(res);
}

export async function sendContactMessage(contactMessage) {
    const res = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(contactMessage),
    });
    return handleResponse(res);
}

export async function loginAdmin(credentials) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(credentials),
    });
    return handleResponse(res);
}

function getAuthHeaders(token) {
    return token
        ? { Authorization: `Bearer ${token}` }
        : {};
}

async function handleResponseWithMeta(res) {
    const body = await res.json().catch(() => null);

    if (!res.ok || !body || body.success === false) {
        const message = body?.message || `Request failed with status ${res.status}`;
        const error = new Error(message);
        error.status = res.status;
        throw error;
    }

    return {data: body.data, pagination: body.pagination};
}

export async function fetchReservationsAdmin({token, page = 1, limit = 20}) {
    const params = new URLSearchParams({page, limit});
    const res = await fetch(`${API_BASE_URL}/reservations?${params.toString()}`, {
        headers: getAuthHeaders(token),
    });
    return handleResponseWithMeta(res);
}

export async function updateReservationStatus({token, id, status}) {
    const res = await fetch(`${API_BASE_URL}/reservations/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(token),
        },
        body: JSON.stringify({status}),
    });
    return handleResponse(res);
}

export async function fetchContactMessagesAdmin({token, page = 1, limit = 20}) {
    const params = new URLSearchParams({page, limit});
    const res = await fetch(`${API_BASE_URL}/contact?${params.toString()}`, {
        headers: getAuthHeaders(token),
    });
    return handleResponseWithMeta(res);
}

export async function deleteContactMessage({token, id}) {
    const res = await fetch(`${API_BASE_URL}/contact/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
    });
    return handleResponse(res);
}

export async function fetchCocktailsAdmin({
                                              token,
                                              page = 1,
                                              limit = 20,
                                          }) {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
    });

    const res = await fetch(
        `${API_BASE_URL}/cocktails?${params.toString()}`,
        {
            headers: getAuthHeaders(token),
        }
    );

    return handleResponseWithMeta(res);
}

export async function createCocktail({token, cocktail}) {
    const res = await fetch(`${API_BASE_URL}/cocktails`, {
        method: "POST",
        headers: {"Content-Type": "application/json", ...getAuthHeaders(token)},
        body: JSON.stringify(cocktail),
    });
    return handleResponse(res);
}

export async function updateCocktail({token, id, cocktail}) {
    const res = await fetch(`${API_BASE_URL}/cocktails/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json", ...getAuthHeaders(token)},
        body: JSON.stringify(cocktail),
    });
    return handleResponse(res);
}

export async function deleteCocktail({token, id}) {
    const res = await fetch(`${API_BASE_URL}/cocktails/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
    });
    return handleResponse(res);
}

export async function fetchReservationsByDate({token, days = 30}) {
    const params = new URLSearchParams({days});
    const res = await fetch(`${API_BASE_URL}/analytics/reservations-by-date?${params.toString()}`, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(res);
}

export async function fetchBusiestSlots({token}) {
    const res = await fetch(`${API_BASE_URL}/analytics/busiest-slots`, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(res);
}

export async function fetchCocktailBreakdown({token}) {
    const res = await fetch(`${API_BASE_URL}/analytics/cocktail-breakdown`, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(res);
}

export async function fetchContactVolume({token, days = 30}) {
    const params = new URLSearchParams({days});
    const res = await fetch(`${API_BASE_URL}/analytics/contact-volume?${params.toString()}`, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(res);
}

export async function registerCustomer(payload) {
    const res = await fetch(`${API_BASE_URL}/customers/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    return handleResponse(res);
}

export async function loginCustomer(credentials) {
    const res = await fetch(`${API_BASE_URL}/customers/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    });

    return handleResponse(res);
}

export async function fetchMyProfile({ token }) {
    const res = await fetch(`${API_BASE_URL}/customers/me`, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(res);
}

export async function updateMyProfile({ token, name }) {
    const res = await fetch(`${API_BASE_URL}/customers/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders(token) },
        body: JSON.stringify({ name }),
    });
    return handleResponse(res);
}

export async function fetchMyReservations({ token }) {
    const res = await fetch(`${API_BASE_URL}/reservations/mine`, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(res);
}

export async function cancelMyReservation({ token, id }) {
    const res = await fetch(`${API_BASE_URL}/reservations/mine/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
    });
    return handleResponse(res);
}

export async function fetchMyFavorites({ token }) {
    const res = await fetch(`${API_BASE_URL}/customers/me/favorites`, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(res);
}

export async function likeCocktail({ token, cocktailId }) {
    const res = await fetch(`${API_BASE_URL}/favorites/${cocktailId}`, {
        method: "POST",
        headers: getAuthHeaders(token),
    });
    return handleResponse(res);
}

export async function unlikeCocktail({ token, cocktailId }) {
    const res = await fetch(`${API_BASE_URL}/favorites/${cocktailId}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
    });
    return handleResponse(res);
}

export async function verifyEmail({ verificationToken }) {
    const res = await fetch(`${API_BASE_URL}/customers/verify-email/${verificationToken}`);
    return handleResponse(res);
}

export async function resendVerificationEmail({ token }) {
    const res = await fetch(`${API_BASE_URL}/customers/resend-verification`, {
        method: "POST",
        headers: getAuthHeaders(token),
    });
    return handleResponse(res);
}

export async function forgotPassword({ email }) {
    const res = await fetch(`${API_BASE_URL}/customers/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });
    return handleResponse(res);
}

export async function resetPassword({ resetToken, password, confirmPassword }) {
    const res = await fetch(`${API_BASE_URL}/customers/reset-password/${resetToken}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword }),
    });
    return handleResponse(res);
}