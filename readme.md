# Queue stats

A very naive daemon used to publish RabbitMQ queue statistics to StatsD.

The following metric gauges are published to the configure StatsD server:
- `<prefix>.queue.<queue-name>.total`
- `<prefix>.queue.<queue-name>.total.rate`
- `<prefix>.queue.<queue-name>.ready`
- `<prefix>.queue.<queue-name>.ready.rate`
- `<prefix>.queue.<queue-name>.unacknowledged`
- `<prefix>.queue.<queue-name>.unacknowledged.rate`
- `<prefix>.queue.<queue-name>.consumer.count`
- `<prefix>.queue.<queue-name>.redelivery.rate`

## Config
The following environmental variables must be set in order for the daemon to start:
- `QS_RABBITMQ_USERNAME`
- `QS_RABBITMQ_PASSWORD`
- `QS_RABBITMQ_HOST`
- `QS_RABBITMQ_PORT`
- `QS_TICK_TIME`
- `QS_STATSD_HOST`
- `QS_STATSD_PORT`

## Running

The daemon is configured to be deployed using PM2. The npm start script has been
setup to start the process in forked mode via PM2.

`npm start` will start the process in PM2.
