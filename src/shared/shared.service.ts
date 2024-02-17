import { QueueInteractionScore } from '@remnote/plugin-sdk/dist/interfaces';

export const SharedService = {

  getClassByScore: (score: number) => {
    if (score === 0.01) {
      return 'card-too-early-bg';
    } else if (score === 0) {
      return 'card-again-bg';
    } else if (score === 0.5) {
      return 'card-red-bg';
    } else if (score === 1) {
      return 'card-orange-bg';
    } else if (score === 1.5) {
      return 'card-green-bg';
    } else if (score === 2) {
      return 'card-leech-bg';
    } else if (score === 3) {
      return 'card-reset-bg';
    }
  },
  convertMilliSecondsIntoLegibleString: (milliSecondsIn: number | undefined): string => {
    if (!milliSecondsIn) {
      return '0ms';
    }

    let secsIn = milliSecondsIn / (1000);

    let hours = Math.trunc(secsIn / 3600),
      remainder = secsIn % 3600,
      minutes = Math.trunc(remainder / 60),
      seconds = Math.trunc(remainder % 60);

    return (((hours > 0) ? (hours + 'h ') : '')
      + ((minutes > 0) ? (minutes + 'min ') : '')
      + ((seconds > 0) ? (seconds + 'sec') : ''));
  },
  translateScore: (score: QueueInteractionScore) => {
    if (score === 0.01) {
      return 'Too early';
    } else if (score === 0) {
      return 'Repeat';
    } else if (score === 0.5) {
      return 'Hard';
    } else if (score === 1) {
      return 'Good';
    } else if (score === 1.5) {
      return 'Easy';
    } else if (score === 2) {
      return 'Viewed as leech';
    } else if (score === 3) {
      return 'Reset';
    }
  }
}
