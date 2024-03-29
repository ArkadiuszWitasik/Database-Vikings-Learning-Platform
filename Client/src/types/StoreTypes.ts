import { UserRole } from './Enums';

export interface IUserStoreStore {
	role: UserRole | null;
	userData: {
		firstName: string | null;
		lastName: string | null;
		email: string | null;
		userId: number | null;
	};
	setRole: (role: UserRole) => void;
	setUserData: (userData: IUserStoreStore['userData']) => void;
	clearUserStoreData: () => void;
}

export type TAssignedSpecialTasks = {
	id: number;
	title: string;
	openDate: string;
	question: string;
	isMarkdown: boolean;
	numberOfAnswers: number;
	lecturerId: number;
};

export interface IStudentStoreStore {
	studentData: {
		indexNumber: number | null;
		health: number | null;
		score: number | null;
		// rank: number | null;
		isPasswordChanged: boolean | null;
		// lastLogin: null,
		studentId: number | null;
		groupId: number | null;
		answersIds: number[] | null;
		lecturerId: number | null;
	};
	setStudentData: (studentData: IStudentStoreStore['studentData']) => void;
	clearStudentStoreData: () => void;
}

export interface ILecturerStore {
	lecturerData: {
		lecturerId: number | null;
		isAdmin: boolean | null;
		idCheck: number | null;
	};
	setLecturerData: (lecturerData: ILecturerStore['lecturerData']) => void;
	clearLecturerStoreData: () => void;
}

export type TaskType = {
	number: number;
	question: string;
	closeDate: string;
	isMarkdown: boolean;
};

export type CreatedLessonType = {
	lessonNumber: number;
	lessonImage: string;
	groupId: number;
	isFrequencyChecked: boolean;
	absentStudents: number[] | [];
	absentStudentsCredentials: string[] | [];
	tasks: TaskType[] | [];
};

export interface ICreateLessonStore {
	createdLessonsArray: CreatedLessonType[];
	addLesson: (lesson: CreatedLessonType) => void;
	removeLesson: (groupId: number) => void;
	updateLesson: (groupId: number, updatedLesson: CreatedLessonType) => void;
}
