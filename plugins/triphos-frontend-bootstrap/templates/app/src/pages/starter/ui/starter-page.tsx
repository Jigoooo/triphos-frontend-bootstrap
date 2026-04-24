import { Link } from '@tanstack/react-router';
import { CalendarDays, ChevronDown, LoaderCircle, MessageSquare, MousePointer2, Plus, Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';

import { useFormState, useMediaQuery, useTimer } from '@/shared/hooks';
import { useColors } from '@/shared/theme';
import { alertDialog } from '@/shared/ui/alert-dialog';
import { useBottomSheet } from '@/shared/ui/bottom-sheet';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { DatePicker } from '@/shared/ui/date-picker';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { BouncingDotsLoader, Spinner } from '@/shared/ui/loader';
import { useModalDialog } from '@/shared/ui/modal-dialog';
import { OverlayScrollbar as OverlayScrollbarComponent } from '@/shared/ui/overlay-scrollbar';
import { Progress } from '@/shared/ui/progress';
import { RadioGroup } from '@/shared/ui/radio';
import { MultiSelect, Select } from '@/shared/ui/select';
import { SpeedDial } from '@/shared/ui/speed-dial';
import { Switch } from '@/shared/ui/switch';
import { Textarea } from '@/shared/ui/textarea';
import { ThemeToggle } from '@/shared/ui/theme-toggle';
import { toast } from '@/shared/ui/toast';
import { ToggleButton } from '@/shared/ui/toggle-button';
import { Tooltip } from '@/shared/ui/tooltip';
import { Typography } from '@/shared/ui/typography';

const INITIAL_TIMER_SECONDS = 30;

export function StarterPage() {
  const colors = useColors();
  const openBottomSheet = useBottomSheet();
  const openModalDialog = useModalDialog();
  const containerRef = useRef<HTMLDivElement>(null);
  const isWide = useMediaQuery('(min-width: 900px)');
  const isMedium = useMediaQuery('(min-width: 640px)');
  const { formatTime, isRunning, resetTimer, time, toggleTimer } = useTimer(INITIAL_TIMER_SECONDS, false);
  const [selected, setSelected] = useState(false);
  const [checked, setChecked] = useState(true);
  const [switchOn, setSwitchOn] = useState(true);
  const [date, setDate] = useState('2026-04-21');
  const [selectValue, setSelectValue] = useState('starter');
  const [radioValue, setRadioValue] = useState('starter');
  const [selectedSurfaces, setSelectedSurfaces] = useState(['checkbox', 'toast']);
  const [text, setText] = useState('');
  const { formState, onFormChange } = useFormState({
    name: 'Triphos starter',
  });
  const progressValue = Math.round(((INITIAL_TIMER_SECONDS - time) / INITIAL_TIMER_SECONDS) * 100);
  const timerStatusLabel = time === 0 ? 'Complete' : isRunning ? 'Running' : 'Paused';
  const timerStatusColor =
    time === 0 ? colors.feedback.success : isRunning ? colors.interactive.primary : colors.text.secondary;

  const cardStyle = {
    border: `1px solid ${colors.border.default}`,
    borderRadius: '1.6rem',
    backgroundColor: colors.bg.elevated,
    padding: isMedium ? '1.6rem' : '1.2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  } satisfies React.CSSProperties;

  const nestedPanelStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1.2rem',
    borderRadius: '1.2rem',
    border: `1px solid ${colors.border.default}`,
    backgroundColor: colors.bg.subtle,
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
                fontSize: '1.5rem',
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
            <FormField label='Project name' description='useFormState + animated focus baseline'>
              <Input value={formState.name} onChange={(event) => onFormChange('name', event.target.value)} />
            </FormField>
            <FormField label='Workspace' description={`Current workspace: ${selectValue}`}>
              <Select.Root value={selectValue} onValueChange={setSelectValue}>
                <Select.Trigger>
                  <Select.Value placeholder='Select a workspace' />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value='starter'>Starter</Select.Item>
                  <Select.Item value='admin'>Admin</Select.Item>
                  <Select.Item value='marketing'>Marketing</Select.Item>
                </Select.Content>
              </Select.Root>
            </FormField>
            <FormField label='Shared surfaces' description='Multi-select chips remove inline'>
              <MultiSelect.Root values={selectedSurfaces} onValuesChange={setSelectedSurfaces}>
                <MultiSelect.Trigger>
                  <MultiSelect.Value placeholder='Select shared surfaces' />
                </MultiSelect.Trigger>
                <MultiSelect.Content>
                  <MultiSelect.Item value='checkbox'>Checkbox</MultiSelect.Item>
                  <MultiSelect.Item value='select'>Select</MultiSelect.Item>
                  <MultiSelect.Item value='toast'>Toast</MultiSelect.Item>
                  <MultiSelect.Item value='dialog'>Dialog</MultiSelect.Item>
                </MultiSelect.Content>
              </MultiSelect.Root>
            </FormField>
            <FormField label='Radio group' description={`Current choice: ${radioValue}`}>
              <RadioGroup.Root value={radioValue} onValueChange={setRadioValue} orientation='horizontal'>
                <RadioGroup.Item value='starter'>
                  <RadioGroup.Indicator />
                  <RadioGroup.Label>Starter</RadioGroup.Label>
                </RadioGroup.Item>
                <RadioGroup.Item value='admin'>
                  <RadioGroup.Indicator />
                  <RadioGroup.Label>Admin</RadioGroup.Label>
                </RadioGroup.Item>
                <RadioGroup.Item value='marketing'>
                  <RadioGroup.Indicator />
                  <RadioGroup.Label>Marketing</RadioGroup.Label>
                </RadioGroup.Item>
              </RadioGroup.Root>
            </FormField>
            <FormField label='Date picker'>
              <DatePicker value={date} onChange={setDate} />
            </FormField>
            <FormField label='Textarea'>
              <Textarea value={text} onChange={(event) => setText(event.target.value)} autoResize />
            </FormField>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Checkbox.Root checked={checked} onCheckedChange={setChecked}>
                <Checkbox.Indicator />
                <Checkbox.Label>Checkbox starter</Checkbox.Label>
              </Checkbox.Root>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{ fontSize: '1.4rem', color: colors.text.primary }}>Switch</span>
                <Switch checked={switchOn} onChange={setSwitchOn} />
              </div>
              <ToggleButton selected={selected} onClick={() => setSelected((current) => !current)}>
                Toggle button
              </ToggleButton>
            </div>
          </section>

          <section style={cardStyle}>
            <strong style={{ fontSize: '1.8rem', color: colors.text.primary }}>Buttons</strong>
            <p style={{ fontSize: '1.4rem', color: colors.text.secondary }}>
              Shared button variants stay compact and inline-style-first.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Button>Solid button</Button>
              <Button variant='outline'>Outline button</Button>
              <Button variant='ghost'>Ghost button</Button>
            </div>
          </section>

          <section style={cardStyle}>
            <strong style={{ fontSize: '1.8rem', color: colors.text.primary }}>Feedback &amp; Overlays</strong>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Button onClick={() => toast.success('Starter toast is working')}>Toast success</Button>
              <Tooltip content='Tooltip starter uses @floating-ui/react'>
                <Button variant='outline'>
                  <MousePointer2 size={16} />
                  Tooltip
                </Button>
              </Tooltip>
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
          </section>

          <section style={cardStyle}>
            <strong style={{ fontSize: '1.8rem', color: colors.text.primary }}>Loading &amp; Progress</strong>
            <div style={nestedPanelStyle}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontSize: '1.3rem', color: colors.text.secondary }}>Countdown demo</span>
                  <strong style={{ fontSize: '3rem', color: colors.text.primary, lineHeight: 1 }}>{formatTime}</strong>
                </div>
                <span
                  style={{
                    padding: '0.35rem 0.8rem',
                    borderRadius: '999px',
                    border: `1px solid ${colors.border.default}`,
                    backgroundColor: colors.bg.elevated,
                    color: timerStatusColor,
                    fontSize: '1.2rem',
                    fontWeight: 700,
                  }}
                >
                  {timerStatusLabel}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <Progress value={progressValue} />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    fontSize: '1.3rem',
                    color: colors.text.secondary,
                  }}
                >
                  <span>Progress</span>
                  <span>{progressValue}%</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Button onClick={toggleTimer}>{isRunning ? 'Pause' : 'Start'}</Button>
                <Button variant='outline' onClick={resetTimer}>
                  Reset
                </Button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Spinner />
              <BouncingDotsLoader />
            </div>
          </section>

          <section style={cardStyle}>
            <strong style={{ fontSize: '1.8rem', color: colors.text.primary }}>Typography</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <Typography
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 700,
                  color: colors.text.primary,
                  lineHeight: 1.2,
                }}
              >
                Triphos starter headline
              </Typography>
              <Typography
                style={{
                  fontSize: '1.6rem',
                  color: colors.text.secondary,
                  lineHeight: 1.6,
                }}
              >
                A minimal text primitive mirrored from the shared-ui package and ready for template-level reuse.
              </Typography>
              <Typography
                style={{
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: colors.interactive.primary,
                }}
              >
                Caption / Meta
              </Typography>
            </div>
          </section>

          <section style={cardStyle}>
            <strong style={{ fontSize: '1.8rem', color: colors.text.primary }}>Scroll utilities</strong>
            <div
              ref={containerRef}
              data-overlay-scroll-panel='true'
              style={{
                position: 'relative',
                height: '18rem',
                overflowY: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
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
                    <LoaderCircle
                      size={16}
                      color={colors.interactive.primary}
                      style={{ animation: 'spin 0.9s linear infinite' }}
                    />
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
        icon={<Plus size={20} strokeWidth={2.75} />}
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
