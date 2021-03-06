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
import {
  Button, Icons, Tooltip, Typography,
} from "@drill4j/ui-kit";
import { Link, useHistory } from "react-router-dom";
import tw, { styled } from "twin.macro";

import { ConditionSetting, QualityGate, QualityGateStatus } from "types/quality-gate-type";
import { BUILD_STATUS } from "common/constants";
import {
  useActiveBuild, useAgentRouteParams, useBuildVersion, useNavigation, usePreviousBuildCoverage,
  useTestToCodeRouteParams, useAdminConnection,
} from "hooks";
import { ParentBuild } from "types/parent-build";
import { Metrics } from "types/metrics";
import { getModalPath } from "common";
import { AnalyticsInfo, Risk } from "types";
import { KEY_METRICS_EVENT_NAMES, sendKeyMetricsEvent } from "common/analytic";
import { PageHeader } from "components";
import { ActionSection } from "./action-section";
import { BaselineTooltip } from "./baseline-tooltip";

export const CoveragePluginHeader = () => {
  const { agentId = "" } = useAgentRouteParams();
  const { buildVersion } = useTestToCodeRouteParams();
  const { getPagePath } = useNavigation();
  const { buildVersion: activeBuildVersion = "", buildStatus } = useActiveBuild(agentId) || {};
  const { risks: risksCount = 0, tests: testToRunCount = 0 } = useBuildVersion<Metrics>("/data/stats") || {};
  const initialRisks = useBuildVersion<Risk[]>("/build/risks") || [];
  const { version: previousBuildVersion = "" } = useBuildVersion<ParentBuild>("/data/parent") || {};
  const conditionSettings = useBuildVersion<ConditionSetting[]>("/data/quality-gate-settings") || [];
  const { status = "FAILED" } = useBuildVersion<QualityGate>("/data/quality-gate") || {};
  const { byTestType: previousBuildTests = [] } = usePreviousBuildCoverage(previousBuildVersion) || {};
  const configured = conditionSettings.some(({ enabled }) => enabled);
  const StatusIcon = Icons[status];
  const { push } = useHistory();
  const { isAnalyticsDisabled } = useAdminConnection<AnalyticsInfo>("/api/analytics/info") || {};

  return (
    <ContentWrapper>
      <div tw="col-span-4 lg:col-span-1 mr-6 font-light text-24 leading-32" data-test="coverage-plugin-header:plugin-name">Test2Code</div>
      <BaselinePanel>
        <div>Current build:</div>
        <div className="flex items-center text-monochrome-black" title={buildVersion}>
          <Typography.MiddleEllipsis>
            <span tw="whitespace-nowrap" data-test="header:current-build-version">{buildVersion}</span>
          </Typography.MiddleEllipsis>
          <BaselineTooltip />
        </div>
        <div>Parent build:</div>
        {previousBuildVersion
          ? (
            <div
              className="flex link"
              onClick={() => push(getPagePath({
                name: "overview",
                params: { buildVersion: previousBuildVersion },
                queryParams: { activeTab: "methods" },
              }))}
              title={previousBuildVersion}
            >
              <Typography.MiddleEllipsis>
                <span tw="whitespace-nowrap" data-test="header:parent-build-version">{previousBuildVersion}</span>
              </Typography.MiddleEllipsis>
            </div>
          ) : <span>&ndash;</span>}
      </BaselinePanel>
      {activeBuildVersion === buildVersion && buildStatus === BUILD_STATUS.ONLINE && (
        <div tw="pl-4 pr-4 lg:mr-10 border-l border-monochrome-medium-tint text-monochrome-default">
          <div className="flex items-center w-full">
            <div tw="mr-2 text-12 leading-16 font-bold" data-test="coverage-plugin-header:quality-gate-label">
              QUALITY GATE
            </div>
            {!configured && (
              <Tooltip
                message={(
                  <>
                    <div tw="text-center">Configure quality gate conditions to</div>
                    <div>define whether your build passes or not.</div>
                  </>
                )}
              >
                <Icons.Info tw="flex text-monochrome-default" />
              </Tooltip>
            )}
          </div>
          {!configured ? (
            <StatusWrapper
              to={getModalPath({ name: "qualityGate" })}
              data-test="coverage-plugin-header:configure-button"
            >
              <Button
                primary
                size="small"
                onClick={() => {
                  !isAnalyticsDisabled && sendKeyMetricsEvent({
                    name: KEY_METRICS_EVENT_NAMES.CLICK_ON_CONFIGURE_BUTTON,
                  });
                }}
              >
                Configure
              </Button>
            </StatusWrapper>
          ) : (
            <StatusWrapper
              to={getModalPath({ name: "qualityGate" })}
              status={status}
              onClick={() => {
                !isAnalyticsDisabled && sendKeyMetricsEvent({
                  name: KEY_METRICS_EVENT_NAMES.CLICK_ON_ICON,
                  label: "Quality Gates",
                });
              }}
            >
              <StatusIcon />
              <StatusTitle data-test="coverage-plugin-header:quality-gate-status">
                {status}
              </StatusTitle>
            </StatusWrapper>
          )}
        </div>
      )}
      <ActionSection
        label="risks"
        previousBuild={{ previousBuildVersion, previousBuildTests }}
      >
        {initialRisks.length
          ? (
            <Count
              to={getPagePath({ name: "risks", params: { buildVersion } })}
              className="flex items-center w-full"
              data-test="action-section:count:risks"
              onClick={() => {
                !isAnalyticsDisabled && sendKeyMetricsEvent({
                  name: KEY_METRICS_EVENT_NAMES.CLICK_ON_ICON,
                  label: "Risks",
                });
              }}
            >
              {risksCount}
              <Icons.Expander tw="ml-1 text-blue-default" width={8} height={8} />
            </Count>
          ) : <span data-test="action-section:no-value:risks">&ndash;</span>}
      </ActionSection>
      <ActionSection
        label="tests to run"
        previousBuild={{ previousBuildVersion, previousBuildTests }}
      >
        {previousBuildTests.length > 0 ? (
          <Count
            to={getPagePath({ name: "testsToRun", params: { buildVersion } })}
            className="flex items-center w-full"
            data-test="action-section:count:tests-to-run"
            onClick={() => {
              !isAnalyticsDisabled && sendKeyMetricsEvent({
                name: KEY_METRICS_EVENT_NAMES.CLICK_ON_ICON,
                label: "Test to Run",
              });
            }}
          >
            {testToRunCount}
            <Icons.Expander tw="ml-1 text-blue-default" width={8} height={8} />
          </Count>
        ) : (
          <div
            tw="text-20 leading-32 text-monochrome-black"
            data-test="action-section:no-value:tests-to-run"
          >
            &ndash;
          </div>
        )}
      </ActionSection>
    </ContentWrapper>
  );
};

