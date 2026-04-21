import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position='bottom-right'
      expand
      visibleToasts={3}
      gap={12}
      style={{
        fontSize: '1.4rem',
      }}
      toastOptions={{
        style: {
          padding: 0,
          background: 'transparent',
          boxShadow: 'none',
        },
        duration: 1800,
      }}
    />
  );
}

