export async function onRequestPost({ request, env }) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  };

  try {
    const body = await request.json();
    const question = typeof body.question === "string" ? body.question.trim() : "";

    if (!question) {
      return new Response(JSON.stringify({ error: "প্রশ্ন লিখে পাঠান।" }), { status: 400, headers });
    }
    if (question.length > 1500) {
      return new Response(JSON.stringify({ error: "প্রশ্নটি ১৫০০ অক্ষরের মধ্যে রাখুন।" }), { status: 413, headers });
    }
    if (!env.AI) {
      return new Response(JSON.stringify({ error: "AI binding সেট করা হয়নি। README-এর নির্দেশনা অনুসরণ করুন।" }), { status: 503, headers });
    }

    const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        {
          role: "system",
          content: "তুমি Masum AI, একটি সহায়ক বাংলা প্রশ্নোত্তর সহকারী। ব্যবহারকারীর প্রশ্নের উত্তর সহজ, ভদ্র ও পরিষ্কার বাংলায় দাও। নিশ্চিত না হলে তা স্পষ্ট করে বলো; তথ্য বানিয়ে বলো না। চিকিৎসা, আইন, অর্থ বা জরুরি বিষয় হলে বিশেষজ্ঞ/সরকারি উৎসে যাচাই করতে বলো। বিপজ্জনক বা বেআইনি কাজে সহায়তা কোরো না। উত্তর সংক্ষিপ্ত রাখো।"
        },
        { role: "user", content: question }
      ],
      max_tokens: 500
    });

    const answer = result?.response;
    if (typeof answer !== "string" || !answer.trim()) {
      return new Response(JSON.stringify({ error: "AI থেকে উত্তর আসেনি। আবার চেষ্টা করুন।" }), { status: 502, headers });
    }
    return new Response(JSON.stringify({ answer: answer.trim() }), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: "সার্ভারে সমস্যা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" }), { status: 500, headers });
  }
}
