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
import { Icons, Typography } from "@drill4j/ui-kit";
import { useFilteredData, useNavigation } from "hooks";
import { ParentBuild } from "types";
import "twin.macro";

export const Baseline = () => {
  const { getPagePath, getModalPath } = useNavigation();
  const { version: previousBuildVersion = "" } = useFilteredData<ParentBuild>("/data/parent") || {};

  return (
    <div tw="flex gap-x-6 text-12 font-bold">
      <Link
        tw="link flex items-center gap-x-2 leading-24"
        to={getModalPath({ name: "baselineBuildModal" })}
        data-test="set-build-as-baseline"
      >
        <Icons.Flag />
        <span>Set Build as Baseline</span>
      </Link>
      <div tw="flex items-center gap-x-1 leading-16 text-monochrome-default">
        Compared to build:
        <Typography.MiddleEllipsis>
          <Link
            to={getPagePath({ name: "overview", params: { buildVersion: previousBuildVersion }, queryParams: { activeTab: "methods" } })}
            title={previousBuildVersion}
            tw="link whitespace-nowrap"
            data-test="parent-build-version"
          >
            {previousBuildVersion}
          </Link>
        </Typography.MiddleEllipsis>
      </div>
    </div>
  );
};
