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
  // N2: Check if user has disabled this notification type
  const pref = await prisma.notificationPreference.findUnique({
    where: { userId_type: { userId, type } },
  });
  if (pref && !pref.enabled) return;

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

// N4: Support pagination
export async function getNotifications(
  userId: string,
  page = 1,
  limit = 20,
): Promise<{ notifications: unknown[]; total: number }> {
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: [{ readAt: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);
  return { notifications, total };
}
