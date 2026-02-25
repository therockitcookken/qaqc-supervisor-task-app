import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/response";
import { getUserFromSession } from "@/lib/auth";
import { canEditContent } from "@/lib/rbac";
export async function GET(){ return ok(await prisma.unit.findMany()); }
export async function POST(req:Request){const user=await getUserFromSession(); if(!user||!canEditContent(user.role)) return fail(403,"forbidden"); const data=await req.json(); const created=await prisma.unit.create({data}); return ok(created);}
export async function PUT(req:Request){const user=await getUserFromSession(); if(!user||!canEditContent(user.role)) return fail(403,"forbidden"); const {id,...data}=await req.json(); if(!id)return fail(400,"invalid_input"); const updated=await prisma.unit.update({where:{id},data}); return ok(updated);} 
export async function DELETE(req:Request){const user=await getUserFromSession(); if(!user||!canEditContent(user.role)) return fail(403,"forbidden"); const {id}=await req.json(); if(!id)return fail(400,"invalid_input"); await prisma.unit.delete({where:{id}}); return ok({deleted:true});}
