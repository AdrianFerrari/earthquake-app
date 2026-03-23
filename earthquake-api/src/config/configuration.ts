export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  usgs: {
    baseUrl:
      process.env.USGS_BASE_URL ?? 'https://earthquake.usgs.gov/fdsnws/event/1',
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL ?? '300', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:4200',
  },
});
