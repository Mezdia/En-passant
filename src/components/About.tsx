import { Anchor, Group, Modal, Stack, Text } from "@mantine/core";
import { isTauri } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

function AboutModal({
  opened,
  setOpened,
}: {
  opened: boolean;
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [info, setInfo] = useState<{
    version: string;
    tauri: string;
    os: string;
    architecture: string;
    osVersion: string;
  } | null>(null);

  useEffect(() => {
    async function load() {
      if (isTauri()) {
        try {
          const { getVersion, getTauriVersion } = await import(
            "@tauri-apps/api/app"
          );
          const {
            version: OSVersion,
            arch,
            type,
          } = await import("@tauri-apps/plugin-os");

          const os = await type();
          const version = await getVersion();
          const tauri = await getTauriVersion();
          const architecture = await arch();
          const osVersion = await OSVersion();
          setInfo({ version, tauri, os, architecture, osVersion });
        } catch (e) {
          console.warn("Failed to load app info:", e);
          setInfo({
            version: "Unknown",
            tauri: "Unknown",
            os: "Unknown",
            architecture: "Unknown",
            osVersion: "Unknown",
          });
        }
      } else {
        // Development mode fallback
        setInfo({
          version: "Development",
          tauri: "N/A",
          os: "Web Browser",
          architecture: "N/A",
          osVersion: "N/A",
        });
      }
    }
    load();
  }, []);
  return (
    <Modal
      centered
      opened={opened}
      onClose={() => setOpened(false)}
      title="About En-passant"
      size="md"
    >
      <Stack gap="md">
        <Group>
          <Text fw="bold">Version:</Text>
          <Text>{info?.version}</Text>
        </Group>
        <Group>
          <Text fw="bold">Tauri Version:</Text>
          <Text>{info?.tauri}</Text>
        </Group>
        <Group>
          <Text fw="bold">Operating System:</Text>
          <Text>
            {info?.os} {info?.architecture} {info?.osVersion}
          </Text>
        </Group>

        <Text fw="bold" size="lg">
          Credits
        </Text>
        <Text>Made by Mezd</Text>
        <Text>All rights belong to Mezdia</Text>

        <Text fw="bold">GitHub Profile:</Text>
        <Anchor
          href="https://github.com/Mezdia"
          target="_blank"
          rel="noreferrer"
        >
          https://github.com/Mezdia
        </Anchor>

        <Text fw="bold">Project Repository:</Text>
        <Anchor
          href="https://github.com/Mezdia/en-passant"
          target="_blank"
          rel="noreferrer"
        >
          https://github.com/Mezdia/en-passant
        </Anchor>

        <Text fw="bold">Website:</Text>
        <Anchor
          href="https://www.enpassant.ir"
          target="_blank"
          rel="noreferrer"
        >
          https://www.enpassant.ir
        </Anchor>

        <Text size="sm" c="dimmed">
          Copyright © 2025 Mezdia. All rights reserved.
        </Text>
      </Stack>
    </Modal>
  );
}

export default AboutModal;
