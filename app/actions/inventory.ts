"use server";

import { z } from "zod";
import { db } from "@/db/index";
import { varieties } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifyAuth } from "./auth";
import { parseWeights, serializeWeights } from "@/app/lib/catalog";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  const session = await verifyAuth(token);
  if (!session || session.role !== "admin") {
    throw new Error("Unauthorized");
  }
}

const VarietyInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().min(2).max(500),
  image: z.string().trim().min(1).max(500),
  pricePerKg: z.number().positive().max(100000),
  allowedWeightsKg: z.array(z.number().int().positive().max(100)).min(1).max(6),
  status: z.enum(["AVAILABLE", "OUT_OF_SEASON", "SOLD_OUT", "PREBOOKING"]),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  isActive: z.boolean().default(true),
});

export type VarietyInput = z.infer<typeof VarietyInputSchema>;

export async function createVariety(input: VarietyInput) {
  await requireAdmin();
  try {
    const v = VarietyInputSchema.parse(input);
    const existing = await db.query.varieties.findFirst({ where: eq(varieties.name, v.name) });
    if (existing) return { success: false, error: `A variety named "${v.name}" already exists.` };

    await db.insert(varieties).values({
      name: v.name,
      description: v.description,
      image: v.image,
      pricePerKg: v.pricePerKg.toFixed(2),
      allowedWeights: serializeWeights(v.allowedWeightsKg),
      status: v.status,
      sortOrder: v.sortOrder,
      isActive: v.isActive,
    });

    revalidatePath("/admin/inventory");
    revalidatePath("/mangoes");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("createVariety failed:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues.map((i) => i.message).join(", ") };
    }
    return { success: false, error: "Failed to create variety." };
  }
}

export async function updateVariety(id: string, input: Partial<VarietyInput>) {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { success: false, error: "Invalid id." };

  try {
    const patch: Record<string, any> = { updatedAt: new Date() };

    if (input.name !== undefined) patch.name = z.string().trim().min(2).max(80).parse(input.name);
    if (input.description !== undefined) patch.description = z.string().trim().min(2).max(500).parse(input.description);
    if (input.image !== undefined) patch.image = z.string().trim().min(1).max(500).parse(input.image);
    if (input.pricePerKg !== undefined) {
      const n = z.number().positive().max(100000).parse(input.pricePerKg);
      patch.pricePerKg = n.toFixed(2);
    }
    if (input.allowedWeightsKg !== undefined) {
      const arr = z.array(z.number().int().positive().max(100)).min(1).max(6).parse(input.allowedWeightsKg);
      patch.allowedWeights = serializeWeights(arr);
    }
    if (input.status !== undefined) patch.status = z.enum(["AVAILABLE", "OUT_OF_SEASON", "SOLD_OUT", "PREBOOKING"]).parse(input.status);
    if (input.sortOrder !== undefined) patch.sortOrder = z.number().int().min(0).max(9999).parse(input.sortOrder);
    if (input.isActive !== undefined) patch.isActive = z.boolean().parse(input.isActive);

    await db.update(varieties).set(patch).where(eq(varieties.id, id));

    revalidatePath("/admin/inventory");
    revalidatePath("/mangoes");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("updateVariety failed:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues.map((i) => i.message).join(", ") };
    }
    return { success: false, error: "Failed to update variety." };
  }
}

export async function quickSetStatus(id: string, status: "AVAILABLE" | "OUT_OF_SEASON" | "SOLD_OUT" | "PREBOOKING") {
  return updateVariety(id, { status });
}

export async function quickSetPrice(id: string, pricePerKg: number) {
  return updateVariety(id, { pricePerKg });
}

export async function deleteVariety(id: string) {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { success: false, error: "Invalid id." };
  try {
    // Soft delete: deactivate instead of removing — preserves order history references.
    await db.update(varieties).set({ isActive: false, updatedAt: new Date() }).where(eq(varieties.id, id));
    revalidatePath("/admin/inventory");
    revalidatePath("/mangoes");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("deleteVariety failed:", error);
    return { success: false, error: "Failed to deactivate variety." };
  }
}

// Helper exported for re-use elsewhere if needed.
export { parseWeights };
