import { prisma } from '../../config/db';

export async function getNotes(entityType: string, entityId: string) {
  return prisma.uICommunications.findMany({
    where: {
      entity_type: entityType,
      entity_id: entityId,
    },
    orderBy: {
      created_at: 'asc',
    },
  });
}

export async function createNote(data: {
  entity_type: string;
  entity_id: string;
  message: string;
  from_role: string;
  attachment_url?: string;
}) {
  return prisma.uICommunications.create({
    data,
  });
}
