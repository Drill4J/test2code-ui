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
import React, { useMemo } from "react";
import {
  Link, Switch, Route,
} from "react-router-dom";
import tw, { styled } from "twin.macro";

import {
  useActiveBuild, useAgentRouteParams, useNavigation, useTestToCodeData, useTestToCodeRouteParams,
} from "hooks";
import { Icons, Tooltip } from "@drill4j/ui-kit";
import { Baseline, ParentBuild } from "../../types";

interface CrumbType {
  content: string;
  link: string;
  AdditionalContent?: React.FC;
}

export const Breadcrumbs = () => {
  const { routes } = useNavigation();
  const {
    testsToRunCrumb, allBuildCrumb, scopeCrumb, risksCrumb, buildCrumb, allScopesCrumb,
  } = useMemo(() => ({
    allBuildCrumb: { content: "All builds", link: routes.allBuilds },
    buildCrumb: { content: ":buildVersion", link: routes.overview, AdditionalContent: BaselineFlag },
    testsToRunCrumb: { content: "Tests to Run", link: routes.testsToRun },
    allScopesCrumb: { content: "All Scopes", link: routes.allScopes },
    scopeCrumb: { content: ":scopeId", link: routes.scope },
    risksCrumb: { content: "Risked Methods", link: routes.risks },
  }), [routes]);

  const Routes = useMemo(() => [
    { path: routes.overview, crumbs: [allBuildCrumb, buildCrumb] },
    { path: routes.risks, crumbs: [allBuildCrumb, buildCrumb, risksCrumb] },
    { path: routes.testsToRun, crumbs: [allBuildCrumb, buildCrumb, testsToRunCrumb] },
    { path: routes.allScopes, crumbs: [allBuildCrumb, buildCrumb, allScopesCrumb] },
    { path: routes.scope, crumbs: [allBuildCrumb, buildCrumb, allScopesCrumb, scopeCrumb] },
    { path: routes.allBuilds, crumbs: [{ content: "Test2Code Plugin", link: "/" }] },
  ], [routes]);
  return (
    <Switch>
      {Routes.map((route) => (
        <Route
          key={route.path}
          exact
          path={route.path}
          render={() => <RouteCrumbs crumbs={route.crumbs} />}
        />
      ))}
    </Switch>
  );
};

const RouteCrumbs = ({ crumbs }: {crumbs: CrumbType[];}) => {
  const { buildVersion, scopeId } = useTestToCodeRouteParams();
  const prepareLink = replaceLinkValues({ buildVersion, scopeId });
  const prepareContent = getContent({ buildVersion, scopeId });
  return (
    <div tw="min-h-[40px]">
      {crumbs.map((crumb) => {
        const link = prepareLink(crumb.link);
        const content = prepareContent(crumb.content);
        const { AdditionalContent } = crumb;
        return (
          <CrumbLink key={content}>
            <Link
              tw="hover:text-blue-medium-tint active:text-blue-shade"
              data-test={`crumb:${convertToDataTestAttr(crumb.content)}`}
              title={content}
              to={link}
            >
              {content}
            </Link>
            {AdditionalContent && <AdditionalContent />}
          </CrumbLink>
        );
      })}
    </div>
  );
};

const CrumbLink = styled.div`
  ${tw`inline-flex items-center gap-x-1 max-w-200px h-full
      text-ellipsis align-middle
      text-blue-default text-12 leading-20
      font-bold cursor-pointer no-underline
  `};
  :last-child {
    ${tw`text-monochrome-default pointer-events-none`};
  }
  :not(:first-child):before {
    ${tw`text-monochrome-default px-2`};
    content: "/";
  }
`;

const BaselineFlag = () => {
  const { agentId } = useAgentRouteParams();
  const { buildVersion } = useTestToCodeRouteParams();
  const { version: parentBuildVersion = "" } = useTestToCodeData<ParentBuild>("/data/parent") || {};
  const { buildVersion: activeBuildVersion = "" } = useActiveBuild(agentId) || {};
  const { version: baseline } = useTestToCodeData<Baseline>("/data/baseline", { buildVersion: activeBuildVersion }) || {};
  const isBaseline = baseline === buildVersion;

  const isInitialBuild = !parentBuildVersion && isBaseline;
  if (!isBaseline) {
    return null;
  }
  return (
    <div tw="pointer-events-auto h-4 w-4 text-monochrome-default cursor-default">
      <Tooltip
        position="bottom-center"
        message={isInitialBuild
          ? (
            <div tw="flex flex-col gap-[6px] text-[13px]">
              <div tw="font-bold">This build is set as baseline.</div>
              <div>
                The initial build is set as baseline by default.<br />
                All methods and key metrics of subsequent<br />
                builds are compared with it.
              </div>
            </div>
          ) : (
            <div tw="flex flex-col gap-[6px] text-[13px]">
              <div tw="font-bold">This build is set as baseline.</div>
              <div>
                All subsequent builds are compared with it.
              </div>
            </div>
          )}
      >
        <Icons.Flag width={16} height={16} />
      </Tooltip>
    </div>
  );
};

const replaceLinkValues = ({ buildVersion, scopeId }: {buildVersion: string, scopeId: string}) =>
  (link: string) => link
    .replace(":buildVersion", buildVersion)
    .replace(":scopeId", scopeId)
    .replace("Tests to Run", "tests-to-tun")
    .replace("All Scopes", "scopes")
    .replace("All builds", "builds");

const getContent = ({ buildVersion, scopeId }: {buildVersion: string, scopeId: string}) =>
  (crumb: string) => {
    if (crumb === ":buildVersion") {
      return buildVersion;
    }
    if (crumb === ":scopeId") {
      return scopeId;
    }
    return crumb;
  };

const convertToDataTestAttr = (crumb: string) => crumb
  .replace(":buildVersion", "selected-build")
  .replace(":scopeId", "selected-scope")
  .replace("Tests to Run", "tests-to-tun")
  .replace("All Scopes", "scopes")
  .replace("All builds", "builds");
