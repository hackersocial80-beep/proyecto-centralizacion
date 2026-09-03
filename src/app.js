const API_URL = "https://localhost:54119";

export async function obtenerIntenciones() {
    const response = await fetch(
        `${API_URL}/api/intenciones`
    );

    if (!response.ok) {
        throw new Error("Error al consultar la API");
    }

    return response.json();
}
export async function crearIntencion(data) {
    const response = await fetch(
        `${API_URL}/api/intenciones`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );

    if (!response.ok) {
        throw new Error("Error al guardar la intención");
    }

    return response.json();
}