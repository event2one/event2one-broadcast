module.exports = {
    apps: [
        {
            name: "broadcast-api",
            script: "./server.js",
            env: {
                NODE_ENV: "production",
                PORT: 3001
            }
        },
        {
            name: "broadcast-front",
            cwd: "./broadcast-app",
            script: "npm",
            args: "start -- -p 3002",
            env: {
                NODE_ENV: "production"
            }
        }
    ]
};
