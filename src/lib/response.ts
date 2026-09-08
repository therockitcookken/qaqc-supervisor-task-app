export const ok = (data: unknown) => Response.json({ ok: true, data, error: null });
export const fail = (code: number, error: string) => Response.json({ ok: false, data: null, error }, { status: code });
