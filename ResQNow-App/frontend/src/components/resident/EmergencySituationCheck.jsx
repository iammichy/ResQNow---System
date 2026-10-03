import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  X,
} from 'lucide-react';

const COMMON_DANGER = {
  key: 'immediateDanger',
  label: 'Is anyone trapped, unconscious, seriously injured, or in immediate danger?',
  options: [
    ['yes', 'Yes'],
    ['no', 'No'],
    ['unsure', 'Unsure'],
  ],
};

const CONFIG = {
  flood: [
    COMMON_DANGER,
    {
      key: 'waterDepth',
      label: 'How deep is the flood water?',
      options: [
        ['shallow', 'Below ankle'],
        ['ankle_knee', 'Ankle–knee'],
        ['knee_waist', 'Knee–waist'],
        ['waist_or_higher', 'Waist or higher'],
        ['unknown', 'Unsure'],
      ],
    },
    {
      key: 'risingRate',
      label: 'What is the water doing now?',
      options: [
        ['stable', 'Stable / going down'],
        ['slow', 'Rising slowly'],
        ['fast', 'Rising quickly'],
        ['unknown', 'Unsure'],
      ],
    },
    {
      key: 'accessCondition',
      label: 'Can responders or vehicles still reach the area?',
      options: [
        ['passable', 'Yes, passable'],
        ['limited', 'Limited access'],
        ['blocked_or_evacuation', 'Blocked / evacuation needed'],
        ['unknown', 'Unsure'],
      ],
    },
  ],
  fire: [
    COMMON_DANGER,
    {
      key: 'fireCondition',
      label: 'What can you see?',
      options: [
        ['smoke_only', 'Smoke only'],
        ['small_contained', 'Small / contained fire'],
        ['active_flames', 'Active flames'],
        ['spreading_heavy_smoke', 'Spreading fire / heavy smoke'],
        ['unknown', 'Unsure'],
      ],
    },
    {
      key: 'electricalHazard',
      label: 'Is there an electrical danger?',
      options: [
        ['none', 'None seen'],
        ['sparks_or_hot_wire', 'Sparks / hot wire'],
        ['live_wire_exposed', 'Exposed live wire'],
        ['unknown', 'Unsure'],
      ],
    },
    {
      key: 'exitCondition',
      label: 'Can people safely leave the affected area?',
      options: [
        ['clear', 'Yes'],
        ['difficult', 'Difficult'],
        ['cannot_exit', 'No / cannot exit'],
        ['unknown', 'Unsure'],
      ],
    },
  ],
  medical: [
    COMMON_DANGER,
    {
      key: 'patientCondition',
      label: 'What best describes the patient?',
      options: [
        ['alert_stable', 'Alert / stable but needs help'],
        ['serious_pain_injury', 'Serious pain or injury'],
        ['breathing_difficulty', 'Difficulty breathing'],
        ['unconscious_not_breathing', 'Unconscious / not breathing'],
        ['unknown', 'Unsure'],
      ],
    },
    {
      key: 'transportNeed',
      label: 'Does the patient appear to need medical transport or urgent medical help?',
      options: [
        ['yes', 'Yes'],
        ['no', 'No'],
        ['unsure', 'Unsure'],
      ],
    },
    {
      key: 'affectedCount',
      label: 'How many people need medical help?',
      options: [
        ['one', '1 person'],
        ['two_three', '2–3 people'],
        ['four_plus', '4 or more'],
        ['unknown', 'Unsure'],
      ],
    },
  ],
  violence: [
    COMMON_DANGER,
    {
      key: 'threatStatus',
      label: 'What is happening now?',
      options: [
        ['ended', 'Threat has ended'],
        ['threatening', 'Threats / aggressive behavior'],
        ['active', 'Active violence'],
        ['weapon', 'Active threat with weapon'],
        ['unknown', 'Unsure'],
      ],
    },
    {
      key: 'injuryStatus',
      label: 'Is anyone injured?',
      options: [
        ['none', 'No'],
        ['minor', 'Minor injury'],
        ['serious', 'Serious injury'],
        ['unknown', 'Unsure'],
      ],
    },
    {
      key: 'safeToStay',
      label: 'Is it safe for the affected person to remain there?',
      options: [
        ['yes', 'Yes'],
        ['no', 'No'],
        ['unsure', 'Unsure'],
      ],
    },
  ],
  accident: [
    COMMON_DANGER,
    {
      key: 'trappedStatus',
      label: 'Is anyone trapped in or under a vehicle or object?',
      options: [
        ['yes', 'Yes'],
        ['no', 'No'],
        ['unknown', 'Unsure'],
      ],
    },
    {
      key: 'injuryStatus',
      label: 'What is the injury situation?',
      options: [
        ['none', 'No injury seen'],
        ['minor', 'Minor injury'],
        ['serious', 'Serious injury'],
        ['unknown', 'Unsure'],
      ],
    },
    {
      key: 'roadAccess',
      label: 'Can vehicles still pass?',
      options: [
        ['passable', 'Yes'],
        ['partial', 'Partially'],
        ['blocked', 'No, road blocked'],
        ['unknown', 'Unsure'],
      ],
    },
  ],
  evacuation: [
    COMMON_DANGER,
    {
      key: 'hazardProximity',
      label: 'How close is the hazard to the affected person or household?',
      options: [
        ['no_immediate', 'No immediate hazard'],
        ['nearby', 'Nearby / approaching'],
        ['immediate', 'Already affecting the location'],
        ['unknown', 'Unsure'],
      ],
    },
    {
      key: 'canLeave',
      label: 'Can they evacuate without barangay assistance?',
      options: [
        ['yes', 'Yes'],
        ['needs_assistance', 'Needs assistance'],
        ['cannot_leave', 'Cannot leave'],
        ['unknown', 'Unsure'],
      ],
    },
    {
      key: 'evacAccess',
      label: 'What is the evacuation route or access like?',
      options: [
        ['open', 'Open / passable'],
        ['limited', 'Limited'],
        ['blocked', 'Blocked'],
        ['unknown', 'Unsure'],
      ],
    },
  ],
};

