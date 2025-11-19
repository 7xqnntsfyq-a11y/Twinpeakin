import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const MBTI_QUESTIONS = [
  { id: "EvsI_energy", question: "When recharging, do you prefer time with others (E) or alone (I)?" },
  { id: "SvsN_info", question: "Do you trust concrete facts (S) or patterns/possibilities (N) more?" },
  { id: "TvsF_judgment", question: "In decisions, do you lean logic/criteria (T) or values/impact (F)?" },
  { id: "JvsP_structure", question: "Do you prefer planned structure (J) or adaptive flexibility (P)?" },
  { id: "stress_core", question: "Under stress, do you withdraw to process (I) or take charge to act (E)?" },
  { id: "focus_inner_outer", question: "Is your default focus inner alignment (Core) or outer execution (Field)?" },
  { id: "pattern_depth", question: "Do you track abstract meanings (N) or tangible specifics (S) by habit?" },
  { id: "conflict_style", question: "In conflict, do you argue the principle (T) or protect the relationship (F)?" },
  { id: "time_pref", question: "Do deadlines energize you when planned (J) or when flexible (P)?" },
  { id: "lead_mode", question: "When you must lead, are you a coordinator (J) or an improviser (P)?" },
  { id: "mirror_mask", question: "Your 'field' self under pressure: direct/decisive (T/J) or supportive/adaptive (F/P)?" },
  { id: "identity_anchor", question: "Which feels most 'you' at rest: quiet depth (I) or engaged motion (E)?" },
];

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAnswer = () => {
    if (!answer.trim()) {
      toast.error("Please provide an answer");
      return;
    }

    const question = MBTI_QUESTIONS[currentQuestion];
    setResponses({ ...responses, [question.id]: answer });
    setAnswer("");

    if (currentQuestion < MBTI_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeOnboarding({ ...responses, [question.id]: answer });
    }
  };

  const completeOnboarding = async (finalResponses: Record<string, string>) => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/profile/complete-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: finalResponses }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Sync complete! Core: ${data.result.core} • Field: ${data.result.field}`);
        setTimeout(() => setLocation("/chat"), 1500);
      } else {
        toast.error("Onboarding failed");
      }
    } catch (error) {
      toast.error("Connection error");
    } finally {
      setIsLoading(false);
    }
  };

  const progress = ((currentQuestion + 1) / MBTI_QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900/20 via-background to-blue-900/20 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Identity Sync</h1>
          <p className="text-muted-foreground">Deep 12 Question MBTI Detection</p>
        </div>

        <div className="bg-secondary/50 rounded-lg border border-border backdrop-blur p-6">
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Question {currentQuestion + 1} of {MBTI_QUESTIONS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-background rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-medium mb-4">{MBTI_QUESTIONS[currentQuestion].question}</h2>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAnswer();
                }
              }}
              placeholder="Type your answer... (Press Enter to continue)"
              className="w-full px-4 py-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3">
            {currentQuestion > 0 && (
              <button
                onClick={() => {
                  setCurrentQuestion(currentQuestion - 1);
                  setAnswer(responses[MBTI_QUESTIONS[currentQuestion - 1].id] || "");
                }}
                className="px-6 py-2 bg-secondary border border-border rounded-md font-medium hover:bg-secondary/80 transition"
                disabled={isLoading}
              >
                Back
              </button>
            )}
            <button
              onClick={handleAnswer}
              disabled={isLoading}
              className="flex-1 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {isLoading ? "Processing..." : currentQuestion < MBTI_QUESTIONS.length - 1 ? "Next" : "Complete Sync"}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Your answers are processed locally. No data is stored or shared.</p>
        </div>
      </div>
    </div>
  );
}
