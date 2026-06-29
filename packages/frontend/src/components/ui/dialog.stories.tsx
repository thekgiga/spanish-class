import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter, DialogClose,
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogAction, AlertDialogCancel,
} from './dialog';
import { Button } from './button';

const meta: Meta = { title: 'UI/Dialog', parameters: { layout: 'centered' }, tags: ['autodocs'] };
export default meta;
type Story = StoryObj;

export const DefaultDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild><Button variant="secondary">Open Dialog</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm your details</DialogTitle>
          <DialogDescription>Short blocking decision — use Drawer for editing.</DialogDescription>
        </DialogHeader>
        <div className="px-6 py-4 text-small text-ink-secondary">Dialog body goes here.</div>
        <DialogFooter>
          <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
          <Button variant="primary">Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const DestructiveAlertDialog: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild><Button variant="danger">Delete account</Button></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete account?</AlertDialogTitle>
          <AlertDialogDescription>
            This action is permanent and cannot be undone. All your data will be removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Yes, delete my account</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};
