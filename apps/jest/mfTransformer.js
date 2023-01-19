const path = require('path');
const webpack = require('webpack');

module.exports = {
  async processAsync(sourceText, sourcePath, options) {
    console.log('process async');
    return new Promise((resolve, reject) => {
      console.log(sourcePath);

      webpack(
        {
          entry: sourcePath,
          optimization: false,
          module: {
            rules: [
              {
                test: /\.(ts|tsx|js|jsx)$/,
                exclude: /node_modules/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: [
                      [
                        '@nrwl/react/babel',
                        {
                          runtime: 'automatic',
                          importSource: '@emotion/react',
                        },
                      ],
                    ],
                  },
                },
              },
              {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
              },
              {
                test: /\.(png|jpg|jpeg|gif|svg)$/,
                use: ['file-loader'],
              },
            ],
          },
          output: {},
          resolve: {
            extensions: ['.ts', '.tsx', '...'],
          },
        },
        (err, stats) => {
          if (err) {
            console.error('error', err);

            return reject(err);
          }

          if (stats.hasErrors()) {
            console.log(stats.toJson().errors);
            reject(new Error(stats.toJson().errors[0]));
          }

          const result = {
            code: stats.toJson({
              modules: true,
            }).modules[0].source,
          };

          console.log('stats', stats.toJson().modules);

          resolve(result);
        }
      );
    });

    // return {
    //   code: `module.exports = ${JSON.stringify(path.basename(sourcePath))};`,
    // };
  },
};
