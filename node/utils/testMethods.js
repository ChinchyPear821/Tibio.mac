import { db } from "../Connection/db.js";
import { getRowById } from "../utils.js";
import PDFDocument from "pdfkit";
import fs from "fs";

export class ArchivePdfModel {
    static async allTransactions({ data }) {
        try {
            const { id_user } = data;

            const allTransactions = getRowById("transactions", "id_user", id_user.toString());

            return allTransactions;
        } catch (e) {
            console.error("Error allTransactions Model", e);
            throw new Error("Error allTransactions Model", e);
        }
    }

    static async pdfCreate({ data }) {
        try {
            const { id_user, cardNumber, bank, amount, type } = data;

            // Obtener el balance del usuario
            const user = db.prepare(`
                SELECT balance FROM users WHERE id_user = ?
            `).get(id_user);

            if (!user) {
                throw new Error(`Usuario con id ${id_user} no encontrado.`);
            }

            // Crear el documento PDF
            const doc = new PDFDocument();
            const fileName = `transaction_${id_user}_${Date.now()}.pdf`;
            const filePath = `./pdfs/${fileName}`;

            // Crear el directorio si no existe
            if (!fs.existsSync("./pdfs")) {
                fs.mkdirSync("./pdfs");
            }

            // Escribir el PDF en un archivo
            doc.pipe(fs.createWriteStream(filePath));

            // Agregar contenido al PDF
            doc
                .fontSize(20)
                .text("Detalles de la Transacción", { align: "center" })
                .moveDown();

            doc
                .fontSize(12)
                .text(`ID Usuario: ${id_user}`)
                .text(`Número de Tarjeta: ${cardNumber}`)
                .text(`Banco: ${bank}`)
                .text(`Monto: $${amount.toFixed(2)}`)
                .text(`Tipo: ${type}`)
                .text(`Balance Actual: $${user.balance.toFixed(2)}`)
                .moveDown();

            doc
                .fontSize(10)
                .text("Gracias por usar nuestro servicio.", { align: "center" });

            // Finalizar el documento
            doc.end();

            console.log(`PDF generado: ${filePath}`);
            return { success: true, filePath };
        } catch (e) {
            console.error("Error al generar el PDF", e);
            throw new Error("Error al generar el PDF", e);
        }
    }
}