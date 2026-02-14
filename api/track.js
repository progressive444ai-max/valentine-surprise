const BOT_TOKEN = process.env.TG_BOT_TOKEN;
const CHAT_ID = process.env.TG_CHAT_ID;

export default async function handler(req, res) {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { event, data } = req.body;

        // Build message based on event type
        let message = "";
        const time = new Date().toLocaleString("ru-RU", { timeZone: "Europe/Kiev" });

        switch (event) {
            case "visit":
                message = `🟢 <b>Новый визит!</b>\n📱 ${data.device}\n🌐 ${data.browser}\n🕐 ${time}`;
                break;
            case "btn_yes":
                message = `💖 Нажата кнопка <b>"Да!"</b>\n🕐 ${time}`;
                break;
            case "btn_no_dodge":
                message = `🏃 Кнопка <b>"Нет"</b> убежала! (${data.count} раз)\n🕐 ${time}`;
                break;
            case "card_view":
                message = `📖 Карточка <b>${data.index}/${data.total}</b>: ${data.title}\n🕐 ${time}`;
                break;
            case "btn_next_card":
                message = `➡️ Нажата <b>"Дальше"</b> (карточка ${data.index}/${data.total})\n🕐 ${time}`;
                break;
            case "btn_guess":
                message = `🎁 Нажата <b>"Угадай, что за подарок"</b>\n🕐 ${time}`;
                break;
            case "guess_option":
                message = `❌ Выбран вариант: <b>"${data.option}"</b> — Не угадала! (${data.clicked}/4)\n🕐 ${time}`;
                break;
            case "full_cycle":
                message = `🏁🏁🏁 <b>ПОЛНЫЙ ЦИКЛ!</b> 🏁🏁🏁\nПрошла все экраны от начала до конца!\n📊 Полных циклов: <b>${data.count}</b>\n🕐 ${time}`;
                break;
            default:
                message = `📌 Событие: ${event}\n🕐 ${time}`;
        }

        // Send to Telegram
        const tgUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const tgRes = await fetch(tgUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: "HTML",
            }),
        });

        const tgData = await tgRes.json();

        if (!tgData.ok) {
            console.error("Telegram error:", tgData);
            return res.status(500).json({ error: "Telegram send failed" });
        }

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error("Track error:", err);
        return res.status(500).json({ error: err.message });
    }
}
