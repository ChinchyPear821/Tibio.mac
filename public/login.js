function showLoadingModal() {
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();
    window.loadingModalInstance = loadingModal;
}

function hideLoadingModal() {
    if (window.loadingModalInstance) {
        window.loadingModalInstance.hide();
    }
}

function showSuccessModal(message = "Operación realizada correctamente") {
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    const successMessageContainer = document.querySelector('#successModal h5');
    successMessageContainer.textContent = message;
    successModal.show();
    window.successModalInstance = successModal;
}

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
            showLoadingModal();
            const response = await fetch("/user/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(loginData),
                credentials: "include"  // Importante para enviar cookies con la solicitud
            });
            hideLoadingModal();
            if (response.ok) {

                const result = await response.json();
                localStorage.setItem("token", result.token);
                //alert("Inicio de sesión exitoso: " + result.message);
                showSuccessModal();
                window.location.href = "main.html";
            } else {
                hideLoadingModal();
                const error = await response.json();
                alert("Error al iniciar sesión: " + error.message);  // Aquí debería salir el error de "Usuario no encontrado" o "Contraseña incorrecta"
            }
        } catch (err) {
            hideLoadingModal();
            console.error("Error en la solicitud:", err);
            alert("Ocurrió un error al procesar la solicitud.");
        }
    });

});

