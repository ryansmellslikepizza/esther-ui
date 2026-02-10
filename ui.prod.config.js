module.exports = {
  apps: [
    {
      name: "esther-ui",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: "/home/ubuntu/esther-ui",
      env: {
        NODE_ENV: "production",
        PORT: 3001
      },
      watch: false
    }
  ]
};
