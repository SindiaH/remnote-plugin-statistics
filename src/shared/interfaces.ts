import { QueueInteractionScore } from '@remnote/plugin-sdk/dist/interfaces';

export type RepetitionTimeObject = {
  id: string;
  dateTime: Date;
  score: QueueInteractionScore;
}

export type RepetitionTimeList = {
  date: Date;
  list: RepetitionTimeObject[];
  goodCount?: number;
  hardCount?: number;
  easyCount?: number;
}
