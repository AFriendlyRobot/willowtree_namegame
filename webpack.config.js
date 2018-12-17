const path = require("path");

module.exports = {
  mode: 'production',
  entry: "./src/scripts/main.js",
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "bundle.js"
  },

  resolve: {
	modules: ['src', 'assets', 'node_modules'],
  },
  
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["babel-preset-env"]
          }
        }
      },
      {
		test: [ /\.css$/ ],
		use: [ 'style-loader', 'css-loader' ]
	  }
    ]
  }
};
