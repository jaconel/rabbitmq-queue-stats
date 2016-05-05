var request = require('request');
var util = require('util');
var lynx = require('lynx');

function getRequiredEnv(key) {
    if (!process.env[key]) {
        throw new Error('Missing env variable \'' + key + '\'');
    }

    return process.env[key];
}

var username = getRequiredEnv('QS_RABBITMQ_USERNAME');
var password = getRequiredEnv('QS_RABBITMQ_PASSWORD');
var host = getRequiredEnv('QS_RABBITMQ_HOST');
var port = getRequiredEnv('QS_RABBITMQ_PORT');
var tick = getRequiredEnv('QS_TICK_TIME');

var statsdPrefix = getRequiredEnv('QS_STATSD_PREFIX');

// statsd config can either be provided by linking in a docker container or by explicitly specifying it
// in an env variable.
var statsdHost = process.env.STATSD_PORT_8125_UDP_ADDR || process.env.STATSD_HOST;
if (!statsdHost) {
    throw new Error('Missing env variable \'STATSD_HOST\'');
}

var statsdPort = process.env.STATSD_PORT_8125_UDP_PORT || process.env.STATSD_PORT;
if (!statsdPort) {
    throw new Error('Missing env variable \'STATSD_PORT\'');
}

var url = util.format("http://%s:%s@%s:%d/api/queues", username, password, host, port);

var statsd = new lynx(statsdHost, statsdPort, { scope: statsdPrefix });

setInterval(function() {
    request(url, function(error, response, body) {
        if (response.statusCode == 200) {
            var queues = JSON.parse(body);
            queues.forEach(function(q) {
                var prefix = util.format('queue.%s.', q.name);

                statsd.gauge(prefix + 'total', q.messages);
                statsd.gauge(prefix + 'total.rate', q.messages_details.rate);
                statsd.gauge(prefix + 'ready', q.messages_ready);
                statsd.gauge(prefix + 'ready.rate', q.messages_ready_details.rate);
                statsd.gauge(prefix + 'unacknowledged', q.messages_unacknowledged);
                statsd.gauge(prefix + 'unacknowledged.rate', q.messages_unacknowledged_details.rate);
                statsd.gauge(prefix + 'consumer.count', q.consumers);

                var redeliveryRate = 0;
                if (q.message_stats.redeliver_details) {
                    redeliveryRate = q.message_stats.redeliver_details.rate;
                }
                statsd.gauge(prefix + 'redelivery.rate', redeliveryRate);
            });
        }
    })
}, tick)
