import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/response";
import { verifyPassword, createSession } from "@/lib/auth";
import { z } from "zod";
import { hit } from "@/lib/rateLimit";
const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
export async function POST(req: Request){
  if(!hit("login",20)) return fail(429,"rate_limited");
  const parsed=schema.safeParse(await req.json()); if(!parsed.success) return fail(400,"invalid_input");
  const user=await prisma.user.findUnique({where:{email:parsed.data.email}}); if(!user) return fail(401,"invalid_credentials");
  if(!(await verifyPassword(parsed.data.password,user.passwordHash))) return fail(401,"invalid_credentials");
  await createSession(user.id);
  return ok({id:user.id,email:user.email,role:user.role});
}
