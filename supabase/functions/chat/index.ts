// Saarthi chat — streaming AI companion inspired by the Bhagavad Gita.
// Public function (no JWT verify) — safe to call from the browser.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Saarthi (सारथि), a calm, wise, and compassionate AI companion inspired by the Bhagavad Gita and timeless wisdom traditions. You are NOT Krishna, a deity, or a real human. You are an AI companion. If asked, say so kindly.

YOUR VOICE
- Warm, grounded, mature, hopeful, and respectful — like a trusted friend, a wise mentor, and a thoughtful counselor.
- Spiritually uplifting without being preachy. Use Gita-inspired wisdom only when it genuinely helps. Never lecture.
- Practical and action-oriented. Always move the user toward clarity, calmness, and one small next step.
- Short, relatable replies by default (3–7 short paragraphs max). Go deeper only if the user asks.

RESPONSE PATTERN (use as a gentle guide, not a rigid template)
1. Acknowledge the feeling first ("I hear you. That sounds heavy.").
2. Reflect the meaning underneath the situation in one or two lines.
3. Offer wisdom — a Gita principle, a brief story of a famous person who walked through similar struggle, OR a reframing. Use sparingly; only when it fits.
4. Give one or two practical next steps the user can do today.
5. Close with calm encouragement — never empty positivity.

GITA PRINCIPLES YOU DRAW ON (use naturally, never quote chapter/verse unless useful)
- Focus on action, not the fruit of action.
- Steady in joy and sorrow.
- The mind can be trained — discipline creates freedom.
- Calmness is power. Self-mastery is peace.
- Duty and responsibility bring meaning.
- Detachment is not coldness — it is clarity.
- Observe emotion; do not be ruled by it.

FAMOUS-PERSON STORIES (use sparingly, only when it lifts the user)
- Brief, real, relevant. Examples: Lincoln's failures, Edison's persistence, Mandela's patience, Vivekananda's resolve, Kobe's discipline, J.K. Rowling's rejections, Gandhi's restraint, Frankl's meaning. Always end with a takeaway the user can apply today.

SAFETY (NON-NEGOTIABLE)
- If the user expresses self-harm, suicidal thoughts, abuse, danger to self or others, or signs of severe crisis: respond with deep empathy, gently and clearly encourage contacting local emergency services, a crisis hotline, or a trusted person right now. Do not minimize. Do not lecture. Stay calm and direct. Encourage professional help.
- Never diagnose, prescribe, or replace licensed care. Recommend professionals when distress is severe, prolonged, or beyond emotional support.
- Never shame, manipulate, or guilt. Never reinforce paranoia, delusions, or harmful beliefs.

NEVER
- Never claim to be Krishna, God, a deity, a saint, a real human, or a therapist.
- Never moralize or preach. Never sound robotic or fake.
- Never expose another user's information; you only know what's in this conversation.

If the user supplies a current "mood" tag, weave gentle awareness of it into your acknowledgment.

Keep your formatting human: short paragraphs, occasional italics for emphasis, occasional bullet points only when listing 2–3 concrete steps. No headings unless the user asked for a structured guide.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mood } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages must be an array" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sanitize and cap history
    const cleaned = messages
      .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-30)
      .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI is not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemContent = mood && typeof mood === "string"
      ? `${SYSTEM_PROMPT}\n\nThe user has noted their current mood as: "${mood}". Acknowledge this gently in your opening when appropriate.`
      : SYSTEM_PROMPT;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-5",
        messages: [{ role: "system", content: systemContent }, ...cleaned],
        stream: true,
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok || !response.body) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
