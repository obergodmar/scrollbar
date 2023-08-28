module.exports = (ctx) => {
  const { env } = ctx;

  const plugins = {
    development: {
      'postcss-prefixer': {},
    },
    production: {
      'postcss-prefixer': {},
      cssnano: {
        preset: 'lite',
      },
    },
  };

  return {
    plugins: plugins[env],
  };
};
