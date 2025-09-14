import React from "react";

export default function Breadcrumb({ steps = [], currentStep = 1 }) {
  return (
    <nav className="flex items-center text-sm text-slate-400 mb-6" aria-label="Breadcrumb">
      {steps.map((s, i) => (
        <div key={i} className={`flex items-center ${i !== steps.length - 1 ? "mr-3" : ""}`}>
          <span className={`${currentStep === i + 1 ? "text-teal-400 font-semibold" : ""}`}>{i + 1}. {s.name}</span>
          {i < steps.length - 1 && <span className="mx-2">→</span>}
        </div>
      ))}
    </nav>
  );
}