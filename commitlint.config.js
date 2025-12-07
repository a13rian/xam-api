module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'no-claude-footer': [2, 'always'],
  },
  plugins: [
    {
      rules: {
        'no-claude-footer': (parsed) => {
          const message = parsed.raw;
          const hasClaude =
            message.includes('Generated with [Claude Code]') ||
            message.includes('Co-Authored-By: Claude');

          return [
            !hasClaude,
            'Commit message must not contain Claude Code footer. Remove "Generated with [Claude Code]" and "Co-Authored-By: Claude" lines.',
          ];
        },
      },
    },
  ],
};
