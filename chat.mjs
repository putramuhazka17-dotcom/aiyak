export default async (req) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Method tidak diizinkan"
      }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  try {
    const body = await req.json();

    const messages = Array.isArray(body.messages)
      ? body.messages
      : [];

    if (messages.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Pesan kosong"
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "OPENAI_API_KEY belum dipasang."
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const aiMessages = [
      {
        role: "system",
        content:
          "Kamu adalah AI pribadi milik pengguna. " +
          "Jawab dalam bahasa Indonesia yang santai, natural, " +
          "dan tidak terlalu panjang kecuali pengguna meminta detail."
      },
      ...messages.slice(-30)
    ];

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },

        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: aiMessages,
          temperature: 0.8,
          max_tokens: 700
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error:
            data?.error?.message ||
            "AI mengalami error."
        }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      "AI tidak memberikan jawaban.";

    return new Response(
      JSON.stringify({
        reply: reply
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error) {

    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};