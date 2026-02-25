import { getUserFromSession } from "@/lib/auth";
import { ok } from "@/lib/response";
export async function GET(){ return ok(await getUserFromSession()); }
