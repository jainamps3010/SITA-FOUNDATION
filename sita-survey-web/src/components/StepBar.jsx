import React from 'react'

export default function StepBar({ current, steps }) {
  return (
    <div className="step-bar">
      {steps.map((label, i) => {
        const num = i + 1
        const isDone = num < current
        const isActive = num === current
        const cls = isDone ? 'done' : isActive ? 'active' : 'inactive'
        return (
          <React.Fragment key={i}>
            <div className="step">
              <div className={`step-num ${cls}`}>
                {isDone ? '✓' : num}
              </div>
              <span className={`step-label ${cls}`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`step-connector ${isDone ? 'done' : ''}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
