import type { Request, Response } from 'express'
import {
  createFeedbackSchema,
  listFeedbackQuerySchema,
  listParticipantsQuerySchema,
} from '../validators/feedback'
import * as feedbackService from '../services/feedback.service'
import * as participantService from '../services/participant.service'
import * as analyticsService from '../services/analytics.service'

export async function createFeedback(req: Request, res: Response) {
  const input = createFeedbackSchema.parse(req.body)
  const feedback = await feedbackService.createFeedback(
    String(req.params.id),
    res.locals.user.id,
    input,
  )
  res.status(201).json({ feedback })
}

export async function listFeedback(req: Request, res: Response) {
  const query = listFeedbackQuerySchema.parse(req.query)
  res.json(await feedbackService.listFeedback(query))
}

export async function listParticipants(req: Request, res: Response) {
  const query = listParticipantsQuerySchema.parse(req.query)
  res.json(await participantService.listParticipants(query))
}

export async function getParticipant(req: Request, res: Response) {
  res.json({ participant: await participantService.getParticipant(String(req.params.id)) })
}

export async function overview(_req: Request, res: Response) {
  res.json(await analyticsService.getOverview())
}