const CATEGORY_LABELS = {
  fire: 'Fire / Smoke / Electrical Danger',
  medical: 'Medical Emergency',
  violence: 'Violence / Safety Threat',
  flood: 'Flood / Rising Water',
  accident: 'Road Accident / Serious Obstruction',
  evacuation: 'Urgent Evacuation',
};

// We keep the four factual SVF fields used by the backend, but present them
// as three very short screens: 1) immediate danger, 2) main condition,
// 3) two final quick facts. This keeps the emergency interaction compact
// without weakening the stored triage basis.
function buildSteps(concernCode) {
  const questions = CONFIG[concernCode] || [];
  if (questions.length !== 4) return questions.map((question) => [question]);
  return [[questions[0]], [questions[1]], [questions[2], questions[3]]];
}

function looksLifeThreatening(concernCode, answers) {
  if (answers?.immediateDanger === 'yes') return true;
  if (
    concernCode === 'medical' &&
    ['breathing_difficulty', 'unconscious_not_breathing'].includes(answers?.patientCondition)
  ) {
    return true;
  }
  if (concernCode === 'fire' && answers?.fireCondition === 'spreading_heavy_smoke') return true;
  if (concernCode === 'fire' && answers?.exitCondition === 'cannot_exit') return true;
  if (concernCode === 'violence' && answers?.threatStatus === 'weapon') return true;
  if (
    concernCode === 'accident' &&
    (answers?.trappedStatus === 'yes' || answers?.injuryStatus === 'serious')
  ) {
    return true;
  }
  if (
    concernCode === 'evacuation' &&
    answers?.canLeave === 'cannot_leave' &&
    answers?.hazardProximity === 'immediate'
  ) {
    return true;
  }
  if (
    concernCode === 'flood' &&
    answers?.waterDepth === 'waist_or_higher' &&
    answers?.risingRate === 'fast'
  ) {
    return true;
  }
  return false;
}

export function emergencySituationComplete(concernCode, answers) {
  const questions = CONFIG[concernCode] || [];
  return questions.length > 0 && questions.every((question) => Boolean(answers?.[question.key]));
}

