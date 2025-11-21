module.exports = {
    apps: [{
        name: 'broadcast',
        script: './server.js',
        cwd: '/var/www/e2o/broadcast/broadcast-app',
        instances: 1,
        exec_mode: 'fork',
        env: {
            NODE_ENV: 'production',
            PORT: 3001
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_file: './logs/combined.log',
        time: true
    }]
};
