import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CourseRequest {
  goal: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { goal }: CourseRequest = await req.json();
    const apiKey = Deno.env.get("OPENAI_API_KEY");

    if (!goal) {
      return new Response(
        JSON.stringify({ error: "Missing learning goal" }),
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

    const prompt = `You are an expert curriculum designer. Create a comprehensive learning course structure for the following goal: "${goal}"

Generate a structured course with:
- A clear title and description
- 4-6 modules that progressively build knowledge
- Each module should have 3-5 lessons
- IMPORTANT: Only provide lesson titles and estimated duration - NO detailed content yet
- Content will be generated later when user opens each lesson

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Course title",
  "description": "Course description",
  "modules": [
    {
      "title": "Module title",
      "description": "Module description",
      "lessons": [
        {
          "title": "Lesson title",
          "estimatedDurationMinutes": 15
        }
      ]
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
            content: "You are an expert curriculum designer. Always return valid JSON only, no other text.",
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
    const courseData = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(courseData), {
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