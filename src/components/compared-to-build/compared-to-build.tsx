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
import { Typography } from "@drill4j/ui-kit";
import { Link } from "react-router-dom";
import React from "react";
import "twin.macro";
import { useNavigation } from "hooks";

interface Props {
  parentBuildVersion: string;
}

export const ComparedToBuild = ({ parentBuildVersion }: Props) => {
  const { getPagePath } = useNavigation();

  return (
    <div tw="flex items-center gap-x-1 leading-16 text-monochrome-default">
      <span>Compared to build:</span>
      <div tw="max-w-[350px]">
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
