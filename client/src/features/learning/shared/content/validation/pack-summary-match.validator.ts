import { TopicPackSummary } from '../catalog.models';
import { TopicPack } from '../topic-pack.models';
import { topicPackToSummary } from '../pack-summary.mapper';

export function validatePackMatchesSummary(summary: TopicPackSummary, pack: TopicPack): TopicPack {
  if (JSON.stringify(topicPackToSummary(pack)) !== JSON.stringify(summary)) {
    throw new Error(`Topic pack ${summary.id} does not match its manifest summary.`);
  }
  return pack;
}
