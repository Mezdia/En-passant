
import React from 'react';
import { useAtomValue } from 'jotai';
import {
    Modal,
    Table,
    Text,
    Badge,
    ActionIcon,
    ScrollArea,
    Group
} from '@mantine/core';
import { IconTrash, IconRobot } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { botGameHistoryAtom } from '@/state/atoms';
import { deleteBotGame } from './botGameHistory';

interface BotGamesViewerProps {
    opened: boolean;
    onClose: () => void;
}

export function BotGamesViewer({ opened, onClose }: BotGamesViewerProps) {
    const { t } = useTranslation();
    const history = useAtomValue(botGameHistoryAtom);

    // Reverse history to show newest first if not already done by selector/atom
    // getBotGameHistory does unshift so it should be newest first.

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={t("Bots.GameHistory")}
            size="xl"
            scrollAreaComponent={ScrollArea.Autosize}
        >
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>{t("Bots.Bot")}</Table.Th>
                        <Table.Th>{t("Game.Result")}</Table.Th>
                        <Table.Th>{t("Common.Date")}</Table.Th>
                        <Table.Th>{t("Game.Moves")}</Table.Th>
                        <Table.Th>{t("Common.Actions")}</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {history.length === 0 ? (
                        <Table.Tr>
                            <Table.Td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                                <Text c="dimmed">{t("Bots.NoGamesFound")}</Text>
                            </Table.Td>
                        </Table.Tr>
                    ) : (
                        history.map((game) => (
                            <Table.Tr key={game.id}>
                                <Table.Td>
                                    <Group gap="xs">
                                        <IconRobot size={16} />
                                        <Text size="sm">{game.botName} ({game.botRating})</Text>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Badge
                                        color={
                                            (game.result === '1-0' && game.playerSide === 'white') ||
                                                (game.result === '0-1' && game.playerSide === 'black')
                                                ? 'green' : (game.result === '1/2-1/2' ? 'gray' : 'red')
                                        }
                                    >
                                        {game.result}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>
                                    {new Date(game.date).toLocaleDateString()} {new Date(game.date).toLocaleTimeString()}
                                </Table.Td>
                                <Table.Td>{game.movesCount}</Table.Td>
                                <Table.Td>
                                    <ActionIcon color="red" variant="subtle" onClick={() => {
                                        if (confirm(t("Common.ConfirmDelete"))) {
                                            deleteBotGame(game.id);
                                            // Trigger is needed here if atom isn't auto-updating from localStorage listener
                                            // For now we assume refresh or we add a trigger later if needed
                                            window.location.reload(); // Quick dirty refresh or use atom setter if available
                                        }
                                    }}>
                                        <IconTrash size={16} />
                                    </ActionIcon>
                                </Table.Td>
                            </Table.Tr>
                        ))
                    )}
                </Table.Tbody>
            </Table>
        </Modal>
    );
}
