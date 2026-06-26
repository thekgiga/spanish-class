import { Response } from "express";
import { prisma } from "../lib/prisma.js";

// In-memory SSE connections: userId → Set of response objects
const connections = new Map<string, Set<Response>>();

export function addSSEConnection(userId: string, res: Response): void {
  if (!connections.has(userId)) connections.set(userId, new Set());
  connections.get(userId)!.add(res);
}

export function removeSSEConnection(userId: string, res: Response): void {
  connections.get(userId)?.delete(res);
  if (connections.get(userId)?.size === 0) connections.delete(userId);
}

function push(userId: string, eventName: string, data: unknown): void {
  const conns = connections.get(userId);
  if (!conns) return;
  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of conns) {
    try {
      res.write(payload);
    } catch {
      conns.delete(res);
    }
  }
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  href?: string,
): Promise<void> {
  const notification = await prisma.notification.create({
    data: { userId, type, title, body, href: href ?? null },
  });
  push(userId, "notification", notification);
}

export async function markRead(id: string, userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { id, userId },
    data: { readAt: new Date() },
  });
}

export async function markAllRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function getNotifications(userId: string, limit = 30) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: [{ readAt: "asc" }, { createdAt: "desc" }],
    take: limit,
  });
}
