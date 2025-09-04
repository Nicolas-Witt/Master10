import nodemailer from "nodemailer";
import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Ajuste para rodar import ES6 no Node
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do multer para usar memória (não salvar no disco)
const upload = multer({ storage: multer.memoryStorage() });

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nicolaswitt2007@gmail.com",
    pass: "xkxz izma mfya xeut" // App Password do Google
  }
});

// Rota para receber comprovantes
app.post("/api/confirm-payment", upload.single("receipt"), async (req, res) => {
  const { orderId, buyerName, buyerEmail, notes, cart } = req.body;
  const file = req.file;

  console.log("Pedido:", orderId);
  console.log("Cliente:", buyerName, buyerEmail);
  console.log("Observações:", notes);
  console.log("Carrinho:", cart);
  console.log("Arquivo recebido:", file?.originalname);

  try {
    const mailOptions = {
      from: '"Loja Básica" <nicolaswitt2007@gmail.com>',
      to: "nicolaswitt2007@gmail.com",
      subject: `Novo comprovante - Pedido #${orderId}`,
      text: `
Pedido: ${orderId}
Cliente: ${buyerName} (${buyerEmail})
Observações: ${notes}
Carrinho: ${cart}
      `,
      attachments: file ? [
        { filename: file.originalname, content: file.buffer }
      ] : []
    };

    // Envio do email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email enviado:", info.response);

    res.json({ success: true, message: "Comprovante recebido e e-mail enviado com sucesso!" });
  } catch (err) {
    console.error("Erro ao enviar e-mail:", err);
    res.status(500).json({ success: false, message: "Erro ao enviar e-mail" });
  }
});

// Iniciar servidor (ignorado no Vercel, mas útil em localhost)
app.listen(3000, () =>
  console.log("🚀 Servidor rodando em http://localhost:3000")
);
