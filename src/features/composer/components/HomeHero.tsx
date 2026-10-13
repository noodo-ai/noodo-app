import { examples } from '../data'
import { Composer, type ComposerProps } from './Composer'
export function HomeHero(props: ComposerProps) {
  return (
    <section className="hero" aria-labelledby="home-title">
      <div className="hero-center">
        <div className="wordmark" id="home-title">
          <span className="wordmark-lead">LET’S</span>
          <span className="wordmark-name">NOODO</span>
        </div>
        <p className="scope-note">
          Understand markets, positions and risk on Hyperliquid.
        </p>
        <div className="assistant-examples">
          {examples.map((question) => (
            <button
              type="button"
              key={question}
              disabled={props.disabled || props.busy}
              onClick={() => props.onChange(question)}
            >
              {question}
            </button>
          ))}
        </div>
      </div>
      <div className="home-composer">
        <Composer {...props} />
      </div>
    </section>
  )
}
