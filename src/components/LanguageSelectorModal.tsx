import {
    Alert,
    Badge,
    Button,
    Group,
    Modal,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    useMantineTheme,
} from "@mantine/core";
import { IconInfoCircle, IconLanguage } from "@tabler/icons-react";
import i18n from "i18next";
import * as classes from "./LanguageSelectorModal.css";

interface LanguageSelectorModalProps {
    opened: boolean;
    onClose: () => void;
    onLanguageSelected?: () => void;
}

const languages = [
    { code: "en_US", label: "English", flag: "🇺🇸", complete: true },
    { code: "fa_IR", label: "فارسی (Persian)", flag: "🇮🇷", complete: true },
    { code: "de_DE", label: "Deutsch", flag: "🇩🇪", complete: false },
    { code: "es_ES", label: "Español", flag: "🇪🇸", complete: false },
    { code: "fr_FR", label: "Français", flag: "🇫🇷", complete: false },
    { code: "it_IT", label: "Italiano", flag: "🇮🇹", complete: false },
    { code: "pt_PT", label: "Português", flag: "🇵🇹", complete: false },
    { code: "ru_RU", label: "Русский", flag: "🇷🇺", complete: false },
    { code: "zh_CN", label: "中文 (简体)", flag: "🇨🇳", complete: false },
    { code: "zh_TW", label: "中文 (繁體)", flag: "🇹🇼", complete: false },
    { code: "ar_SA", label: "العربية", flag: "🇸🇦", complete: false },
    { code: "tr_TR", label: "Türkçe", flag: "🇹🇷", complete: false },
    { code: "uk_UA", label: "Українська", flag: "🇺🇦", complete: false },
    { code: "ko_KR", label: "한국어", flag: "🇰🇷", complete: false },
    { code: "be_BY", label: "Беларуская", flag: "🇧🇾", complete: false },
    { code: "nb_NO", label: "Norsk", flag: "🇳🇴", complete: false },
    { code: "pl_PL", label: "Polski", flag: "🇵🇱", complete: false },
];

export function LanguageSelectorModal({
    opened,
    onClose,
    onLanguageSelected,
}: LanguageSelectorModalProps) {
    const theme = useMantineTheme();

    const handleSelect = (langCode: string) => {
        localStorage.setItem("lang", langCode);
        i18n.changeLanguage(langCode);
        onClose();
        onLanguageSelected?.();
    };

    return (
        <Modal
            opened={opened}
            onClose={() => { }}
            withCloseButton={false}
            centered
            size="lg"
            padding="xl"
            title={
                <Group gap="sm">
                    <ThemeIcon
                        variant="light"
                        size="lg"
                        radius="md"
                        color={theme.primaryColor}
                    >
                        <IconLanguage style={{ width: "70%", height: "70%" }} />
                    </ThemeIcon>
                    <Text fw={700} size="xl">
                        Welcome to En-passant
                    </Text>
                </Group>
            }
            overlayProps={{
                backgroundOpacity: 0.55,
                blur: 3,
            }}
        >
            <Stack gap="lg">
                <Text c="dimmed" size="sm">
                    Please select your preferred language. You can change this later in
                    Settings → Appearance.
                </Text>

                <Alert
                    variant="light"
                    color="blue"
                    title="Language Support"
                    icon={<IconInfoCircle />}
                >
                    Languages marked with a star (★) are fully translated. Other
                    languages are still in development and may have incomplete
                    translations.
                </Alert>

                <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
                    {languages.map((lang) => (
                        <Button
                            key={lang.code}
                            variant="default"
                            size="md"
                            h={56}
                            radius="md"
                            className={`${classes.languageButton} ${lang.complete ? classes.recommendedLanguage : ""}`}
                            onClick={() => handleSelect(lang.code)}
                            styles={{
                                inner: {
                                    justifyContent: "flex-start",
                                },
                                label: {
                                    width: "100%",
                                },
                            }}
                        >
                            <Group w="100%" wrap="nowrap" gap="xs">
                                <Text span className={classes.flagEmoji}>
                                    {lang.flag}
                                </Text>
                                <div className={classes.languageInfo}>
                                    <Group gap={4} wrap="nowrap">
                                        <Text size="sm" fw={500} truncate>
                                            {lang.label}
                                        </Text>
                                        {lang.complete && (
                                            <Badge size="xs" variant="light" color="green">
                                                ★
                                            </Badge>
                                        )}
                                    </Group>
                                </div>
                            </Group>
                        </Button>
                    ))}
                </SimpleGrid>
            </Stack>
        </Modal>
    );
}
