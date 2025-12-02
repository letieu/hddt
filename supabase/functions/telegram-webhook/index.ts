import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const TELEGRAM_ADMIN_ID = Deno.env.get("TELEGRAM_ADMIN_ID");

async function sendTelegramMessage(chat_id, text, extra = {}) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ chat_id, text, parse_mode: "HTML", ...extra }),
  });
  return response.json();
}

async function answerCallbackQuery(callback_query_id, text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`;
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ callback_query_id, text }),
  });
}

async function editMessageText(chat_id, message_id, text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`;
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ chat_id, message_id, text, parse_mode: "HTML" }),
  });
}

Deno.serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    const body = await req.json();

    // Handle command messages
    if (body.message) {
      const message = body.message;
      if (!message || !message.text) {
        return new Response(JSON.stringify({ message: "No message text" }), {
          status: 200,
        });
      }

      const chatId = message.chat.id;
      const text = message.text;

      if (chatId.toString() !== TELEGRAM_ADMIN_ID) {
        await sendTelegramMessage(
          chatId,
          "You are not authorized to use this bot.",
        );
        return new Response(JSON.stringify({ message: "Unauthorized" }), {
          status: 401,
        });
      }

      await sendTelegramMessage(
        chatId,
        "I am a bot for payment notifications. I don't have any other commands.",
      );
    }

    // Handle button clicks (callback queries)
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const [action, notificationId] = callbackQuery.data.split(":");

      if (action === "approve") {
        // 1. Get notification details
        const { data: notification, error: notificationError } =
          await supabaseAdmin
            .from("payment_notifications")
            .select("*")
            .eq("id", notificationId)
            .single();

        if (notificationError)
          throw new Error(
            `Notification fetch failed: ${notificationError.message}`,
          );
        if (notification.status === "completed") {
          await answerCallbackQuery(
            callbackQuery.id,
            "This payment has already been approved.",
          );
          return new Response(JSON.stringify({ message: "Already approved" }), {
            status: 200,
          });
        }

        // 2. Update user credits
        const { error: creditError } = await supabaseAdmin.rpc(
          "increment_credit",
          {
            user_id_input: notification.user_id,
            increment_value: notification.credit_amount,
          },
        );

        if (creditError)
          throw new Error(`Credit update failed: ${creditError.message}`);

        // 3. Update notification status
        const { error: updateError } = await supabaseAdmin
          .from("payment_notifications")
          .update({ status: "completed" })
          .eq("id", notificationId);

        if (updateError)
          throw new Error(`Notification update failed: ${updateError.message}`);

        // 4. Provide feedback to admin
        await answerCallbackQuery(callbackQuery.id, "Payment approved!");

        const approvedMessage = callbackQuery.message.text + "✅ Approved";
        await editMessageText(
          callbackQuery.message.chat.id,
          callbackQuery.message.message_id,
          approvedMessage,
        );
      }
    }

    return new Response(JSON.stringify({ message: "Processed" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    await sendTelegramMessage(
      TELEGRAM_ADMIN_ID,
      "An error occurred while processing your request.",
    );
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }
});
