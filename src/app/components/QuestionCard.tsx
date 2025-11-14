"use client";

import { useState } from "react";

export type QuestionType = "single" | "multi" | "textarea" | "scale";

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface ScaleConfig {
  min: number;
  max: number;
  step: number;
  labels?: string[];
}

export type AnswerValue = string | string[] | number | { text: string };

export type AnswerMap = Record<string, AnswerValue | undefined>;

export interface QuestionDefinition {
  id: string;
  title: string;
  prompt: string;
  helper?: string;
  type: QuestionType;
  options?: QuestionOption[];
  scale?: ScaleConfig;
  placeholder?: string;
  shouldAsk?: (answers: AnswerMap) => boolean;
}

interface QuestionCardProps {
  question: QuestionDefinition;
  onAnswer: (value: AnswerValue) => void;
  defaultValue?: AnswerValue;
  isLastStep?: boolean;
}

export function QuestionCard({ question, onAnswer, defaultValue, isLastStep }: QuestionCardProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>(
    Array.isArray(defaultValue) ? defaultValue : []
  );
  const [selectedSingle, setSelectedSingle] = useState<string>(
    typeof defaultValue === "string" ? defaultValue : ""
  );
  const [textValue, setTextValue] = useState<string>(
    typeof defaultValue === "object" && defaultValue !== null && "text" in defaultValue
      ? String(defaultValue.text)
      : ""
  );
  const [scaleValue, setScaleValue] = useState<number>(
    typeof defaultValue === "number" && !Number.isNaN(defaultValue)
      ? defaultValue
      : question.scale?.min ?? 0
  );

  function toggleMultiValue(value: string) {
    setSelectedValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function handleSubmit() {
    if (question.type === "multi") {
      onAnswer(selectedValues);
      return;
    }

    if (question.type === "single") {
      onAnswer(selectedSingle);
      return;
    }

    if (question.type === "textarea") {
      onAnswer({ text: textValue.trim() });
      return;
    }

    if (question.type === "scale") {
      onAnswer(scaleValue);
    }
  }

  const disableSubmit =
    (question.type === "multi" && selectedValues.length === 0) ||
    (question.type === "single" && !selectedSingle) ||
    (question.type === "textarea" && textValue.trim().length < 3 && !!question.placeholder);

  return (
    <div
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: "18px",
        padding: "2.5rem",
        boxShadow: "0 18px 40px rgba(25, 37, 20, 0.15)",
        border: "1px solid rgba(122, 147, 105, 0.18)",
        marginBottom: "1.5rem",
        backdropFilter: "blur(6px)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
        <span
          style={{
            backgroundColor: "var(--accent)",
            color: "white",
            padding: "0.35rem 0.85rem",
            borderRadius: "999px",
            fontSize: "0.75rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase"
          }}
        >
          Agentic Prompt
        </span>
        <h2 style={{ margin: 0, fontSize: "1.65rem" }}>{question.title}</h2>
      </div>
      <p style={{ marginTop: 0, marginBottom: "1.25rem", maxWidth: "62ch" }}>{question.prompt}</p>
      {question.helper ? (
        <p style={{ marginTop: "-0.75rem", marginBottom: "1.5rem", color: "rgba(33, 41, 32, 0.75)" }}>
          {question.helper}
        </p>
      ) : null}
      {question.type === "multi" && question.options ? (
        <div
          style={{
            display: "grid",
            gap: "0.75rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            marginBottom: "1.5rem"
          }}
        >
          {question.options.map((option) => {
            const isActive = selectedValues.includes(option.value);
            return (
              <button
                key={option.value}
                onClick={() => toggleMultiValue(option.value)}
                style={{
                  textAlign: "left",
                  padding: "1rem",
                  borderRadius: "14px",
                  border: isActive ? "2px solid var(--accent)" : "1px solid rgba(59, 82, 56, 0.25)",
                  backgroundColor: isActive ? "rgba(92, 142, 79, 0.12)" : "rgba(255,255,255,0.6)",
                  color: "inherit",
                  cursor: "pointer",
                  transition: "all 0.18s ease"
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: "0.35rem" }}>{option.label}</div>
                {option.description ? (
                  <div style={{ fontSize: "0.85rem", opacity: 0.75 }}>{option.description}</div>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {question.type === "single" && question.options ? (
        <div
          style={{
            display: "grid",
            gap: "0.75rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            marginBottom: "1.5rem"
          }}
        >
          {question.options.map((option) => {
            const isActive = selectedSingle === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setSelectedSingle(option.value)}
                style={{
                  textAlign: "left",
                  padding: "1.1rem",
                  borderRadius: "14px",
                  border: isActive ? "2px solid var(--accent)" : "1px solid rgba(59, 82, 56, 0.22)",
                  backgroundColor: isActive ? "rgba(92, 142, 79, 0.12)" : "rgba(255,255,255,0.8)",
                  color: "inherit",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontSize: "1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span>{option.label}</span>
                {option.description ? (
                  <span style={{ fontSize: "0.78rem", opacity: 0.7 }}>{option.description}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {question.type === "scale" && question.scale ? (
        <div style={{ marginBottom: "2rem" }}>
          <input
            type="range"
            min={question.scale.min}
            max={question.scale.max}
            step={question.scale.step}
            value={scaleValue}
            onChange={(event) => setScaleValue(Number(event.target.value))}
            style={{ width: "100%" }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "0.5rem",
              fontSize: "0.85rem",
              color: "rgba(20, 31, 20, 0.7)"
            }}
          >
            {question.scale.labels?.map((label, index) => (
              <span key={label} style={{ transform: index === 0 ? "translateX(-6px)" : index === question.scale!.labels!.length - 1 ? "translateX(6px)" : "none" }}>
                {label}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {question.type === "textarea" ? (
        <textarea
          value={textValue}
          onChange={(event) => setTextValue(event.target.value)}
          placeholder={question.placeholder}
          rows={5}
          style={{
            width: "100%",
            padding: "1rem",
            borderRadius: "12px",
            border: "1px solid rgba(59, 82, 56, 0.25)",
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            resize: "vertical",
            fontSize: "1rem",
            marginBottom: "1.25rem"
          }}
        />
      ) : null}

      <button
        onClick={handleSubmit}
        disabled={disableSubmit}
        style={{
          backgroundColor: disableSubmit ? "rgba(148, 166, 137, 0.4)" : "var(--accent)",
          color: "white",
          padding: "0.95rem 2.5rem",
          borderRadius: "999px",
          border: "none",
          fontSize: "1rem",
          fontWeight: 600,
          cursor: disableSubmit ? "not-allowed" : "pointer",
          transition: "background-color 0.2s ease"
        }}
      >
        {isLastStep ? "See Results" : "Lock This In"}
      </button>
    </div>
  );
}
