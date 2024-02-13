import {
  usePlugin,
  renderWidget,
  useTracker,
  useRunAsync,
  Rem,
  useAPIEventListener,
  AppEvents,
} from '@remnote/plugin-sdk';
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
  date: Date;
  list: RepetitionTimeObject[];
  goodCount?: number;
  hardCount?: number;
  easyCount?: number;
}

export const StatisticsWidget = () => {
  const [nextRepetitionTime, setNextRepetitionTime] =
    useState<RepetitionTimeList[]>([]);
  const plugin = usePlugin();
  let allRemsInContext: Rem[] | undefined;
  const [maxCount, setMaxCount] = useState(0);

  useAPIEventListener(AppEvents.QueueCompleteCard, undefined, async () => {
    await reloadData();
  });

  allRemsInContext = useRunAsync(async () => {
    console.log('Updated allRemsInContext');
    return await plugin.rem.getAll();
  }, []);

  useRunAsync(async () => {
      await reloadData();
  }, [allRemsInContext]);

  const reloadData = async () => {
    const objectList: RepetitionTimeObject[] = [];
    for (const rem of allRemsInContext || []) {
      const cards = await rem.getCards();
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
      const index = tempNextRepetitionTime.findIndex((item) => item.date.toDateString() === card.dateTime.toDateString());
      if (index === -1) {
        tempNextRepetitionTime.push({ date: card.dateTime, list: [card] });
      } else {
        tempNextRepetitionTime[index].list.push(card);
      }
    }
    setMaxCount(Math.max(...tempNextRepetitionTime.map(x => x.list.length)));
    setNextRepetitionTime(tempNextRepetitionTime.map(x => {
      return {
        date: x.date,
        list: x.list,
        hardCount: x.list.filter(x => x.score < 1).length,
        goodCount: x.list.filter(x => x.score == 1).length,
        easyCount: x.list.filter(x => x.score == 1.5).length,
      };
    }).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }));
  }

  return (
    <div className="p-2 m-2 rounded-lg rn-clr-background-light rn-clr-content sample-widget">
      <div className="header">
        <h1 className="text-xl">Statistics</h1>
        <button onClick={() => reloadData()}>🔁</button>
      </div>
      {nextRepetitionTime
        ? nextRepetitionTime?.map((list) => {
            return (
              <div className="card-container" key={list.date.toDateString()}>
                <div className="card-date">{list?.date ? moment(list?.date)
                  .format('dd MM-DD') : ''}</div>
                <div className="card" style={{ width: '100%' }}>
                  <div className="indicator" style={{ width: (list?.list?.length / maxCount * 100 + '%') }}>
                    {/*<div className='card-indicator-info'>{list?.list?.length}</div>*/}
                    <div className="card-red-bg"
                         style={{ width: ((list.hardCount ?? 0) / list?.list?.length * 100 + '%') }}>{list.hardCount}</div>
                    <div className="card-orange-bg"
                         style={{ width: ((list.goodCount ?? 0) / list?.list?.length * 100 + '%') }}>{list.goodCount}</div>
                    <div className="card-green-bg"
                         style={{ width: ((list.easyCount ?? 0) / list?.list?.length * 100 + '%') }}>{list.easyCount}</div>
                  </div>
                  <div className="card-sum">
                    Planned cards:&nbsp;
                    <span className="card-length">
                      {list?.list?.length}
                    </span>
                  </div>
                </div>
                <div className="card-popup">

                  <div className="card-info">
                    <span className="card-red">Hard: {list?.hardCount}, </span>
                    <span className="card-orange">Good: {list?.goodCount}, </span>
                    <span className="card-green">Easy: {list?.easyCount}, </span>
                  </div>
                </div>
              </div>);
          },
        )
        : 'No data'}
    </div>
  );
};

renderWidget(StatisticsWidget);
