import { AppEvents, declareIndexPlugin, ReactRNPlugin, RNPlugin, WidgetLocation } from '@remnote/plugin-sdk';
import '../style.css';
import '../App.css';
import icon from '../../public/statistic.svg';

async function showPopup(
  plugin: RNPlugin,
  position?: { top?: number; bottom?: number; left?: number; right?: number },
  classContainer?: string
) {
  console.log('showPopup', 'history_popup_widget');
  //   const { floatingWidgetId } = await plugin.widget.getWidgetContext<WidgetLocation.FloatingWidget>();
  //   await plugin.window.closeFloatingWidget(floatingWidgetId);
  await plugin.window.openWidgetInPane(
    "history_popup_widget",
    position || { top: 0, bottom: 0, left: 0, right: 0 }
  );
}


async function onActivate(plugin: ReactRNPlugin) {
  // Register settings
  // await plugin.settings.registerStringSetting({
  //   id: 'name',
  //   title: 'What is your Name?',
  //   defaultValue: 'Bob',
  // });
  //
  await plugin.settings.registerBooleanSetting({
    id: 'ShowStatisticsForCard',
    title: 'Show the statistics indicators for a card while learning',
    defaultValue: true,
  });
  //
  // await plugin.settings.registerNumberSetting({
  //   id: 'favorite-number',
  //   title: 'What is your favorite number?',
  //   defaultValue: 42,
  // });

  // A command that inserts text into the editor if focused.
  // await plugin.app.registerCommand({
  //   id: 'editor-command',
  //   name: 'Editor Command',
  //   action: async () => {
  //     plugin.editor.insertPlainText('Hello World!');
  //   },
  // });

  // Register a sidebar widget.
  // await plugin.app.registerWidget('statistics_widget', WidgetLocation.LeftSidebar, {
  //   dimensions: { height: 'auto', width: '100%' },
  //   widgetTabIcon: 'https://img.icons8.com/external-yogi-aprelliyanto-flat-yogi-aprelliyanto/32/external-statistic-marketing-and-seo-yogi-aprelliyanto-flat-yogi-aprelliyanto.png',
  //   widgetTabTitle: 'Statistics',
  // });
  // When the user completes a card, we check if they
  // have seen the number of cards specified in the card
  // interval setting. If so we show the popup.
  plugin.event.addListener(AppEvents.QueueLoadCard, undefined, async () => {
    const showStatisticsForCard = Boolean(
      await plugin.settings.getSetting("ShowStatisticsForCard")
    );
    console.log('showStatisticsForCard', showStatisticsForCard);
    if (showStatisticsForCard) {
      // Opens a floating widget popup 180px above the show answer buttons.
      // The "rn-queue..." string is a classname representing the container
      // around the show answer buttons.
      // We use a small setTimeout delay to make sure the queue and show answer
      // button have finished rendering before trying to show the popup.
      setTimeout(() => {
        showPopup(plugin, { top: -144, left: 20 }, "spaced-repetition__bottom");
      }, 125);
    }
  });

  await plugin.app.registerWidget('statistics_widget', WidgetLocation.RightSidebar, {
    dimensions: { height: 'auto', width: '100%' },
    widgetTabIcon: 'https://img.icons8.com/external-yogi-aprelliyanto-flat-yogi-aprelliyanto/32/external-statistic-marketing-and-seo-yogi-aprelliyanto-flat-yogi-aprelliyanto.png',
    widgetTabTitle: 'Statistics',
  });
  // Register the puppy popup widget component.
  await plugin.app.registerWidget(
    "history_popup_widget",
    WidgetLocation.FlashcardUnder,
    {
      dimensions: {
        width: '100%',
        height: 180,
      },
    }
  );
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
