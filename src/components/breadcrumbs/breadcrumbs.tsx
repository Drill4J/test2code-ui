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
import React, { useEffect, useState } from "react";
import {
  Link, matchPath, Switch, useLocation, Route,
} from "react-router-dom";
import tw, { styled } from "twin.macro";

import { PLUGIN_ID, routes } from "common";
import { useTestToCodeRouteParams } from "hooks";
import { getAgentRoutePath } from "admin-routes";

interface CrumbType {
  content: string;
  path: string;
}

const allBuildCrumb = { content: "All builds", path: routes.allBuilds };
const buildCrumb = { content: ":buildVersion", path: routes.overview };
const testsToRunCrumb = { content: "Tests to Run", path: routes.testsToRun };
const allScopesCrumb = { content: "All Scopes", path: routes.allScopes };
const scopeCrumb = { content: ":scopeId", path: routes.scope };
const risksCrumb = { content: "Risks", path: routes.risks };

const Routes = [
  { path: routes.overview, crumbs: [allBuildCrumb, buildCrumb] },
  { path: routes.risks, crumbs: [allBuildCrumb, buildCrumb, risksCrumb] },
  { path: routes.testsToRun, crumbs: [allBuildCrumb, buildCrumb, testsToRunCrumb] },
  { path: routes.allScopes, crumbs: [allBuildCrumb, buildCrumb, allScopesCrumb] },
  { path: routes.scope, crumbs: [allBuildCrumb, buildCrumb, allScopesCrumb, scopeCrumb] },
  { path: routes.allBuilds, crumbs: [allBuildCrumb] },
];

export const Breadcrumbs = () => (
  <Switch>
    {Routes.map((route) => (
      <Route
        exact
        path={getAgentRoutePath(route.path)}
        render={() => <Crumb crumbs={route.crumbs} path={route.path} />}
      />
    ))}
  </Switch>
);

const Crumb = ({ crumbs }: {crumbs: CrumbType[]; path: string}) => {
  const { pathname } = useLocation();

  const { adminPath } = dividePathname(pathname);
  const { buildVersion, scopeId } = useTestToCodeRouteParams();
  const prepareLink = replaceLinkValues({ buildVersion, scopeId });
  const prepareContent = getContent({ buildVersion, scopeId });

  return (
    <BreadcrumbsContainer>
      {crumbs.map((crumb) => {
        const rawLink = `${adminPath}${prepareLink(crumb.path)}`;
        const link = prepareLink(rawLink);
        const content = prepareContent(crumb.content);

        return (
          <CrumbLink key={content}>
            <Link
              data-test={`crumb:${content}`}
              title={content}
              to={link}
            >
              {content}
            </Link>
          </CrumbLink>
        );
      })}
    </BreadcrumbsContainer>
  );
};

const BreadcrumbsContainer = styled.div`
  ${tw`flex items-center h-10 px-6 border-b border-monochrome-medium-tint`}
`;

const CrumbLink = styled.div`
  ${tw`inline-block max-w-200px
      text-ellipsis align-middle
      text-blue-default text-12
      font-bold cursor-pointer no-underline
  `};

  :last-child {
    ${tw`text-monochrome-default pointer-events-none`};
  }

  :not(:first-child):before {
    ${tw`text-monochrome-default px-2`};
    content: "/";
  }

  :not(:last-child) {
    ${tw`hover:text-blue-medium-tint active:text-blue-shade`};
  }
`;

const dividePathname = (pathname: string) => {
  const [adminPath = "", test2codePath = ""] = pathname.split(`/${PLUGIN_ID}/`);
  return { adminPath: `${adminPath}/${PLUGIN_ID}`, test2codePath };
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
