import { Response, Request, NextFunction } from 'express';
import { EnumRole, ParsedToken } from '../../../typings/token';
import { ParamsWithId } from 'interfaces/ParamsWithId';
import MessageResponse from 'interfaces/MessageResponse';
import * as UserServices from './users.services';

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken = req.user;
    const user = await UserServices.findUserById(parsedToken.userId);

    if (!user) {
      res.status(404);
      throw new Error('User not found.');
    }

    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    if (user.role === EnumRole.STUDENT) {
      const student = await UserServices.findStudentByUserId(user.id);
      console.log(student);

      if (student) {
        res.json({
          ...userData,
          studentInfos: {
            studentId: student.id,
            indexNumber: student.indexNumber,
            score: student.score,
            health: student.health,
            rank: student.rank,
            groupId: student.groupId,
            answersId: student.answersId,
            idCheck: student.userId,
          },
        });
      } else {
        res.status(404);
        throw new Error('Student not found');
      }
    }

    if (user.role === EnumRole.LECTURER || user.role === EnumRole.SUPERUSER) {
      const lecturer = await UserServices.findLecturerByUserId(user.id);
      if (lecturer) {
        res.json({
          ...userData,
          lecturerInfos: {
            lecturerId: lecturer.id,
            isAdmin: lecturer.isAdmin,
            idCheck: lecturer.userId,
          },
        });
      } else {
        res.status(404);
        throw new Error('Lecturer not found');
      }
    }
  } catch (error) {
    next(error);
  }
}

export async function updateUser(
  req: Request<ParamsWithId, MessageResponse>,
  res: Response<MessageResponse>,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { firstName, lastName, password, role } = req.body;

    const user = await UserServices.findUserById(+id);

    if (!user) {
      res.status(404);
      throw new Error(`User with given id doesn't exists.`);
    }

    await UserServices.updateUser(+id, {
      firstName,
      lastName,
      password,
      role,
    });

    res.json({
      message: `User with id: ${id} was updated successfully.`,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(
  req: Request<ParamsWithId, MessageResponse>,
  res: Response<MessageResponse>,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const user = await UserServices.findUserById(+id);

    if (!user) {
      res.status(404);
      throw new Error(`User with given id doesn't exists.`);
    }

    await UserServices.deleteUser(+id);

    res.json({
      message: `User with id: ${id} was deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
}
