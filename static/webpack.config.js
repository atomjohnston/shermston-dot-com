module.exports = {
  entry: {
      shermston: './scripts/shermston.js',
      rsvp: './scripts/rsvp.js',
      admin: './scripts/admin.js'
  },
  output: {
      filename: '[name].js',
      path: __dirname + '/dist'
  }
};