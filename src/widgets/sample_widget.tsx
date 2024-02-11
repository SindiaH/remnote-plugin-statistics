import { usePlugin, renderWidget, useTracker, useRunAsync, Rem } from '@remnote/plugin-sdk';
import { Card } from '@remnote/plugin-sdk/dist/name_spaces/card';
import { useState } from 'react';
import moment from 'moment';
import { QueueInteractionScore } from '@remnote/plugin-sdk/dist/interfaces';
import '../style.css';
import '../App.css';

type RepetitionTimeObject = {
  id: string;
  dateTime: Date;
  score: QueueInteractionScore;
}

type RepetitionTimeList = {
  date: string;
  list: RepetitionTimeObject[]
}

export const SampleWidget = () => {
  const [nextRepetitionTime, setNextRepetitionTime] =
    useState<RepetitionTimeList[]>([]);
  const plugin = usePlugin();

  let name = useTracker(() => plugin.settings.getSetting<string>('name'));
  let likesPizza = useTracker(() => plugin.settings.getSetting<boolean>('pizza'));
  let favoriteNumber = useTracker(() => plugin.settings.getSetting<number>('favorite-number'));
  var allCardsInContext;
  let allRemsInContext: Rem[] | undefined;
  /**
   * get all Cards from allRemsInContext, resolve the promises and store them in allCards
   */
  // const contextRem = useRunAsync(async () => {
  //   return await plugin.rem.getAll();
  // }, []);

  allRemsInContext = useRunAsync(async () => {
    return await plugin.rem.getAll();
  }, []);

  useRunAsync(async () => {
    const result: Card[] = [];
    const objectList: RepetitionTimeObject[] = [];
    for (const rem of allRemsInContext || []) {
      const cards = await rem.getCards();
      result.push(...cards);
      for (const card of cards) {
        if (card.nextRepetitionTime) {
          const item: RepetitionTimeObject = {
            dateTime: new Date(card.nextRepetitionTime),
            id: card.remId,
            score: card.repetitionHistory?.at(-1)?.score ?? 0,
          };
          objectList.push(item);
        }
      }
    }
    const tempNextRepetitionTime: RepetitionTimeList[] = [];
    for (const card of objectList) {
      const date = card.dateTime ? moment(card.dateTime).format('yyyy-MM-DD') : 'empty';
      const index = tempNextRepetitionTime.findIndex((item) => item.date === date);
      if (index === -1) {
        tempNextRepetitionTime.push({ date: date, list: [card] });
      } else {
        tempNextRepetitionTime[index].list.push(card);
      }
    }
    setNextRepetitionTime(tempNextRepetitionTime.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }));
  }, [allRemsInContext]);

  return (
    <div className="p-2 m-2 rounded-lg rn-clr-background-light rn-clr-content sample-widget">
      <h1 className="text-xl">Statistics</h1>
      {nextRepetitionTime
        ? nextRepetitionTime?.map((list) => {
            return (<div key={list.date}>
              <div className="card-date">{list?.date ?? ''}</div>
              <div className="card-sum">Planned cards: <span className="card-length">{list?.list?.length}</span></div>
              <div className="card-info">
                <span className="card-red">Hard: {list?.list.filter(x => x.score == 0.5).length}, </span>
                <span className="card-orange">Good: {list?.list.filter(x => x.score == 1).length}, </span>
                <span className="card-green">Easy: {list?.list.filter(x => x.score == 1.5).length}, </span>
                <span>Other: {list?.list.filter(x => x.score == 0 || x.score == 0.01).length}</span>
              </div>
            </div>);
          },
        )
        : 'No data'}
    </div>
  );
};

renderWidget(SampleWidget);
