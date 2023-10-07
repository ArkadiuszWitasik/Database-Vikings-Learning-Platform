import { Router } from 'express';
import { validateRequest } from '../../middlewares';
import * as GroupsControllers from './groups.controllers';
import * as GroupSchemas from './groups.schemas';
import { paramsWithIdSchema } from '../../interfaces/ParamsWithId';

const router = Router();

router.post(
  '/createGroup',
  validateRequest({ body: GroupSchemas.groupSchema }),
  GroupsControllers.createGroup
);

router.patch(
  '/renameGroup/:id',
  validateRequest({
    params: paramsWithIdSchema,
    body: GroupSchemas.renameGroupInput,
  }),
  GroupsControllers.renameGroup
);

router.delete(
  '/deleteGroup/:id',
  validateRequest({ params: paramsWithIdSchema }),
  GroupsControllers.deleteGroup
);

export default router;
