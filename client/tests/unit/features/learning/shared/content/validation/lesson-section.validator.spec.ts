import { describe, expect, it } from 'vitest';
import { Lesson } from '@/features/learning/shared/content/lesson.models';
import { validateLessonSectionResponsibilities } from '@/features/learning/shared/content/validation/lesson-section.validator';
import { validateLessons } from '@/features/learning/shared/content/validation/lesson.validator';
import { learningPack } from '../../../../../../helpers/unit/learning-content.fixture';
import { loadContentSource } from '../../../../../../../tools/content-source-loader.mjs';
import { validatePackContent } from '../../../../../../../tools/content-validation/shared/pack-content.validator.mjs';
import { validateLessonSectionResponsibilities as validateStandalone } from '../../../../../../../tools/content-validation/shared/lesson-section-quality.mjs';

function lessonWithList(): Lesson {
  const lesson = structuredClone(learningPack.lessons[0]);
  lesson.sections.push({
    title: 'Renamed teaching section',
    paragraphs: ['Read the words.'],
    keyPoints: ['talo — house', 'koulu — school'],
  });
  return lesson;
}

describe('lesson section responsibilities', () => {
  it('rejects a vocabulary list under any grammar heading at both boundaries', () => {
    const lesson = lessonWithList();
    expect(() => validateLessons([lesson], new Set())).toThrowError(
      'repeats its vocabulary list in grammar section Renamed teaching section',
    );
    expect(validateStandalone([lesson])).toEqual([
      'lesson-1: repeats its vocabulary list in grammar section Renamed teaching section',
    ]);
  });

  it('catches introduced, reused, and supplied entries in paragraphs with annotations', () => {
    const lesson = lessonWithList();
    lesson.reusedVocabulary = lesson.introducedVocabulary.splice(1);
    lesson.sections[1] = {
      title: 'Supporting forms',
      paragraphs: ['TALO – house.', 'koulu - school; supplied here', 'hyvin — well'],
      keyPoints: ['Keep the pattern unchanged.'],
    };
    expect(() => validateLessonSectionResponsibilities(lesson)).toThrowError(
      'repeats its vocabulary list',
    );
    expect(validateStandalone([lesson])).toHaveLength(1);
  });

  it('rejects a list made entirely from supplied forms', () => {
    const lesson = lessonWithList();
    lesson.suppliedVocabulary.push({ finnish: 'koulussa', english: 'at school', type: 'word' });
    lesson.sections[1].keyPoints = ['hyvin — well', 'koulussa — at school; complete form supplied'];
    expect(() => validateLessonSectionResponsibilities(lesson)).toThrowError(
      'repeats its vocabulary list',
    );
    expect(validateStandalone([lesson])).toHaveLength(1);
  });

  it('retains grammar transformations, contextual sentences, and purposeful word reuse', () => {
    const lesson = lessonWithList();
    lesson.sections[1] = {
      title: 'Form the location',
      paragraphs: ['Hyvin means “well” in this example.'],
      keyPoints: [
        'talo → talossa — in the house',
        'koulu → koulussa — at school',
        'Minä opin hyvin. — I learn well.',
      ],
    };
    expect(() => validateLessons([lesson], new Set())).not.toThrow();
    expect(validateStandalone([lesson])).toEqual([]);
  });

  it('wires the standalone guard into complete pack validation', async () => {
    const source = await loadContentSource('content');
    const pack = structuredClone(
      source.packs.find((item) => item['id'] === 'affirmative-possession'),
    );
    const lessons = pack!['lessons'] as Lesson[];
    lessons[0].sections.push({
      title: 'Supporting words',
      paragraphs: ['Read these.'],
      keyPoints: ['pallo — ball', 'kirja — book'],
    });
    const result = await validatePackContent(pack!);
    expect(result.errors.join('\n')).toContain(
      'repeats its vocabulary list in grammar section Supporting words',
    );
  });
});
