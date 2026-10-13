import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import { AssistantMarkdown } from './AssistantMarkdown'

it('renders answer headings, tables, emphasis, code and lists', () => {
  const html = renderToStaticMarkup(
    <AssistantMarkdown
      text={
        '## Account positions\n\n**Account address:** `0x123`\n\n| Item | Status |\n| --- | --- |\n| Positions | No positions |\n\n- Default perpetuals'
      }
    />,
  )
  expect(html).toContain('<h2>Account positions</h2>')
  expect(html).toContain('<strong>Account address:</strong>')
  expect(html).toContain('<code>0x123</code>')
  expect(html).toContain('class="markdown-table-wrap"')
  expect(html).toContain('<th>Item</th>')
  expect(html).toContain('<td>No positions</td>')
  expect(html).toContain('<li>Default perpetuals</li>')
})

it('does not execute HTML or unsafe links from model output', () => {
  const html = renderToStaticMarkup(
    <AssistantMarkdown
      text={'<script>alert(1)</script>\n\n[link](javascript:alert%281%29)'}
    />,
  )
  expect(html).not.toContain('<script>')
  expect(html).not.toContain('href="javascript:')
})
