import type { Preview } from "@storybook/react";
import { mswLoader } from "msw-storybook-addon/csf3";
import { handlers } from "../mocks/handlers";
import "../app/globals.css";

const preview: Preview = {
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "tracebench-dark",
      values: [{ name: "tracebench-dark", value: "#070708" }],
    },
    nextjs: {
      appDirectory: true,
    },
    a11y: {
      test: "todo",
    },
    msw: {
      handlers,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  loaders: [mswLoader()],
  decorators: [
    (Story) => (
      <div className="min-h-[240px] bg-tb-bg p-4 text-tb-text antialiased">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
};

export default preview;
