import { AppEvents, declareIndexPlugin, ReactRNPlugin, RNPlugin, WidgetLocation } from '@remnote/plugin-sdk';
import '../../public/App.css';

async function onActivate(plugin: ReactRNPlugin) {
  await plugin.settings.registerBooleanSetting({
    id: 'ShowStatisticsForCard',
    title: 'Show the statistics indicators for a card while learning',
    defaultValue: true,
  });
  await plugin.settings.registerBooleanSetting({
    id: 'ShowStatisticsForRem',
    title: 'Show the statistics indicators for a rem next to it while in the editor view, if the rem has cards',
    defaultValue: true,
  });

  await plugin.app.registerWidget('statistics_widget', WidgetLocation.RightSidebar, {
    dimensions: { height: 'auto', width: '100%' },
    widgetTabIcon: 'https://img.icons8.com/external-yogi-aprelliyanto-flat-yogi-aprelliyanto/32/external-statistic-marketing-and-seo-yogi-aprelliyanto-flat-yogi-aprelliyanto.png',
    widgetTabTitle: 'Statistics',
  });
  await plugin.app.registerWidget(
    'history_popup_widget',
    WidgetLocation.FlashcardUnder,
    {
      dimensions: {
        width: '100%',
        height: 220,
      },
    },
  );

  const showStatisticsForCard = Boolean(
    await plugin.settings.getSetting('ShowStatisticsForRem'),
  );

  if (showStatisticsForCard) {
    await plugin.app.registerWidget(
      'history_rightside_info',
      WidgetLocation.RightSideOfEditor,
      {
        dimensions: {
          width: '100%',
          height: 40,
        },
      },
    );
  }

}

async function onDeactivate(_: ReactRNPlugin) {
}

declareIndexPlugin(onActivate, onDeactivate);
