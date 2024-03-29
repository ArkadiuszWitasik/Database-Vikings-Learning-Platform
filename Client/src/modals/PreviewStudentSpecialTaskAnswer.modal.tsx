import { AnswerReplyStatus, AnswerReplyStatusEnum } from '@/types/Enums';
import { useForm, zodResolver } from '@mantine/form';
import { ContextModalProps, modals } from '@mantine/modals';
import { useState } from 'react';
import {
	Box,
	Button,
	Center,
	Divider,
	Flex,
	Group,
	Loader,
	NumberInput,
	ScrollArea,
	Select,
	Text,
	Textarea,
} from '@mantine/core';
import { CodeHighlight } from '@mantine/code-highlight';
import { IconBlockquote, IconCircleCheck, IconCoins, IconListDetails } from '@tabler/icons-react';
import { answerReplySchema } from './CreateAnswerReply.schema';
import dayjs from 'dayjs';
import useSpecialTaskAnswerReplyMutation from '@/hooks/answer/useSpecialTaskAnswerReplyMutation';

const selectData = [
	{
		value: AnswerReplyStatusEnum.Values.CORRECT,
		label: 'Poprawne',
	},
	{
		value: AnswerReplyStatusEnum.Values.PARTLY_CORRECT,
		label: 'Częściowo poprawne',
	},
	{
		value: AnswerReplyStatusEnum.Values.INCORRECT,
		label: 'Niepoprane',
	},
];

interface PreviewStudentSpecialTaskAnswerModalProps {
	studentFullName: string;
	studentIndex: number;
	studentAnswer: string;
	answerId: number;
}

function PreviewStudentSpecialTaskAnswerModal({
	context,
	id,
	innerProps,
}: ContextModalProps<PreviewStudentSpecialTaskAnswerModalProps>) {
	const [selectError, setSelectError] = useState<string | null>(null);
	const answerReplyForm = useForm({
		initialValues: {
			replyStatus: '' as AnswerReplyStatus | string,
			replyDesc: '',
			grantedScore: 100 as number | string,
		},
		validate: zodResolver(answerReplySchema),
	});

	const {
		mutate: createSpecialTaskAnswerReply,
		isPending,
		isSuccess,
	} = useSpecialTaskAnswerReplyMutation(innerProps.answerId, {
		replyDate: dayjs().toDate(),
		replyDesc: answerReplyForm.values.replyDesc,
		replyStatus: answerReplyForm.values.replyStatus as AnswerReplyStatus,
		grantedScore: answerReplyForm.values.grantedScore as number,
	});

	const handleReplySpecialTaskAnswer = () => {
		answerReplyForm.validate();
		if (!answerReplyForm.values.replyStatus) {
			setSelectError('Wybierz status odpowiedzi');
			return;
		}
		createSpecialTaskAnswerReply();
	};

	const handleCloseModal = () => {
		context.closeModal(id);
		modals.closeAll();
	};

	if (isPending) {
		return (
			<Center h={120}>
				<Loader />
			</Center>
		);
	}

	if (isSuccess) {
		return (
			<>
				<Flex direction='column' align='center' gap='md' mb='md'>
					<IconCircleCheck size='3rem' color='var(--mantine-primary-color)' />
					<Text>Odpowiedź została oceniona</Text>
				</Flex>
				<Button fullWidth onClick={handleCloseModal}>
					Zamknij
				</Button>
			</>
		);
	}

	return (
		<form
			onSubmit={e => {
				e.preventDefault();
				handleReplySpecialTaskAnswer();
			}}>
			<Text mb='md'>
				{innerProps.studentFullName},&nbsp;{innerProps.studentIndex}
			</Text>

			<ScrollArea.Autosize mah={250} type='auto' offsetScrollbars>
				<CodeHighlight code={innerProps.studentAnswer} language='sql' withCopyButton={false} />
			</ScrollArea.Autosize>

			<Divider my='md' />

			<Flex justify='space-between' gap='md'>
				<Select
					leftSection={<IconListDetails />}
					w='50%'
					label='Ocena zadania specjalnego'
					placeholder='Ocena zadania specjalnego...'
					data={selectData.map(item => item.label)}
					error={selectError}
					{...(answerReplyForm.getInputProps('replyStatus'),
					{
						onChange: value => {
							answerReplyForm.setFieldValue('replyStatus', selectData.find(item => item.label === value)!.value);
							setSelectError(null);
						},
					})}
				/>
				<NumberInput
					w='50%'
					leftSection={<IconCoins color='var(--score-color)' />}
					defaultValue={100}
					step={5}
					min={0}
					max={100}
					clampBehavior='strict'
					allowDecimal={false}
					label='Ilość punktów'
					placeholder='Ilość punktów'
					{...answerReplyForm.getInputProps('grantedScore')}
				/>
			</Flex>
			<Textarea
				leftSection={<IconBlockquote />}
				leftSectionProps={{
					style: { alignItems: 'flex-start', marginTop: '3px' },
				}}
				w='100%'
				my='sm'
				label='Komentarz do zadania'
				placeholder='Treść komentarza...'
				rows={5}
				{...answerReplyForm.getInputProps('replyDesc')}
			/>

			<Group justify='center' mt='lg'>
				<Button miw={150} variant='outline' onClick={handleCloseModal}>
					Anuluj
				</Button>
				<Button type='submit' miw={150}>
					Oceń
				</Button>
			</Group>
		</form>
	);
}

export default PreviewStudentSpecialTaskAnswerModal;
