import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TodayMenuSection } from "@/components/todays-menu";
import {
  cartLines,
  contact,
  menuExtras,
  menuMain,
  orderingWindows,
  todaysMenu,
} from "../fixtures/menu";

const meta: Meta<typeof TodayMenuSection> = {
  title: "Domain/Today's Menu",
  component: TodayMenuSection,
};

export default meta;
type Story = StoryObj<typeof TodayMenuSection>;

export const OpenWithCart: Story = {
  render: () => (
    <TodayMenuSection
      loading={false}
      loadError={false}
      menuPublished
      ordering={todaysMenu.ordering}
      windowLabel="9:00 am-1:00 pm"
      mainItem={menuMain}
      extras={menuExtras}
      lines={cartLines}
      total={menuMain.price + menuExtras[0].price * 2}
      orderable
      contact={contact}
      onQuantityChange={() => {}}
    />
  ),
};

export const EmptyCart: Story = {
  render: () => (
    <TodayMenuSection
      loading={false}
      loadError={false}
      menuPublished
      ordering={todaysMenu.ordering}
      windowLabel="9:00 am-1:00 pm"
      mainItem={menuMain}
      extras={menuExtras}
      lines={[]}
      total={0}
      orderable
      contact={contact}
      onQuantityChange={() => {}}
    />
  ),
};

export const ClosingSoon: Story = {
  render: () => (
    <TodayMenuSection
      loading={false}
      loadError={false}
      menuPublished
      ordering={orderingWindows.closing_soon}
      windowLabel="9:00 am-1:00 pm"
      mainItem={menuMain}
      extras={menuExtras}
      lines={cartLines}
      total={menuMain.price + menuExtras[0].price * 2}
      orderable
      contact={contact}
      onQuantityChange={() => {}}
    />
  ),
};

export const OrderingClosed: Story = {
  render: () => (
    <TodayMenuSection
      loading={false}
      loadError={false}
      menuPublished
      ordering={orderingWindows.closed}
      windowLabel="9:00 am-1:00 pm"
      mainItem={menuMain}
      extras={menuExtras}
      lines={cartLines}
      total={menuMain.price + menuExtras[0].price * 2}
      orderable={false}
      contact={contact}
      onQuantityChange={() => {}}
    />
  ),
};

export const NoMenuPublished: Story = {
  render: () => (
    <TodayMenuSection
      loading={false}
      loadError={false}
      menuPublished={false}
      ordering={null}
      windowLabel={null}
      mainItem={null}
      extras={[]}
      lines={[]}
      total={0}
      orderable={false}
      contact={contact}
      onQuantityChange={() => {}}
    />
  ),
};

export const Loading: Story = {
  render: () => (
    <TodayMenuSection
      loading
      loadError={false}
      menuPublished={false}
      ordering={null}
      windowLabel={null}
      mainItem={null}
      extras={[]}
      lines={[]}
      total={0}
      orderable={false}
      contact={contact}
      onQuantityChange={() => {}}
    />
  ),
};

export const LoadError: Story = {
  render: () => (
    <TodayMenuSection
      loading={false}
      loadError
      menuPublished={false}
      ordering={null}
      windowLabel={null}
      mainItem={null}
      extras={[]}
      lines={[]}
      total={0}
      orderable={false}
      contact={contact}
      onQuantityChange={() => {}}
    />
  ),
};
