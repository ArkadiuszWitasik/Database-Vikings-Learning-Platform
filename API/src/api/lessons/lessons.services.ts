import { Lesson, Prisma } from '@prisma/client';
import { db } from '../../db';

export function createLessonByName(lesson: Prisma.LessonCreateInput) {
  return db.lesson.create({
    data: lesson,
  });
}

export function findLessonById(id: Lesson['id']) {
  return db.lesson.findUnique({
    where: {
      id,
    },
  });
}

export function updateLesson(
  id: Lesson['id'],
  lesson: Pick<Prisma.LessonUpdateInput, 'number' | 'image'>
) {
  return db.lesson.update({
    where: {
      id,
    },
    data: lesson,
  });
}

export function deleteLesson(id: Lesson['id']) {
  return db.lesson.delete({
    where: {
      id,
    },
  });
}
