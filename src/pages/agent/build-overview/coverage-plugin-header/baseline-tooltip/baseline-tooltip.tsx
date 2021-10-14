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
  Link,
} from "react-router-dom";
import { Icons, Tooltip } from "@drill4j/ui-kit";
import tw, { styled } from "twin.macro";

import {
  useAgent, useTestToCodeParams, useAgentParams, useBuildVersion,
} from "hooks";
import { Baseline } from "types/baseline";
import { ParentBuild } from "types/parent-build";
import { getModalPath } from "common";

export const BaselineTooltip = () => {
  const { agentId = "" } = useAgentParams();
  const { buildVersion } = useTestToCodeParams();

  const { buildVersion: activeBuildVersion = "" } = useAgent(agentId) || {};
  const { version: baseline } = useBuildVersion<Baseline>("/data/baseline", { buildVersion: activeBuildVersion }) || {};
  const isBaseline = baseline === buildVersion;
  const isActiveBuild = activeBuildVersion === buildVersion;
  const { version: previousBuildVersion = "" } = useBuildVersion<ParentBuild>("/data/parent") || {};
  const { Flag, disabled, info } = showBaseline(isBaseline, isActiveBuild, previousBuildVersion);

  return (
    <Tooltip message={<div tw="text-center">{info}</div>} position="top-center">
      <Link to={getModalPath({ name: "baselineBuildModal" })} data-test="mark-as-baseline-flag">
        <FlagWrapper
          active={Boolean(isActiveBuild && previousBuildVersion)}
          disabled={disabled}
        >
          <Flag />
        </FlagWrapper>
      </Link>
    </Tooltip>
  );
};

const FlagWrapper = styled.div(({ active, disabled }: { active?: boolean; disabled?: boolean }) => [
  tw`ml-2 text-monochrome-default`,
  active ? tw`text-blue-default cursor-pointer` : tw`pointer-events-none`,
  disabled && tw`pointer-events-none`,
]);

function showBaseline(isBaseline: boolean, isActiveBuild: boolean, previousBuildVersion: string) {
  if (!previousBuildVersion && isBaseline) {
    return ({
      disabled: true,
      info: (
        <>
          The initial build is set as baseline by default. All methods <br />
          and key metrics of subsequent builds are compared with it.
        </>
      ),
      Flag: Icons.Flag,
    });
  }
  if (isActiveBuild && !isBaseline) {
    return ({
      disabled: false,
      info: "Set as Baseline",
      Flag: Icons.Flag,
    });
  }
  if (isActiveBuild && isBaseline) {
    return ({
      disabled: false,
      info: "Unset as Baseline",
      Flag: Icons.FilledFlag,
    });
  }
  if (!isActiveBuild && isBaseline) {
    return ({
      disabled: true,
      info: (
        <>
          This build is set as baseline. <br />
          All subsequent builds are compared with it.
        </>
      ),
      Flag: Icons.Flag,
    });
  }

  return {
    disabled: true,
    info: null,
    Flag: () => null,
  };
}
