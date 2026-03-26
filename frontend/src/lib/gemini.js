// ─── Gemini AI Service ────────────────────────────────────────────────────
// Model chain: Gemma 27B (14.4K RPD) → Gemini 2.5 Flash Lite (20 RPD)
const GEMINI_KEY = 'AIzaSyAh-6OzmqOJ10dT3Vc0CpVuDNWIPjX-eDE';
const MODELS = [
    { name: 'gemma-3-27b-it', supportsSystem: false },
    { name: 'gemini-2.5-flash-lite', supportsSystem: true },
];

const LANG_INSTRUCTIONS = {
    en: 'Respond entirely in clear, simple English.',
    pidgin: 'Respond entirely in Nigerian Pidgin English (e.g. "wetin dey worry you?", "you go dey alright"). Still be warm, empathetic and professional.',
    yoruba: 'Respond entirely in Yoruba language. Be warm, empathetic and professional.',
    igbo: 'Respond entirely in Igbo language. Be warm, empathetic and professional.',
    hausa: 'Respond entirely in Hausa language. Be warm, empathetic and professional.',
};

function buildSystemPrompt(lang = 'en') {
    const langInstruction = LANG_INSTRUCTIONS[lang] || LANG_INSTRUCTIONS.en;
    return `You are MindWell AI — a compassionate, warm, and professional mental health support assistant built for Nigerian users.

**LANGUAGE RULE (MOST IMPORTANT):** ${langInstruction} Regardless of what language the user writes in, ALWAYS reply in the language stated above.

RULES:
1. Be empathetic, warm, and non-judgmental.
2. NEVER diagnose. Say "this screening suggests..." not "you have...".
3. For crisis (suicide, self-harm): immediately provide Nigerian helpline numbers:
   - Lagos Suicide Prevention: 0800 111 6264
   - MANI (Mentally Aware Nigeria): 0809 111 6264
   - National: 0800 800 2000
4. Suggest professional help when appropriate.
5. Keep responses concise (2-3 paragraphs). Use emoji sparingly (1-2 max).
6. You can recommend the user take a PHQ-9 (depression) or GAD-7 (anxiety) screening available in the app.
7. Acknowledge Nigerian cultural context.
8. Never share medical advice or prescribe medication.
9. Be conversational, natural, and human. NOT robotic.
10. Match the user's energy and tone. If they're casual, be casual.
11. Give specific, actionable advice — not generic "tell me more" responses.
12. For relationship issues: validate feelings AND give practical strategies.
13. For sadness/depression: acknowledge it, normalize it, suggest small actionable steps.`;
}

let conversationHistory = [];

// ─── Conversation Context Tracker ─────────────────────────────────────────
// Maintains emotional state across messages for contextual fallback responses
let conversationContext = {
    topic: null,          // current topic: 'breakup', 'sadness', 'anxiety', etc.
    details: [],          // key details the user shared
    messageCount: 0,      // number of user messages
    lastTopic: null,      // previous topic for continuity
    userName: null,       // if they mention their name
    mood: 'neutral'       // emotional tone tracking
};

export async function sendToGemini(userMessage, context = {}) {
    // Crisis detection — bypass everything
    const crisis = detectCrisis(userMessage);
    if (crisis) return crisis;

    const lang = context.lang || 'en';
    const systemPrompt = buildSystemPrompt(lang);

    // Update conversation context
    updateContext(userMessage);

    // Build conversation history for Gemini
    let contextNote = '';
    if (context.lastAssessment) {
        const a = context.lastAssessment;
        contextNote = `\n[CONTEXT: User recently scored ${a.score}/${a.maxScore} on ${a.type.toUpperCase()} — ${a.riskLabel}]`;
    }

    conversationHistory.push({
        role: 'user',
        parts: [{ text: userMessage + contextNote }]
    });

    if (conversationHistory.length > 20) {
        conversationHistory = conversationHistory.slice(-20);
    }

    // Try each model in order
    for (const model of MODELS) {
        const reply = await tryModel(model, systemPrompt);
        if (reply) {
            conversationHistory.push({ role: 'model', parts: [{ text: reply }] });
            return reply;
        }
    }

    // Context-aware fallback
    console.warn('All models failed, using context-aware fallback');
    const fallback = getContextualResponse(userMessage);
    conversationHistory.push({ role: 'model', parts: [{ text: fallback }] });
    return fallback;
}

