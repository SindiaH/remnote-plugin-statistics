import { renderWidget, usePlugin, useRunAsync, WidgetLocation } from '@remnote/plugin-sdk';
import '../../public/App.css';
import './history-popup-widget.css';
import './history-rightside-info.css';
import { SharedService } from '../shared/shared.service';

export const HistoryRightsideInfo = () => {
  const plugin = usePlugin();

  const currentCardInfo = useRunAsync(async() => {
    let context = await plugin.widget.getWidgetContext<WidgetLocation.RightSideOfEditor>()
    let rem = await plugin.rem.findOne(context?.remId);
    let cards = await rem?.getCards();
    return cards ? cards[0] : undefined;
  }, []);

  return (
    <>
      {currentCardInfo?.remId ?
        <div className="cursor-pointer grid gap-1 grid-cols-2 history-rightside-widget">
          <div className="flex text-center text-lg items-center pr-2">
            {currentCardInfo?.repetitionHistory?.map((item, index) => {
              return (
                <div key={index} className="flex score-item items-center">
                  <div className={'score-square ' + SharedService.getClassByScore(item.score)}></div>
                  {/*<div className={'score-hover-infos ' + getClassByScore(item.score)}>*/}
                  {/*  <div>Response Time: {convertMilliSecondsIntoLegibleString(item.responseTime)}</div>*/}
                  {/*  <div>Date: {new Date(item.date).toLocaleString()}</div>*/}
                  {/*</div>*/}
                </div>
              );
            })}
          </div>
        </div>
        : <></>
      }
    </>
  );
};
renderWidget(HistoryRightsideInfo);
