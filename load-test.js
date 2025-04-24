import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 },  // Stay at 20 users for 1 minute
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
  },
};

const BASE_URL = process.env.BASE_URL

export default function () {
  // Initialize
  const initResponse = http.post(BASE_URL, JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "1.0.0",
      clientInfo: { name: "TestClient", version: "1.0.0" },
      capabilities: {
        tools: {},
        resources: {},
        logging: {},
        sampling: {},
        roots: {},
        prompts: {}
      }
    }
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream'
    }
  });

  check(initResponse, {
    'initialize status is 200': (r) => r.status === 200,
  });

  // List tools
  const listResponse = http.post(BASE_URL, JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {}
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream'
    }
  });

  check(listResponse, {
    'list tools status is 200': (r) => r.status === 200,
  });

  // Make a search request
  const searchResponse = http.post(BASE_URL, JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "brave_web_search",
      arguments: {
        query: "test search",
        count: 2
      }
    }
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream'
    }
  });

  check(searchResponse, {
    'search status is 200': (r) => r.status === 200,
  });

  sleep(1);
} 