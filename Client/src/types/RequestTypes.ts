import { z } from 'zod';
import { AnswerReplyStatusEnum, UserRoleEnum } from './Enums';

const UserRequestSchema = z.object({
	email: z.string().email(),
	password: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	role: UserRoleEnum,
});

const TLoginRequest = UserRequestSchema.pick({ email: true, password: true });

const SendAnswerRequestSchema = z.object({
	solution: z.string().min(1),
	taskId: z.number().int(),
	studentId: z.number().int(),
});

const UpdateTaskInfoRequestSchema = z.object({
	taskId: z.number().int(),
	taskInfo: z.object({
		isMarkdown: z.boolean(),
		question: z.string(),
		closeDate: z.date(),
	}),
});

const TReplyAnswerRequestSchema = z.object({
	replyStatus: AnswerReplyStatusEnum,
	replyDesc: z.string(),
	grantedScore: z.number().int(),
	replyDate: z.date(),
});

const TCreateLessonRequestSchema = z.object({
	number: z.number().int(),
	image: z.string(),
	groupId: z.number().int(),
	isFrequencyChecked: z.boolean(),
	absentStudents: z.array(z.number().int()),
	tasks: z.array(
		z.object({
			number: z.number().int(),
			question: z.string(),
			closeDate: z.string(),
			isMarkdown: z.boolean(),
		})
	),
});

const TRegisterManyStudentsRequestSchema = z.object({
	lecturerId: z.number().int(),
	groupName: z.string().min(1),
	studentsToRegister: z.array(
		z.object({
			firstName: z.string().min(1),
			lastName: z.string().min(1),
			indexNumber: z.number().int(),
		})
	),
});

const TAddStudentToGroupRequestSchema = z.object({
	groupId: z.number().int(),
	studentData: z.object({
		firstName: z.string().min(1),
		lastName: z.string().min(1),
		indexNumber: z.number().int(),
	}),
});

const TReorderLessonRequestSchema = z.array(
	z.object({
		lessonId: z.number().int(),
		newLessonNumber: z.number().int(),
	})
);

const TUpdateStudentRequestSchema = z.object({
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	indexNumber: z.number().int(),
	score: z.number().int(),
	health: z.number().int(),
});

const TCreateTaskRequestSchema = z.object({
	lessonId: z.number().int(),
	number: z.number().int(),
	question: z.string(),
	closeDate: z.string(),
	isMarkdown: z.boolean(),
});

const TUpdateAnswerReplyRequestSchema = z.object({
	replyStatus: AnswerReplyStatusEnum,
	replyDesc: z.string(),
	grantedScore: z.number().int(),
});

export type TUserRequest = z.infer<typeof UserRequestSchema>;
export type TLoginRequest = z.infer<typeof TLoginRequest>;
export type TSendAnswerRequest = z.infer<typeof SendAnswerRequestSchema>;

export type TUpdateTaskInfoRequest = z.infer<
	typeof UpdateTaskInfoRequestSchema
>;
export type TUpdateStudentRequest = z.infer<typeof TUpdateStudentRequestSchema>;
export type TReplyAnswerRequest = z.infer<typeof TReplyAnswerRequestSchema>;
export type TCreateLessonRequest = z.infer<typeof TCreateLessonRequestSchema>;
export type TRegisterManyStudentsRequest = z.infer<
	typeof TRegisterManyStudentsRequestSchema
>;
export type TAddStudentToGroupRequest = z.infer<
	typeof TAddStudentToGroupRequestSchema
>;
export type TReorderLessonRequest = z.infer<typeof TReorderLessonRequestSchema>;
export type TCreateTaskRequest = z.infer<typeof TCreateTaskRequestSchema>;
export type TUpdateAnswerReplyRequest = z.infer<
	typeof TUpdateAnswerReplyRequestSchema
>;