export default function EmergencySituationCheck({
  concernCode,
  answers,
  onChange,
  onUseSos,
  open,
  onClose,
  onComplete,
}) {
  const steps = useMemo(() => buildSteps(concernCode), [concernCode]);
  const [stepIndex, setStepIndex] = useState(0);
  const [dangerPrompt, setDangerPrompt] = useState(false);
  const [pendingNextStep, setPendingNextStep] = useState(null);

  useEffect(() => {
    if (!open) return;

    // Resume at the first incomplete screen when the resident reopens it.
    const incompleteIndex = steps.findIndex((step) =>
      step.some((question) => !answers?.[question.key])
    );
    setStepIndex(incompleteIndex === -1 ? Math.max(steps.length - 1, 0) : incompleteIndex);
    setDangerPrompt(false);
    setPendingNextStep(null);
  }, [open, concernCode, steps, answers]);

  if (!open || !concernCode || steps.length === 0) return null;

  const step = steps[stepIndex] || [];
  const stepComplete = step.every((question) => Boolean(answers?.[question.key]));
  const allComplete = emergencySituationComplete(concernCode, answers);

  const advanceAfterAnswer = (nextAnswers) => {
    const currentStepComplete = step.every((question) => Boolean(nextAnswers?.[question.key]));
    if (!currentStepComplete) return;

    const nextIndex = stepIndex + 1;
    if (looksLifeThreatening(concernCode, nextAnswers)) {
      setPendingNextStep(nextIndex);
      setDangerPrompt(true);
      return;
    }

    if (nextIndex < steps.length) {
      window.setTimeout(() => setStepIndex(nextIndex), 120);
      return;
    }

    window.setTimeout(() => onComplete?.(), 120);
  };

  const handleAnswer = (key, value) => {
    const nextAnswers = { ...answers, [key]: value };
    onChange(key, value);
    advanceAfterAnswer(nextAnswers);
  };

  const continueEmergency = () => {
    const nextIndex = pendingNextStep ?? stepIndex + 1;
    setDangerPrompt(false);
    setPendingNextStep(null);

    if (nextIndex < steps.length) {
      setStepIndex(nextIndex);
    } else {
      onComplete?.();
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/45 backdrop-blur-[1px] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-resqnow-border-soft overflow-hidden max-h-[92vh]">
        <div className="px-4 pt-4 pb-3 border-b border-resqnow-border-soft">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-resqnow-critical/10 text-resqnow-critical flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-resqnow-critical">
                  Quick emergency check
                </p>
                <span className="text-[10px] font-extrabold text-resqnow-muted">
                  {stepIndex + 1}/{steps.length}
                </span>
              </div>
              <h2 className="text-[15px] font-extrabold text-resqnow-primary mt-0.5 leading-snug">
                {CATEGORY_LABELS[concernCode] || 'Emergency'}
              </h2>
              <p className="text-[10px] text-resqnow-muted mt-1 leading-relaxed">
                Short factual questions only. You do not choose the priority; ResQNow computes it from the answers.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close quick check"
              className="w-8 h-8 rounded-full border border-resqnow-border-soft text-resqnow-muted flex items-center justify-center shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 h-1.5 rounded-full bg-resqnow-canvas overflow-hidden">
            <div
              className="h-full bg-resqnow-critical transition-all duration-200"
              style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[68vh]">
          {dangerPrompt ? (
            <div className="rounded-2xl border border-resqnow-critical/30 bg-resqnow-critical/8 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-resqnow-critical mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-extrabold text-resqnow-critical">Possible immediate life danger</p>
                  <p className="text-[11px] text-resqnow-secondary mt-1.5 leading-relaxed">
                    SOS is the faster route when someone may die, is trapped, unconscious, or needs immediate rescue.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onUseSos}
                className="w-full mt-4 min-h-[46px] rounded-xl bg-resqnow-critical text-white text-[12px] font-extrabold active:scale-[0.99] transition-all"
              >
                Use SOS Fast-Track
              </button>
              <button
                type="button"
                onClick={continueEmergency}
                className="w-full mt-2 min-h-[44px] rounded-xl border border-resqnow-border bg-white text-resqnow-secondary text-[11px] font-bold"
              >
                Continue Emergency Report
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {step.map((question, questionIndex) => (
                <div key={question.key} className="rounded-2xl bg-resqnow-canvas border border-resqnow-border-soft p-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-white border border-resqnow-border text-[10px] font-extrabold text-resqnow-critical flex items-center justify-center shrink-0">
                      {answers?.[question.key] ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        stepIndex === steps.length - 1 && step.length > 1
                          ? `${stepIndex + 1}${String.fromCharCode(97 + questionIndex)}`
                          : stepIndex + 1
                      )}
                    </span>
                    <p className="text-[12px] font-extrabold text-resqnow-primary leading-snug pt-0.5">
                      {question.label}
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {question.options.map(([value, label]) => {
                      const selected = answers?.[question.key] === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleAnswer(question.key, value)}
                          className={`min-h-[46px] rounded-xl border px-2.5 py-2 text-[11px] font-bold leading-tight active:scale-[0.99] transition-all ${
                            selected
                              ? 'border-resqnow-critical/35 bg-resqnow-critical/10 text-resqnow-critical'
                              : 'border-resqnow-border-soft bg-white text-resqnow-secondary'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {stepIndex === steps.length - 1 && stepComplete && allComplete && (
                <div className="flex items-center gap-2 rounded-xl bg-resqnow-safe/10 border border-resqnow-safe/20 px-3 py-2.5">
                  <CheckCircle2 className="w-4 h-4 text-resqnow-safe shrink-0" />
                  <p className="text-[11px] font-bold text-resqnow-safe">Quick check complete.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {!dangerPrompt && (
          <div className="px-4 pb-4 pt-2 flex items-center gap-2 border-t border-resqnow-border-soft bg-white">
            <button
              type="button"
              onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
              disabled={stepIndex === 0}
              className="min-h-[42px] px-3 rounded-xl border border-resqnow-border-soft text-resqnow-secondary text-[11px] font-bold disabled:opacity-35 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <p className="text-[10px] text-resqnow-muted flex-1 text-right">
              {stepIndex < steps.length - 1
                ? 'Selecting an answer moves you forward.'
                : 'Answer the last items to finish.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
