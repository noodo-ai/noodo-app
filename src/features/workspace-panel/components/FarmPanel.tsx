import { useState } from 'react'
import { farmAgents } from '../data'
import { AgentDetailPage } from './AgentDetailPage'
import { ConnectAgentPage } from './ConnectAgentPage'
import { FarmAgentList } from './FarmAgentList'

type FarmPage = { kind: 'list' } | { kind: 'detail'; agentName: string } | { kind: 'connect' }

export function FarmPanel() {
  const [page, setPage] = useState<FarmPage>({ kind: 'list' })
  const showList = () => setPage({ kind: 'list' })

  if (page.kind === 'detail') {
    const agent = farmAgents.find(({ name }) => name === page.agentName)
    if (agent) return <AgentDetailPage agent={agent} onBack={showList} />
  }

  if (page.kind === 'connect') return <ConnectAgentPage onBack={showList} />

  return <FarmAgentList onSelectAgent={(agentName) => setPage({ kind: 'detail', agentName })} onConnectAgent={() => setPage({ kind: 'connect' })} />
}
