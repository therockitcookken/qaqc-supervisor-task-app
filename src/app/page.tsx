'use client'

import { useEffect, useMemo, useState } from 'react'
import { addTask, fetchTasks, subscribeTasks, TaskRow } from '@/lib/realtimeTasks'

export default function Home() {
  // workspace demo: sau này thay bằng workspace theo user
  const workspaceId = useMemo(() => 'NV-DEMO', [])
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [title, setTitle] = useState('')

  useEffect(() => {
    let unsub: null | (() => void) = null

    ;(async () => {
      const initial = await fetchTasks(workspaceId)
      setTasks(initial)

      unsub = subscribeTasks(workspaceId, (row) => {
        setTasks((prev) => {
          // upsert theo id, ưu tiên bản có updated_at mới hơn
          const i = prev.findIndex((x) => x.id === row.id)
          if (i === -1) return [row, ...prev]

          const cur = prev[i]
          const newer = new Date(row.updated_at).getTime() >= new Date(cur.updated_at).getTime()
          if (!newer) return prev

          const copy = prev.slice()
          copy[i] = row
          // đưa lên đầu theo updated_at
          copy.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          return copy
        })
      })
    })()

    return () => {
      if (unsub) unsub()
    }
  }, [workspaceId])

  async function onAdd() {
    const t = title.trim()
    if (!t) return
    setTitle('')
    await addTask(workspaceId, t)
  }

  return (
    <main style={{ padding: 16, fontFamily: 'system-ui' }}>
      <h1>QAQC Tasks (Realtime)</h1>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nhập task..."
          style={{ padding: 8, width: 320 }}
        />
        <button onClick={onAdd} style={{ padding: '8px 12px' }}>
          Add
        </button>
      </div>

      <p style={{ marginTop: 12, opacity: 0.7 }}>
        Workspace: <b>{workspaceId}</b> (mở 2 máy / 2 tab để test sync)
      </p>

      <ul style={{ marginTop: 12 }}>
        {tasks.map((t) => (
          <li key={t.id}>
            <b>{t.title}</b> — {t.status} — <small>{new Date(t.updated_at).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </main>
  )
}
