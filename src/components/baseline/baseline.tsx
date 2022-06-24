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
import { Link } from "react-router-dom";
import { Icons, Tooltip } from "@drill4j/ui-kit";
import { getModalPath } from "common";
import {
  useActiveBuild, useAgentRouteParams, useTestToCodeData, useTestToCodeRouteParams,
} from "hooks";
import { Baseline as BaselineType } from "types";
import "twin.macro";

export const Baseline = () => {
  const { agentId } = useAgentRouteParams();
  const { buildVersion } = useTestToCodeRouteParams();
  const { buildVersion: activeBuildVersion = "" } = useActiveBuild(agentId) || {};

  const { version: baseline } = useTestToCodeData<BaselineType>("/data/baseline", { buildVersion: activeBuildVersion }) || {};
  const isBaseline = baseline === buildVersion;

  return (
    <Tooltip
      position="bottom-center"
      message={(
        <div tw="flex flex-col gap-[6px] text-[13px]">
          <div tw="font-bold">Baseline build is the reference build.</div>
          <div>
            All methods and key metrics of subsequent <br />
            builds are compared with it.
          </div>
        </div>
      )}
    >
      <Link
        tw="link flex items-center gap-x-2 mt-2 leading-24"
        to={getModalPath({ name: "baselineBuildModal" })}
        data-test="set-build-as-baseline"
      >
        <Icons.Flag />
        <span>{isBaseline ? "Unset" : "Set"} Build as Baseline</span>
      </Link>
    </Tooltip>
  );
};
