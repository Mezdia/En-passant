import { Button, Group, Modal, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconRocket } from "@tabler/icons-react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "./OnboardingTour.css";

interface OnboardingTourProps {
    opened: boolean;
    onClose: () => void;
}

export function OnboardingTour({ opened, onClose }: OnboardingTourProps) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.dir() === "rtl";
    const driverObj = useRef<ReturnType<typeof driver> | null>(null);
    const [showWelcome, setShowWelcome] = useState(true);

    // Reset welcome state when reopened
    useEffect(() => {
        if (opened) {
            setShowWelcome(true);
        }
    }, [opened]);

    const handleStart = () => {
        setShowWelcome(false);

        // Small delay to allow modal to close before driver starts
        setTimeout(() => {
            driverObj.current = driver({
                showProgress: true,
                animate: true,
                allowClose: true,
                doneBtnText: t("Onboarding.Buttons.Finish"),
                nextBtnText: t("Onboarding.Buttons.Next"),
                prevBtnText: t("Common.Previous"),
                onDestroyed: () => {
                    // If destroyed (closed/finished), we notify parent
                    onClose();
                },
                steps: [
                    {
                        element: "#tour-nav-board",
                        popover: {
                            title: t("Onboarding.Board.Title"),
                            description: t("Onboarding.Board.Desc"),
                            side: isRtl ? "left" : "right",
                            align: "start",
                        },
                    },
                    {
                        element: "#tour-nav-files",
                        popover: {
                            title: t("Onboarding.Databases.Title"),
                            description: t("Onboarding.Databases.Desc"),
                            side: isRtl ? "left" : "right",
                            align: "start",
                        },
                    },
                    {
                        element: "#tour-nav-bots",
                        popover: {
                            title: t("Onboarding.Bots.Title"),
                            description: t("Onboarding.Bots.Desc"),
                            side: isRtl ? "left" : "right",
                            align: "start",
                        },
                    },
                    {
                        element: "#tour-nav-settings",
                        popover: {
                            title: t("Onboarding.Settings.Title"),
                            description: t("Onboarding.Settings.Desc"),
                            side: isRtl ? "left" : "right",
                            align: "start",
                        },
                    },
                    {
                        element: "#root", // Center finish
                        popover: {
                            title: t("Onboarding.Finish.Title"),
                            description: t("Onboarding.Finish.Desc"),
                            side: "top",
                            align: "center",
                            onNextClick: () => {
                                localStorage.setItem("onboarding_status", "completed");
                                driverObj.current?.destroy();
                            }
                        },
                    },
                ]
            });
            driverObj.current.drive();
        }, 300);
    };

    const handleSkip = () => {
        localStorage.setItem("onboarding_status", "skipped");
        onClose();
    };

    const handleLater = () => {
        localStorage.setItem("onboarding_status", "later");
        onClose();
    };

    return (
        <Modal
            opened={opened && showWelcome}
            onClose={handleLater}
            centered
            withCloseButton={false}
            size="md"
            padding="xl"
            radius="lg"
            overlayProps={{
                backgroundOpacity: 0.55,
                blur: 3,
            }}
        >
            <Stack align="center" gap="lg" py="md">
                <ThemeIcon size={80} radius={100} variant="light" color="blue">
                    <IconRocket size={40} />
                </ThemeIcon>

                <Title order={2} ta="center">{t("Onboarding.Welcome.Title")}</Title>

                <Text c="dimmed" ta="center" size="lg">
                    {t("Onboarding.Welcome.Desc")}
                </Text>

                <Group w="100%" justify="center" mt="md">
                    <Button variant="subtle" color="gray" onClick={handleSkip}>
                        {t("Onboarding.Buttons.Close")}
                    </Button>
                    <Button variant="default" onClick={handleLater}>
                        {t("Onboarding.Buttons.Later")}
                    </Button>
                    <Button size="md" onClick={handleStart}>
                        {t("Onboarding.Buttons.Finish")}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
