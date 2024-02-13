import {
  AppEvents,
  renderWidget,
  useAPIEventListener,
  usePlugin,
  useRunAsync,
  WidgetLocation,
} from '@remnote/plugin-sdk';
import { StatisticsWidget } from './statistics_widget';
import '../style.css';
import './history-popup-widget.css';

export const HistoryPopupWidget = () => {
  const plugin = usePlugin();

  let currentCardInfo = useRunAsync(async () => {
    let item =  await plugin.queue.getCurrentCard();
    console.log('currentCardInfo', item);
    return item;

  }, []);

  plugin.event.addListener(AppEvents.QueueLoadCard, undefined, async () => {
    console.log('QueueLoadCard');
  });

  // useAPIEventListener(AppEvents.QueueExit, undefined, async () => {
  //   const { floatingWidgetId } = await plugin.widget.getWidgetContext<WidgetLocation.FloatingWidget>();
  //   await plugin.window.closeFloatingWidget(floatingWidgetId);
  // });

  const getClassByScore = (score: number) => {
    if (score <= 0.01) {
      return "color-again";
    } else if (score === 0.5 || score === 2) {
      return "color-red";
    } else if (score === 1) {
      return "color-orange";
    } else if (score === 1.5) {
      return "color-green";
    }
  }

  const convertMilliSecondsIntoLegibleString = (milliSecondsIn: number | undefined): string => {

    if(!milliSecondsIn) {
      return "0ms";
    }

    let secsIn = milliSecondsIn / 60;
    let milliSecs = milliSecondsIn % 1000;

    let hours = Math.trunc(secsIn / 3600),
      remainder = secsIn % 3600,
      minutes = Math.trunc(remainder / 60),
      seconds = Math.trunc(remainder % 60);


    return ( hours ? (hours + "h ") : ""
      + minutes ?  (minutes + "min ") : ""
      + seconds ? (seconds + "sec") : "" );
  }

  return (
    <>
      {
        <div  className="cursor-pointer grid gap-1 grid-cols-2 history-popup-widget" >
          <div className="flex text-center text-lg items-center pr-2">
            <div>History:</div>
            {currentCardInfo?.repetitionHistory?.map((item, index) => {
              return (
                <div key={index} className="flex score-item items-center">
                  <div className={'score-square ' + getClassByScore(item.score)}> </div>
                  <div className={'score-hover-infos ' + getClassByScore(item.score)}>
                    <div>Response Time: {convertMilliSecondsIntoLegibleString(item.responseTime)}</div>
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
}
renderWidget(HistoryPopupWidget);
