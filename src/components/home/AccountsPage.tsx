import { Box, Card, Group, SimpleGrid, Stack, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import Accounts from "./Accounts";
import Databases from "./Databases";

function AccountsPage() {
  const { t } = useTranslation();

  return (
    <Group grow px="lg" pb="lg" h="100%" style={{ overflow: "hidden" }}>
      <Stack h="100%">
        <Title py="sm">{t("Accounts.Title", "Accounts")}</Title>
        <Accounts />
      </Stack>
      <Box h="100%" pt="md" style={{ overflow: "hidden" }}>
        <Databases />
      </Box>
    </Group>
  );
}

export default AccountsPage;
