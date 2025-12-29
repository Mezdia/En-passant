import {
    Button,
    Group,
    Modal,
    Stack,
    Stepper,
    Text,
    ThemeIcon,
    useMantineTheme,
    Box,
    Title,
    Transition,
} from "@mantine/core";
import {
    IconArrowRight,
    IconArrowLeft,
    IconCheck,
    IconChess,
    IconDatabase,
    IconLayoutSidebar,
    IconRobot,
    IconSettings,
    IconX,
    IconClock,
    IconRocket,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import * as classes from "./OnboardingTour.css";

interface OnboardingTourProps {
    opened: boolean;
    onClose: () => void;
}

export type OnboardingStatus = "completed" | "skipped" | "later" | null;

export function OnboardingTour({ opened, onClose }: OnboardingTourProps) {
    const { t, i18n } = useTranslation();
    const theme = useMantineTheme();
    const [active, setActive] = useState(0);
    const isRtl = i18n.dir() === "rtl";

    const nextStep = () =>
        setActive((current) => (current < steps.length - 1 ? current + 1 : current));
    const prevStep = () =>
        setActive((current) => (current > 0 ? current - 1 : current));

    const handleFinish = () => {
        localStorage.setItem("onboarding_status", "completed");
        onClose();
    };

    const handleSkip = () => {
        localStorage.setItem("onboarding_status", "skipped");
        onClose();
    };

    const handleLater = () => {
        localStorage.setItem("onboarding_status", "later");
        onClose();
    };

    const steps = [
        {
            title: t("Onboarding.Welcome.Title"),
            description: t("Onboarding.Welcome.Desc"),
            icon: <IconRocket size={32} />,
            color: "blue",
        },
        {
            title: t("Onboarding.Sidebar.Title"),
            description: t("Onboarding.Sidebar.Desc"),
            icon: <IconLayoutSidebar size={32} />,
            color: "cyan",
        },
        {
            title: t("Onboarding.Board.Title"),
            description: t("Onboarding.Board.Desc"),
            icon: <IconChess size={32} />,
            color: "teal",
        },
        {
            title: t("Onboarding.Databases.Title"),
            description: t("Onboarding.Databases.Desc"),
            icon: <IconDatabase size={32} />,
            color: "orange",
        },
        {
            title: t("Onboarding.Bots.Title"),
            description: t("Onboarding.Bots.Desc"),
            icon: <IconRobot size={32} />,
            color: "indigo",
        },
        {
            title: t("Onboarding.Settings.Title"),
            description: t("Onboarding.Settings.Desc"),
            icon: <IconSettings size={32} />,
            color: "pink",
        },
        {
            title: t("Onboarding.Finish.Title"),
            description: t("Onboarding.Finish.Desc"),
            icon: <IconCheck size={32} />,
            color: "green",
        },
    ];

    return (
        <Modal
            opened={opened}
            onClose={() => { }} // Disable closing by clicking outside/esc
            withCloseButton={false}
            centered
            size="xl"
            padding={0}
            radius="lg"
            overlayProps={{
                backgroundOpacity: 0.7,
                blur: 5,
            }}
            transitionProps={{ transition: 'fade', duration: 300 }}
        >
            <Box className={classes.root}>
                <Stack gap={0} h="100%">
                    {/* Header Area with Graphic/Color Accent */}
                    <Box className={classes.header} style={{ backgroundColor: theme.colors[steps[active].color][9] }}>
                        <Transition mounted={opened} transition="slide-down" duration={500} timingFunction="ease">
                            {(styles) => (
                                <Stack align="center" style={styles}>
                                    <ThemeIcon size={80} radius={100} variant="white" color={steps[active].color} className={classes.iconPulse}>
                                        {steps[active].icon}
                                    </ThemeIcon>
                                    <Title order={1} className={classes.title} c="white">
                                        {steps[active].title}
                                    </Title>
                                </Stack>
                            )}
                        </Transition>
                    </Box>

                    {/* Content Area */}
                    <Box className={classes.content}>
                        <Stack align="center" gap="xl" h="100%" justify="space-between">
                            <Text size="lg" ta="center" className={classes.description}>
                                {steps[active].description}
                            </Text>

                            <Stepper
                                active={active}
                                onStepClick={setActive}
                                className={classes.stepper}
                                size="sm"
                                allowNextStepsSelect={false}
                            >
                                {steps.map((_, index) => (
                                    <Stepper.Step key={index} />
                                ))}
                            </Stepper>

                            <Group justify="space-between" w="100%" mt="xl">
                                <Group>
                                    <Button
                                        variant="subtle"
                                        color="gray"
                                        onClick={handleSkip}
                                        leftSection={<IconX size={16} />}
                                    >
                                        {t("Onboarding.Buttons.Close")}
                                    </Button>
                                    <Button
                                        variant="subtle"
                                        color="gray"
                                        onClick={handleLater}
                                        leftSection={<IconClock size={16} />}
                                    >
                                        {t("Onboarding.Buttons.Later")}
                                    </Button>
                                </Group>

                                <Group>
                                    {active > 0 && (
                                        <Button
                                            variant="default"
                                            onClick={prevStep}
                                            leftSection={isRtl ? <IconArrowRight size={18} /> : <IconArrowLeft size={18} />}
                                        >
                                            {t("Common.Previous")}
                                        </Button>
                                    )}
                                    {active < steps.length - 1 ? (
                                        <Button
                                            onClick={nextStep}
                                            rightSection={isRtl ? <IconArrowLeft size={18} /> : <IconArrowRight size={18} />}
                                            className={classes.actionButton}
                                        >
                                            {t("Onboarding.Buttons.Next")}
                                        </Button>
                                    ) : (
                                        <Button
                                            color="green"
                                            onClick={handleFinish}
                                            leftSection={<IconCheck size={18} />}
                                            className={classes.actionButton}
                                        >
                                            {t("Onboarding.Buttons.Finish")}
                                        </Button>
                                    )}
                                </Group>
                            </Group>
                        </Stack>
                    </Box>
                </Stack>
            </Box>
        </Modal>
    );
}
