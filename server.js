const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxLSH40bpmVMzbNfrw3OS7DcHYK1048WaX3vULkO4rEU8s--t0J782jUYbBXkULPS04/exec";

app.use(cors({
  origin: "*", // yoki domen yozasan
  methods: ["GET", "POST"]
}));

// Lead saqlash
app.post("/webinar", async (req, res) => {
  try {
    const { name, phone } = req.body;

    await axios.post(GOOGLE_SCRIPT_URL, {
      name,
      phone
    });

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: error.message || "xatolik" });
  }
});

// Telegram click tracking
app.post("/telegram-click", async (req, res) => {
  try {
    await axios.post(GOOGLE_SCRIPT_URL, {
      event: "telegram_click"
    });

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "xatolik" });
  }
});

app.listen(3000, () => {
  console.log("Server 3000 portda ishlayapti 🚀");
});
