import {
  usePlugin,
  renderWidget,
  useRunAsync,
  Rem,
  useAPIEventListener,
  AppEvents, Card,
} from '@remnote/plugin-sdk';
import { useState } from 'react';
import moment from 'moment';
import '../../public/App.css';
import { RepetitionTimeList, RepetitionTimeObject } from '../shared/interfaces';
import { SharedService } from '../shared/shared.service';


export const StatisticsWidget = () => {
  const [nextRepetitionTime, setNextRepetitionTime] =
    useState<RepetitionTimeList[]>([]);
  const plugin = usePlugin();
  let allRemsInContext: Rem[] | undefined;
  let allRepetitionTimeObjects: RepetitionTimeObject[] = [];
  const [maxCount, setMaxCount] = useState(0);
  const [currentCard, setCurrentCard] = useState<Card | undefined>(undefined);
  const [isPlannedForToday, setIsPlannedForToday] = useState<boolean | undefined>(false);

  useAPIEventListener(AppEvents.QueueCompleteCard, undefined, async () => {
    await reloadData();
  });
  useAPIEventListener(AppEvents.QueueExit, undefined, async () => {
    await reloadData();
    setCurrentCard(undefined);
  })

  useAPIEventListener(AppEvents.QueueLoadCard, undefined, async () => {
    await reloadCurrentCard();
  })

  allRemsInContext = useRunAsync(async () => {
    const list = await plugin.rem.getAll();
    return list.filter(async (rem) => {
      if (await rem.getEnablePractice()) {
        return rem;
      }
    });
  }, []);

  useRunAsync(async () => {
    await reloadData();
    await reloadCurrentCard();
  }, [allRemsInContext]);

  const reloadCurrentCard = async () => {
    const currentCard = await plugin.queue.getCurrentCard();
    setIsPlannedForToday(false);
    if(currentCard) {
      allRepetitionTimeObjects.forEach((item) => {
        if (moment(item.dateTime).format('dd MM-DD') == moment(new Date()).format('dd MM-DD')
          && item.id === currentCard?.remId) {
          setIsPlannedForToday(true);
        }
      });
    }
    setCurrentCard(currentCard);
  }

  const reloadData = async () => {

    for (const rem of allRemsInContext || []) {
      const cards = await rem.getCards();
      for (const card of cards) {
        if (card.nextRepetitionTime && card.repetitionHistory) {
          const item: RepetitionTimeObject = {
            dateTime: moment.utc(card.nextRepetitionTime).local(true).toDate(),
            id: card.remId,
            score: card.repetitionHistory?.at(-1)?.score ?? 0,
          };
          allRepetitionTimeObjects.push(item);

        }
      }
    }
    const tempNextRepetitionTime: RepetitionTimeList[] = [];
    for (const card of allRepetitionTimeObjects) {
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
  };

  return (
    <div className="p-2 m-2 rounded-lg rn-clr-background-light rn-clr-content sample-widget">
      <div className="header">
        <h1 className="text-xl">Statistics</h1>
        <button onClick={() => reloadData()}>🔁</button>
      </div>
      {currentCard?.remId ?
        <div className="current-card">
          <h1>Current Card</h1>
          <div className="last-score">Last score: <div
            className={'score-square ' + SharedService.getClassByScore(currentCard.repetitionHistory?.at(-1)?.score ?? 0)}>

          </div>
          </div>
          <div>Scheduled: <div>{moment(currentCard.repetitionHistory?.at(-1)?.scheduled).format('dd, DD.MM.YYYY HH:mm')}</div>
          </div>
          <div>Last rep: <div>{moment(currentCard.repetitionHistory?.at(-1)?.date).format('dd, DD.MM.YYYY HH:mm')}</div>
          </div>
          <div className="current-card-date">Next
            rep: <div>{moment(currentCard?.nextRepetitionTime).format('dd, DD.MM.YYYY HH:mm')}</div></div>
          <div>Planned for today: <div>{isPlannedForToday === true ? 'Yes' : 'No'}</div></div>
        </div>
        : ''}
      {nextRepetitionTime
        ? nextRepetitionTime?.map((list) => {
            return (
              <div className="card-container" key={list.date.toDateString()}>
                <div className="card-date">{list?.date ? moment(list?.date)
                  .format('dd MM-DD') : ''}</div>
                <div className="card" style={{ width: '100%' }}>
                  <div className="indicator" style={{ width: (list?.list?.length / maxCount * 100 + '%') }}>
                    {list.hardCount && list.hardCount > 0 ?
                      <div className="card-red-bg"
                           style={{ width: ((list.hardCount ?? 0) / list?.list?.length * 100 + '%') }}>{list.hardCount}</div>
                    : ''}
                    {
                      list.goodCount && list.goodCount > 0 ?
                        <div className="card-orange-bg"
                             style={{ width: ((list.goodCount ?? 0) / list?.list?.length * 100 + '%') }}>{list.goodCount}</div>
                        : ''
                    }
                    {
                      list.easyCount && list.easyCount > 0 ?
                        <div className="card-green-bg"
                             style={{ width: ((list.easyCount ?? 0) / list?.list?.length * 100 + '%') }}>{list.easyCount}</div>
                        : ''
                    }
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
