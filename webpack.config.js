/** 
 * Config based on https://github.com/aurelia/skeleton-navigation/blob/master/skeleton-typescript-webpack/webpack.config.js 
 * 
 * Notable: 
 * https://github.com/jods4/aurelia-webpack-build/blob/master/demos/01-No_splits/webpack.config.js
 */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const project = require('./aurelia_project/aurelia.json');
const { AureliaPlugin, ModuleDependenciesPlugin } = require('aurelia-webpack-plugin');
const { ProvidePlugin } = require('webpack');
// const { TsConfigPathsPlugin, CheckerPlugin } = require('awesome-typescript-loader');
// const { } = require('ts-loader');
const projectJSON = require('./package.json');

const tsLoader = 'ts-loader';

// config helpers:
const ensureArray = (config) => config && (Array.isArray(config) ? config : [config]) || [];
const when = (condition, config, negativeConfig) =>
  condition ? ensureArray(config) : ensureArray(negativeConfig);

// primary config:
const title = 'Aurelia Webpack';
const outDir = path.resolve(__dirname, project.platform.output);
const srcDir = path.resolve(__dirname, 'src');
const nodeModulesDir = path.resolve(__dirname, 'node_modules');
const baseUrl = '/';

const cssRules = [
  { loader: 'css-loader' },
];

module.exports = ({production, server, extractCss, coverage} = {}) => ({
  mode: 'development',
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [srcDir, 'node_modules'] //.map(x => path.resolve(x)),
  },
  entry: {
    app: [  './src/main.ts', 'aurelia-bootstrapper' ], // './src/main.ts', // ['aurelia-bootstrapper'],
    vendor: ['bluebird', 'jquery', 'bootstrap'],
    //vendor: [ "aurelia-bootstrapper" ] //'aurelia': Object.keys(projectJSON.dependencies).filter(dep => dep.startsWith('aurelia-'))
  },
  output: {
    path: outDir,
    publicPath: baseUrl,
    filename: production ? '[name].[chunkhash].bundle.js' : '[name].[hash].bundle.js',
    sourceMapFilename: production ? '[name].[chunkhash].bundle.map' : '[name].[hash].bundle.map',
    chunkFilename: production ? '[name].[chunkhash].chunk.js' : '[name].[hash].chunk.js'
  },
  devServer: {
    contentBase: outDir,
    // serve index.html for all 404 (required for push-state)
    historyApiFallback: true
  },
  devtool: production ? 'nosources-source-map' : 'cheap-module-eval-source-map',
  /*
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: "initial",
          test: path.resolve(__dirname, "node_modules"),
          name: "vendor",
          enforce: true
        }
      }
    },
  },
  */
  module: {
    rules: [
      // CSS required in JS/TS files should use the style-loader that auto-injects it into the website
      // only when the issuer is a .js/.ts file, so the loaders are not applied inside html templates
      {
        test: /\.css$/i,
        issuer: [{ not: [{ test: /\.html$/i }] }],
        use: extractCss ? ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: cssRules
        }) : ['style-loader', ...cssRules],
      },
     /*
      { // temporarily added
        test: /\.css$/i,
        loader: ['style-loader', 'css-loader'],
        issuer: /\.[tj]s$/i
      },
      */
      /*
      { // temporarily added
        test: /\.css$/i,
        loader: 'css-loader',
        issuer: /\.html?$/i
      },
      */
      {
        test: /\.css$/i,
        issuer: [{ test: /\.html$/i }],
        // CSS required in templates cannot be extracted safely
        // because Aurelia would try to require it again in runtime
        use: cssRules
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
        issuer: /\.[tj]s$/i
      },
      {
        test: /\.scss$/,
        use: ['css-loader', 'sass-loader'],
        issuer: /\.html?$/i
      },
      { test: /\.html$/i, loader: 'html-loader' },
      { test: /\.ts$/i, loader: tsLoader, exclude: nodeModulesDir },
      { test: /\.json$/i, loader: 'json-loader' },
      // use Bluebird as the global Promise implementation:
      { test: /[\/\\]node_modules[\/\\]bluebird[\/\\].+\.js$/, loader: 'expose-loader?Promise' },
      // embed small images and fonts as Data Urls and larger ones as files:
      { test: /\.(png|gif|jpg|cur)$/i, loader: 'url-loader', options: { limit: 8192 } },
      { test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff2' } },
      { test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff' } },
      // load these fonts normally, as files:
      { test: /\.(ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'file-loader' },
      ...when(coverage, {
        test: /\.[jt]s$/i, loader: 'istanbul-instrumenter-loader',
        include: srcDir, exclude: [/\.{spec,test}\.[jt]s$/i],
        enforce: 'post', options: { esModules: true },
      })
    ]
  },
  plugins: [
    new AureliaPlugin({
      customViewLoaders: {
        '.css': ['css-loader'],
        '.scss': ['css-loader', 'sass-loader'],
        '.sass': ['css-loader', 'sass-loader'],
      },
      features: {
        ie: false
      }
    }),
    new ProvidePlugin({
      $: 'jquery', // because 'bootstrap' by Twitter depends on this
      jQuery: 'jquery', // just an alias
    }),
    new ModuleDependenciesPlugin({
      'aurelia-testing': [ './compile-spy', './view-spy' ],
      'aurelia-notify': [ './style.css' ]
    }),
    // new TsConfigPathsPlugin(),
    // new CheckerPlugin(),
    new HtmlWebpackPlugin({
      template: 'index.ejs',
      minify: production ? {
        removeComments: true,
        collapseWhitespace: true
      } : undefined,
      metadata: {
        // available in index.ejs //
        title, server, baseUrl
      }
    }),
    ...when(extractCss, new ExtractTextPlugin({
      filename: production ? '[contenthash].css' : '[id].css',
      allChunks: true
    })),
    ...when(production, new CopyWebpackPlugin([
      { from: 'static/favicon.ico', to: 'favicon.ico' }
    ]))
  ]
});
