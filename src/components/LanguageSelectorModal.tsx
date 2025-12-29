import { Button, Modal, SimpleGrid, Text, Stack, Alert, ThemeIcon, Group } from "@mantine/core";
import { IconInfoCircle, IconLanguage } from "@tabler/icons-react";
import i18n from "i18next";
import { useState } from "react";

interface LanguageSelectorModalProps {
    opened: boolean;
    onClose: () => void;
}

const languages = [
    { code: "en_US", label: "English", flag: "🇺🇸" },
    { code: "fa_IR", label: "فارسی", flag: "🇮🇷" },
    { code: "de_DE", label: "Deutsch", flag: "🇩🇪" },
    { code: "es_ES", label: "Español", flag: "🇪🇸" },
    { code: "fr_FR", label: "Français", flag: "🇫🇷" },
    { code: "it_IT", label: "Italiano", flag: "🇮🇹" },
    { code: "pt_PT", label: "Português", flag: "🇵🇹" },
    { code: "ru_RU", label: "Русский", flag: "🇷🇺" },
    { code: "zh_CN", label: "中文 (Simplified)", flag: "🇨🇳" },
    { code: "zh_TW", label: "中文 (Traditional)", flag: "🇹🇼" },
    { code: "ar_SA", label: "العربية", flag: "🇸🇦" },
    { code: "tr_TR", label: "Türkçe", flag: "🇹🇷" },
    { code: "uk_UA", label: "Українська", flag: "🇺🇦" },
    { code: "kp_KR", label: "한국어", flag: "🇰🇷" },
    { code: "be_BY", label: "Беларуская", flag: "🇧🇾" },
    { code: "nb_NO", label: "Norsk", flag: "🇳🇴" },
    { code: "pl_PL", label: "Polski", flag: "🇵🇱" },
];

export function LanguageSelectorModal({ opened, onClose }: LanguageSelectorModalProps) {
    const handleSelect = (langCode: string) => {
        localStorage.setItem("lang", langCode);
        i18n.changeLanguage(langCode);
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={() => { }} /* Prevent closing by clicking outside */
            withCloseButton={false}
            centered
            size="lg"
            padding="xl"
            title={
                <Group>
                    <ThemeIcon variant="light" size="lg" radius="md" color="blue">
                        <IconLanguage style={{ width: '70%', height: '70%' }} />
                    </ThemeIcon>
                    <Text fw={700} size="xl">Welcome / خوش آمدید</Text>
                </Group>
            }
            overlayProps={{
                backgroundOpacity: 0.55,
                blur: 3,
            }}
        >
            <Stack gap="lg">
                <Text c="dimmed" size="sm">
                    Please select your preferred language. You can change this later in the settings.
                    <br />
                    لطفاً زبان مورد نظر خود را انتخاب کنید. می‌توانید بعداً آن را در تنظیمات تغییر دهید.
                </Text>

                <Alert variant="light" color="blue" title="Language Support / پشتیبانی زبان" icon={<IconInfoCircle />}>
                    English and Persian (Farsi) are fully supported. Other languages are currently in development.
                </Alert>

                <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
                    {languages.map((lang) => (
                        <Button
                            key={lang.code}
                            variant="default"
                            size="lg"
                            h={60}
                            radius="md"
                            onClick={() => handleSelect(lang.code)}
                            styles={(theme) => ({
                                inner: {
                                    justifyContent: "flex-start",
                                },
                                label: {
                                    width: "100%",
                                },
                                root: {
                                    borderColor: lang.code === "fa_IR" || lang.code === "en_US" ? theme.colors.blue[4] : undefined,
                                    borderWidth: lang.code === "fa_IR" || lang.code === "en_US" ? 2 : 1,
                                }
                            })}
                        >
                            <Group w="100%" wrap="nowrap">
                                <Text span size="2xl" style={{ lineHeight: 1 }}>{lang.flag}</Text>
                                <Stack gap={0} ml="xs">
                                    <Text size="sm" fw={500} truncate>{lang.label}</Text>
                                    <Text size="xs" c="dimmed" truncate>{lang.code}</Text>
                                </Stack>
                            </Group>
                        </Button>
                    ))}
                </SimpleGrid>
            </Stack>
        </Modal>
    );
}
