import { declareIndexPlugin, ReactRNPlugin, WidgetLocation } from '@remnote/plugin-sdk';
import '../style.css';
import '../App.css';
import icon from '../../public/statistic.svg';

async function onActivate(plugin: ReactRNPlugin) {
  // Register settings
  // await plugin.settings.registerStringSetting({
  //   id: 'name',
  //   title: 'What is your Name?',
  //   defaultValue: 'Bob',
  // });
  //
  // await plugin.settings.registerBooleanSetting({
  //   id: 'pizza',
  //   title: 'Do you like pizza?',
  //   defaultValue: true,
  // });
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
  await plugin.app.registerWidget('statistics_widget', WidgetLocation.RightSidebar, {
    dimensions: { height: 'auto', width: '100%' },
    widgetTabIcon: 'https://img.icons8.com/external-yogi-aprelliyanto-flat-yogi-aprelliyanto/32/external-statistic-marketing-and-seo-yogi-aprelliyanto-flat-yogi-aprelliyanto.png',
    widgetTabTitle: 'Statistics',
  });
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
