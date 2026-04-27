import { createFileRoute } from '@tanstack/react-router';

import { StarterPage } from '@/pages/starter';

export const Route = createFileRoute('/starter')({
  component: StarterPage,
});
