import { Center } from '@mantine/core';
import {
	createBrowserRouter,
	redirect,
	RouterProvider,
} from 'react-router-dom';
import LoginForm from './components/Login/Login.form';
import BlankContent from './components/UI/BlankContent';
import StudentLayout from './layouts/Student.layout';
import MyTasksPage from './pages/MyTasks.page';
import ScoreBoardPage from './pages/ScoreBoard.page';
import TaskAnswerPage from './pages/TaskAnswer.page';
import LecturerLayout from './layouts/Lecturer.layout';
import { loginMiddleware } from './utils/middlewares';

const router = createBrowserRouter([
	{
		path: '/',
		loader: loginMiddleware,
		element: <StudentLayout />,
		children: [
			{ index: true, element: <Center>STRONA GŁOWNA</Center> },
			{ path: '/score-board', element: <ScoreBoardPage /> },
			{ path: '/my-tasks', element: <MyTasksPage /> },
			{ path: '/task/:id', element: <TaskAnswerPage /> },
		],
	},
	{
		path: '/dashboard',
		loader: loginMiddleware,
		element: <LecturerLayout />,
		children: [
			{ index: true, element: <Center>Widok Grup</Center> },
			{
				path: 'group/:id',
				element: <Center>Podglad jednej grupy</Center>,
			},
		],
	},
	{
		path: '/login',
		element: <LoginForm />,
	},
	{ path: '/me', element: <BlankContent /> },
]);

export function Router() {
	return <RouterProvider router={router} />;
}
