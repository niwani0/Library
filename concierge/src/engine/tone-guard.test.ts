import { describe, expect, it } from 'vitest';

import { allScriptMessages } from './script';
import { lintTone } from './tone-guard';

describe('lintTone', () => {
  it('flags exclamation marks as salesy', () => {
    expect(lintTone('Welcome aboard!')[0]).toContain('exclamation');
  });

  it('flags verbose messages', () => {
    const rambling =
      'First sentence here. Second sentence here. Third sentence here. Fourth sentence here.';

    expect(lintTone(rambling)[0]).toContain('verbose');
  });

  it('flags salesy pressure phrases', () => {
    expect(lintTone('Act now to get this rate')[0]).toContain('banned phrase');
  });

  it('flags robotic self-deprecation', () => {
    expect(lintTone('As an AI, I cannot help with that')[0]).toContain('banned phrase');
  });

  it('passes calm professional copy', () => {
    expect(lintTone('Your account is ready to use.')).toEqual([]);
  });
});

describe('the entire concierge voice', () => {
  it.each(allScriptMessages().map((message) => [message]))(
    'passes the tone guard: %s',
    (message) => {
      expect(lintTone(message)).toEqual([]);
    },
  );
});
