/**
 * HomeworkPage stories — all UX states.
 *
 * Uses a pre-seeded QueryClient to avoid needing MSW or a live backend.
 * Each story hydrates the 'student-homework' query key with the desired state.
 */
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import { HomeworkPage } from '@/pages/student/HomeworkPage';

// ── Story wrapper ─────────────────────────────────────────────────────────────

type HomeworkItem = {
  bookingId: string;
  slotId: string;
  startTime: string;
  endTime: string;
  professor: { firstName: string; lastName: string } | null;
  homeworkNotes: string;
  noteId: string;
  updatedAt: string;
};

function makeClient(
  state: 'loading' | 'error' | 'empty' | { data: HomeworkItem[] }
): QueryClient {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  if (state === 'loading') {
    // Don't seed — query will stay in loading state (no fetcher mounted)
    qc.setQueryData(['student-homework'], undefined);
  } else if (state === 'error') {
    qc.setQueryData(['student-homework'], () => {
      throw new Error('Network error');
    });
  } else if (state === 'empty') {
    qc.setQueryData(['student-homework'], []);
  } else {
    qc.setQueryData(['student-homework'], state.data);
  }
  return qc;
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </I18nextProvider>
  );
}

// ── Sample data ───────────────────────────────────────────────────────────────

const SAMPLE_ITEMS: HomeworkItem[] = [
  {
    bookingId: 'booking-1',
    slotId: 'slot-1',
    startTime: new Date('2026-07-08T10:00:00Z').toISOString(),
    endTime: new Date('2026-07-08T11:00:00Z').toISOString(),
    professor: { firstName: 'Maria', lastName: 'Garcia' },
    homeworkNotes:
      'Practice the subjunctive tense with these exercises:\n1. Write 5 sentences using "ojalá"\n2. Complete page 47 in the workbook\n3. Watch the recommended YouTube video and note 10 new vocab words',
    noteId: 'note-1',
    updatedAt: new Date('2026-07-08T12:00:00Z').toISOString(),
  },
  {
    bookingId: 'booking-2',
    slotId: 'slot-2',
    startTime: new Date('2026-07-01T10:00:00Z').toISOString(),
    endTime: new Date('2026-07-01T11:00:00Z').toISOString(),
    professor: { firstName: 'Maria', lastName: 'Garcia' },
    homeworkNotes:
      'Review vocabulary from Chapter 4. Focus on irregular verbs in the preterite.',
    noteId: 'note-2',
    updatedAt: new Date('2026-07-01T11:30:00Z').toISOString(),
  },
  {
    bookingId: 'booking-3',
    slotId: 'slot-3',
    startTime: new Date('2026-06-24T10:00:00Z').toISOString(),
    endTime: new Date('2026-06-24T11:00:00Z').toISOString(),
    professor: null,
    homeworkNotes: 'Listen to the podcast episode and summarize it in 3–4 Spanish sentences.',
    noteId: 'note-3',
    updatedAt: new Date('2026-06-24T12:00:00Z').toISOString(),
  },
];

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof HomeworkPage> = {
  title: 'Pages/Student/HomeworkPage',
  component: HomeworkPage,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof HomeworkPage>;

// ── States ────────────────────────────────────────────────────────────────────

export const Populated: Story = {
  render: () => (
    <Wrapper>
      <QueryClientProvider client={makeClient({ data: SAMPLE_ITEMS })}>
        <HomeworkPage />
      </QueryClientProvider>
    </Wrapper>
  ),
  parameters: {
    docs: {
      description: { story: 'Three completed lessons with homework notes; newest first.' },
    },
  },
};

export const Empty: Story = {
  render: () => (
    <Wrapper>
      <QueryClientProvider client={makeClient('empty')}>
        <HomeworkPage />
      </QueryClientProvider>
    </Wrapper>
  ),
  parameters: {
    docs: {
      description: { story: 'No completed lessons with homework — shows empty state with BookOpen icon.' },
    },
  },
};

export const WithError: Story = {
  render: () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    // Pre-seed as error state by using a failed query result
    qc.setQueriesData({ queryKey: ['student-homework'] }, () => {
      // Simulate cached error by storing an explicit Error-like value
      return undefined;
    });
    // Mark the query as failed
    qc.getQueryCache().build(qc, { queryKey: ['student-homework'], queryFn: () => Promise.reject(new Error('Network error')) }).setState({ status: 'error', error: new Error('Network error'), data: undefined, fetchStatus: 'idle', dataUpdateCount: 0, errorUpdateCount: 1, isInvalidated: false, dataUpdatedAt: 0, errorUpdatedAt: Date.now() } as any);
    return (
      <Wrapper>
        <QueryClientProvider client={qc}>
          <HomeworkPage />
        </QueryClientProvider>
      </Wrapper>
    );
  },
  parameters: {
    docs: {
      description: { story: 'API error — shows inline error alert with retry message.' },
    },
  },
};

export const SingleItem: Story = {
  render: () => (
    <Wrapper>
      <QueryClientProvider client={makeClient({ data: [SAMPLE_ITEMS[0]] })}>
        <HomeworkPage />
      </QueryClientProvider>
    </Wrapper>
  ),
  parameters: {
    docs: {
      description: { story: 'One completed lesson — no professor assigned (null professor field).' },
    },
  },
};

export const LongHomeworkText: Story = {
  render: () => (
    <Wrapper>
      <QueryClientProvider client={makeClient({ data: [{
        ...SAMPLE_ITEMS[0],
        homeworkNotes:
          'This is a very long homework assignment to test how the card handles extended content.\n\n' +
          'Section 1 — Grammar:\n- Complete exercises 1–20 on pages 52–55\n- Write a paragraph using the imperfect tense\n- Conjugate all irregular verbs in the preterite\n\n' +
          'Section 2 — Vocabulary:\n- Learn the 30 new words from the vocabulary list\n- Create flashcards for each word with a sample sentence\n\n' +
          'Section 3 — Listening:\n- Watch the two recommended videos on YouTube\n- Transcribe one minute of audio from each video\n\n' +
          'Due date: next session. Bring completed workbook.',
      }] })}>
        <HomeworkPage />
      </QueryClientProvider>
    </Wrapper>
  ),
  parameters: {
    docs: {
      description: { story: 'Very long homework text — verifies whitespace-pre-wrap and card density at all widths.' },
    },
  },
};
