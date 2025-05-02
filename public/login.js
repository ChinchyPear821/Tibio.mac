document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const loginData = {
            email: formData.get("email"), // Cambiado a "email" para coincidir con el servidor
            password: formData.get("password"),
        };

        // Validar que los campos no estén vacíos
        if (!loginData.email || !loginData.password) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        try {
            // Enviar los datos al servidor
            const response = await fetch("/user/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(loginData),
                credentials: "include"  // Importante para enviar cookies con la solicitud
            });

            if (response.ok) {
                const result = await response.json();
                localStorage.setItem("token", result.token);
                alert("Inicio de sesión exitoso: " + result.message);
                window.location.href = "main.html";
            } else {
                const error = await response.json();
                alert("Error al iniciar sesión: " + error.message);  // Aquí debería salir el error de "Usuario no encontrado" o "Contraseña incorrecta"
            }
        } catch (err) {
            console.error("Error en la solicitud:", err);
            alert("Ocurrió un error al procesar la solicitud.");
        }
    });

});

