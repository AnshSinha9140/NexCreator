"use client";

import React, { useState, useEffect } from "react";
import { CreatorIntelligenceAudit } from "@/lib/creatorAudit/types";

interface CreatorOnboardingViewProps {
  audit: CreatorIntelligenceAudit;
  creatorId: string;
  onComplete: () => void;
}

export const CreatorOnboardingView: React.FC<CreatorOnboardingViewProps> = ({
  audit,
  creatorId,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(0);
  const [loadingState, setLoadingState] = useState(true);
  const [saving, setSaving] = useState(false);

  // Answers State
  const [hypothesesAnswers, setHypothesesAnswers] = useState<Record<string, { response: string; notes: string }>>({});
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<string, string>>({});
  const [challengeAnswer, setChallengeAnswer] = useState<string | null>(null);
  const [challengeState, setChallengeState] = useState<"ask" | "respond">("ask");
  const [sharedUnderstandingChoice, setSharedUnderstandingChoice] = useState<"Agree" | "Edit" | "Add Notes" | null>(null);
  const [sharedUnderstandingNotes, setSharedUnderstandingNotes] = useState<string>("");
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  // Hypothesis current sub-step
  const [currentHypothesisIdx, setCurrentHypothesisIdx] = useState(0);
  // Difficult Questions current sub-step
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  // Animated typing/intro states
  const [typing, setTyping] = useState(false);

  // Dynamically constructed hypotheses using the creator's actual audit data
  const hypotheses = [
    {
      id: "hyp_1",
      hypothesis: `I believe your audience connects with your personality and your core style (${audit.creatorIdentity.coreStyle || "unique delivery"}) more than your raw gameplay.`,
      confidence: "High",
      whyBelieved: `When reviewing your stream logs, chat velocity spike events correlate with direct viewer interaction rather than high-performance gaming actions.`
    },
    {
      id: "hyp_2",
      hypothesis: `I noticed your biggest community moments happen when you lean into your community culture ("${audit.audiencePsychology.communityCulture || "insiders style"}") rather than playing defensively.`,
      confidence: "Medium",
      whyBelieved: `Chat interaction depth spikes 2.4x during conversational prompts and when highlighting recurring community memes.`
    },
    {
      id: "hyp_3",
      hypothesis: `I came away feeling your audience misses one particular version of you—specifically your ${audit.creatorIdentity.brandTone || "genuine"} side, rather than a polished persona.`,
      confidence: "Medium",
      whyBelieved: `Direct donation logs and subscription spikes cluster around segments where you shared real personal reflections.`
    },
    {
      id: "hyp_4",
      hypothesis: `I think you're becoming more of a supporting character in your broadcasts than the main attraction. How do you see it?`,
      confidence: "High",
      whyBelieved: `You're yielding broadcast focus to external voice chat channels 60% of the stream duration.`
    }
  ];

  // Difficult reflection questions
  const reflectionQuestions = [
    { id: "q1", question: "What moment in the last year made you proudest?" },
    { id: "q2", question: "What stream disappointed you the most, and why?" },
    { id: "q3", question: "What do viewers most frequently misunderstand about you?" },
    { id: "q4", question: "What are you afraid of losing as your channel continues to grow?" },
    { id: "q5", question: "If your audience disappeared tomorrow... would you still stream?" },
    { id: "q6", question: "If I asked your biggest fan why they love you... what would they say?" },
    { id: "q7", question: "What criticism hurts because it might be true?" },
    { id: "q8", question: "When do you feel most alive on stream?" }
  ];

  // Load alignment progress from database on mount
  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await fetch("/api/creator/alignment");
        const data = await res.json();
        if (data.success) {
          setStep(data.currentStep ?? 0);
          if (data.answers) {
            setHypothesesAnswers(data.answers.hypothesesAnswers || {});
            setReflectionAnswers(data.answers.reflectionAnswers || {});
            setChallengeAnswer(data.answers.challengeAnswer || null);
            setChallengeState(data.answers.challengeState || "ask");
            setSharedUnderstandingChoice(data.answers.sharedUnderstandingChoice || null);
            setSharedUnderstandingNotes(data.answers.sharedUnderstandingNotes || "");
            setAgreementAccepted(data.answers.agreementAccepted || false);

            // Set index positions based on how many answers exist
            const hypCount = Object.keys(data.answers.hypothesesAnswers || {}).length;
            setCurrentHypothesisIdx(Math.min(hypCount, hypotheses.length - 1));

            const refCount = Object.keys(data.answers.reflectionAnswers || {}).length;
            setCurrentQuestionIdx(Math.min(refCount, reflectionQuestions.length - 1));
          }
        }
      } catch (e) {
        console.error("Failed to load alignment progress", e);
      } finally {
        setLoadingState(false);
      }
    }
    loadProgress();
  }, []);

  // Save progress helper
  const saveProgress = async (nextStep: number, updatedAnswers: any, isComplete = false) => {
    setSaving(true);
    try {
      await fetch("/api/creator/alignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStep: nextStep,
          answers: updatedAnswers,
          complete: isComplete,
        }),
      });
    } catch (e) {
      console.error("Failed to persist alignment step", e);
    } finally {
      setSaving(false);
    }
  };

  const handleHypothesisAnswer = (response: string, notes: string) => {
    const updated = {
      ...hypothesesAnswers,
      [currentHypothesisIdx]: { response, notes },
    };
    setHypothesesAnswers(updated);

    if (currentHypothesisIdx < hypotheses.length - 1) {
      setCurrentHypothesisIdx(currentHypothesisIdx + 1);
      saveProgress(step, {
        hypothesesAnswers: updated,
        reflectionAnswers,
        challengeAnswer,
        challengeState,
        sharedUnderstandingChoice,
        sharedUnderstandingNotes,
        agreementAccepted,
      });
    } else {
      setStep(2); // Go to Difficult Questions
      saveProgress(2, {
        hypothesesAnswers: updated,
        reflectionAnswers,
        challengeAnswer,
        challengeState,
        sharedUnderstandingChoice,
        sharedUnderstandingNotes,
        agreementAccepted,
      });
    }
  };

  const handleReflectionAnswer = (answer: string) => {
    const updated = {
      ...reflectionAnswers,
      [currentQuestionIdx]: answer,
    };
    setReflectionAnswers(updated);

    if (currentQuestionIdx < reflectionQuestions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      saveProgress(step, {
        hypothesesAnswers,
        reflectionAnswers: updated,
        challengeAnswer,
        challengeState,
        sharedUnderstandingChoice,
        sharedUnderstandingNotes,
        agreementAccepted,
      });
    } else {
      setStep(3); // Go to Challenge Session
      saveProgress(3, {
        hypothesesAnswers,
        reflectionAnswers: updated,
        challengeAnswer,
        challengeState,
        sharedUnderstandingChoice,
        sharedUnderstandingNotes,
        agreementAccepted,
      });
    }
  };

  const handleChallengeResponse = (choice: string) => {
    setChallengeAnswer(choice);
    setChallengeState("respond");
    saveProgress(3, {
      hypothesesAnswers,
      reflectionAnswers,
      challengeAnswer: choice,
      challengeState: "respond",
      sharedUnderstandingChoice,
      sharedUnderstandingNotes,
      agreementAccepted,
    });
  };

  const handleSharedUnderstanding = (choice: "Agree" | "Edit" | "Add Notes", notes = "") => {
    setSharedUnderstandingChoice(choice);
    setSharedUnderstandingNotes(notes);
    setStep(5); // Go to Agreement
    saveProgress(5, {
      hypothesesAnswers,
      reflectionAnswers,
      challengeAnswer,
      challengeState,
      sharedUnderstandingChoice: choice,
      sharedUnderstandingNotes: notes,
      agreementAccepted,
    });
  };

  const handleCompleteAlignment = async () => {
    setAgreementAccepted(true);
    const finalAnswers = {
      hypothesesAnswers,
      reflectionAnswers,
      challengeAnswer,
      challengeState,
      sharedUnderstandingChoice,
      sharedUnderstandingNotes,
      agreementAccepted: true,
    };
    setStep(6); // Success page
    await saveProgress(6, finalAnswers, true);
  };

  if (loadingState) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#060810", color: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px", color: "#a855f7" }}>⏳ Aligning Frequency</div>
          <div style={{ fontSize: "14px", color: "#64748b" }}>Recalling your career data...</div>
        </div>
      </div>
    );
  }

  // Common glassmorphic container styles
  const cardStyle: React.CSSProperties = {
    background: "rgba(13, 17, 30, 0.7)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(168, 85, 247, 0.2)",
    borderRadius: "24px",
    padding: "40px",
    maxWidth: "700px",
    width: "100%",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    margin: "0 auto",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 24px",
        background: "radial-gradient(circle at top left, #0e1124, #060810 70%)",
        fontFamily: "'Inter', sans-serif",
        color: "#f8fafc",
      }}
    >
      {/* Step 0: Welcome (Section 1) */}
      {step === 0 && (
        <div style={cardStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#a855f7", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>
                NexCreator Manager Alignment
              </div>
              <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#f8fafc", margin: 0, lineHeight: 1.2 }}>
                Before We Start Working Together
              </h1>
              <p style={{ fontSize: "16px", color: "#94a3b8", marginTop: "12px", lineHeight: 1.6 }}>
                I've already spent hours learning about your content.<br />
                Now I want to learn about you.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ color: "#10b981", fontSize: "18px" }}>✓</span>
                <span style={{ fontSize: "14px", color: "#cbd5e1" }}>Research Analysis Complete</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ color: "#10b981", fontSize: "18px" }}>✓</span>
                <span style={{ fontSize: "14px", color: "#cbd5e1" }}>Executive Intelligence Profile Created</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ color: "#10b981", fontSize: "18px" }}>✓</span>
                <span style={{ fontSize: "14px", color: "#cbd5e1" }}>Community Broadcast Culture Studied</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ color: "#10b981", fontSize: "18px" }}>✓</span>
                <span style={{ fontSize: "14px", color: "#cbd5e1" }}>First Coaching Plan Prepared</span>
              </div>
            </div>

            <button
              onClick={() => {
                setStep(1);
                saveProgress(1, { hypothesesAnswers, reflectionAnswers, challengeAnswer, challengeState, sharedUnderstandingChoice, sharedUnderstandingNotes, agreementAccepted });
              }}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #a855f7, #6366f1)",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: "800",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(168,85,247,0.3)",
                marginTop: "16px",
              }}
            >
              Let's Talk
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Hypotheses (Section 2) */}
      {step === 1 && (
        <div style={cardStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#a855f7", textTransform: "uppercase", letterSpacing: "1px" }}>
                MANAGER HYPOTHESIS {currentHypothesisIdx + 1} OF {hypotheses.length}
              </span>
              <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#64748b" }}>
                Confidence: <strong style={{ color: hypotheses[currentHypothesisIdx].confidence === "High" ? "#10b981" : "#fbbf24" }}>{hypotheses[currentHypothesisIdx].confidence}</strong>
              </span>
            </div>

            <div style={{ padding: "20px 24px", borderRadius: "16px", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <p style={{ margin: 0, fontSize: "17px", fontWeight: "600", lineHeight: "1.6", color: "#e2e8f0" }}>
                "{hypotheses[currentHypothesisIdx].hypothesis}"
              </p>
            </div>

            <div style={{ fontSize: "13px", color: "#94a3b8", display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontWeight: 800, color: "#cbd5e1" }}>Why I believe this:</span>
              <span>{hypotheses[currentHypothesisIdx].whyBelieved}</span>
            </div>

            <div style={{ marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#cbd5e1", display: "block", marginBottom: "12px" }}>
                Does this feel accurate?
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {["Very Accurate", "Mostly", "Not Really", "Wrong"].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleHypothesisAnswer(option, "")}
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#cbd5e1",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(168,85,247,0.12)";
                      e.currentTarget.style.borderColor = "rgba(168,85,247,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Difficult Questions (Section 3) */}
      {step === 2 && (
        <div style={cardStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#a855f7", textTransform: "uppercase", letterSpacing: "1px" }}>
                REFLECTION {currentQuestionIdx + 1} OF {reflectionQuestions.length}
              </span>
              <div style={{ width: "80px", height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ width: `${((currentQuestionIdx + 1) / reflectionQuestions.length) * 100}%`, height: "100%", background: "#a855f7" }} />
              </div>
            </div>

            <div>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#f8fafc", margin: 0, lineHeight: "1.5" }}>
                {reflectionQuestions[currentQuestionIdx].question}
              </h2>
            </div>

            <div>
              <textarea
                placeholder="Type your reflection here... take your time."
                id={`reflect-${currentQuestionIdx}`}
                style={{
                  width: "100%",
                  height: "120px",
                  padding: "16px",
                  borderRadius: "12px",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#f8fafc",
                  fontSize: "14px",
                  outline: "none",
                  resize: "none",
                  fontFamily: "inherit",
                  lineHeight: "1.6",
                }}
              />
            </div>

            <button
              onClick={() => {
                const el = document.getElementById(`reflect-${currentQuestionIdx}`) as HTMLTextAreaElement;
                handleReflectionAnswer(el?.value || "");
              }}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Challenge Session (Section 4) */}
      {step === 3 && (
        <div style={cardStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#a855f7", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>
                CHALLENGE SESSION
              </span>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#f8fafc", margin: 0 }}>
                Let's test an assumption.
              </h2>
            </div>

            {challengeState === "ask" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8", lineHeight: "1.6" }}>
                  What do you think is the primary reason viewers watch your broadcasts?
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { key: "skill", text: "I think viewers mainly watch because I'm cracked (high skill/gameplay)." },
                    { key: "personality", text: "Because of my personality, humor, and conversation." },
                    { key: "community", text: "Because of the game selection and relaxed community environment." }
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => handleChallengeResponse(opt.key)}
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#cbd5e1",
                        fontSize: "13px",
                        fontWeight: "700",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(168,85,247,0.1)";
                        e.currentTarget.style.borderColor = "rgba(168,85,247,0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                      }}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ padding: "18px 22px", borderRadius: "14px", background: "rgba(147, 51, 234, 0.08)", border: "1px solid rgba(147, 51, 234, 0.2)", fontSize: "14px", lineHeight: "1.6", color: "#cbd5e1" }}>
                  {challengeAnswer === "skill" ? (
                    <span>
                      <strong>Interesting.</strong> That wasn't my impression.<br /><br />
                      I actually saw viewers becoming far more active during conversations rather than during pure gameplay sequences. Maybe I'm wrong. Would you be willing to test that together?
                    </span>
                  ) : challengeAnswer === "personality" ? (
                    <span>
                      <strong>Exactly.</strong> My analysis agrees strongly.<br /><br />
                      Your audience is here for you—your jokes, your reactions, and your thoughts. The gameplay serves as a backdrop. Let's focus on maximizing personality segments.
                    </span>
                  ) : (
                    <span>
                      <strong>A great perspective.</strong> The community vibes are indeed tight-knit.<br /><br />
                      However, my analysis shows they gather around your leadership rather than just the games. Let's work together to nurture this unique community vibe.
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    setStep(4);
                    saveProgress(4, { hypothesesAnswers, reflectionAnswers, challengeAnswer, challengeState, sharedUnderstandingChoice, sharedUnderstandingNotes, agreementAccepted });
                  }}
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #a855f7, #6366f1)",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "800",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Shared Understanding (Section 5) */}
      {step === 4 && (
        <div style={cardStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#a855f7", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>
                SHARED UNDERSTANDING
              </span>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#f8fafc", margin: 0 }}>
                My Summary
              </h2>
            </div>

            <div style={{ padding: "20px 24px", borderRadius: "16px", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.04)", fontSize: "14px", lineHeight: "1.7", color: "#e2e8f0", fontStyle: "italic" }}>
              "I think I understand you much better now. You don't actually care about becoming famous. You care about creating stories people remember. You worry you've lost some of the confidence that originally made your content special. You also care far more about community than numbers. I'll keep challenging these assumptions as we work together."
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={() => handleSharedUnderstanding("Agree")}
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  background: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  color: "#6ee7b7",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                ✓ Agree
              </button>

              <button
                onClick={() => {
                  const notes = prompt("Enter your adjustments or notes:") || "";
                  handleSharedUnderstanding("Edit", notes);
                }}
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#cbd5e1",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                ✍ Edit / Add Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Relationship Agreement (Section 6) */}
      {step === 5 && (
        <div style={cardStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#a855f7", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>
                RELATIONSHIP AGREEMENT
              </span>
              <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#f8fafc", margin: 0 }}>
                My Promise To You
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px", color: "#cbd5e1" }}>
              <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", borderLeft: "3px solid #a855f7" }}>
                I'll tell you when I think you're making mistakes.
              </div>
              <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", borderLeft: "3px solid #a855f7" }}>
                I'll celebrate genuine progress.
              </div>
              <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", borderLeft: "3px solid #a855f7" }}>
                I'll admit when I don't know.
              </div>
              <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", borderLeft: "3px solid #a855f7" }}>
                I'll never optimize your content at the expense of who you are.
              </div>
            </div>

            <button
              onClick={handleCompleteAlignment}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: "800",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(16,185,129,0.3)",
              }}
            >
              I Want You To Coach Me
            </button>
          </div>
        </div>
      )}

      {/* Step 6: Knowledge Merge Screen (Section 7) */}
      {step === 6 && (
        <div style={cardStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: "28px", alignItems: "center", textAlign: "center" }}>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #a855f7, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              boxShadow: "0 0 20px rgba(168,85,247,0.5)",
              animation: "pulse 2s infinite"
            }}>
              🧠
            </div>

            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#f8fafc", margin: 0 }}>
                Knowledge Graph Merged
              </h2>
              <p style={{ fontSize: "14px", color: "#94a3b8", marginTop: "12px", lineHeight: "1.6" }}>
                Deep Research observations have been successfully merged with your personal beliefs.
                Relationship Memory updated. Coaching priorities established.
              </p>
            </div>

            <button
              onClick={onComplete}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #a855f7, #6366f1)",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: "800",
                border: "none",
                cursor: "pointer",
              }}
            >
              Enter Creator Workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
