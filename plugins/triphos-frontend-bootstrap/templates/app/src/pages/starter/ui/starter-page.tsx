import { Link } from '@tanstack/react-router';
import { CalendarDays, Check, ChevronDown, LoaderCircle, MessageSquare, MousePointer2, Palette, Plus, Sparkles } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { useBottomSheet } from '@/shared/ui/bottom-sheet';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { DatePicker } from '@/shared/ui/date-picker';
import { EmptyState } from '@/shared/ui/empty-state';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { BouncingDotsLoader, DelayedFallback, Skeleton, Spinner } from '@/shared/ui/loader';
import { useModalDialog } from '@/shared/ui/modal-dialog';
import { Select } from '@/shared/ui/select';
import { SpeedDial } from '@/shared/ui/speed-dial';
import { Switch } from '@/shared/ui/switch';
import { Textarea } from '@/shared/ui/textarea';
import { ThemeToggle } from '@/shared/ui/theme-toggle';
import { toast } from '@/shared/ui/toast';
import { ToggleButton } from '@/shared/ui/toggle-button';
import { Tooltip } from '@/shared/ui/tooltip';
import { alertDialog } from '@/shared/ui/alert-dialog';
import { useColors } from '@/shared/theme';
import { useFormState, useMediaQuery, useTimer } from '@/shared/hooks';
import { formatPhoneNumber, thousandSeparator } from '@/shared/lib/formatter/formatter-lib';
import { OverlayScrollbar as OverlayScrollbarComponent } from '@/shared/ui/overlay-scrollbar';

