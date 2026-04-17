const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// Google Apps Script URL (o'zingiznikiga almashtiring!)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbza6QBLY7iUrfKzmyFwCVuMq-HTftqnKibaru_1J7xWRf7yVr25en09k5oTDkGMsqCD/exec";

// WEBINAR VAQTI (backenddan boshqariladi)
const WEBINAR_DATE = "2025-04-20";
const WEBINAR_TIME = "20:00";
const WEBINAR_TIMEZONE = "+05:00";

// Get webinar target time
app.get("/webinar-time", (req, res) => {
  const targetTime = new Date(`${WEBINAR_DATE}T${WEBINAR_TIME}:00${WEBINAR_TIMEZONE}`);
  res.json({
    success: true,
    targetTime: targetTime.toISOString(),
    date: WEBINAR_DATE,
    time: WEBINAR_TIME,
    timezone: WEBINAR_TIMEZONE
  });
});

// LEAD YUBORISH - WEBINAR
app.post("/webinar", async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: "Ism va telefon raqam kiritilishi shart" 
      });
    }
    
    const cleanPhone = phone.replace(/\s/g, '');
    
    console.log(`📝 Yangi lead: ${name} - ${cleanPhone}`);
    
    const response = await axios.post(GOOGLE_SCRIPT_URL, {
      eventType: "webinar_lead",
      name: name,
      phone: cleanPhone,
      timestamp: new Date().toISOString()
    });
    
    console.log("✅ Lead Google Sheetga saqlandi");
    
    res.json({ 
      success: true, 
      id: response.data.id,
      isDuplicate: response.data.isDuplicate,
      message: "Lead muvaffaqiyatli saqlandi" 
    });
    
  } catch (error) {
    console.error("❌ Webinar lead error:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    res.status(500).json({ 
      success: false, 
      message: "Server xatoligi. Google Sheet URLni tekshiring!" 
    });
  }
});

// TELEGRAM CLICK TRACKING
app.post("/telegram-click", async (req, res) => {
  try {
    const { phone } = req.body;
    console.log(`📱 Telegram bosildi: ${phone || "anonim"}`);
    
    await axios.post(GOOGLE_SCRIPT_URL, {
      eventType: "telegram_click",
      phone: phone || "",
      timestamp: new Date().toISOString()
    });
    
    res.json({ success: true });
    
  } catch (error) {
    console.error("❌ Telegram click error:", error.message);
    res.json({ success: true });
  }
});

// HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.json({ 
    status: "active",
    name: "VSL Webinar API",
    webinarTime: `${WEBINAR_DATE} ${WEBINAR_TIME} ${WEBINAR_TIMEZONE}`,
    endpoints: {
      webinarTime: "GET /webinar-time",
      webinar: "POST /webinar",
      telegramClick: "POST /telegram-click",
      health: "GET /health"
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portda ishlayapti`);
  console.log(`📅 Webinar vaqti: ${WEBINAR_DATE} ${WEBINAR_TIME} ${WEBINAR_TIMEZONE}`);
});