import {
  renderWidget,
  usePlugin,
  useRunAsync,
} from '@remnote/plugin-sdk';
import '../style.css';
import '../../public/App.css';
import './history-popup-widget.css';
import { SharedService } from '../shared/shared.service';

export const HistoryPopupWidget = () => {
  const plugin = usePlugin();

  let currentCardInfo = useRunAsync(async () => {
    return await plugin.queue.getCurrentCard();
  }, []);

  return (
    <>
      {
        <div className="cursor-pointer grid gap-1 grid-cols-2 history-popup-widget">
          <div className="flex text-center text-lg items-center pr-2">
            <div>History:</div>
            {currentCardInfo?.repetitionHistory?.map((item, index) => {
              return (
                <div key={index} className="flex score-item items-center">
                  <div className={'score-square ' + SharedService.getClassByScore(item.score)}></div>
                  <div className={'score-hover-infos ' + SharedService.getClassByScore(item.score)}>
                    <div>Response Time: {SharedService.convertMilliSecondsIntoLegibleString(item.responseTime)}</div>
                    <div>Date: {new Date(item.date).toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      }
    </>
  );
};
renderWidget(HistoryPopupWidget);
