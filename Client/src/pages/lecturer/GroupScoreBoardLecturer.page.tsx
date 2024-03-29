import ScoreBoardLecturer from '@/components/ScoreBoard/ScoreBoardLecturer.component';
import DataNotFound from '@/components/UI/DataNotFound';
import useGetStudentsFromGroup from '@/hooks/groups/useGetStudentsFromGroup';
import useGetGroupsByLecturerId from '@/hooks/users/useGetGroupsByLecturerId';
import useGetScoreBoardQuery from '@/hooks/users/useGetScoreBoardQuery';
import { useLecturerStore } from '@/utils/stores/useLecturerStore';
import { Center, Loader, Stack, Text, Title } from '@mantine/core';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

function GroupScoreBoardLecturerPage() {
	const [searchTerm, setSearchTerm] = useState('');
	const { id } = useParams();
	const { lecturerData } = useLecturerStore();
	const { data: groupsData } = useGetGroupsByLecturerId(lecturerData.lecturerId);
	const { data: scoreBoardData } = useGetScoreBoardQuery();

	if (groupsData?.groups.length === 0) {
		return <DataNotFound firstLineText='Nie posiadasz' secondLineText='żadnych grup' />;
	}

	const groupName = groupsData?.groups.find(group => group.groupId === +id!)?.groupName;

	const selectLabels = groupsData?.groups?.map(group => group.groupName);

	const { data: StudentsFromGroup, isPending } = useGetStudentsFromGroup(+id!);

	if (StudentsFromGroup?.students.length === 0) {
		return (
			<DataNotFound firstLineText='Brak studentów' secondLineText='w grupie' withAddStudentButton groupId={+id!} />
		);
	}

	if (isPending) {
		return (
			<Center h='25vh'>
				<Loader />
			</Center>
		);
	}

	const filteredBySearchTerm = scoreBoardData?.scoreBoard.filter(
		student =>
			student.indexNumber.toString().includes(searchTerm) ||
			`${student.User.firstName} ${student.User.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<Stack maw={1100} mx='auto'>
			<Title fz='lg' order={1}>
				Tablica wyników grupy: {groupName}
			</Title>
			<ScoreBoardLecturer
				type='group'
				scoreBoardData={filteredBySearchTerm}
				searchTerm={searchTerm}
				setSearchTerm={setSearchTerm}
			/>
		</Stack>
	);
}

export default GroupScoreBoardLecturerPage;