export function starterPage() {
  const colors = useColors();
  const openBottomSheet = useBottomSheet();
  const openModalDialog = useModalDialog();
  const containerRef = useRef<HTMLDivElement>(null);
  const isWide = useMediaQuery('(min-width: 900px)');
  const isMedium = useMediaQuery('(min-width: 640px)');
  const { formatTime, startTimer, stopTimer, resetTimer } = useTimer(125, false);
  const [selected, setSelected] = useState(false);
  const [checked, setChecked] = useState(true);
  const [switchOn, setSwitchOn] = useState(true);
  const [date, setDate] = useState('2026-04-21');
  const [selectValue, setSelectValue] = useState('starter');
  const [text, setText] = useState('');
  const { formState, onFormChange } = useFormState({
    name: 'Triphos',
    count: '12000',
  });

  const starterCards = useMemo(
    () => [
      'button',
      'input',
      'select',
      'checkbox',
      'textarea',
      'theme-toggle',
      'toast',
      'tooltip',
      'loader',
      'modal',
      'alert',
      'bottom-sheet',
      'speed-dial',
    ],
    [],
  );

  const cardStyle = {
    border: `1px solid ${colors.border.default}`,
    borderRadius: '1.6rem',
    backgroundColor: colors.bg.elevated,
    padding: isMedium ? '1.6rem' : '1.2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  } satisfies React.CSSProperties;

  return (
    <main
      style={{
        minHeight: '100dvh',
        backgroundColor: colors.bg.base,
        padding: isMedium ? '2rem' : '1.2rem',
      }}
    >
      <div
        style={{
          width: 'min(120rem, 100%)',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.6rem',
        }}
      >
        <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMedium ? 'center' : 'flex-start',
          flexDirection: isMedium ? 'row' : 'column',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                color: colors.interactive.primary,
                fontSize: '1.4rem',
                fontWeight: 700,
              }}
            >
              <Sparkles size={16} />
              Triphos UI starter
            </div>
            <h1 style={{ fontSize: '3.2rem', color: colors.text.primary }}>Starter showcase</h1>
            <p style={{ fontSize: '1.5rem', color: colors.text.secondary }}>
              Shared baseline, inline-style-first starter UI, and overlay wiring in one route.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              width: isMedium ? 'auto' : '100%',
            }}
          >
            <ThemeToggle />
            <Link
              to='/'
              style={{
                padding: '0.9rem 1.2rem',
                borderRadius: '999px',
                border: `1px solid ${colors.border.default}`,
                color: colors.text.primary,
                textDecoration: 'none',
                fontWeight: 600,
                width: isMedium ? 'auto' : '100%',
                textAlign: 'center',
              }}
            >
              Home
            </Link>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isWide ? 'repeat(2, minmax(0, 1fr))' : '1fr',
            gap: '1.6rem',
          }}
        >
          <section style={cardStyle}>
            <strong style={{ fontSize: '1.8rem', color: colors.text.primary }}>Form controls</strong>
            <FormField label='Project name' description='useFormState + formatter baseline'>
              <Input
                value={formState.name}
                onChange={(event) => onFormChange('name', event.target.value)}
                endDecorator={<Palette size={16} color={colors.text.tertiary} />}
              />
            </FormField>
            <FormField label='Budget'>
              <Input
                value={thousandSeparator(formState.count)}
                onChange={(event) => onFormChange('count', event.target.value.replaceAll(',', ''))}
              />
            </FormField>
            <FormField label='Phone preview' description={formatPhoneNumber('01012341234')}>
              <Select
                value={selectValue}
                onChange={(event) => setSelectValue(event.target.value)}
                options={[
                  { label: 'Starter', value: 'starter' },
                  { label: 'Admin', value: 'admin' },
                  { label: 'Marketing', value: 'marketing' },
                ]}
              />
            </FormField>
            <FormField label='Date picker'>
              <DatePicker value={date} onChange={setDate} />
            </FormField>
            <FormField label='Textarea'>
              <Textarea value={text} onChange={(event) => setText(event.target.value)} autoResize />
            </FormField>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Checkbox checked={checked} onChange={setChecked} label='Checkbox starter' />
              <Switch checked={switchOn} onChange={setSwitchOn} />
              <ToggleButton selected={selected} onClick={() => setSelected((current) => !current)}>
                Toggle button
              </ToggleButton>
            </div>
          </section>

          <section style={cardStyle}>
            <strong style={{ fontSize: '1.8rem', color: colors.text.primary }}>Buttons and feedback</strong>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Button onClick={() => toast.success('Starter toast is working')}>Toast success</Button>
              <Button
                variant='outline'
                onClick={async () => {
                  const confirmed = await alertDialog.confirm({
                    title: 'Delete draft?',
                    message: 'This only demos the alert-dialog starter.',
                  });
                  toast.info(`Confirm result: ${String(confirmed)}`);
                }}
              >
                Alert dialog
              </Button>
              <Button
                variant='ghost'
                onClick={async () => {
                  await openModalDialog(
                    () => (
                      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <strong style={{ fontSize: '1.8rem' }}>Modal starter</strong>
                        <p style={{ fontSize: '1.4rem', color: colors.text.secondary }}>
                          Root-level renderer wiring is already mounted.
                        </p>
                      </div>
                    ),
                    {},
                  );
                }}
              >
                Modal dialog
              </Button>
              <Button
                onClick={async () => {
                  await openBottomSheet(() => (
                    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <strong style={{ fontSize: '1.8rem' }}>Bottom sheet starter</strong>
                      <p style={{ fontSize: '1.4rem', color: colors.text.secondary }}>
                        This uses the shared bottom-sheet store and renderer.
                      </p>
                    </div>
                  ));
                }}
              >
                Bottom sheet
              </Button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Tooltip content='Tooltip starter uses @floating-ui/react'>
                <Button variant='outline'>
                  <MousePointer2 size={16} />
                  Tooltip
                </Button>
              </Tooltip>
              <Button variant='ghost' onClick={startTimer}>
                Start timer
              </Button>
              <Button variant='ghost' onClick={stopTimer}>
                Stop timer
              </Button>
              <Button variant='ghost' onClick={resetTimer}>
                Reset timer
              </Button>
              <span style={{ fontSize: '1.5rem', color: colors.text.secondary }}>{formatTime}</span>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Spinner />
              <BouncingDotsLoader />
              <Skeleton width='8rem' height='1.4rem' />
              <DelayedFallback fallback={<span style={{ fontSize: '1.3rem' }}>Delayed fallback</span>} />
            </div>
          </section>

          <section style={cardStyle}>
            <strong style={{ fontSize: '1.8rem', color: colors.text.primary }}>Empty/scroll utilities</strong>
            <EmptyState
              title='Starter route baseline'
              description={`Included cards: ${starterCards.length}`}
              action={
                <Button variant='outline' onClick={() => toast.info('Empty state action')}>
                  <Check size={16} />
                  Action
                </Button>
              }
            />
            <div
              ref={containerRef}
              style={{
                position: 'relative',
                height: '18rem',
                overflowY: 'auto',
                borderRadius: '1.2rem',
                border: `1px solid ${colors.border.default}`,
                backgroundColor: colors.bg.subtle,
                padding: '1rem',
              }}
            >
              <OverlayScrollbarComponent containerRef={containerRef} offset={{ top: 0, right: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {Array.from({ length: 18 }, (_, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.8rem',
                      padding: '0.8rem 1rem',
                      borderRadius: '1rem',
                      backgroundColor: colors.bg.elevated,
                    }}
                  >
                    <LoaderCircle size={16} color={colors.interactive.primary} />
                    <span style={{ fontSize: '1.4rem', color: colors.text.primary }}>
                      Scroll utility row {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <SpeedDial
        icon={<Plus size={20} />}
        onActionSelect={(actionId) => toast.info(`Speed dial action: ${actionId}`)}
        actions={[
          { id: 'toast', label: 'Toast', icon: <MessageSquare size={18} /> },
          { id: 'date', label: 'Date', icon: <CalendarDays size={18} /> },
          { id: 'select', label: 'Select', icon: <ChevronDown size={18} /> },
        ]}
      />
    </main>
  );
}