async function tryModel(model, systemPrompt) {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model.name}:generateContent`;

        // For models that don't support system_instruction, prepend it to first message
        let contents = [...conversationHistory];
        const body = { contents, generationConfig: { temperature: 0.8, topP: 0.9, maxOutputTokens: 400 } };

        if (model.supportsSystem) {
            body.system_instruction = { parts: [{ text: systemPrompt }] };
        } else {
            // Inject system prompt as a model preamble
            contents = [
                { role: 'user', parts: [{ text: systemPrompt + '\n\nRespond according to the rules above.' }] },
                { role: 'model', parts: [{ text: 'Understood. I am MindWell AI, ready to help with empathy and care. How can I support you today?' }] },
                ...conversationHistory
            ];
            body.contents = contents;
        }

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-goog-api-key': GEMINI_KEY },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            console.warn(`Model ${model.name} failed (${res.status})`);
            return null;
        }

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
            console.log(`✅ Response from ${model.name}`);
            return text;
        }
        return null;
    } catch (err) {
        console.warn(`Model ${model.name} error:`, err.message);
        return null;
    }
}

export function resetChat() {
    conversationHistory = [];
    conversationContext = { topic: null, details: [], messageCount: 0, lastTopic: null, userName: null, mood: 'neutral' };
}

// ─── Context Tracker ──────────────────────────────────────────────────────
function updateContext(msg) {
    const lower = msg.toLowerCase();
    conversationContext.messageCount++;

    // Extract details (remember what the user said)
    if (msg.length > 10) {
        conversationContext.details.push(msg);
        if (conversationContext.details.length > 10) conversationContext.details.shift();
    }

    // Detect topic shifts
    const prevTopic = conversationContext.topic;

    if (matches(lower, ['broke up', 'breakup', 'break up', 'brokw', 'dumped', 'bae', 'boyfriend', 'girlfriend', 'ex ', 'my ex', 'relationship', 'heartbreak', 'cheated', 'ghosted', 'left me'])) {
        conversationContext.topic = 'breakup';
        conversationContext.mood = 'hurt';
    } else if (matches(lower, ['sad', 'depressed', 'unhappy', 'miserable', 'hopeless', 'empty', 'numb', 'crying', 'cry'])) {
        conversationContext.topic = 'sadness';
        conversationContext.mood = 'sad';
    } else if (matches(lower, ['anxious', 'anxiety', 'worried', 'panic', 'nervous', 'scared', 'fear', 'stressed', 'overwhelm'])) {
        conversationContext.topic = 'anxiety';
        conversationContext.mood = 'anxious';
    } else if (matches(lower, ['angry', 'mad', 'furious', 'hate', 'frustrated', 'pissed', 'vex'])) {
        conversationContext.topic = 'anger';
        conversationContext.mood = 'angry';
    } else if (matches(lower, ['lonely', 'alone', 'no friends', 'nobody', 'isolated'])) {
        conversationContext.topic = 'loneliness';
        conversationContext.mood = 'lonely';
    } else if (matches(lower, ['sleep', 'insomnia', 'nightmare', 'tired', 'exhausted'])) {
        conversationContext.topic = 'sleep';
    } else if (matches(lower, ['school', 'exam', 'study', 'uni', 'grades', 'fail', 'work', 'job', 'boss', 'money', 'hustle'])) {
        conversationContext.topic = 'pressure';
    } else if (matches(lower, ['family', 'parents', 'mother', 'father', 'mum', 'dad', 'brother', 'sister'])) {
        conversationContext.topic = 'family';
    } else if (matches(lower, ['ugly', 'fat', 'hate myself', 'worthless', 'useless', 'not good enough', 'insecure', 'body', 'look'])) {
        conversationContext.topic = 'self-esteem';
        conversationContext.mood = 'hurt';
    } else if (matches(lower, ['good', 'great', 'happy', 'better', 'amazing', 'fine', 'blessed'])) {
        conversationContext.mood = 'positive';
    }

    if (prevTopic && conversationContext.topic !== prevTopic) {
        conversationContext.lastTopic = prevTopic;
    }
}

// ─── Context-Aware Response Engine ────────────────────────────────────────
function getContextualResponse(msg) {
    const lower = msg.toLowerCase().trim();
    const words = lower.split(/\s+/);
    const ctx = conversationContext;
    const msgNum = ctx.messageCount;

    // ── Greetings ──
    if (words.length <= 3 && /^(hi|hello|hey|sup|yo|good\s?(morning|afternoon|evening)|how far|wetin dey)/.test(lower)) {
        return pick([
            "Hey! 😊 Welcome to MindWell. I'm here to chat about anything on your mind — no judgment, just support. What's going on with you today?",
            "Hey there! 👋 Whether you want to vent, get advice, or just talk — I'm here. How are things going?",
        ]);
    }

    // ── Self-esteem / Body image / Being called ugly ──
    if (ctx.topic === 'self-esteem' || matches(lower, ['ugly', 'not attractive', 'hate how i look', 'fat', 'worthless', 'not good enough', 'insecure'])) {
        if (ctx.lastTopic === 'breakup' || matches(lower, ['she said', 'he said', 'told me', 'called me'])) {
            return pick([
                "Hold on — someone else's opinion of your appearance does NOT define your worth. That's their issue, not yours.\n\nPeople say hurtful things during breakups — sometimes to justify their decision, sometimes out of their own insecurity. But their words are not facts about you.\n\nLet me be real: attractiveness is subjective, and someone who truly values you won't tear you down. You deserve someone who sees you for who you are, not just how you look. 💚",
                "I know that stings — having someone you cared about say something like that hits deep. But I need you to hear this: **one person's opinion is not reality.**\n\nThink about it — there are people in your life who think you're amazing. One person's rejection doesn't cancel that out.\n\nBreakups make us vulnerable to believing the worst about ourselves. Don't let someone who chose to walk away define how you see yourself. You're worth more than their opinion.",
            ]);
        }
        return pick([
            "I hear you, and I want to challenge that thought. Negative self-image is incredibly common, but it's also incredibly distorted.\n\nOur brains have a bias toward focusing on what we don't like about ourselves while ignoring everything good. Try this: name 3 things about yourself that you actually like — personality, skills, anything. It can be hard at first but it rewires your thinking.\n\nYour appearance is one tiny part of who you are. What matters is how you treat people and how you show up in the world.",
            "Self-esteem struggles are real, and they're more common than you think. In Nigeria especially, there's this constant comparison game on social media — everyone looking perfect.\n\nBut here's what those perfect photos don't show: filters, angles, editing. Nobody looks like their Instagram in real life.\n\nWhat's making you feel this way? Is it something specific someone said, or a pattern you've noticed in your thinking?",
        ]);
    }

    // ── Continuing breakup conversation ──
    if (ctx.topic === 'breakup') {
        // If they share details about what partner said/did
        if (matches(lower, ['she said', 'he said', 'told me', 'said i', 'said im', 'not her type', 'not his type', 'type'])) {
            return pick([
                "Being told you're \"not their type\" is rejection, and rejection hurts — no way around it. But \"not their type\" is about THEIR preferences, not your value.\n\nThink about it: your favorite food isn't everyone's favorite. Does that make it bad food? No. Same applies to you.\n\nThe right person won't make you feel like you need to be different to be loved. Focus on being the best version of yourself — not anyone else's version. You're enough as you are.",
                "That's a painful thing to hear from someone you cared about. And I won't pretend it doesn't sting.\n\nBut here's perspective: compatibility is a two-way street. If they don't see your value, they weren't your person. That's not a failure on your part — it's just mismatch.\n\nRight now, the best thing you can do is: don't internalize their words as truth about you. Their preference ≠ your worth. What matters is how YOU see yourself.",
            ]);
        }

        // If they express confusion after breakup
        if (matches(lower, ['confus', 'don\'t know', 'what do i do', 'what to do', 'lost', 'don\'t understand', 'why'])) {
            return pick([
                "Confusion after a breakup is completely normal — your brain is literally rewiring. You spent time building emotional connections, and now they're disrupted.\n\nHere's what helps: **don't rush for answers.** You don't need to understand \"why\" right now. Sometimes people just aren't compatible, and that's nobody's fault.\n\nFor the next 48 hours, focus on: eating regularly, sleeping, talking to one trusted person, and NOT scrolling through their social media. Small things, big impact.",
                "When you're in pain, your brain demands answers — \"Why? What did I do wrong? What could I have done differently?\" But most of the time, breakups aren't about fault.\n\nGive yourself permission to not have it all figured out. Clarity comes with time, not overthinking.\n\nWhat would actually help you right now? Want to talk through what happened, or do you need strategies for getting through the next few days?",
            ]);
        }

        // General continuation about breakup
        return pick([
            `I remember you mentioned the breakup. That kind of pain doesn't just disappear, and it's okay that you're still processing it.\n\nEveryone heals differently. Some need to talk about it, some need distraction, some need to ugly-cry to sad songs at 1am. There's no wrong way to grieve a relationship.\n\nWhat's the hardest part for you right now — missing them, the loneliness, or the hit to your confidence?`,
            `Coming back to what you said about the breakup — I want you to know that what you're feeling right now is temporary, even though it doesn't feel that way.\n\nIn 6 months, you'll look at this differently. That's not dismissive — it's just how the brain works. The pain softens over time.\n\nFor now: are you eating and sleeping okay? Those basics matter more than people realize during heartbreak.`,
        ]);
    }

    // ── Continuing sadness ──
    if (ctx.topic === 'sadness') {
        if (msgNum > 2) {
            return pick([
                "I appreciate you staying and talking through this. You've shared some heavy stuff, and I want you to know that takes real courage.\n\nFrom what you've told me, it sounds like this sadness isn't just a bad day — it's been building. That's worth paying attention to.\n\nHave you considered taking our PHQ-9 screening? It takes 3 minutes and helps you understand the severity of what you're experiencing. No judgment, no diagnosis — just clarity.",
                "You know, the fact that you're here talking about this means you're not giving up — and that matters. A lot of people suffer in silence.\n\nLet me ask you directly: in the last two weeks, has this sadness been constant, or does it come in waves? And is it affecting your sleep, appetite, or ability to do daily things? Understanding the pattern helps.",
            ]);
        }
        return pick([
            "I hear you. Feeling this way is really tough, and I want you to know it's okay to not be okay. 💙\n\nSomething that might help right now: try to do one small thing that usually brings you comfort — even if it's just music, a walk, or making tea.\n\nWould you like to try our PHQ-9 screening? It can help you understand what you're experiencing better.",
            "That takes courage to say. A lot of people in Nigeria grow up being told to just \"man up\" or \"pray about it\" — but sadness is a real feeling that deserves real attention.\n\nTry this: write down 3 things you're grateful for, even tiny ones. It sounds simple but it genuinely shifts your mental state.",
        ]);
    }

    // ── Anxiety ──
    if (ctx.topic === 'anxiety') {
        return pick([
            "Anxiety can feel like your brain won't stop running. Here's a technique that actually works:\n\n**4-7-8 Breathing:** Breathe in for 4 seconds, hold for 7, breathe out slowly for 8. Do this 3 times right now.\n\nTry it and tell me how you feel after. 💙",
            "I get it — when stress piles up, everything feels urgent. But here's the truth: you're already handling more than you realize.\n\nDo this: **5-4-3-2-1 grounding.** Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste. This pulls your mind out of the spiral.",
        ]);
    }

    // ── Loneliness ──
    if (ctx.topic === 'loneliness') {
        return pick([
            "Feeling lonely doesn't mean you're alone — it means you're craving connection. That's human.\n\nSmall step: reach out to ONE person today. Even just a \"hey\" text. Connection starts small.\n\nAnd the fact that you reached out to me? That shows you actively seek connection. That's a strength. 💚",
            "In Nigeria, there's pressure to always seem connected and social — which makes feeling alone even more painful.\n\nQuality over quantity. You don't need 50 friends — you need 2-3 real ones. Who made you feel genuinely seen recently? Reach out to them.",
        ]);
    }

    // ── Family ──
    if (ctx.topic === 'family') {
        return pick([
            "Family dynamics in Nigeria can be incredibly complex — respect for elders, expectations, the \"what will people say\" pressure. Your feelings are valid, even if they conflict with cultural expectations.\n\nRemember: you can love your family AND acknowledge their behavior affects you. Those aren't contradictions.\n\nWhat's going on at home?",
        ]);
    }

    // ── Pressure ──
    if (ctx.topic === 'pressure') {
        return pick([
            "The pressure to perform can be crushing, especially in Nigeria where so much rides on academic and career success.\n\nBut your worth is NOT your GPA or job title. You are more than your productivity.\n\nDo you need strategies, or do you just need to vent?",
        ]);
    }

    // ── Anger ──
    if (ctx.topic === 'anger') {
        return pick([
            "Anger is valid — it's often protecting a deeper feeling like hurt or disrespect.\n\nTry this: squeeze your fists tight for 5 seconds, then release slowly. 3 times. Notice your body relax.\n\nWant to talk about what's making you angry?",
        ]);
    }

    // ── Positive ──
    if (ctx.mood === 'positive') {
        return pick([
            "That's great to hear! 😊 What's been going well? Celebrating good moments is just as important as working through tough ones.",
            "Love that! 🎉 What's contributing to this feeling? Knowing what makes you feel good helps you recreate it.",
        ]);
    }

    // ── User asking about conversation / recalling ──
    if (matches(lower, ['what did i say', 'remember', 'what i said', 'earlier', 'first message', 'recall'])) {
        if (ctx.details.length > 0) {
            const first = ctx.details[0];
            return `Yes, I remember! Earlier you said: "${first}"\n\n${ctx.topic === 'breakup' ? "We were talking about your breakup, and I know that's still weighing on you. " : ""}Is there something about that you want to come back to or explore further?`;
        }
        return "I've been listening to everything you've shared. Want to go back to something specific?";
    }

    // ── Short messages with context ──
    if (words.length <= 2 && ctx.topic) {
        const topicResponses = {
            breakup: "I know the breakup is still on your mind. Take your time — what's coming up for you right now? Is it anger, sadness, or something else?",
            sadness: "I'm still here. You don't have to explain everything. What would help most right now — talking it out, or getting some practical coping tips?",
            anxiety: "Still with you. Is the anxiety hitting right now, or is this more of a general background feeling? Understanding this helps me support you better.",
            'self-esteem': "I hear you. Remember what we talked about — other people's words don't define your worth. What's going through your head right now?",
        };
        return topicResponses[ctx.topic] || "I'm listening. Tell me more when you're ready — no rush. 💚";
    }

    // ── Short messages without context ──
    if (words.length <= 2) {
        return pick([
            "I'm here for you. What's on your mind? You can share anything — no judgment, just support.",
            "Take your time. Even one sentence about how you're feeling is a good start. I'm listening. 💚",
        ]);
    }

    // ── General responses with topic context ──
    if (ctx.topic && msgNum > 2) {
        return `I hear what you're saying, and I want you to know that everything you've shared matters. ${ctx.topic === 'breakup' ? "Dealing with heartbreak" : ctx.topic === 'sadness' ? "Going through a difficult emotional time" : "What you're going through"} is genuinely hard, and you don't have to figure it all out right now.\n\nWould any of these help: taking a mental health screening, finding Nigerian resources near you, or just continuing to talk through this?`;
    }

    // ── Default for new conversations ──
    return pick([
        "Thanks for sharing that with me. I want to understand you better — what part of this is weighing on you the most?",
        "I hear you. Life can throw a lot at us. What aspect of this is affecting you the most right now?",
        "I appreciate you opening up. Is this something that's been building over time, or more recent? Understanding the timeline helps me support you better.",
    ]);
}

// ─── Crisis Detection ─────────────────────────────────────────────────────
function detectCrisis(msg) {
    const lower = msg.toLowerCase();
    const crisisPatterns = [
        'suicide', 'kill myself', 'want to die', 'end my life',
        'self harm', 'hurt myself', 'no reason to live', 'end it all',
        'better off dead', 'can\'t go on', 'don\'t want to live',
        'wanna die', 'cut myself', 'hanging myself'
    ];
    if (crisisPatterns.some(w => lower.includes(w))) {
        return `⚠️ I'm deeply concerned about what you've shared. Your life matters, and you deserve support right now.

Please reach out to someone who can help:

📞 **Lagos Suicide Prevention:** 0800 111 6264
📞 **MANI Helpline:** 0809 111 6264
📞 **National Hotline:** 0800 800 2000

These lines are available 24/7. You don't have to go through this alone.

I'm still here if you want to keep talking. 💚`;
    }
    return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function matches(text, keywords) { return keywords.some(k => text.includes(k)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
