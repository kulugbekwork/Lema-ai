import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface LessonContentRequest {
  lessonTitle: string;
  courseContext: string;
  moduleContext: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { lessonTitle, courseContext, moduleContext }: LessonContentRequest = await req.json();
    const apiKey = Deno.env.get("OPENAI_API_KEY");

    if (!lessonTitle) {
      return new Response(
        JSON.stringify({ error: "Missing lesson title" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured on server" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const prompt = `You are an expert educational content designer. Create detailed lesson content for:

Lesson: "${lessonTitle}"
Course Context: ${courseContext}
Module Context: ${moduleContext}

Create a comprehensive lesson with:
- 5-8 slides that teach the topic progressively
- Each slide should be focused and not too long (2-4 paragraphs max)
- After every 2-3 slides, include a quiz question to test understanding
- Each quiz question should have 4 multiple choice options (a, b, c, d)
- Provide clear explanations for correct answers

Return ONLY a valid JSON object with this exact structure:
{
  "slides": [
    {
      "slideNumber": 1,
      "title": "Slide title",
      "content": "Slide content in markdown format with examples and explanations"
    }
  ],
  "questions": [
    {
      "slideNumber": 2,
      "questionText": "Question text",
      "optionA": "First option",
      "optionB": "Second option",
      "optionC": "Third option",
      "optionD": "Fourth option",
      "correctAnswer": "a",
      "explanation": "Explanation of why this is correct"
    }
  ]
}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert educational content designer. Always return valid JSON only, no other text.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(
        JSON.stringify({ error: "OpenAI API error", details: error }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const lessonContent = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(lessonContent), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
