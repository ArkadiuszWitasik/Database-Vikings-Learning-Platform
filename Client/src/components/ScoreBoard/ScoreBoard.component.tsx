import {
	Table,
	Progress,
	Anchor,
	Text,
	Group,
	ThemeIcon,
	rem,
} from '@mantine/core';
import classes from './TableReviews.module.css';
import { IconCoins, IconTrophy } from '@tabler/icons-react';

//Pozycja
// Imię i nazwisko
// Grupa
// Score

const data = [
	{
		studentName: 'Jan Kowalski',
		groupName: 'I ISI',
		score: 1600,
	},
	{
		studentName: 'Tomek Nowak',
		groupName: 'II IO',
		score: 1290,
	},
	{
		studentName: 'Daniel Danielowski',
		groupName: 'IV ISI',
		score: 1790,
	},
	{
		studentName: 'Roman Romanowski',
		groupName: 'IV ISI',
		score: 2050,
	},
	{
		studentName: 'Szymon Szymonowski',
		groupName: 'I ISI',
		score: 1890,
	},
	{
		studentName: 'Maciej Maciejowski',
		groupName: 'III ISI',
		score: 1530,
	},
];

const topColors = [
	'var(--score-color)',
	'var(--mantine-color-gray-4)',
	'#9F563A',
];

function ScoreBoard() {
	const rows = data.map((row, index) => {
		const position = index + 1;
		const isTop3 = position < 4;
		return (
			<Table.Tr key={row.studentName}>
				<Table.Td>
					{isTop3 ? (
						<ThemeIcon
							variant='transparent'
							size='md'
							c={topColors[position - 1]}
							p={0}
							m={0}
						>
							<IconTrophy />
						</ThemeIcon>
					) : (
						<Text ml='xs' size='md'>
							{position}
						</Text>
					)}
				</Table.Td>
				<Table.Td>{row.studentName}</Table.Td>
				<Table.Td>{row.groupName}</Table.Td>
				<Table.Td>
					<Group align='center' gap={rem(5)}>
						<ThemeIcon variant='transparent' size='sm' c='var(--score-color)'>
							<IconCoins />
						</ThemeIcon>
						{row.score}
					</Group>
				</Table.Td>
				{/* <Table.Td>{Intl.NumberFormat().format(totalReviews)}</Table.Td> */}
			</Table.Tr>
		);
	});

	return (
		<Table.ScrollContainer minWidth={700}>
			<Table verticalSpacing='xs'>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>Pozycja</Table.Th>
						<Table.Th>Student</Table.Th>
						<Table.Th>Grupa</Table.Th>
						<Table.Th>Punkty</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>{rows}</Table.Tbody>
			</Table>
		</Table.ScrollContainer>
	);
}

export default ScoreBoard;
