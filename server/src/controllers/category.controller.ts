import type { Request, Response } from 'express'
import { createCategorySchema, updateCategorySchema } from '../validators/category'
import * as service from '../services/category.service'

export async function list(_req: Request, res: Response) {
  res.json({ categories: await service.listCategories() })
}

export async function create(req: Request, res: Response) {
  const data = createCategorySchema.parse(req.body)
  res.status(201).json({ category: await service.createCategory(data) })
}

export async function update(req: Request, res: Response) {
  const data = updateCategorySchema.parse(req.body)
  res.json({ category: await service.updateCategory(String(req.params.id), data) })
}

export async function remove(req: Request, res: Response) {
  await service.deleteCategory(String(req.params.id))
  res.json({ message: 'Category deleted' })
}
