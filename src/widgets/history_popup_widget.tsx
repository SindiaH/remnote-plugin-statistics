import {
  AppEvents,
  renderWidget, useAPIEventListener,
  usePlugin,
  useRunAsync,
} from '@remnote/plugin-sdk';
import '../../public/App.css';
import './history-popup-widget.css';
import { SharedService } from '../shared/shared.service';
import { useState } from 'react';

export const HistoryPopupWidget = () => {
  const plugin = usePlugin();
  const [showStatisticsForCard, setShowStatisticsForCard] = useState(false);

  useAPIEventListener(AppEvents.QueueLoadCard, undefined, async () => {
    currentCardInfo = await plugin.queue.getCurrentCard();
  });

  let currentCardInfo = useRunAsync(async () => {
    setShowStatisticsForCard(await plugin.settings.getSetting("ShowStatisticsForCard"));
    return await plugin.queue.getCurrentCard();
  }, []);

  return (
    <>
      {showStatisticsForCard ?
        <div className="cursor-pointer grid gap-1 grid-cols-2 history-popup-widget">
          <div className="flex text-center text-lg items-center pr-2">
            <div>History:</div>
            {currentCardInfo?.repetitionHistory?.map((item, index) => {
              return (
                <div key={index} className="flex score-item items-center">
                  <div className={'score-square ' + SharedService.getClassByScore(item.score)}></div>
                  <div className={'score-hover-infos ' + SharedService.getClassByScore(item.score)}>
                    <div>Score: <div>{SharedService.translateScore(item.score)}</div></div>
                    <div>Response Time: <div>{SharedService.convertMilliSecondsIntoLegibleString(item.responseTime)}</div></div>
                    <div>Rep date: <div>{new Date(item.date).toLocaleString()}</div></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div> : ''
      }
    </>
  );
};
renderWidget(HistoryPopupWidget);
