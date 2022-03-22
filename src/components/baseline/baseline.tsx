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
import { Icons, Tooltip, Typography } from "@drill4j/ui-kit";
import {
  useActiveBuild, useAgentRouteParams, useNavigation, useTestToCodeData, useTestToCodeRouteParams,
} from "hooks";
import { ParentBuild, Baseline as BaselineType } from "types";
import "twin.macro";

export const Baseline = () => {
  const { getPagePath, getModalPath } = useNavigation();
  const { version: parentBuildVersion = "" } = useTestToCodeData<ParentBuild>("/data/parent") || {};
  const { agentId } = useAgentRouteParams();
  const { buildVersion } = useTestToCodeRouteParams();
  const { buildVersion: activeBuildVersion = "" } = useActiveBuild(agentId) || {};

  const { version: baseline } = useTestToCodeData<BaselineType>("/data/baseline", { buildVersion: activeBuildVersion }) || {};
  const isBaseline = baseline === buildVersion;

  return (
    <div tw="flex gap-x-6 text-12 font-bold">
      <Tooltip
        position="bottom-center"
        message={(
          <>
            <div tw="font-bold">Baseline build is the reference build.</div>
            <div>
              All methods and key metrics of subsequent <br />
              builds are compared with it.
            </div>
          </>
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
      <div tw="flex items-center gap-x-1 leading-16 text-monochrome-default">
        Compared to build:
        <Typography.MiddleEllipsis>
          <Link
            to={getPagePath({ name: "overview", params: { buildVersion: parentBuildVersion }, queryParams: { activeTab: "methods" } })}
            title={parentBuildVersion}
            tw="link whitespace-nowrap"
            data-test="parent-build-version"
          >
            {parentBuildVersion}
          </Link>
        </Typography.MiddleEllipsis>
      </div>
    </div>
  );
};
