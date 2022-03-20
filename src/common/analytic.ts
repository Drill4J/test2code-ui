/*
 * Copyright 2020 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import ReactGA from "react-ga";
/* eslint-disable no-shadow */

export enum PLUGIN_EVENT_NAMES {
  CLICK_ON_START_NEW_SESSION_BUTTON = 'Click on button "Start New Session"',
  CLICK_ON_START_SESSION_BUTTON = 'Click on button "Start Session"',
  CLICK_ON_SESSION_MANAGEMENT_LINK = 'Click on "Session Management"',
  CLICK_ON_ABORT_ALL_SESSION_BUTTON = 'Click on "Abort all"',
  CLICK_ON_FINISH_ALL_SESSION_BUTTON = 'Click on "Finish all"',
  CLICK_ON_ABORT_SESSION_BUTTON = 'Click on "Abort" for single operation',
  CLICK_ON_FINISH_SESSION_BUTTON = 'Click on "Finish" for single operation',
}

export enum KEY_METRICS_EVENT_NAMES {
  CLICK_ON_ICON = "Click on icon",
  CLICK_ON_GET_SUGGESTED_TESTS_BUTTON = 'Click on button "Get Suggested Tests"',
  CLICK_ON_COPY_TO_CLIPBOARD_BUTTON = 'Click on button  "Copy to Clipboard"',
  CLICK_ON_CONFIGURE_BUTTON = 'Click on button "Configure"',
  CLICK_ON_SAVE_BUTTON_IN_QG_PANEL = 'Click on button "Save" in panel "Quality Gate"',
  CLICK_ON_COPY_ICON_IN_QG_PANEL = 'Click on icon "Copy" in panel "Quality Gate"',
}

export enum NAVIGATION_EVENT_NAMES {
  CLICK_ON_DASHBOARD_ICON = "Click on icon",
}

export enum EVENT_LABELS {
  SESSION_MANAGEMENT = "Panel \"Sessions Management\""
}

interface PluginEventProps {
  name: PLUGIN_EVENT_NAMES,
  label?: EVENT_LABELS | string,
  dimension2?: string,
}

export const sendPluginEvent = ({ name, label, dimension2 }: PluginEventProps) => {
  ReactGA.set({ dimension3: Date.now() });
  dimension2 && ReactGA.set({ dimension2 });
  ReactGA.event({
    action: name,
    category: "Plugin",
    label,
  });
};

export const sendKeyMetricsEvent = (event: KEY_METRICS_EVENT_NAMES, label?: EVENT_LABELS) => {
  ReactGA.set({ dimension3: Date.now() });
  ReactGA.event({
    action: event,
    category: "Key metrics",
    label,
  });
};

export const sendNavigationEvent = (event: NAVIGATION_EVENT_NAMES, label?: EVENT_LABELS) => {
  ReactGA.set({ dimension3: Date.now() });
  ReactGA.event({
    action: event,
    category: "Navigation",
    label,
  });
};
