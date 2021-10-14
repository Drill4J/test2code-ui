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
import React, { useState, useEffect } from "react";
import { Icons } from "@drill4j/ui-kit";
import tw from "twin.macro";

import { copyToClipboard, percentFormatter } from "@drill4j/common-utils";
import { ConditionSettingByType, Results } from "types/quality-gate-type";
import { useAgentParams, useBuildVersion } from "hooks";
import { Metrics } from "types/metrics";
import { QualityGateConfigurationUrl } from "./quality-gate-configuration-url";
import { getQualityGateConfigurationUrl } from "./get-quality-gate-configuration-url";
import { Condition } from "./condition";

interface Props {
  conditionSettingByType: ConditionSettingByType;
  results: Results;
}

export const QualityGateStatus = ({ conditionSettingByType, results }: Props) => {
  const [copied, setCopied] = useState(false);
  const { pluginId = "", agentId = "" } = useAgentParams();
  const { coverage = 0, risks: risksCount = 0, tests: testToRunCount = 0 } = useBuildVersion<Metrics>("/data/stats") || {};

  useEffect(() => {
    const timeout = setTimeout(() => setCopied(false), 5000);
    copied && timeout;
    return () => clearTimeout(timeout);
  }, [copied]);

  return (
    <>
      <div tw="p-6 space-y-6">
        {conditionSettingByType.coverage?.enabled && (
          <Condition
            passed={Boolean(results.coverage)}
            type="coverage"
            thresholdValue={conditionSettingByType.coverage.condition.value}
          >
            <div tw="block text-monochrome-default text-10 leading-16" data-test="quality-gate-status:condition-status:coverage">
              {results.coverage ? "Passed" : "Failed"}. Your coverage is&nbsp;
              <span tw="font-bold" data-test="quality-gate-status:condition-status:coverage">
                {percentFormatter(coverage || 0)}
              </span>
              %
            </div>
          </Condition>
        )}
        {conditionSettingByType.risks?.enabled && (
          <Condition
            passed={Boolean(results.risks)}
            type="risks"
            thresholdValue={conditionSettingByType.risks.condition.value}
          >
            <div tw="block text-monochrome-default text-10 leading-16" data-test="quality-gate-status:condition-status:risks">
              {results.risks ? "Passed" : "Failed"}. You have&nbsp;
              <span tw="font-bold" data-test="quality-gate-status:condition-status:risks">{risksCount}</span>
              &nbsp;not covered risk methods
            </div>
          </Condition>
        )}
        {conditionSettingByType.tests?.enabled && (
          <Condition
            passed={Boolean(results.tests)}
            type="testsToRun"
            thresholdValue={conditionSettingByType.tests.condition.value}
          >
            <div tw="block text-monochrome-default text-10 leading-16" data-test="quality-gate-status:condition-status:tests">
              {results.tests ? "Passed" : "Failed"}. You have&nbsp;
              <span tw="font-bold" data-test="quality-gate-status:condition-status:tests">{testToRunCount}</span>
                &nbsp;not executed tests to run
            </div>
          </Condition>
        )}
      </div>
      <div
        css={[
          tw`relative flex flex-col gap-y-4 pt-2 pb-6 pr-6 pl-6`,
          tw`text-14 leading-20 bg-monochrome-light-tint break-words text-monochrome-default`,
        ]}
        data-test="quality-gate-status:info-panel"
      >
        <span>
          This is Quality Gate configuration for this build.
          Use this Curl in your command line to get JSON:
        </span>
        <QualityGateConfigurationUrl agentId={agentId} pluginId={pluginId} />
        <div tw="absolute bottom-6 right-6 text-blue-default cursor-pointer active:text-blue-shade">
          {copied
            ? (
              <div className="flex items-center gap-x-1 text-10 leading-16 primary-blue-default">
                <span tw="text-monochrome-black">Copied to clipboard.</span>
                <Icons.Check height={10} width={14} viewBox="0 0 14 10" />
              </div>
            )
            : (
              <Icons.Copy
                data-test="quality-gate-status:copy-icon"
                onClick={() => { copyToClipboard(getQualityGateConfigurationUrl(agentId, pluginId)); setCopied(true); }}
              />
            )}
        </div>
      </div>
    </>
  );
};
