import { toRpcHttpCookieList, toRpcHttp } from '../src/converters';
import { Cookie } from "../types/public/Interfaces";
import { expect } from 'chai';
import * as sinon from 'sinon';
import { AzureFunctionsRpcMessages as rpc } from '../azure-functions-language-worker-protobuf/src/rpc';
import 'mocha';

describe('Rpc Converters', () => {
  /** NullableBool */ 
  it('converts http cookies', () => {
    let cookieInputs =
    [
        {
            name: "mycookie",
            value: "myvalue",
            maxAge: 200000
        },
        {
            name: "mycookie2",
            value: "myvalue2",
            path: "/",
            maxAge: "200000"
        },
        {
            name: "mycookie3-expires",
            value: "myvalue3-expires",
            expires: new Date('December 17, 1995 03:24:00 PST')
        }
    ];
    
    let rpcCookies = toRpcHttpCookieList(<Cookie[]>cookieInputs);
    expect(rpcCookies[0].name).to.equal("mycookie");
    expect(rpcCookies[0].value).to.equal("myvalue");
    expect((<any>rpcCookies[0].maxAge).value).to.equal(200000);

    expect(rpcCookies[1].name).to.equal("mycookie2");
    expect(rpcCookies[1].value).to.equal("myvalue2");
    expect((<any>rpcCookies[1].path).value).to.equal("/");
    expect((<any>rpcCookies[1].maxAge).value).to.equal(200000);

    expect(rpcCookies[2].name).to.equal("mycookie3-expires");
    expect(rpcCookies[2].value).to.equal("myvalue3-expires");
    expect((<any>rpcCookies[2].expires).value.seconds).to.equal(819199440);
  });

  it('converts http cookie SameSite', () => {
    let cookieInputs: Cookie[] =
    [
        {
            name: "none-cookie",
            value: "myvalue",
            sameSite: "None"
        },
        {
            name: "lax-cookie",
            value: "myvalue",
            sameSite: "Lax"
        },
        {
            name: "strict-cookie",
            value: "myvalue",
            sameSite: "Strict"
        },
        {
            name: "default-cookie",
            value: "myvalue"
        }
    ];
    
    let rpcCookies = toRpcHttpCookieList(<Cookie[]>cookieInputs);
    expect(rpcCookies[0].name).to.equal("none-cookie");
    expect(rpcCookies[0].sameSite).to.equal(rpc.RpcHttpCookie.SameSite.ExplicitNone);

    expect(rpcCookies[1].name).to.equal("lax-cookie");
    expect(rpcCookies[1].sameSite).to.equal(rpc.RpcHttpCookie.SameSite.Lax);

    expect(rpcCookies[2].name).to.equal("strict-cookie");
    expect(rpcCookies[2].sameSite).to.equal(rpc.RpcHttpCookie.SameSite.Strict);

    expect(rpcCookies[3].name).to.equal("default-cookie");
    expect(rpcCookies[3].sameSite).to.equal(rpc.RpcHttpCookie.SameSite.None);
  });

  it('throws on invalid input', () => {
      expect(() => {
        let cookieInputs = [
                {
                    name: 123,
                    value: "myvalue",
                    maxAge: 200000
                },
                {
                    name: "mycookie2",
                    value: "myvalue2",
                    path: "/",
                    maxAge: "200000"
                },
                {
                    name: "mycookie3-expires",
                    value: "myvalue3-expires",
                    expires: new Date('December 17, 1995 03:24:00')
                },
                {
                    name: "mycookie3-expires",
                    value: "myvalue3-expires",
                    expires: new Date("")
                }
            ];
        
        toRpcHttpCookieList(<Cookie[]>cookieInputs);
      }).to.throw("");
  });

  it('throws on array as http response', () => {
    expect(() => {
      let response = ["one", 2, "3"];
      toRpcHttp(response);
    }).to.throw("The HTTP response must be an 'object' type that can include properties such as 'body', 'status', and 'headers'. Learn more: https://go.microsoft.com/fwlink/?linkid=2112563");
  });

  it('throws on string as http response', () => {
      expect(() => {
      let response = "My output string";
      toRpcHttp(response);
      }).to.throw("The HTTP response must be an 'object' type that can include properties such as 'body', 'status', and 'headers'. Learn more: https://go.microsoft.com/fwlink/?linkid=2112563");
  });
})
