import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'

function handleError(error: unknown): never {
  const code = (error as { code?: string }).code
  if (code === 'P2002') throw new AppError(409, 'A category with this name already exists')
  if (code === 'P2025') throw new AppError(404, 'Category not found')
  throw error
}

export function listCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { events: true } } },
  })
}

export async function createCategory(data: { name: string; description?: string }) {
  try {
    return await prisma.category.create({ data })
  } catch (error) {
    return handleError(error)
  }
}

export async function updateCategory(
  id: string,
  data: { name?: string; description?: string },
) {
  try {
    return await prisma.category.update({ where: { id }, data })
  } catch (error) {
    return handleError(error)
  }
}

export async function deleteCategory(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { events: true } } },
  })
  if (!category) throw new AppError(404, 'Category not found')

  if (category._count.events > 0) {
    throw new AppError(
      409,
      `Cannot delete: ${category._count.events} event(s) still use this category`,
    )
  }

  await prisma.category.delete({ where: { id } })
}