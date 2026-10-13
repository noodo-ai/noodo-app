import { ChevronDown } from 'lucide-react'
import { useElapsedTime } from '../hooks/useElapsedTime'
import { DataCards } from '../../assistant/components/DataCards'
import { statusLabels, toolLabels } from '../../assistant/progress'
import type { DataCard, RunActivity } from '../../assistant/types'
import { AssistantMarkdown } from './AssistantMarkdown'

export interface ResponseStepsProps {
  activity: RunActivity[]
  cards: DataCard[]
  responding: boolean
  startedAt?: number
  completedAt?: number | null
}

export function ResponseSteps({ activity, cards, responding, startedAt, completedAt }: ResponseStepsProps) {
  const toolIds = new Set(activity.filter((item) => item.type === 'tool').map((item) => item.id))
  const unmatchedCards = cards.filter((card) => !toolIds.has(card.id))
  const answers = activity.filter((item) => item.type === 'text' && item.phase === 'final')
  const progress = activity.filter((item) => item.type !== 'text' || item.phase !== 'final')
  const hasAnswer = answers.some((item) => item.type === 'text' && item.text.trim().length > 0)
  const elapsed = useElapsedTime(startedAt, completedAt, responding && !hasAnswer)

  return (
    <>
      <div className="response-sections" aria-label="Response activity">
        {(progress.length > 0 || unmatchedCards.length > 0) && (
          <details className="response-progress" open={!hasAnswer}>
            <summary className="response-progress-toggle">
              <span>Elapsed {elapsed}</span>
              <ChevronDown size={14} strokeWidth={1.6} aria-hidden="true" />
            </summary>
            <div className="response-progress-content">
              {progress.map((item) => (
                <div className={`response-section response-${item.type === 'text' ? item.phase : 'tool'}`} key={item.id}>
                  {item.type === 'text' ? (
                    <>
                      {item.phase === 'pending' && responding && <span className="response-phase">Responding</span>}
                      <AssistantMarkdown text={item.text} />
                    </>
                  ) : (
                    <>
                      <div className="response-tool-heading">{toolLabels[item.name] ?? 'Read-only query'}</div>
                      <p className="response-tool-status" role="status">{statusLabels[item.status] ?? 'Pending'}</p>
                      <DataCards cards={cards.filter((card) => card.id === item.id)} />
                    </>
                  )}
                </div>
              ))}
              {unmatchedCards.length > 0 && <DataCards cards={unmatchedCards} />}
            </div>
          </details>
        )}
        {answers.map((item) => item.type === 'text' && (
          <div className="response-section response-final" key={item.id}>
            <AssistantMarkdown text={item.text} />
          </div>
        ))}
      </div>
    </>
  )
}
