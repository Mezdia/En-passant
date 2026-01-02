import { AppShellSection, Stack, Tooltip } from "@mantine/core";
import {
  type Icon,
  IconChess,
  IconCpu,
  IconDatabase,
  IconFiles,
  IconRobot,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import { Link, useMatchRoute } from "@tanstack/react-router";
import cx from "clsx";
import { useTranslation } from "react-i18next";
import * as classes from "./Sidebar.css";

interface NavbarLinkProps {
  icon: Icon;
  label: string;
  url: string;
  active?: boolean;
  id?: string;
}

function NavbarLink({ url, icon: Icon, label, id }: NavbarLinkProps) {
  const matcesRoute = useMatchRoute();
  return (
    <Tooltip label={label} position="right">
      <Link
        to={url}
        id={id}
        className={cx(classes.link, {
          [classes.active]: matcesRoute({ to: url, fuzzy: true }),
        })}
      >
        <Icon size="1.5rem" stroke={1.5} />
      </Link>
    </Tooltip>
  );
}

const linksdata = [
  { icon: IconChess, label: "Board", url: "/", id: "tour-nav-board" },
  { icon: IconUser, label: "User", url: "/accounts", id: "tour-nav-user" },
  { icon: IconFiles, label: "Files", url: "/files", id: "tour-nav-files" },
  {
    icon: IconDatabase,
    label: "Databases",
    url: "/databases",
    id: "tour-nav-databases",
  },
  { icon: IconRobot, label: "Bots", url: "/bots", id: "tour-nav-bots" },
  { icon: IconCpu, label: "Engines", url: "/engines", id: "tour-nav-engines" },
];

export function SideBar() {
  const { t } = useTranslation();

  const links = linksdata.map((link) => (
    <NavbarLink {...link} label={t(`SideBar.${link.label}`)} key={link.label} />
  ));

  return (
    <>
      <AppShellSection grow>
        <Stack justify="center" gap={0}>
          {links}
        </Stack>
      </AppShellSection>
      <AppShellSection>
        <Stack justify="center" gap={0}>
          <NavbarLink
            icon={IconSettings}
            label={t("SideBar.Settings")}
            url="/settings"
            id="tour-nav-settings"
          />
        </Stack>
      </AppShellSection>
    </>
  );
}
