import { enginesAtom } from "@/state/atoms";
import {
  type Engine,
  type LocalEngine,
  engineSchema,
  requiredEngineSettings,
} from "@/utils/engines";
import {
  ActionIcon,
  Box,
  Button,
  Center,
  Checkbox,
  Divider,
  FileInput,
  Group,
  JsonInput,
  Modal,
  NumberInput,
  Paper,
  ScrollArea,
  Select,
  SimpleGrid,
  Space,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconCloud,
  IconCopy,
  IconCpu,
  IconPhotoPlus,
  IconPlus,
} from "@tabler/icons-react";
import { useAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";
import useSWRImmutable from "swr/immutable";
import OpenFolderButton from "../common/OpenFolderButton";
import AddEngine from "./AddEngine";

import { type EngineConfig, type UciOptionConfig, commands } from "@/bindings";
import * as classes from "@/components/common/GenericCard.css";
import { Route } from "@/routes/engines";
import { unwrap } from "@/utils/unwrap";
import { useToggle } from "@mantine/hooks";
import { useNavigate } from "@tanstack/react-router";
import { open } from "@tauri-apps/plugin-dialog";
import { useTranslation } from "react-i18next";
import ConfirmModal from "../common/ConfirmModal";
import GenericCard from "../common/GenericCard";
import GoModeInput from "../common/GoModeInput";
import LocalImage from "../common/LocalImage";
import LinesSlider from "../panels/analysis/LinesSlider";

type SpinOption = Extract<UciOptionConfig, { type: "spin" }>;
type CheckOption = Extract<UciOptionConfig, { type: "check" }>;
type ComboOption = Extract<UciOptionConfig, { type: "combo" }>;
type StringOption = Extract<UciOptionConfig, { type: "string" }>;
type NonButtonOption = SpinOption | CheckOption | ComboOption | StringOption;

type OptionWithValue =
  | (Omit<SpinOption, "value"> & {
      value: SpinOption["value"] & { value: number };
    })
  | (Omit<CheckOption, "value"> & {
      value: CheckOption["value"] & { value: boolean };
    })
  | (Omit<ComboOption, "value"> & {
      value: ComboOption["value"] & { value: string };
    })
  | (Omit<StringOption, "value"> & {
      value: StringOption["value"] & { value: string };
    });

const isCheckOption = (
  option: OptionWithValue,
): option is Extract<OptionWithValue, { type: "check" }> =>
  option.type === "check";

const isNonCheckOption = (
  option: OptionWithValue,
): option is Exclude<OptionWithValue, { type: "check" }> =>
  option.type !== "check";

export default function EnginesPage() {
  const { t } = useTranslation();

  const [engines, setEngines] = useAtom(enginesAtom);
  const [opened, setOpened] = useState(false);
  const { selected } = Route.useSearch();
  const navigate = useNavigate();
  const setSelected = (v: number | null) => {
    navigate({ search: { selected: v ?? undefined } });
  };

  const selectedEngine = selected !== undefined ? engines[selected] : null;

  return (
    <Stack h="100%" px="lg" pb="lg">
      <AddEngine opened={opened} setOpened={setOpened} />
      <Group align="baseline" py="sm">
        <Title>{t("Engines.Title")}</Title>
        <OpenFolderButton base="AppDir" folder="engines" />
      </Group>
      <Group grow flex={1} style={{ overflow: "hidden" }} align="start">
        <ScrollArea h="100%" offsetScrollbars>
          <SimpleGrid
            cols={{ base: 1, md: 2 }}
            spacing={{ base: "md", md: "sm" }}
          >
            {engines.map((item, i) => {
              const stats =
                item.type === "local"
                  ? [
                      {
                        label: "ELO",
                        value: item.elo ? item.elo.toString() : "??",
                      },
                    ]
                  : [{ label: "Type", value: "Cloud" }];
              if (item.type === "local" && item.version) {
                stats.push({
                  label: t("Common.Version"),
                  value: item.version,
                });
              }
              return (
                <GenericCard
                  id={i}
                  key={item.id}
                  isSelected={selected === i}
                  setSelected={setSelected}
                  error={undefined}
                  Header={<EngineName engine={item} />}
                  stats={stats}
                />
              );
            })}
            <Box
              className={classes.card}
              component="button"
              type="button"
              onClick={() => setOpened(true)}
            >
              <Stack gap={0} justify="center" w="100%" h="100%">
                <Text mb={10}>{t("Common.AddNew")}</Text>
                <Box>
                  <IconPlus size="1.3rem" />
                </Box>
              </Stack>
            </Box>
          </SimpleGrid>
        </ScrollArea>
        {!selectedEngine || selected === undefined ? (
          <Center h="100%">
            <Text>{t("Engines.Settings.NoEngine")}</Text>
          </Center>
        ) : (
          <Paper withBorder p="md" h="100%">
            {selectedEngine.type === "local" ? (
              <EngineSettings selected={selected} setSelected={setSelected} />
            ) : (
              <Stack>
                <Divider variant="dashed" label={t("Common.GeneralSettings")} />

                <TextInput
                  w="50%"
                  label={t("Common.Name")}
                  value={selectedEngine.name}
                  onChange={(e) => {
                    setEngines(async (prev) => {
                      const copy = [...(await prev)];
                      copy[selected].name = e.currentTarget.value;
                      return copy;
                    });
                  }}
                />

                <Divider
                  variant="dashed"
                  label={t("Engines.Settings.AdvancedSettings")}
                />
                <Stack w="50%">
                  <Text fw="bold">{t("Engines.Settings.NumOfLines")}</Text>
                  <LinesSlider
                    value={
                      Number(
                        selectedEngine.settings?.find(
                          (setting) => setting.name === "MultiPV",
                        )?.value,
                      ) || 1
                    }
                    setValue={(v) => {
                      setEngines(async (prev) => {
                        const copy = [...(await prev)];
                        const setting = copy[selected].settings?.find(
                          (setting) => setting.name === "MultiPV",
                        );
                        if (setting) {
                          setting.value = v;
                        } else {
                          copy[selected].settings?.push({
                            name: "MultiPV",
                            value: v,
                          });
                        }
                        return copy;
                      });
                    }}
                  />
                </Stack>

                <Group justify="right">
                  <Button
                    color="red"
                    onClick={() => {
                      setEngines(async (prev) => {
                        const copy = [...(await prev)];
                        copy.splice(selected, 1);
                        return copy;
                      });
                      setSelected(null);
                    }}
                  >
                    {t("Common.Remove")}
                  </Button>
                </Group>
              </Stack>
            )}
          </Paper>
        )}
      </Group>
    </Stack>
  );
}

function EngineSettings({
  selected,
  setSelected,
}: { selected: number; setSelected: (v: number | null) => void }) {
  const { t } = useTranslation();

  const [engines, setEngines] = useAtom(enginesAtom);
  const engine = engines[selected] as LocalEngine;
  const { data: options } = useSWRImmutable<
    EngineConfig,
    unknown,
    [string, string]
  >(["engine-config", engine.path], async ([, path]) =>
    unwrap(await commands.getEngineConfig(path)),
  );

  const setEngine = useCallback(
    (newEngine: LocalEngine) => {
      setEngines(async (prev) => {
        const copy = [...(await prev)];
        copy[selected] = newEngine;
        return copy;
      });
    },
    [selected, setEngines],
  );

  useEffect(() => {
    if (options) {
      const settings = [...(engine.settings || [])];
      const missing = requiredEngineSettings.filter(
        (field) => !settings.find((setting) => setting.name === field),
      );
      for (const field of requiredEngineSettings) {
        if (!settings.find((setting) => setting.name === field)) {
          const option = options.options.find(
            (option) => option.value.name === field,
          );
          if (option) {
            // @ts-ignore
            settings.push({ name: field, value: option.value.default });
          }
        }
      }
      if (missing.length > 0) {
        setEngine({ ...engine, settings });
      }
    }
  }, [engine, engine.settings, options, setEngine]);

  const completeOptions: OptionWithValue[] =
    options?.options
      .filter((option): option is NonButtonOption => option.type !== "button")
      .map((option) => {
        const setting = engine.settings?.find(
          (setting) => setting.name === option.value.name,
        );
        const rawValue = setting?.value;
        switch (option.type) {
          case "spin": {
            const defaultValue = option.value.default ?? 0;
            const value =
              typeof rawValue === "number"
                ? rawValue
                : rawValue !== null && rawValue !== undefined
                  ? Number(rawValue)
                  : Number(defaultValue);
            return { ...option, value: { ...option.value, value } };
          }
          case "check": {
            const defaultValue = option.value.default ?? false;
            const value =
              typeof rawValue === "boolean" ? rawValue : defaultValue;
            return { ...option, value: { ...option.value, value } };
          }
          case "combo": {
            const defaultValue = option.value.default ?? "";
            const value =
              typeof rawValue === "string" ? rawValue : defaultValue;
            return { ...option, value: { ...option.value, value } };
          }
          case "string": {
            const defaultValue = option.value.default ?? "";
            const value =
              typeof rawValue === "string" ? rawValue : defaultValue;
            return { ...option, value: { ...option.value, value } };
          }
        }
      }) ?? [];

  function changeImage() {
    open({
      title: "Select image",
    }).then((res) => {
      if (typeof res === "string") {
        setEngine({ ...engine, image: res });
      }
    });
  }

  function setSetting(
    name: string,
    value: string | number | boolean | null,
    def: string | number | boolean | null,
  ) {
    const newSettings = engine.settings || [];
    const setting = newSettings.find((setting) => setting.name === name);
    if (setting) {
      setting.value = value;
    } else {
      newSettings.push({ name, value });
    }
    if (value !== def || requiredEngineSettings.includes(name)) {
      setEngine({
        ...engine,
        settings: newSettings,
      });
    } else {
      setEngine({
        ...engine,
        settings: newSettings.filter((setting) => setting.name !== name),
      });
    }
  }

  const [deleteModal, toggleDeleteModal] = useToggle();
  const [jsonModal, toggleJSONModal] = useToggle();

  return (
    <ScrollArea h="100%" offsetScrollbars>
      <Stack>
        <Divider variant="dashed" label={t("Common.GeneralSettings")} />
        <Group grow align="start" wrap="nowrap">
          <Stack>
            <Group wrap="nowrap" w="100%">
              <TextInput
                flex={1}
                label={t("Common.Name")}
                value={engine.name}
                onChange={(e) =>
                  setEngine({ ...engine, name: e.currentTarget.value })
                }
              />
              <TextInput
                label={t("Common.Version")}
                w="5rem"
                value={engine.version}
                placeholder="?"
                onChange={(e) =>
                  setEngine({ ...engine, version: e.currentTarget.value })
                }
              />
            </Group>
            <Group grow>
              <NumberInput
                label="ELO"
                value={engine.elo || undefined}
                min={0}
                placeholder={t("Common.Unknown")}
                onChange={(v) =>
                  setEngine({
                    ...engine,
                    elo: typeof v === "number" ? v : undefined,
                  })
                }
              />
            </Group>
          </Stack>
          <Center>
            {engine.image ? (
              <Paper
                withBorder
                style={{ cursor: "pointer" }}
                onClick={changeImage}
              >
                <LocalImage
                  src={engine.image}
                  alt={engine.name}
                  mah="10rem"
                  maw="100%"
                  fit="contain"
                />
              </Paper>
            ) : (
              <ActionIcon
                size="10rem"
                variant="subtle"
                styles={{
                  root: {
                    border: "1px dashed",
                  },
                }}
                onClick={changeImage}
              >
                <IconPhotoPlus size="2.5rem" />
              </ActionIcon>
            )}
          </Center>
        </Group>
        <Divider
          variant="dashed"
          label={t("Engines.Settings.SearchSettings")}
        />
        <GoModeInput
          goMode={engine.go || null}
          setGoMode={(v) => setEngine({ ...engine, go: v })}
        />

        <Divider
          variant="dashed"
          label={t("Engines.Settings.AdvancedSettings")}
        />
        <SimpleGrid cols={2}>
          {completeOptions.filter(isNonCheckOption).map((option) => {
            switch (option.type) {
              case "spin": {
                const v = option.value;
                return (
                  <NumberInput
                    key={v.name}
                    label={v.name}
                    min={v.min !== null ? Number(v.min) : undefined}
                    max={v.max !== null ? Number(v.max) : undefined}
                    value={Number(v.value)}
                    onChange={(e) =>
                      setSetting(v.name, e, Number(v.default ?? 0))
                    }
                  />
                );
              }
              case "combo": {
                const v = option.value;
                return (
                  <Select
                    key={v.name}
                    label={v.name}
                    data={v.var}
                    value={v.value}
                    onChange={(e) => setSetting(v.name, e, v.default ?? "")}
                  />
                );
              }
              case "string": {
                const v = option.value;
                if (v.name.toLowerCase().includes("file")) {
                  const file = v.value ? new File([v.value], v.value) : null;
                  return (
                    <FileInput
                      key={v.name}
                      clearable
                      label={v.name}
                      value={file}
                      onClick={async () => {
                        const selected = await open({
                          multiple: false,
                        });
                        if (!selected) return;
                        setSetting(v.name, selected as string, v.default ?? "");
                      }}
                      onChange={(e) => {
                        if (e === null) {
                          setSetting(v.name, null, v.default ?? "");
                        }
                      }}
                    />
                  );
                }
                return (
                  <TextInput
                    key={v.name}
                    label={v.name}
                    value={v.value || ""}
                    onChange={(e) =>
                      setSetting(v.name, e.currentTarget.value, v.default ?? "")
                    }
                  />
                );
              }
              default:
                return null;
            }
          })}
        </SimpleGrid>
        <SimpleGrid cols={2}>
          {completeOptions.filter(isCheckOption).map((o) => {
            return (
              <Checkbox
                key={o.value.name}
                label={o.value.name}
                checked={o.value.value}
                onChange={(e) =>
                  setSetting(
                    o.value.name,
                    e.currentTarget.checked,
                    o.value.default ?? false,
                  )
                }
              />
            );
          })}
        </SimpleGrid>

        <Group justify="end">
          <Button variant="default" onClick={() => toggleJSONModal(true)}>
            {t("Engines.Settings.EditJSON")}
          </Button>
          <Button
            variant="default"
            onClick={() =>
              setEngine({
                ...engine,
                settings: options?.options
                  .filter((option) =>
                    requiredEngineSettings.includes(option.value.name),
                  )
                  .map((option) => ({
                    name: option.value.name,
                    // @ts-ignore
                    value: option.value.default,
                  })),
              })
            }
          >
            {t("Engines.Settings.Reset")}
          </Button>
          <Button
            leftSection={<IconCopy size="1rem" />}
            variant="default"
            onClick={() => {
              const duplicatedEngine: LocalEngine = {
                ...engine,
                id: crypto.randomUUID(),
                name: `${engine.name} (Copy)`,
              };
              setEngines(async (prev) => {
                const copy = [...(await prev)];
                copy.splice(selected + 1, 0, duplicatedEngine);
                return copy;
              });
              setSelected(selected + 1);
            }}
          >
            {t("Common.Duplicate")}
          </Button>
          <Button color="red" onClick={() => toggleDeleteModal()}>
            {t("Common.Remove")}
          </Button>
        </Group>
        <ConfirmModal
          title={t("Engines.Remove.Title")}
          description={t("Engines.Remove.Message")}
          opened={deleteModal}
          onClose={toggleDeleteModal}
          onConfirm={() => {
            setEngines(async (prev) =>
              (await prev).filter((e) => e.name !== engine.name),
            );
            setSelected(null);
            toggleDeleteModal();
          }}
          confirmLabel={t("Common.Remove")}
        />
      </Stack>
      <JSONModal
        key={engine.name}
        opened={jsonModal}
        toggleOpened={toggleJSONModal}
        engine={engine}
        setEngine={(v) =>
          setEngines(async (prev) => {
            const copy = [...(await prev)];
            copy[selected] = v;
            return copy;
          })
        }
      />
    </ScrollArea>
  );
}

function JSONModal({
  opened,
  toggleOpened,
  engine,
  setEngine,
}: {
  opened: boolean;
  toggleOpened: () => void;
  engine: Engine;
  setEngine: (v: Engine) => void;
}) {
  const { t } = useTranslation();

  const [value, setValue] = useState(JSON.stringify(engine, null, 2));
  const [error, setError] = useState<string | null>(null);
  return (
    <Modal
      opened={opened}
      onClose={toggleOpened}
      title={t("Engines.Settings.EditJSON")}
      size="xl"
    >
      <JsonInput
        autosize
        value={value}
        onChange={(e) => {
          setValue(e);
          setError(null);
        }}
        error={error}
      />
      <Space h="md" />
      <Button
        onClick={() => {
          const parseRes = engineSchema.safeParse(JSON.parse(value));
          if (parseRes.success) {
            setEngine(parseRes.data);
            setError(null);
            toggleOpened();
          } else {
            setError("Invalid Configuration"); // TODO: show better error message
          }
        }}
      >
        {t("Common.Save")}
      </Button>
    </Modal>
  );
}

function EngineName({ engine }: { engine: Engine }) {
  const { data: fileExists, isLoading } = useSWRImmutable(
    ["file-exists", engine.type === "local" ? engine.path : null],
    async ([, path]) => {
      if (path === null) return false;
      if (engine.type !== "local") return true;
      const res = await commands.fileExists(path);
      return res.status === "ok";
    },
  );

  const hasError = engine.type === "local" && !isLoading && !fileExists;

  return (
    <Group wrap="nowrap">
      {engine.image ? (
        <LocalImage src={engine.image} alt={engine.name} h="2.5rem" />
      ) : engine.type !== "local" ? (
        <IconCloud size="2.5rem" />
      ) : (
        <IconCpu size="2.5rem" />
      )}
      <Stack gap={0}>
        <Text fw="bold" lineClamp={1} c={hasError ? "red" : undefined}>
          {engine.name} {hasError ? "(file missing)" : ""}
        </Text>
        <Text
          size="xs"
          c="dimmed"
          style={{ wordWrap: "break-word" }}
          lineClamp={1}
        >
          {engine.type === "local"
            ? engine.path.split(/\/|\\/).slice(-1)[0]
            : engine.url}
        </Text>
      </Stack>
    </Group>
  );
}
