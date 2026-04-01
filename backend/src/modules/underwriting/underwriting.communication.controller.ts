import { FastifyReply, FastifyRequest } from 'fastify';
import * as communicationService from './underwriting.communication.service';
import fs from 'fs';
import path from 'path';

export async function getTimeline(
  request: FastifyRequest<{ Params: { entityType: string; entityId: string } }>,
  reply: FastifyReply
) {
  const { entityType, entityId } = request.params;
  const notes = await communicationService.getNotes(entityType.toUpperCase(), entityId);
  return reply.send(notes);
}

export async function postNote(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    let data: any = {};
    let fileUrl: string | undefined = undefined;

    if (request.isMultipart()) {
      const parts = request.parts();
      for await (const part of parts) {
        if (part.type === 'file') {
          const fileName = `underwriting_${Date.now()}_${part.filename}`;
          const uploadPath = path.join(__dirname, '../../../public/uploads', fileName);
          const buffer = await part.toBuffer();
          await fs.promises.writeFile(uploadPath, buffer);
          fileUrl = `/uploads/${fileName}`;
        } else {
          data[part.fieldname] = (part as any).value;
        }
      }
    } else {
      data = request.body;
    }

    if (!data.entity_id || !data.entity_type || !data.message) {
      return reply.status(400).send({ message: 'Missing required fields' });
    }

    const note = await communicationService.createNote({
      entity_id: data.entity_id,
      entity_type: data.entity_type.toUpperCase(),
      message: data.message,
      from_role: (request.user as any).role,
      attachment_url: fileUrl
    });

    return reply.status(201).send(note);
  } catch (error: any) {
    return reply.status(500).send({ message: error.message });
  }
}
