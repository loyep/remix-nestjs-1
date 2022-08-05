import { All, Controller, Get, Inject, Injectable, Req, Res } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import * as express from 'express'
import * as path from 'path'
import {
  RequestInit as NodeRequestInit, createRequestHandler as createRemixRequestHandler, AbortController, Headers as NodeHeaders, Request as NodeRequest, Response as NodeResponse, writeReadableStreamToWritable
} from '@remix-run/node'


export async function sendRemixResponse(
  res: express.Response,
  nodeResponse: NodeResponse
): Promise<void> {
  res.statusMessage = nodeResponse.statusText;
  res.status(nodeResponse.status);

  for (let [key, values] of Object.entries(nodeResponse.headers.raw())) {
    for (let value of values) {
      res.append(key, value);
    }
  }

  if (nodeResponse.body) {
    await writeReadableStreamToWritable(nodeResponse.body, res);
  } else {
    res.end();
  }
}

const BUILD_DIR = path.join(process.cwd(), 'build');

function createRemixHeaders(requestHeaders: express.Request["headers"]) {
  let headers = new NodeHeaders();

  for (let [key, values] of Object.entries(requestHeaders)) {
    if (values) {
      if (Array.isArray(values)) {
        for (let value of values) {
          headers.append(key, value);
        }
      } else {
        headers.set(key, values);
      }
    }
  }

  return headers;
}

function createRemixRequest(req: express.Request) {
  let origin = `${req.protocol}://${req.get("host")}`;
  let url = new URL(req.url, origin);
  let controller = new AbortController();
  req.on("close", () => {
    controller.abort();
  });
  let init: NodeRequestInit = {
    method: req.method,
    headers: createRemixHeaders(req.headers),
    signal: controller.signal as NodeRequestInit["signal"],
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req;
  }

  return new NodeRequest(url.href, init);
}

@Controller()
export class AppController {

  // private req: express.Request
  // private res: express.Response
  // private handleRequest?: RequestHandler
  constructor(@Inject(REQUEST) req: express.Request) {
    // this.req = req
    // this.res = req.res!
  }

  async renderRemix(req: express.Request, res: express.Response, ctx: any = {}) {
    try {
      let request = createRemixRequest(req);
      let loadContext = ctx;
      console.log('request', request)
      const handleRequest = createRemixRequestHandler(require(BUILD_DIR), process.env.NODE_ENV);
      // if (!this.handleRequest) {
      //   this.handleRequest = createRequestHandler(require(BUILD_DIR), process.env.NODE_ENV);
      // }

      let response = (await handleRequest?.(
        request,
        loadContext
      )) as NodeResponse;

      await sendRemixResponse(res, response);
    } catch (err) {
      console.log(err)
      res.send(500)
    }
  }

  @All('*')
  async index(@Req() req: express.Request, @Res() res: express.Response): Promise<any> {
    const data = await this.renderRemix(req, res, {
      text: 'hello world'
    })
    // return data
  }
}
