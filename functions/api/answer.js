
export async function onRequestPost({ request, env }) {
  try {
    const { question } = await request.json();

    if (!question || !question.trim()) {
      return Response.json(
        { answer: "দয়া করে একটি প্রশ্ন লিখুন।" },
        { status: 400 }
      );
    }

    const result = await env.AI.run(
      "@cf/meta/llama-3.1-8b-instruct",
      {
        messages: [
          {
            role: "system",
            content: "তুমি Masum AI। বাংলায় সহজ, ভদ্র ও সহায়কভাবে উত্তর দাও।"
          },
          {
            role: "user",
            content: question
          }
        ]
      }
    );

    return Response.json({
      answer: result.response || "আবার চেষ্টা করুন।"
    });
  } catch (error) {
    return Response.json(
      { answer: "দুঃখিত, এখন উত্তর দেওয়া যাচ্ছে না।" },
      { status: 500 }
    );
  }
}
