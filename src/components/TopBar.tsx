import {
  Box,
  Center,
  Image,
  Menu,
  Text,
  UnstyledButton,
} from "@mantine/core";
import * as classes from "./TopBar.css";

import { isTauri } from "@tauri-apps/api/core";
import type { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useEffect, useState } from "react";

function IconMinimize() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      transform="scale(0.8)"
    >
      <title>Minimize</title>
      <path d="M19 13H5v-2h14v2z" fill="currentColor" />
    </svg>
  );
}

function IconMaximize() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      transform="scale(0.8)"
    >
      <title>Maximize</title>
      <path d="M19 5H5v14h14V5zm-2 12H7V7h10v10z" fill="currentColor" />
    </svg>
  );
}

function IconX() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      transform="scale(0.8)"
    >
      <title>Close</title>
      <path
        d="M19 6.41l-1.41-1.41L12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
        fill="currentColor"
      />
    </svg>
  );
}

type MenuAction = {
  label: string;
  shortcut?: string;
  action?: () => void;
};

type MenuGroup = {
  label: string;
  options: MenuAction[];
};

function TopBar({ menuActions }: { menuActions: MenuGroup[] }) {
  const [appWindow, setAppWindow] = useState<WebviewWindow | null>(null);

  useEffect(() => {
    if (!isTauri()) return;
    try {
      import("@tauri-apps/api/webviewWindow")
        .then((module) => {
          setAppWindow(module.getCurrentWebviewWindow());
        })
        .catch(() => {
          // Silently fail if Tauri is not available
        });
    } catch (error) {
      // Silently fail if Tauri is not available
    }
  }, []);

  return (
    <Box className={classes.root}>
      <Box className={classes.left} data-tauri-drag-region>
        <Box className={classes.brand} data-tauri-drag-region>
          <Box className={classes.logo}>
            <Image src="/logo.png" fit="contain" />
          </Box>
          <Text className={classes.title}>En-passant</Text>
        </Box>
        <Box className={classes.menu}>
          {menuActions.map((action) => (
            <Menu
              key={action.label}
              shadow="md"
              width={200}
              position="bottom-start"
              transitionProps={{ duration: 0 }}
            >
              <Menu.Target>
                <UnstyledButton className={classes.menuButton}>
                  {action.label}
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                {action.options.map((option, i) =>
                  option.label === "divider" ? (
                    <Menu.Divider key={i} />
                  ) : (
                    <Menu.Item
                      key={option.label}
                      rightSection={
                        option.shortcut && (
                          <Text size="xs" c="dimmed">
                            {option.shortcut}
                          </Text>
                        )
                      }
                      onClick={option.action}
                    >
                      {option.label}
                    </Menu.Item>
                  ),
                )}
              </Menu.Dropdown>
            </Menu>
          ))}
        </Box>
      </Box>
      <Box className={classes.windowControls} data-tauri-drag-region>
        <Center
          onClick={() => appWindow?.minimize()}
          className={classes.windowButton}
        >
          <IconMinimize />
        </Center>
        <Center
          onClick={() => appWindow?.toggleMaximize()}
          className={classes.windowButton}
        >
          <IconMaximize />
        </Center>
        <Center
          onClick={() => appWindow?.close()}
          className={classes.closeButton}
        >
          <IconX />
        </Center>
      </Box>
    </Box>
  );
}

export default TopBar;
