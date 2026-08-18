import { capabilities } from '../data'
import type { ComposerMode } from '../types'
import { Composer } from './Composer'

export interface HomeHeroProps {
  input: string
  mode: ComposerMode
  focusRequest: number
  onInputChange: (value: string) => void
  onModeChange: (mode: ComposerMode) => void
  onSubmit: () => void
  onPickPrompt: (prompt: string) => void
}

export function HomeHero({ input, mode, focusRequest, onInputChange, onModeChange, onSubmit, onPickPrompt }: HomeHeroProps) {
  return (
    <section className="hero" aria-labelledby="home-title">
      <div className="wordmark" id="home-title">NOODO</div>
      <Composer value={input} onChange={onInputChange} onSubmit={onSubmit} mode={mode} onModeChange={onModeChange} focusRequest={focusRequest} />
      <div className="capabilities" aria-label="Quick actions">
        {capabilities.map(({ label, Icon, prompt }) => (
          <button type="button" key={label} onClick={() => onPickPrompt(prompt)}><Icon size={16} strokeWidth={1.55} />{label}</button>
        ))}
      </div>
    </section>
  )
}
