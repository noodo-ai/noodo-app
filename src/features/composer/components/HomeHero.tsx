import { capabilities, type CapabilityId } from '../data'
import type { ComposerMode } from '../types'
import { Composer } from './Composer'

export interface HomeHeroProps {
  input: string
  mode: ComposerMode
  onInputChange: (value: string) => void
  onModeChange: (mode: ComposerMode) => void
  onSubmit: () => void
  onOpenCapability: (capability: CapabilityId) => void
}

export function HomeHero({ input, mode, onInputChange, onModeChange, onSubmit, onOpenCapability }: HomeHeroProps) {
  return (
    <section className="hero" aria-labelledby="home-title">
      <div className="hero-center">
        <div className="wordmark" id="home-title">
          <span className="wordmark-lead">LET’S</span>
          <span className="wordmark-name">NOODO</span>
        </div>
        <div className="capabilities" aria-label="Quick actions">
          {capabilities.map(({ id, label, Icon }) => (
            <button type="button" key={id} onClick={() => onOpenCapability(id)}><Icon size={16} strokeWidth={1.55} />{label}</button>
          ))}
        </div>
      </div>
      <div className="home-composer">
        <Composer value={input} onChange={onInputChange} onSubmit={onSubmit} mode={mode} onModeChange={onModeChange} />
      </div>
    </section>
  )
}
