import * as bcrypt from 'bcrypt';
import { db } from '../../db';
import type { User, Prisma, Student } from '@prisma/client';

export function findUserById(id: User['id']) {
  return db.user.findUnique({
    where: {
      id,
    },
  });
}

export function findUserByEmail(email: string) {
  return db.user.findUnique({
    where: {
      email,
    },
  });
}

export function findStudentByIndexNumber(indexNumber: Student['indexNumber']) {
  return db.user.findUnique({
    where: {
      email: `${indexNumber}@student.uwm.edu.pl`,
    },
  });
}

export function createUser(user: Prisma.UserCreateInput) {
  user.password = bcrypt.hashSync(user.password, 12);
  return db.user.create({
    data: user,
  });
}

export function createLecturer(lecturer: Prisma.LecturerCreateInput) {
  return db.lecturer.create({
    data: lecturer,
  });
}

export function createStudent(student: Prisma.StudentCreateInput) {
  return db.student.create({
    data: student,
  });
}

export function updateUser(id: User['id'], user: Prisma.UserUpdateInput) {
  return db.user.update({
    where: {
      id,
    },
    data: user,
  });
}

export function deleteUser(id: User['id']) {
  return db.user.delete({
    where: {
      id,
    },
  });
}
