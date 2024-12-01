import {
  AppEvents,
  declareIndexPlugin,
  PluginCommandMenuLocation,
  ReactRNPlugin,
  RNPlugin,
  usePlugin,
  WidgetLocation,
} from '@remnote/plugin-sdk';
import '../../public/App.css';
import { Command } from 'concurrently';

async function onActivate(plugin: ReactRNPlugin) {
  console.log('Plugin activated');

  await plugin.app.registerMenuItem({
    id: "reset-all-cards",
    name: "Reset All Cards",
    location: PluginCommandMenuLocation.DocumentMenu,
    // iconUrl: 'https://png.pngtree.com/element_our/20190530/ourmid/pngtree-correct-icon-image_1267804.jpg',
    action: async (document) => {
      console.log('Sending message', document.remId);

      let parentRem = await plugin.rem.findOne(document.remId);
      let rems = await parentRem?.getChildrenRem();

      console.log(rems);
      // let rems = await plugin.rem.findMany(context);
      const nextPracticeTime = (new Date()).getTime();

      rems?.forEach((rem) => {
        rem.getType().then((type) => {
          console.log('type', type);
        });
        rem?.getCards().then((cards) => {
          cards?.forEach((card) => {
            console.log('Remove card');

            // card.update({h: [], n: nextPracticeTime, a: nextPracticeTime, t: 0, l: undefined});
            console.log(card._id, card.type);
            // card.updateCardRepetitionStatus();
          });
        });


      })
    },
  });

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

  async function resetFocusedCard() {



    // const rId = rem.parent;
    // const nextPracticeTime = (new Date()).getTime();
    // const cards = window.CardCollection(window.currentKnowledgeBaseId());
    // console.log(rId);
    // const card = cards.findOne({remId: rId});
    // console.log("Card:", cards, card, rId);
    // card.update({h: [], n: nextPracticeTime, a: nextPracticeTime, t: 0, l: undefined});
    // console.info("Reset Schedule of rem", rem.key, "with id", rId);
  }

}

async function onDeactivate(_: ReactRNPlugin) {
}

declareIndexPlugin(onActivate, onDeactivate);
