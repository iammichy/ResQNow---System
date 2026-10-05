import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  X,
} from 'lucide-react';

const CONFIG = {
  'evac-assistance': [
    {
      key: 'hazardProximity',
      label: 'How close is the hazard to the household?',
      options: [
        ['none', 'No hazard nearby'],
        ['nearby', 'Nearby'],
        ['affecting_now', 'Affecting us now'],
        ['unknown', 'Unsure'],
      ],
    },
    {
      key: 'canLeave',
      label: 'Can the person or household leave without assistance?',
      options: [
        ['independently', 'Yes'],
        ['needs_assistance', 'Needs assistance'],
        ['cannot_leave', 'Cannot leave'],
        ['unknown', 'Unsure'],
      ],
    },
    {
      key: 'routeAccess',
      label: 'What is the route or access like?',
      options: [
        ['open', 'Open / passable'],
        ['limited', 'Limited'],
        ['blocked', 'Blocked'],
        ['unknown', 'Unsure'],
      ],
    },
  ],

  'bhw-assistance': [
    {
      key: 'personCondition',
      label: 'What best describes the person now?',
      options: [
        ['alert_stable', 'Alert / stable'],
        ['needs_attention', 'Needs attention'],
        ['worsening', 'Getting worse'],
        ['severe_or_unresponsive', 'Severe / unresponsive'],
        ['unknown', 'Unsure'],
      ],
    },
    {
      key: 'breathingCondition',
      label: 'How is the person breathing?',
      options: [
        ['normal', 'Normal'],
        ['difficulty', 'Difficulty breathing'],
        ['unknown', 'Unsure'],
      ],
    },
    {
      key: 'mobilityNeed',
      label: 'Can the person move without assistance?',
      options: [
        ['none', 'Yes'],
        ['needs_assistance', 'Needs assistance'],
        ['cannot_move', 'Cannot move'],
        ['unknown', 'Unsure'],
      ],
    },
  ],

  'road-obstruction': [
    {
      key: 'roadAccess',
      label: 'Can people or vehicles still pass?',
      options: [
        ['passable', 'Yes'],
        ['partial', 'Partially'],
        ['blocked', 'No, blocked'],
        ['unknown', 'Unsure'],
      ],
    },
    {
      key: 'peopleAtRisk',
      label: 'Are people directly at risk from the obstruction?',
      options: [
        ['no', 'No'],
        ['yes', 'Yes'],
        ['unsure', 'Unsure'],
      ],
    },
    {
      key: 'hazardCondition',
      label: 'What is the condition now?',
      options: [
        ['stable', 'Stable'],
        ['worsening', 'Getting worse'],
        ['dangerous_object_or_wire', 'Dangerous object / wire'],
        ['unknown', 'Unsure'],
      ],
    },
  ],

  'damaged-facility': [
    {
      key: 'publicAccess',
      label: 'How close is the damage to people or public access?',
      options: [
        ['away_from_people', 'Away from people'],
        ['near_people', 'Near people'],
        ['blocking_access', 'Blocking access'],
        ['unknown', 'Unsure'],
      ],
    },
    {
      key: 'damageCondition',
      label: 'What does the damage look like?',
      options: [
        ['minor', 'Minor damage'],
        ['exposed_damage', 'Exposed damage'],
        ['collapse_or_electrical_risk', 'Collapse / electrical risk'],
        ['unknown', 'Unsure'],
      ],
    },
    {
      key: 'conditionTrend',
      label: 'Is the condition changing?',
      options: [
        ['stable', 'Stable'],
        ['worsening', 'Getting worse'],
        ['unknown', 'Unsure'],
      ],
    },
  ],

  /*
   * Internal code "cleanup" is retained for API/database
   * compatibility, but the Resident-facing category is now
   * Drainage / Flood Risk.
   */
  cleanup: [
    {
      key: 'areaImpact',
      label: 'How much of the area has water buildup or drainage overflow?',
      options: [
        ['small', 'Small area'],
        ['moderate', 'Moderate area'],
        ['widespread', 'Widespread'],
        ['unknown', 'Unsure'],
      ],
    },
    {
      key: 'accessImpact',
      label: 'Does the drainage or water buildup affect access?',
      options: [
        ['none', 'No'],
        ['limited', 'Limited access'],
        ['blocked', 'Blocked'],
        ['unknown', 'Unsure'],
      ],
    },
    {
      key: 'materialRisk',
      label: 'What is visible around the drainage or water?',
      options: [
        ['ordinary_waste', 'Leaves / waste / debris clogging drainage'],
        ['sharp_or_contaminated', 'Contaminated / sharp material present'],
        ['unknown', 'Unsure'],
      ],
    },
  ],

  /*
   * Internal code "community-concern" is retained for
   * compatibility, but the category is now a specific
   * Electrical / Streetlight Hazard.
   */
  'community-concern': [
    {
      key: 'peopleAtRisk',
      label: 'Are people directly at risk from the electrical or streetlight hazard?',
      options: [
        ['no', 'No'],
        ['yes', 'Yes'],
        ['unsure', 'Unsure'],
      ],
    },
    {
      key: 'accessImpact',
      label: 'Does the hazard affect safe access to the road or public area?',
      options: [
        ['none', 'No'],
        ['limited', 'Limited'],
        ['blocked', 'Blocked / unsafe'],
        ['unknown', 'Unsure'],
      ],
    },
    {
      key: 'conditionTrend',
      label: 'What best describes the condition?',
      options: [
        ['stable', 'Stable'],
        ['recurring', 'Recurring / intermittent'],
        ['worsening', 'Getting worse'],
        ['unknown', 'Unsure'],
      ],
    },
  ],

  'other-assistance': [
    {
      key: 'immediateSafetyRisk',
      label: 'Is there an immediate safety risk?',
      options: [
        ['no', 'No'],
        ['yes', 'Yes'],
        ['unsure', 'Unsure'],
      ],
    },
    {
      key: 'mobilitySupport',
      label: 'Does anyone need help moving or getting somewhere safe?',
      options: [
        ['none', 'No'],
        ['needs_assistance', 'Needs assistance'],
        ['cannot_move', 'Cannot move'],
        ['unknown', 'Unsure'],
      ],
    },
    {
      key: 'affectedCount',
      label: 'How many people are affected?',
      options: [
        ['one', '1 person'],
        ['two_three', '2-3 people'],
        ['four_plus', '4 or more'],
        ['unknown', 'Unsure'],
      ],
    },
  ],
};

