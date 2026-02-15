import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Calendar, Clock, Users } from 'lucide-react';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outlined', 'ghost'],
      description: 'Visual style variant',
    },
    hover: {
      control: 'boolean',
      description: 'Enable hover effect',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">
          This is the main content of the card. You can put any content here.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const Elevated: Story = {
  render: () => (
    <Card variant="elevated" className="w-80">
      <CardHeader>
        <CardTitle>Elevated Card</CardTitle>
        <CardDescription>This card has a larger shadow</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">
          Elevated cards stand out more with enhanced shadow effects.
        </p>
      </CardContent>
    </Card>
  ),
};

export const Outlined: Story = {
  render: () => (
    <Card variant="outlined" className="w-80">
      <CardHeader>
        <CardTitle>Outlined Card</CardTitle>
        <CardDescription>Border-based styling</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">
          Outlined cards use borders instead of shadows.
        </p>
      </CardContent>
    </Card>
  ),
};

export const WithHover: Story = {
  render: () => (
    <Card hover className="w-80">
      <CardHeader>
        <CardTitle>Hoverable Card</CardTitle>
        <CardDescription>Hover over me!</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">
          This card has interactive hover effects for better UX.
        </p>
      </CardContent>
    </Card>
  ),
};

export const LessonCard: Story = {
  render: () => (
    <Card hover className="w-80">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary">
            <Users className="mr-1 h-3 w-3" />
            Group
          </Badge>
          <Badge variant="gold">
            Premium
          </Badge>
        </div>

        <h3 className="font-semibold text-navy-800 mb-1">
          Spanish Conversation Practice
        </h3>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Clock className="h-4 w-4" />
          <span>10:00 AM - 11:00 AM (1 hour)</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Calendar className="h-4 w-4" />
          <span>March 15, 2026</span>
        </div>

        <p className="text-sm text-muted-foreground mb-3">
          Practice conversational Spanish with other students at your level.
        </p>

        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-sm text-muted-foreground">
            3/5 spots filled
          </span>
          <Button size="sm" variant="primary">
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-4">
        <CardTitle className="text-sm">Default</CardTitle>
      </Card>
      <Card variant="elevated" className="p-4">
        <CardTitle className="text-sm">Elevated</CardTitle>
      </Card>
      <Card variant="outlined" className="p-4">
        <CardTitle className="text-sm">Outlined</CardTitle>
      </Card>
      <Card variant="ghost" className="p-4">
        <CardTitle className="text-sm">Ghost</CardTitle>
      </Card>
    </div>
  ),
};
