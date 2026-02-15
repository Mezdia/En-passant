import { sessionsAtom } from "@/state/atoms";
import { Group, Select } from "@mantine/core";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface WebsiteAccountSelectorProps {
  playerName: string;
  onWebsiteChange: (website: string | null) => void;
  onAccountChange: (account: string | null) => void;
  allowAll: boolean;
}

const WebsiteAccountSelector = ({
  playerName,
  onWebsiteChange,
  onAccountChange,
  allowAll,
}: WebsiteAccountSelectorProps) => {
  const { t } = useTranslation();
  const sessions = useAtomValue(sessionsAtom);

  const websites = [];
  if (sessions.some((s) => s.player === playerName && s.chessCom?.username)) {
    websites.push({
      value: "Chess.com",
      label: t("Accounts.ChessCom", "Chess.com"),
    });
  }
  if (
    sessions.some(
      (s) => s.lichess?.username && s.lichess?.username === playerName,
    )
  ) {
    websites.push({
      value: "Lichess",
      label: t("Accounts.Lichess", "Lichess"),
    });
  }

  if (allowAll) {
    websites.unshift({
      value: "All websites",
      label: t("Accounts.Website.All", "All websites"),
    });
  }

  const [website, setWebsite] = useState<string | null>(websites[0]?.value);
  const [account, setAccount] = useState<string | null>(
    t("Accounts.Account.All", "All accounts"),
  );

  useEffect(() => {
    onWebsiteChange(website);
  }, [website, onWebsiteChange]);

  useEffect(() => {
    onAccountChange(account);
  }, [account, onAccountChange]);

  const accounts = [t("Accounts.Account.All", "All accounts")].concat(
    sessions
      .filter(
        (s) =>
          s.player === playerName &&
          ((website === "Chess.com" && s.chessCom?.username) ||
            (website === "Lichess" && s.lichess?.username)),
      )
      .map((s) => s.chessCom?.username || s.lichess?.username)
      .filter(
        (username): username is string =>
          username !== undefined && username !== null,
      ),
  );

  return (
    <Group grow>
      <Select
        pt="lg"
        label={t("Accounts.Website", "Website")}
        value={website}
        onChange={(value) => {
          setWebsite(value);
          setAccount(t("Accounts.Account.All", "All accounts"));
        }}
        data={websites}
        allowDeselect={false}
      />
      {website !== "All websites" && (
        <Select
          pt="lg"
          label={t("Accounts.Account", "Account")}
          value={account}
          onChange={(value) => setAccount(value)}
          data={accounts}
          allowDeselect={false}
        />
      )}
    </Group>
  );
};

export default WebsiteAccountSelector;
