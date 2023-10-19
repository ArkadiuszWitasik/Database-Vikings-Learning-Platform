import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import StudentNavbar from './components/Navbar/Student.navbar';
import LoginForm from './components/Login/Login.form';
import TaskAnswerPage from './pages/TaskAnswer.page';
import BlankContent from './components/UI/BlankContent';

const router = createBrowserRouter([
	{
		path: '/',
		element: <StudentNavbar />,
	},
	{
		path: '/login',
		element: <LoginForm />,
	},
	{
		path: '/scoreBoard',
		element: <StudentNavbar />,
	},
	{
		path: '/my-tasks',
		element: <StudentNavbar />,
	},
	{ path: '/me', element: <BlankContent /> },
	{
		path: '/task/:id',
		element: <TaskAnswerPage />,
	},
]);

export function Router() {
	return <RouterProvider router={router} />;
}
