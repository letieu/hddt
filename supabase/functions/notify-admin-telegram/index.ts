const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const TELEGRAM_ADMIN_ID = Deno.env.get("TELEGRAM_ADMIN_ID");

async function sendTelegramMessage(chat_id, text, reply_markup) {
  console.log("Sending Telegram message...");
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ chat_id, text, parse_mode: "HTML", reply_markup }),
  });
  const responseJson = await response.json();
  console.log("Telegram API response:", responseJson);
  return responseJson;
}

Deno.serve(async (req) => {
  console.log("notify-admin-telegram function started.");
  try {
    console.log("TELEGRAM_BOT_TOKEN exists:", !!TELEGRAM_BOT_TOKEN);
    console.log("TELEGRAM_ADMIN_ID:", TELEGRAM_ADMIN_ID);

    const body = await req.json();
    console.log("Request body:", body);
    const { record } = body;

    if (!record) {
      console.error("No record found in request body.");
      return new Response(JSON.stringify({ error: "No record found" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    const message = `
<b>New Payment Notification</b> 💰

<b>User Email:</b> ${record.user_email}
<b>Credit Option:</b> ${record.credit_option_name} (${record.credit_amount} credits)
<b>Price:</b> ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.price)}
<b>Payment Info:</b> <code>${record.payment_info}</code>
    `;

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "Approve",
            callback_data: `approve:${record.id}`,
          },
        ],
      ],
    };

    await sendTelegramMessage(TELEGRAM_ADMIN_ID, message, keyboard);

    console.log("Function finished successfully.");
    return new Response(JSON.stringify({ message: "Notification sent" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in notify-admin-telegram function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
