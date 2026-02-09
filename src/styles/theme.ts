// theme.ts
import { createTheme } from "@mantine/core";
import { themeToVars } from "@mantine/vanilla-extract";

// Do not forget to pass theme to MantineProvider
export const theme = createTheme({
  fontFamily:
    "\"Source Sans 3\", \"Segoe UI Variable Text\", \"Segoe UI\", \"Noto Sans\", sans-serif",
  primaryColor: "cyan",
});

// CSS variables object, can be access in *.css.ts files
export const vars = themeToVars(theme);