const CATEGORY_LABELS = {
  'evac-assistance': 'Evacuation Assistance',
  'bhw-assistance': 'Health Worker / BHW Assistance',
  'road-obstruction': 'Road Obstruction / Fallen Tree',
  'damaged-facility': 'Damaged Public Facility',
  cleanup: 'Drainage / Flood Risk',
  'community-concern': 'Electrical / Streetlight Hazard',
  'other-assistance': 'Other Barangay Assistance',
};

export function nonEmergencySituationComplete(
  concernCode,
  answers
) {
  const questions =
    CONFIG[concernCode] || [];

  return (
    questions.length === 3 &&
    questions.every(
      (question) =>
        Boolean(
          answers?.[question.key]
        )
    )
  );
}

export default function NonEmergencySituationCheck({
  concernCode,
  answers,
  onChange,
  open,
  onClose,
  onComplete,
}) {
  const questions = useMemo(
    () =>
      CONFIG[concernCode] || [],
    [concernCode]
  );

  const [
    stepIndex,
    setStepIndex,
  ] = useState(0);

  useEffect(() => {
    if (!open) {
      return;
    }

    const incompleteIndex =
      questions.findIndex(
        (question) =>
          !answers?.[question.key]
      );

    setStepIndex(
      incompleteIndex === -1
        ? Math.max(
            questions.length - 1,
            0
          )
        : incompleteIndex
    );
  }, [
    open,
    concernCode,
    questions,
    answers,
  ]);

  if (
    !open ||
    !concernCode ||
    questions.length !== 3
  ) {
    return null;
  }

  const question =
    questions[stepIndex];

  const selectedValue =
    answers?.[question.key];

  const handleAnswer = (
    value
  ) => {
    const nextAnswers = {
      ...answers,
      [question.key]: value,
    };

    onChange(
      question.key,
      value
    );

    if (
      stepIndex <
      questions.length - 1
    ) {
      window.setTimeout(
        () =>
          setStepIndex(
            (current) =>
              Math.min(
                current + 1,
                questions.length - 1
              )
          ),
        120
      );

      return;
    }

    const complete =
      questions.every(
        (item) =>
          Boolean(
            nextAnswers[
              item.key
            ]
          )
      );

    if (complete) {
      window.setTimeout(
        () => onComplete?.(),
        120
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/45 backdrop-blur-[1px] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-resqnow-border-soft overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-resqnow-border-soft">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-resqnow-violet/10 text-resqnow-violet flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-4.5 h-4.5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-resqnow-violet">
                  Quick situation check
                </p>

                <span className="text-[10px] font-extrabold text-resqnow-muted">
                  {stepIndex + 1}/3
                </span>
              </div>

              <h2 className="text-[15px] font-extrabold text-resqnow-primary mt-0.5 leading-snug">
                {
                  CATEGORY_LABELS[
                    concernCode
                  ] ||
                  'Barangay Assistance'
                }
              </h2>

              <p className="text-[10px] text-resqnow-muted mt-1 leading-relaxed">
                Three short factual questions only. ResQNow determines the response level from your answers.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close quick situation check"
              className="w-8 h-8 rounded-full border border-resqnow-border-soft text-resqnow-muted flex items-center justify-center shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 h-1.5 rounded-full bg-resqnow-canvas overflow-hidden">
            <div
              className="h-full bg-resqnow-violet transition-all duration-200"
              style={{
                width:
                  `${
                    (
                      (stepIndex + 1) /
                      3
                    ) * 100
                  }%`,
              }}
            />
          </div>
        </div>

        <div className="p-4">
          <div className="rounded-2xl bg-resqnow-canvas border border-resqnow-border-soft p-3">
            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-white border border-resqnow-border text-[10px] font-extrabold text-resqnow-violet flex items-center justify-center shrink-0">
                {selectedValue ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  stepIndex + 1
                )}
              </span>

              <p className="text-[12px] font-extrabold text-resqnow-primary leading-snug pt-0.5">
                {question.label}
              </p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {question.options.map(
                ([
                  value,
                  label,
                ]) => {
                  const selected =
                    selectedValue ===
                    value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        handleAnswer(
                          value
                        )
                      }
                      className={`min-h-[46px] rounded-xl border px-2.5 py-2 text-[11px] font-bold leading-tight active:scale-[0.99] transition-all ${
                        selected
                          ? 'border-resqnow-violet/35 bg-resqnow-violet/10 text-resqnow-violet'
                          : 'border-resqnow-border-soft bg-white text-resqnow-secondary'
                      }`}
                    >
                      {label}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 pt-2 flex items-center gap-2 border-t border-resqnow-border-soft bg-white">
          <button
            type="button"
            onClick={() =>
              setStepIndex(
                (current) =>
                  Math.max(
                    0,
                    current - 1
                  )
              )
            }
            disabled={
              stepIndex === 0
            }
            className="min-h-[42px] px-3 rounded-xl border border-resqnow-border-soft text-resqnow-secondary text-[11px] font-bold disabled:opacity-35 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <p className="text-[10px] text-resqnow-muted flex-1 text-right">
            Tap one answer to continue.
          </p>
        </div>
      </div>
    </div>
  );
}