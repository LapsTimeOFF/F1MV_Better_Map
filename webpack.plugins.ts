import type IForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import SentryWebpackPlugin from "@sentry/webpack-plugin";

import dotenv from 'dotenv';
dotenv.config();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

export const plugins = [
    new ForkTsCheckerWebpackPlugin({
        logger: "webpack-infrastructure",
    }),
    new SentryWebpackPlugin({
        org: "lapstime",
        project: "electron",

        // Specify the directory containing build artifacts
        include: ".webpack/main/",

        // Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
        // and needs the `project:releases` and `org:read` scopes
        authToken: process.env.SENTRY_AUTH_TOKEN,
        urlPrefix: 'webpack-internal:///./src/',
        

        // Optionally uncomment the line below to override automatic release name detection
        // release: process.env.RELEASE,
    }),
];
