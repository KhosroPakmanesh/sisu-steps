import { beforeAll, describe, expect, it } from 'vitest';
import { loadContentSource } from '../../../../tools/content-source-loader.mjs';
import { validateNumberPracticeNovelty } from '../../../../tools/content-validation/shared/number-practice-novelty.mjs';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';

describe('new number-specific optional task novelty', () => {
  let packs: TopicPack[];
  beforeAll(async () => {
    packs = (await loadContentSource('content')).packs as unknown as TopicPack[];
  });
  it('accepts all 23 additions without rejecting preserved retrieval', () => {
    expect(packs.flatMap(validateNumberPracticeNovelty)).toEqual([]);
    expect(
      packs.flatMap((pack) =>
        pack.lessons
          .filter((lesson) => lesson.numberScope)
          .flatMap((lesson) =>
            lesson.practiceExercises.filter((exercise) =>
              exercise.id.startsWith(lesson.id + '-practice-'),
            ),
          ),
      ),
    ).toHaveLength(23);
  });
  it.each([
    ['affirmative-possession', 'aps-fixed-on-singular', 'aps-review-e022'],
    ['affirmative-possession', 'aps-sentences-singular', 'aps-fixed-on-singular-test-e104'],
    ['negative-possession', 'nps-partitive-singular', 'nps-sentences-singular-test-e108'],
    ['possession-questions', 'pqs-short-answers-singular', 'pqs-short-answers-test-e005'],
    ['possessive-pronouns-endings', 'ppe-whose-singular', 'pop-whose-singular-test-e102'],
  ])(
    'rejects a scored/Review task disguised as new optional work in %s / %s',
    (packId, lessonId, peerId) => {
      const pack = structuredClone(packs.find((item) => item.id === packId)!);
      const lesson = pack.lessons.find((item) => item.id === lessonId)!;
      const index = lesson.practiceExercises.findIndex((exercise) =>
        exercise.id.startsWith(lessonId + '-practice-'),
      );
      const id = lesson.practiceExercises[index].id;
      const peer = pack.tests
        .flatMap((test) => test.exercises)
        .find((exercise) => exercise.id === peerId)!;
      lesson.practiceExercises[index] = {
        ...structuredClone(peer),
        id,
        prompt: 'Optional practice: ' + peer.prompt,
      };
      expect(validateNumberPracticeNovelty(pack).join(' ')).toContain(
        'repeated number-specific optional task',
      );
      if (peer.tokens) {
        lesson.practiceExercises[index].tokens = [...peer.tokens].reverse();
        expect(validateNumberPracticeNovelty(pack).join(' ')).toContain(
          'repeated number-specific optional task',
        );
      }
    },
  );
});
