import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import {
  Drawer, DrawerTrigger, DrawerContent, DrawerHeader,
  DrawerTitle, DrawerDescription, DrawerBody, DrawerFooter, DrawerCloseButton,
} from './drawer';
import { Button } from './button';

const meta: Meta = { title: 'UI/Drawer', parameters: { layout: 'centered' }, tags: ['autodocs'] };
export default meta;
type Story = StoryObj;

export const DefaultDrawer: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild><Button variant="secondary">Open Drawer</Button></DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Lesson details</DrawerTitle>
          <DrawerDescription>Review and take action on this booking request.</DrawerDescription>
          <DrawerCloseButton />
        </DrawerHeader>
        <DrawerBody>
          <p className="text-small text-ink-secondary">Drawer body — scrollable when content overflows.</p>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="secondary">Cancel</Button>
          <Button variant="primary">Approve</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const WideDrawer: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild><Button variant="secondary">Open Wide Drawer</Button></DrawerTrigger>
      <DrawerContent size="wide">
        <DrawerHeader>
          <DrawerTitle>Wide panel (520 px)</DrawerTitle>
          <DrawerCloseButton />
        </DrawerHeader>
        <DrawerBody>
          <p className="text-small text-ink-secondary">For complex content like booking composition.</p>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="secondary">Discard</Button>
          <Button variant="primary">Save</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};
