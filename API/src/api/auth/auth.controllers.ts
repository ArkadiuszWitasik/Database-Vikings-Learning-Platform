import { Response, Request, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { generateTokens, verifyRefreshToken } from '../../utils/jwt';
import { generatePasswordByCredentials } from '../../utils/generatePassword';
import { hashToken } from '../../utils/hashToken';
import MessageResponse, { LoginResponse } from 'interfaces/MessageResponse';
import * as UserServices from '../users/users.services';
import * as AuthSchemas from './auth.schemas';
import * as AuthServices from './auth.services';
import * as GroupServices from '../groups/groups.services';
import { EnumRole } from '../../../typings/token';
import { Student } from '@prisma/client';

export async function registerManyStudents(
  req: Request<
    {},
    {},
    AuthSchemas.RegisterManyStudentsInput,
    AuthSchemas.RegisterQuerySchema
  >,
  res: Response<
    | MessageResponse
    | {
        existingStudents: Student['indexNumber'][];
      }
  >,
  next: NextFunction
) {
  try {
    const { lecturerId, groupName, studentsToRegister } = req.body;

    const existingLecturer = await UserServices.findLecturerById(lecturerId);

    if (!existingLecturer) {
      return res.status(422).json({
        message: 'Lecturer with given id does not exist',
      });
    }

    const existingGroup = await GroupServices.findGroupByName(groupName);

    if (existingGroup) {
      return res.status(422).json({
        message: 'Group with given name already exists',
      });
    }

    const newGroup = await GroupServices.createGroup({
      name: groupName,
      Lecturer: { connect: { id: lecturerId } },
    });

    const existingUsers = await UserServices.findManyUsersByEmail(
      studentsToRegister.map(
        (student) => `${student.indexNumber}@student.uwm.edu.pl`
      )
    );

    if (existingUsers.length > 0) {
      return res.status(422).json({
        message: 'Some students already exist',
        existingStudents: existingUsers.map(
          (student) => +student.email.split('@')[0]
        ),
      });
    }

    const usersToCreate = studentsToRegister.map((student) => ({
      email: `${student.indexNumber}@student.uwm.edu.pl`.toLowerCase(),
      password: bcrypt.hashSync(
        generatePasswordByCredentials(
          student.firstName,
          student.lastName,
          student.indexNumber
        ),
        12
      ),
      firstName: student.firstName,
      lastName: student.lastName,
    }));

    const createdUsers = await UserServices.createManyUsers(usersToCreate);

    if (createdUsers.count > 0) {
      const studentsEmails = studentsToRegister.map(
        (student) => `${student.indexNumber}@student.uwm.edu.pl`
      );

      const newUsers = await UserServices.findManyUsersByEmail(studentsEmails);

      const studentsToCreate = newUsers.map((user) => ({
        indexNumber: +user.email.split('@')[0],
        groupId: newGroup.id,
        userId: user.id,
      }));

      const createStudents =
        await UserServices.createManyStudents(studentsToCreate);

      const createdStudentsCount = createStudents.count;

      if (createdStudentsCount > 0) {
        const refreshTokens = newUsers.map((user) => ({
          jti: uuidv4(),
          refreshToken: generateTokens(user, uuidv4()).refreshToken,
          userId: user.id,
        }));

        await AuthServices.addManyRefreshTokensToWhitelist(refreshTokens);
      } else {
        return res.status(500).json({
          message: 'An error occurred while creating students',
        });
      }
    } else {
      return res.status(500).json({
        message: 'An error occurred while creating users',
      });
    }

    res.json({
      message: 'Students created successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function registerStudent(
  req: Request<{}, {}, AuthSchemas.RegisterStudentInput>,
  res: Response<MessageResponse>,
  next: NextFunction
) {
  try {
    const { firstName, lastName, indexNumber, groupId } = req.body;

    const existingUser =
      await UserServices.findStudentByIndexNumber(indexNumber);

    if (existingUser) {
      res.status(400);
      throw new Error('This student already exists.');
    }

    const generatedPassword = generatePasswordByCredentials(
      firstName,
      lastName,
      indexNumber
    );

    const user = await UserServices.createUser({
      email: `${indexNumber}@student.uwm.edu.pl`,
      password: generatedPassword,
      firstName,
      lastName,
    });

    if (user) {
      await UserServices.createStudent({
        indexNumber,
        Group: { connect: { id: groupId } },
        User: { connect: { id: user.id } },
      });
    }

    const jti = uuidv4();
    const { refreshToken } = generateTokens(user, jti);

    await AuthServices.addRefreshTokenToWhitelist({
      jti,
      refreshToken,
      userId: user.id,
    });

    res.json({
      message: `Student ${user.firstName} ${user.lastName} created and added to group with id: ${groupId} successfully.`,
    });
  } catch (error) {
    next(error);
  }
}

// export const registerStudentAndAddToGroup = async (
//   req: Request<{}, {}, AuthSchemas.RegisterStudentInput>,
//   res: Response<MessageResponse>,
//   next: NextFunction
// ) => {
//   try {
//     const { firstName, lastName, indexNumber, groupId } = req.body;

//     const existingUser =
//       await UserServices.findStudentByIndexNumber(indexNumber);

//     if (existingUser) {
//       res.status(400);
//       throw new Error('This student already exists.');
//     }

//     const generatedPassword = generatePasswordByCredentials(
//       firstName,
//       lastName,
//       indexNumber
//     );

//     const user = await UserServices.createUser({
//       email: `${indexNumber}@student.uwm.edu.pl`,
//       password: generatedPassword,
//       firstName,
//       lastName,
//     });

//     if (user) {
//       await UserServices.createStudent({
//         indexNumber,
//         Group: { connect: { id: groupId } },
//         User: { connect: { id: user.id } },
//       });
//     }

//     const jti = uuidv4();
//     const { refreshToken } = generateTokens(user, jti);

//     await AuthServices.addRefreshTokenToWhitelist({
//       jti,
//       refreshToken,
//       userId: user.id,
//     });

//     res.json({
//       message: `Student ${user.firstName} ${user.lastName} created successfully.`,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export async function registerLecturer(
  req: Request<
    {},
    {},
    AuthSchemas.RegisterLecturerInput,
    AuthSchemas.RegisterQuerySchema
  >,
  res: Response<MessageResponse>,
  next: NextFunction
) {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await UserServices.findUserByEmail(email);

    if (existingUser) {
      res.status(400);
      throw new Error('Lecturer with this email is already in use.');
    }

    const user = await UserServices.createUser({
      email,
      password,
      firstName,
      lastName,
      role: EnumRole.LECTURER,
    });

    if (user) {
      await UserServices.createLecturer({
        User: { connect: { id: user.id } },
      });
    }

    const jti = uuidv4();
    const { refreshToken } = generateTokens(user, jti);

    await AuthServices.addRefreshTokenToWhitelist({
      jti,
      refreshToken,
      userId: user.id,
    });

    res.json({
      message: `Lecturer ${user.firstName} ${user.lastName} created successfully.`,
    });
  } catch (error) {
    next(error);
  }
}

export async function registerSuperUser(
  req: Request<
    {},
    {},
    AuthSchemas.RegisterSuperUserInput,
    AuthSchemas.RegisterQuerySchema
  >,
  res: Response<MessageResponse>,
  next: NextFunction
) {
  try {
    const { email, password, firstName, lastName } = req.body;
    const { refreshTokenInCookie } = req.query;

    const existingUser = await UserServices.findUserByEmail(email);

    if (existingUser) {
      res.status(400);
      throw new Error('User with this email is already in use.');
    }

    const user = await UserServices.createUser({
      email,
      password,
      firstName,
      lastName,
      role: EnumRole.SUPERUSER,
    });

    if (user) {
      await UserServices.createSuperUser({
        User: { connect: { id: user.id } },
      });
    }

    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(user, jti);

    await AuthServices.addRefreshTokenToWhitelist({
      jti,
      refreshToken,
      userId: user.id,
    });

    res.json({
      message: `SuperUser ${user.firstName} ${user.lastName} created successfully.`,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request<{}, {}, AuthSchemas.LoginInput>,
  res: Response<LoginResponse>,
  next: NextFunction
) {
  try {
    const { email, password } = req.body;

    const existingUser = await UserServices.findUserByEmail(email);

    if (!existingUser) {
      res.status(401);
      throw new Error('Invalid login credentials.');
    }

    const validPassword = await bcrypt.compare(password, existingUser.password);
    if (!validPassword) {
      res.status(401);
      throw new Error('Invalid login credentials.');
    }

    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(existingUser, jti);

    if (existingUser.role === EnumRole.STUDENT) {
      const student = await UserServices.findStudentByUserId(existingUser.id);
      if (!student) {
        res.status(401);
        throw new Error('Invalid login credentials.');
      }
      await UserServices.updateLastLogin(student.id);
    }

    await AuthServices.addRefreshTokenToWhitelist({
      jti,
      refreshToken,
      userId: existingUser.id,
    });

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.cookie('access_token', accessToken, {
      maxAge: 1000 * 60 * 15,
      httpOnly: true,
    });
    res.cookie('refresh_token', refreshToken, {
      maxAge: 1000 * 60 * 60 * 8,
      httpOnly: true,
    });
    res.cookie('loggedIn', true, {
      maxAge: 1000 * 60 * 15,
    });
    res.json({
      message: 'Logged in successfully.',
      role: existingUser.role,
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshTokens(
  req: Request<{}, {}, AuthSchemas.RefreshInput>,
  res: Response<MessageResponse>,
  next: NextFunction
) {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      res.status(400);
      throw new Error('Missing refresh token.');
    }
    const payload = verifyRefreshToken(refreshToken) as {
      userId: number;
      jti: string;
    };

    const savedRefreshToken = await AuthServices.findRefreshTokenById(
      payload.jti
    );
    if (!savedRefreshToken || savedRefreshToken.revoked === true) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    const hashedToken = hashToken(refreshToken);
    if (hashedToken !== savedRefreshToken.hashedToken) {
      res.status(401);
      throw new Error('Unauthorized');
    }
    const user = await UserServices.findUserById(payload.userId);

    if (!user) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    await AuthServices.deleteRefreshToken(savedRefreshToken.id);
    const jti = uuidv4();
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user,
      jti
    );
    await AuthServices.addRefreshTokenToWhitelist({
      jti,
      refreshToken: newRefreshToken,
      userId: user.id,
    });

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.cookie('access_token', accessToken, {
      maxAge: 1000 * 60 * 15,
      httpOnly: true,
    });
    res.cookie('refresh_token', newRefreshToken, {
      maxAge: 1000 * 60 * 60 * 8,
      httpOnly: true,
    });
    res.cookie('loggedIn', true, {
      maxAge: 1000 * 60 * 15,
    });
    res.json({
      message: 'Token refreshed successfully.',
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError')
    ) {
      res.status(401);
    }
    next(error);
  }
}

export async function logout(
  req: Request,
  res: Response<MessageResponse>,
  next: NextFunction
) {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      res.status(400);
      throw new Error('Missing refresh token.');
    }
    const payload = verifyRefreshToken(refreshToken) as {
      userId: number;
      jti: string;
    };

    const savedRefreshToken = await AuthServices.findRefreshTokenById(
      payload.jti
    );
    if (!savedRefreshToken || savedRefreshToken.revoked === true) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    const hashedToken = hashToken(refreshToken);
    if (hashedToken !== savedRefreshToken.hashedToken) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    await AuthServices.deleteRefreshToken(savedRefreshToken.id);

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.clearCookie('loggedIn');
    res.json({
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export function checkRole(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;

    if (!user) {
      res.status(401);
      throw new Error('Unauthorized.');
    }

    // if (user.role !== EnumRole.SUPERUSER && user.role !== EnumRole.LECTURER) {
    //   res.json({
    //     role: EnumRole.STUDENT,
    //   });
    //   throw new Error('Forbidden.');
    // } else {
    //   res.json({
    //     message: 'User is admin.',
    //   });
    // }
    res.json({
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
}