const ContentWrapper = styled(PageHeader)`
  ${tw`grid grid-rows-2 lg:grid-rows-1 grid-cols-4 gap-2 w-full`}
  @media screen and (min-width: 1024px) {
    grid-template-columns: max-content auto max-content max-content max-content !important;
  }
`;
const BaselinePanel = styled.div`
  ${tw`grid gap-x-2 lg:pl-6`}
  ${tw`lg:border-l border-monochrome-medium-tint font-bold text-12 leading-24 text-monochrome-default`}
  grid-template-columns: max-content minmax(64px, 60%);
  grid-template-rows: repeat(2, 1fr);
`;
const StatusWrapper = styled(Link)(({ status }: { status?: QualityGateStatus }) => [
  tw`flex items-center h-8 text-14`,
  status === "PASSED" && tw`text-green-default cursor-pointer`,
  status === "FAILED" && tw`text-red-default cursor-pointer`,
]);
const StatusTitle = styled.div`
  ${tw`ml-2 font-bold lowercase`}
  &::first-letter {
    ${tw`uppercase`}
  }
`;
const Count = styled(Link)`
  ${tw`flex items-center w-full text-20 leading-32 cursor-pointer`}
  ${tw`text-monochrome-black hover:text-blue-medium-tint active:text-blue-shade`}
`;
