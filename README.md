# Tezos Baking Exporter

Tezos Baking Exporter is a metrics exporter for [Prometheus](https://prometheus.io/).  
It exports metrics about a given baker.  
It collectes metrics from a given node using the [RPC API](http://tezos.gitlab.io/mainnet/api/rpc.html).

## Run

```
docker run --rm -p 9090:9090 asbjornenge/tezos-baking-exporter:latest ---host 0.0.0.0 --interval 10000 --node-host <node-ip> --baker <tz1...> --label network=zeronet
```

:tada:

## Options

Options can either be passed as cli parameters or be set as ENV variables.

```
cli           env             default     wat
--            --              --          --
--host        HOST            localhost   What host to expose metrics API
--port        PORT            9090        What port to expose metrics API 
--node-proto  NODE_PROTO      http        What protocol to query node
--node-host   NODE_HOST       localhost   What host to query node
--node-port   NODE_PORT       8732        What port to query node
--interval    QUERY_INTERVAL  30000       Collection interval
--baker       BAKER           -           tz1... (baker address - required)
--label       -               -           Add metric labels (ex. --label network=zeronet)
```

enjoy.
