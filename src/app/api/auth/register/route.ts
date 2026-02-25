import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/response";
import { hashPassword, createSession } from "@/lib/auth";
import { z } from "zod";
import { hit } from "@/lib/rateLimit";
const schema = z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().min(1) });
export async function POST(req: Request){
  if(!hit("register",10)) return fail(429,"rate_limited");
  const parsed=schema.safeParse(await req.json()); if(!parsed.success) return fail(400,"invalid_input");
  const existing=await prisma.user.findUnique({where:{email:parsed.data.email}}); if(existing) return fail(409,"email_exists");
  const user=await prisma.user.create({data:{...parsed.data,passwordHash:await hashPassword(parsed.data.password), role:"Student"}});
  await createSession(user.id);
  return ok({id:user.id,email:user.email,role:user.role});
}
