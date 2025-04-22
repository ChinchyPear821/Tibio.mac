document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("user-registration-form");

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Evita que el formulario recargue la página

        // Capturar los datos del formulario
        const formData = new FormData(form);
        const userData = {
            username: formData.get("username"),
            email: formData.get("email"),
            password: formData.get("password"),
        };

        try {
            // Enviar los datos al servidor
            const response = await fetch("/user/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                const result = await response.json();
                alert("Usuario creado exitosamente: " + result.message);

                window.location.href = "index.html"; // Redirigir a la página de inicio
            } else {
                const error = await response.json();
                alert("Error al crear usuario: " + error.message);
            }
        } catch (err) {
            console.error("Error en la solicitud:", err);
            alert("Ocurrió un error al procesar la solicitud.");
        }
    });
});