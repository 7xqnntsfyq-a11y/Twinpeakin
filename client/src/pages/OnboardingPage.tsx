import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface QuestionOption {
  value: string;
  icon: string;
  title: string;
  description: string;
}

interface Question {
  id: string;
  dimension: string;
  dimensionDescription: string;
  badge: string;
  optionA: QuestionOption;
  optionB: QuestionOption;
}

const MBTI_QUESTIONS: Question[] = [
  {
    id: "EvsI_energy",
    dimension: "Energy Source",
    dimensionDescription: "How do you recharge and gain energy?",
    badge: "E/I",
    optionA: {
      value: "I recharge best by spending quality time alone, diving into my thoughts and inner world. Solitude energizes me.",
      icon: "🏡",
      title: "Inner Focus",
      description: "I recharge by spending time alone"
    },
    optionB: {
      value: "I gain energy from being around people, engaging in conversations and social activities. Interaction energizes me.",
      icon: "🌍",
      title: "Outer Focus",
      description: "I gain energy from being with others"
    }
  },
  {
    id: "SvsN_info",
    dimension: "Information Processing",
    dimensionDescription: "How do you prefer to take in information?",
    badge: "S/N",
    optionA: {
      value: "I trust concrete facts, real-world data, and practical details. I prefer what's proven and tangible.",
      icon: "📊",
      title: "Facts & Details",
      description: "I trust concrete facts and evidence"
    },
    optionB: {
      value: "I trust patterns, possibilities, and the bigger picture. I prefer exploring what could be and abstract meanings.",
      icon: "🔮",
      title: "Patterns & Possibilities",
      description: "I see patterns and future possibilities"
    }
  },
  {
    id: "TvsF_judgment",
    dimension: "Decision Making",
    dimensionDescription: "How do you prefer to make decisions?",
    badge: "T/F",
    optionA: {
      value: "I make decisions based on logic, objective criteria, and rational analysis. I prioritize fairness and consistency.",
      icon: "⚖️",
      title: "Logic & Analysis",
      description: "I decide with logic and criteria"
    },
    optionB: {
      value: "I make decisions based on values, personal impact, and how it affects people. I prioritize harmony and empathy.",
      icon: "❤️",
      title: "Values & Impact",
      description: "I decide based on values and people"
    }
  },
  {
    id: "JvsP_structure",
    dimension: "Lifestyle Approach",
    dimensionDescription: "How do you prefer to organize your life?",
    badge: "J/P",
    optionA: {
      value: "I prefer planned structure, clear schedules, and having things decided in advance. Organization gives me peace.",
      icon: "📋",
      title: "Planned & Structured",
      description: "I like plans and organization"
    },
    optionB: {
      value: "I prefer adaptive flexibility, keeping options open, and going with the flow. Spontaneity gives me freedom.",
      icon: "🎨",
      title: "Flexible & Adaptive",
      description: "I like flexibility and spontaneity"
    }
  },
  {
    id: "stress_core",
    dimension: "Stress Response",
    dimensionDescription: "How do you naturally respond under stress?",
    badge: "E/I",
    optionA: {
      value: "Under stress, I withdraw to process internally, reflect deeply, and work through things in my own space.",
      icon: "🧘",
      title: "Withdraw & Process",
      description: "I need alone time to process"
    },
    optionB: {
      value: "Under stress, I take charge and act, engage with the situation directly, and tackle problems head-on.",
      icon: "⚡",
      title: "Take Charge & Act",
      description: "I engage and take action"
    }
  },
  {
    id: "focus_inner_outer",
    dimension: "Natural Focus",
    dimensionDescription: "Where does your attention naturally gravitate?",
    badge: "Core/Field",
    optionA: {
      value: "My default focus is inner alignment - understanding myself, my values, and maintaining internal coherence.",
      icon: "🎯",
      title: "Inner Alignment",
      description: "I focus on my inner world"
    },
    optionB: {
      value: "My default focus is outer execution - getting things done, managing tasks, and engaging with external demands.",
      icon: "🚀",
      title: "Outer Execution",
      description: "I focus on external action"
    }
  },
  {
    id: "pattern_depth",
    dimension: "Observation Style",
    dimensionDescription: "What do you naturally track and notice?",
    badge: "S/N",
    optionA: {
      value: "I track tangible specifics, concrete details, and real-world facts as they are. I notice what's actually there.",
      icon: "🔍",
      title: "Concrete Specifics",
      description: "I notice tangible details"
    },
    optionB: {
      value: "I track abstract meanings, underlying patterns, and symbolic connections. I notice what things could mean.",
      icon: "🌌",
      title: "Abstract Meanings",
      description: "I see deeper patterns and meanings"
    }
  },
  {
    id: "conflict_style",
    dimension: "Conflict Approach",
    dimensionDescription: "How do you handle disagreements?",
    badge: "T/F",
    optionA: {
      value: "In conflict, I argue the principle, focus on what's logically right, and stand firm on objective truth.",
      icon: "🛡️",
      title: "Defend Principles",
      description: "I argue for what's logically right"
    },
    optionB: {
      value: "In conflict, I protect the relationship, consider feelings, and work toward harmony and understanding.",
      icon: "🤝",
      title: "Protect Relationship",
      description: "I prioritize harmony and feelings"
    }
  },
  {
    id: "time_pref",
    dimension: "Deadline Energy",
    dimensionDescription: "How do deadlines affect your energy?",
    badge: "J/P",
    optionA: {
      value: "Deadlines energize me when I have a clear plan and structure. I work best with advance preparation.",
      icon: "⏰",
      title: "Planned Approach",
      description: "I need structured preparation"
    },
    optionB: {
      value: "Deadlines energize me when I have flexibility to adapt. I often do my best work closer to the deadline.",
      icon: "🎪",
      title: "Flexible Approach",
      description: "I thrive with adaptive timing"
    }
  },
  {
    id: "lead_mode",
    dimension: "Leadership Style",
    dimensionDescription: "When you lead, what's your natural approach?",
    badge: "J/P",
    optionA: {
      value: "When I lead, I'm a coordinator - organizing, planning ahead, and ensuring everything is structured properly.",
      icon: "👔",
      title: "Coordinator",
      description: "I organize and plan systematically"
    },
    optionB: {
      value: "When I lead, I'm an improviser - adapting on the fly, responding to what emerges, and staying flexible.",
      icon: "🎭",
      title: "Improviser",
      description: "I adapt and respond fluidly"
    }
  },
  {
    id: "mirror_mask",
    dimension: "Public Persona",
    dimensionDescription: "How does your 'public self' show up under pressure?",
    badge: "Field",
    optionA: {
      value: "My field self under pressure is direct and decisive - I cut through ambiguity and make clear calls quickly.",
      icon: "⚔️",
      title: "Direct & Decisive",
      description: "I become sharp and action-oriented"
    },
    optionB: {
      value: "My field self under pressure is supportive and adaptive - I help others and adjust to what's needed.",
      icon: "🌿",
      title: "Supportive & Adaptive",
      description: "I become helpful and flexible"
    }
  },
  {
    id: "identity_anchor",
    dimension: "Core Identity",
    dimensionDescription: "What feels most authentically 'you' at rest?",
    badge: "Core",
    optionA: {
      value: "At rest, I am quiet depth - reflective, introspective, and comfortable in my inner world of thought.",
      icon: "🌊",
      title: "Quiet Depth",
      description: "My true self is contemplative"
    },
    optionB: {
      value: "At rest, I am engaged motion - active, responsive, and naturally drawn to interact with the world around me.",
      icon: "💫",
      title: "Engaged Motion",
      description: "My true self is dynamic"
    }
  }
];

