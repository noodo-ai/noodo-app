import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function AssistantMarkdown({ text }: { text: string }) {
  return (
    <div className="assistant-text">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="markdown-table-wrap">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {text}
      </Markdown>
    </div>
  )
}
