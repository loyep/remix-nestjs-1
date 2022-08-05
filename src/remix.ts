import * as express from 'express'
import path from 'path'
import { createRequestHandler, GetLoadContextFunction } from '@remix-run/express';
import { AppService } from './app.service';

const BUILD_DIR = path.join(process.cwd(), 'build');

function isStaticAsset(request: express.Request) {
    return /^\/(build|assets)\//gi.test(request.url);
}

function purgeRequireCacheInDev() {
    if (process.env.NODE_ENV === 'production') return;

    for (const key in require.cache) {
        if (key.startsWith(BUILD_DIR)) {
            delete require.cache[key];
        }
    }
}

export function remix() {

    // const getLoadContext: GetLoadContextFunction = (req) => {
    //     // return your context here
    //     return {
    //         text: 'hello world',
    //     };
    // };
    console.log('req',)

    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (isStaticAsset(req)) return next();
        next();
        // purgeRequireCacheInDev();

        // const requestHandler = createRequestHandler({
        //     // `remix build` and `remix dev` output files to a build directory, you need
        //     // to pass that build to the request handler
        //     build: require(BUILD_DIR),
    
        //     // return anything you want here to be available as `context` in your
        //     // loaders and actions. This is where you can bridge the gap between Remix
        //     // and your server
        //     getLoadContext,
        // });
        // return requestHandler(req, res, next)
    }
}

export default remix