type OnboardingStep = "welcome" | "questions" | "midway" | "review" | "results";

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ core: string; field: string } | null>(null);

  const totalQuestions = MBTI_QUESTIONS.length;
  const answeredCount = Object.keys(responses).length;
  const progress = (answeredCount / totalQuestions) * 100;

  const estimatedMinutesRemaining = Math.ceil((totalQuestions - answeredCount) * 0.25);

  const handleOptionSelect = (questionId: string, value: string) => {
    setResponses({ ...responses, [questionId]: value });
    
    setTimeout(() => {
      if (currentQuestion === 5 && step === "questions") {
        setStep("midway");
      } else if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setStep("review");
      }
    }, 300);
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    setStep("results");

    try {
      const res = await fetch("/api/profile/complete-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data.result);
      } else {
        toast.error("Onboarding failed");
        setStep("review");
      }
    } catch (error) {
      toast.error("Connection error");
      setStep("review");
    } finally {
      setIsLoading(false);
    }
  };

  const goToChat = () => {
    toast.success("Welcome to Twinpeakin!");
    setTimeout(() => setLocation("/chat"), 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900/20 via-background to-blue-900/20 p-4">
      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl"
          >
            <div className="text-center mb-8">
              <motion.h1 
                className="text-5xl font-bold mb-4"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                Welcome to Twinpeakin! 👋
              </motion.h1>
              <motion.p 
                className="text-xl text-muted-foreground mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Discover your two AI personalities
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-secondary/50 rounded-lg border border-border backdrop-blur p-8"
            >
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🎭</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Two Personalities, One You</h3>
                    <p className="text-muted-foreground">
                      We'll help you discover your dual AI companions - one for your inner world (reflection, growth, emotions) and one for the outer world (tasks, decisions, action).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="text-3xl">⏱️</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Just 3-5 Minutes</h3>
                    <p className="text-muted-foreground">
                      Answer 12 quick questions to personalize your experience. No MBTI knowledge needed - just choose what feels right to you.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="text-3xl">🔒</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Private & Secure</h3>
                    <p className="text-muted-foreground">
                      Your responses are processed locally and never stored or shared. Complete privacy guaranteed.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep("questions")}
                className="w-full py-4 bg-primary text-primary-foreground rounded-md font-semibold text-lg hover:opacity-90 transition"
              >
                Let's Begin ✨
              </button>
            </motion.div>
          </motion.div>
        )}

        {step === "questions" && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-3xl"
          >
            <DimensionBadges currentQuestion={currentQuestion} />
            
            <div className="bg-secondary/50 rounded-lg border border-border backdrop-blur p-6 md:p-8">
              <ProgressIndicator 
                current={currentQuestion + 1}
                total={totalQuestions}
                progress={((currentQuestion + 1) / totalQuestions) * 100}
                timeRemaining={estimatedMinutesRemaining}
              />

              <div className="mb-6">
                <div className="text-sm font-medium text-primary mb-2">
                  {MBTI_QUESTIONS[currentQuestion].dimension}
                </div>
                <h2 className="text-2xl font-semibold mb-2">
                  {MBTI_QUESTIONS[currentQuestion].dimensionDescription}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <OptionCard
                  option={MBTI_QUESTIONS[currentQuestion].optionA}
                  isSelected={responses[MBTI_QUESTIONS[currentQuestion].id] === MBTI_QUESTIONS[currentQuestion].optionA.value}
                  onClick={() => handleOptionSelect(MBTI_QUESTIONS[currentQuestion].id, MBTI_QUESTIONS[currentQuestion].optionA.value)}
                />
                <OptionCard
                  option={MBTI_QUESTIONS[currentQuestion].optionB}
                  isSelected={responses[MBTI_QUESTIONS[currentQuestion].id] === MBTI_QUESTIONS[currentQuestion].optionB.value}
                  onClick={() => handleOptionSelect(MBTI_QUESTIONS[currentQuestion].id, MBTI_QUESTIONS[currentQuestion].optionB.value)}
                />
              </div>

              <div className="flex gap-3">
                {currentQuestion > 0 && (
                  <button
                    onClick={() => setCurrentQuestion(currentQuestion - 1)}
                    className="px-6 py-3 bg-secondary border border-border rounded-md font-medium hover:bg-secondary/80 transition"
                  >
                    ← Back
                  </button>
                )}
                {responses[MBTI_QUESTIONS[currentQuestion].id] && (
                  <button
                    onClick={() => {
                      if (currentQuestion === 5) {
                        setStep("midway");
                      } else if (currentQuestion < totalQuestions - 1) {
                        setCurrentQuestion(currentQuestion + 1);
                      } else {
                        setStep("review");
                      }
                    }}
                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition"
                  >
                    Continue →
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {step === "midway" && (
          <motion.div
            key="midway"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">Halfway There!</h2>
              <p className="text-muted-foreground">You're doing great! Just 6 more questions.</p>
            </div>

            <div className="bg-secondary/50 rounded-lg border border-border backdrop-blur p-8">
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-4">Your Choices So Far:</h3>
                <div className="space-y-3">
                  {MBTI_QUESTIONS.slice(0, 6).map((q) => {
                    const response = responses[q.id];
                    const selected = response === q.optionA.value ? q.optionA : q.optionB;
                    return (
                      <div key={q.id} className="flex items-center gap-3 text-sm">
                        <div className="text-2xl">{selected.icon}</div>
                        <div>
                          <div className="font-medium">{q.dimension}</div>
                          <div className="text-muted-foreground">{selected.title}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => {
                  setCurrentQuestion(6);
                  setStep("questions");
                }}
                className="w-full py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 transition"
              >
                Continue to Second Half →
              </button>
            </div>
          </motion.div>
        )}

        {step === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-3xl"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Review Your Answers</h2>
              <p className="text-muted-foreground">
                Take a moment to review. You can go back to change any answer.
              </p>
            </div>

            <div className="bg-secondary/50 rounded-lg border border-border backdrop-blur p-6 mb-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                {MBTI_QUESTIONS.map((q, idx) => {
                  const response = responses[q.id];
                  const selected = response === q.optionA.value ? q.optionA : response === q.optionB.value ? q.optionB : null;
                  
                  return (
                    <div key={q.id} className="border-b border-border pb-4 last:border-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-primary mb-1">
                            Question {idx + 1}: {q.dimension}
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {q.dimensionDescription}
                          </div>
                          {selected && (
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{selected.icon}</span>
                              <span className="font-medium">{selected.title}</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setCurrentQuestion(idx);
                            setStep("questions");
                          }}
                          className="px-3 py-1 text-sm bg-secondary border border-border rounded hover:bg-secondary/80 transition"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCurrentQuestion(totalQuestions - 1);
                  setStep("questions");
                }}
                className="px-6 py-3 bg-secondary border border-border rounded-md font-medium hover:bg-secondary/80 transition"
              >
                ← Back to Questions
              </button>
              <button
                onClick={completeOnboarding}
                disabled={answeredCount < totalQuestions}
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                Complete & Discover Your AI Companions ✨
              </button>
            </div>
          </motion.div>
        )}

        {step === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl"
          >
            {isLoading ? (
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-6xl mb-4"
                >
                  ✨
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Analyzing Your Responses...</h2>
                <p className="text-muted-foreground">Creating your personalized AI companions</p>
              </div>
            ) : result ? (
              <>
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="text-6xl mb-4"
                  >
                    🎊
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-2">Your Personality Profile is Ready!</h2>
                  <p className="text-muted-foreground">Meet your two AI companions</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-purple-900/30 to-purple-600/20 rounded-lg border border-purple-500/30 backdrop-blur p-6"
                  >
                    <div className="text-3xl mb-3">🧘</div>
                    <h3 className="text-xl font-bold mb-2">Inner Self (Core)</h3>
                    <div className="text-3xl font-bold mb-2 text-purple-300">{result.core}</div>
                    <p className="text-sm text-muted-foreground">
                      Your companion for reflection, personal growth, emotions, and inner alignment. 
                      Thoughtful, introspective, and deeply attuned to your authentic self.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-br from-blue-900/30 to-blue-600/20 rounded-lg border border-blue-500/30 backdrop-blur p-6"
                  >
                    <div className="text-3xl mb-3">🚀</div>
                    <h3 className="text-xl font-bold mb-2">Field Alpha (Public)</h3>
                    <div className="text-3xl font-bold mb-2 text-blue-300">{result.field}</div>
                    <p className="text-sm text-muted-foreground">
                      Your companion for tasks, decisions, execution, and outer-world challenges. 
                      Action-oriented, decisive, and focused on getting things done.
                    </p>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-secondary/50 rounded-lg border border-border backdrop-blur p-6 mb-6"
                >
                  <h3 className="font-semibold mb-3">What This Means:</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your <strong className="text-foreground">Core Self</strong> represents your natural state at rest - how you think, 
                    feel, and process when you're being most authentic. Your <strong className="text-foreground">Field Self</strong> is 
                    how you show up in the world - your action-oriented, task-focused persona.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Each conversation is intelligently routed to the right companion based on whether you need 
                    inner reflection or outer execution. Together, they provide complete support for your whole life.
                  </p>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  onClick={goToChat}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-md font-semibold text-lg hover:opacity-90 transition"
                >
                  Start Chatting with Your AI Companions 💬
                </motion.button>
              </>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProgressIndicator({ current, total, progress, timeRemaining }: { 
  current: number; 
  total: number; 
  progress: number;
  timeRemaining: number;
}) {
  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium">Question {current} of {total}</span>
        <span className="text-muted-foreground">
          About {timeRemaining} {timeRemaining === 1 ? 'minute' : 'minutes'} left
        </span>
      </div>
      <div className="w-full bg-background rounded-full h-2.5">
        <motion.div
          className="bg-primary h-2.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}

function DimensionBadges({ currentQuestion }: { currentQuestion: number }) {
  const badges = [
    { label: "E/I", range: [0, 1, 4, 11] },
    { label: "S/N", range: [1, 2, 6] },
    { label: "T/F", range: [2, 3, 7] },
    { label: "J/P", range: [3, 8, 9] }
  ];

  const isActive = (range: number[]) => range.includes(currentQuestion);

  return (
    <div className="flex justify-center gap-2 mb-6">
      {badges.map((badge) => (
        <motion.div
          key={badge.label}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            isActive(badge.range)
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary/50 text-muted-foreground border border-border'
          }`}
          animate={isActive(badge.range) ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {badge.label}
        </motion.div>
      ))}
    </div>
  );
}

function OptionCard({ option, isSelected, onClick }: {
  option: QuestionOption;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative p-6 rounded-lg border-2 text-left transition ${
        isSelected
          ? 'border-primary bg-primary/10'
          : 'border-border bg-background/50 hover:border-primary/50'
      }`}
    >
      <div className="text-4xl mb-3">{option.icon}</div>
      <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
      <p className="text-sm text-muted-foreground">{option.description}</p>
      
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
        >
          <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}
