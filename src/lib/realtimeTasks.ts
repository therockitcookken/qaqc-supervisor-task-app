import { supabase } from '@/lib/supabaseClient'

export type TaskRow = {
  workspace_id: string
  id: string
  title: string
  status: string
  updated_at: string
}

// Load initial
export async function fetchTasks(workspaceId: string) {
  const { data, error } = await supabase
    .from('qaqc_tasks')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as TaskRow[]
}

// Insert new
export async function addTask(workspaceId: string, title: string) {
  const { error } = await supabase.from('qaqc_tasks').insert({
    workspace_id: workspaceId,
    title,
    status: 'open',
  })
  if (error) throw error
}

// Subscribe realtime
export function subscribeTasks(workspaceId: string, onChange: (row: TaskRow) => void) {
  const channel = supabase
    .channel(`qaqc_tasks:${workspaceId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'qaqc_tasks', filter: `workspace_id=eq.${workspaceId}` },
      (payload) => {
        const row = (payload.new ?? payload.old) as TaskRow
        if (row) onChange(row)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
