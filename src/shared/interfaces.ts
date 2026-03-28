import { QueueInteractionScore } from '@remnote/plugin-sdk/dist/interfaces';

export type RepetitionTimeObject = {
  id: string;
  dateTime: Date;
  score: QueueInteractionScore;
}

export type TreeNode = {
  id: string;
  name: string;
  children: TreeNode[];
  depth: number;
};

export type RepetitionTimeList = {
  date: Date;
  list: RepetitionTimeObject[];
  goodCount?: number;
  hardCount?: number;
  easyCount?: number;
}
