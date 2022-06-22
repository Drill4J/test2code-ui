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
import React from "react";
import { Button, Typography } from "@drill4j/ui-kit";
import { convertToPercentage, getDuration, percentFormatter } from "@drill4j/common-utils";
import { useHistory } from "react-router-dom";
import tw, { styled } from "twin.macro";

import { TestsToRunSummary } from "types/tests-to-run-summary";
import { getModalPath } from "common";
import { PageHeader } from "components";
import { useAdminConnection } from "hooks";
import { AnalyticsInfo } from "types";
import { KEY_METRICS_EVENT_NAMES, sendKeyMetricsEvent } from "common/analytic";
import { SavedTimeSection } from "./saved-time-section";

interface AgentInfo {
  agentType: string;
  buildVersion: string;
  previousBuildVersion: string;
  activeBuildVersion: string;
}
interface Props {
  agentInfo: AgentInfo;
  previousBuildAutoTestsCount: number;
  previousBuildTestsDuration: number;
  summaryTestsToRun: TestsToRunSummary;
}

const SubTitle = styled.div`
  ${tw`grid mr-4 text-14 leading-24 font-bold text-monochrome-default`};
  grid-template-columns: max-content minmax(auto, max-content) max-content minmax(auto, max-content);
`;

export const TestsToRunHeader = ({
  agentInfo,
  previousBuildAutoTestsCount,
  previousBuildTestsDuration,
  summaryTestsToRun,
}: Props) => {
  const { push } = useHistory();
  const {
    stats: {
      duration: currentDuration = 0,
      parentDuration = 0,
      total: totalTestsToRun = 0,
      completed: completedTestsToRun = 0,
    } = {},
    statsByType: {
      AUTO: { total: totalAutoTestsToRun = 0, completed: completedAutoTestsToRun = 0 } = {},
    } = {},
  } = summaryTestsToRun;

  const {
    buildVersion, previousBuildVersion, activeBuildVersion,
  } = agentInfo;
  const totalDuration = getDuration(previousBuildTestsDuration);
  const estimatedTimeSaved = getDuration(previousBuildTestsDuration - parentDuration);
  const totalTimeSaved = getDuration(
    previousBuildTestsDuration - currentDuration > 0
      ? previousBuildTestsDuration - currentDuration
      : 0,
  );
  const { isAnalyticsDisabled } = useAdminConnection<AnalyticsInfo>("/api/analytics/info") || {};

  return (
    <PageHeader tw="justify-between">
      <div>
        <div
          tw="flex gap-x-2 text-24 leading-36 text-monochrome-black"
          data-test="tests-to-run-header:title"
        >
          Recommended Tests
        </div>
      </div>
      <div tw="flex items-center gap-6 mr-10">
        {activeBuildVersion === buildVersion && (
          <Button
            secondary
            size="large"
            onClick={() => {
              push(getModalPath({ name: "getSuggestedTests" }));
              !isAnalyticsDisabled && sendKeyMetricsEvent({
                name: KEY_METRICS_EVENT_NAMES.CLICK_ON_GET_SUGGESTED_TESTS_BUTTON,
              });
            }}
            data-test="tests-to-run-header:get-suggested-tests-button"
            disabled={!totalTestsToRun}
          >
            Get Recommended Tests
          </Button>
        )}
        <SavedTimeSection
          previousBuildAutoTestsCount={previousBuildAutoTestsCount}
          label="total duration"
          message={getTotalDurationTooltipMessage(previousBuildAutoTestsCount)}
        >
          {totalDuration.hours}:{totalDuration.minutes}:{totalDuration.seconds}
        </SavedTimeSection>
        <SavedTimeSection
          previousBuildAutoTestsCount={previousBuildAutoTestsCount}
          label="estimated time saved"
          percentage={
            totalAutoTestsToRun
              ? percentFormatter(
                convertToPercentage(
                  previousBuildTestsDuration - parentDuration,
                  previousBuildTestsDuration,
                ),
              )
              : undefined
          }
          message={
            previousBuildAutoTestsCount
              ? getEstimatedTimeSavedTooltipMessage(totalAutoTestsToRun)
              : null
          }
        >
          {totalAutoTestsToRun
            ? `${estimatedTimeSaved.hours}:${estimatedTimeSaved.minutes}:${estimatedTimeSaved.seconds}`
            : "––:––:––"}
        </SavedTimeSection>
        <SavedTimeSection
          previousBuildAutoTestsCount={previousBuildAutoTestsCount}
          label="total time saved"
          percentage={
            totalAutoTestsToRun && totalAutoTestsToRun === completedAutoTestsToRun
              ? percentFormatter(
                convertToPercentage(
                  previousBuildTestsDuration - currentDuration,
                  previousBuildTestsDuration,
                ),
              )
              : undefined
          }
          message={getTotalSavedTimeTooltipMessage(
            totalAutoTestsToRun - completedAutoTestsToRun,
          )}
        >
          {totalAutoTestsToRun && totalAutoTestsToRun === completedAutoTestsToRun
            ? `${totalTimeSaved.hours}:${totalTimeSaved.minutes}:${totalTimeSaved.seconds}`
            : "––:––:––"}
        </SavedTimeSection>
      </div>
    </PageHeader>
  );
};

function getTotalDurationTooltipMessage(previousBuildAutoTestsCount: number) {
  return previousBuildAutoTestsCount ? (
    <span>Auto Tests total duration in the parent build</span>
  ) : (
    <span>No data about Auto Tests duration in the parent build</span>
  );
}

function getEstimatedTimeSavedTooltipMessage(autoTestsCount: number) {
  return autoTestsCount ? (
    <span>
      Potentially saved time after running only
      <br />
      the suggested Auto Tests
    </span>
  ) : (
    <span>No Auto Tests suggested to run in current build</span>
  );
}

function getTotalSavedTimeTooltipMessage(autoTestsToRunCount: number) {
  return autoTestsToRunCount ? (
    <span>
      Data about saved time will be displayed
      <br />
      when all Auto Tests will have the state done{" "}
    </span>
  ) : null;
}
