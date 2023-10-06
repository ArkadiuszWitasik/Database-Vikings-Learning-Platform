import { Response, Request, NextFunction } from 'express';
import MessageResponse from 'interfaces/MessageResponse';
import { TaskInput } from './tasks.schemas';
import * as TaskServices from './tasks.services';
import dayjs from 'dayjs';
import { ParamsWithId } from 'interfaces/ParamsWithId';

export async function createTask(
  req: Request<{}, MessageResponse, TaskInput>,
  res: Response<MessageResponse>,
  next: NextFunction
) {
  try {
    const { number, question, closeDate, isExtra, lessonId } = req.body;

    const task = await TaskServices.createTask({
      number,
      question,
      closeDate: dayjs(closeDate).toDate(),
      isExtra: isExtra || false,
      Lesson: {
        connect: {
          id: lessonId,
        },
      },
    });

    res.json({
      message: `Task with ${task.id}, number ${task.number} created successfully. Close time is: ${task.closeDate}`,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(
  req: Request<{}, MessageResponse, {}, ParamsWithId>,
  res: Response<MessageResponse>,
  next: NextFunction
) {
  try {
    const { id } = req.query;

    const task = await TaskServices.findTaskById(+id);

    if (!task) {
      res.status(404);
      throw new Error(`Task with given id doesn't exists.`);
    }

    await TaskServices.deleteTask(+id);

    res.json({
      message: `Task with ${task.id}, number ${task.number} deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
}
