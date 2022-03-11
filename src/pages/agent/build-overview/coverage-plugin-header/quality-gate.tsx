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
import { Button, Icons, Tooltip } from "@drill4j/ui-kit";
import React from "react";
import { getModalPath } from "common";
import { Link } from "react-router-dom";
import tw, { styled } from "twin.macro";
import { ConditionSetting, QualityGateStatus, QualityGate as QualityGateType } from "types";
import { useBuildVersion } from "hooks";

export const QualityGate = () => {
  const { status = "FAILED" } = useBuildVersion<QualityGateType>("/data/quality-gate") || {};
  const conditionSettings = useBuildVersion<ConditionSetting[]>("/data/quality-gate-settings") || [];
  const configured = conditionSettings.some(({ enabled }) => enabled);
  const StatusIcon = Icons[status];

  return (
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
          >
            Configure
          </Button>
        </StatusWrapper>
      ) : (
        <StatusWrapper
          to={getModalPath({ name: "qualityGate" })}
          status={status}
        >
          <StatusIcon />
          <StatusTitle data-test="coverage-plugin-header:quality-gate-status">
            {status}
          </StatusTitle>
        </StatusWrapper>
      )}
    </div>
  );
};

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
