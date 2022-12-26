const express = require('express')
const exphbs = require('express-handlebars')
const app = express()
const port = 3000

app.engine('handlebars', exphbs.engine({
  defaultLayout: 'main',
  helpers: {
    active: (active) => {
      if (active) {
        return 'active'
      }
    }
  }
}))
app.set('view engine', 'handlebars')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/about', (req, res) => {
  const about = true
  res.render('about', { about })
})

app.get('/portfolio', (req, res) => {
  const portfolio = true
  res.render('portfolio', { portfolio })
})

app.get('/contact', (req, res) => {
  const contact = true
  res.render('contact', { contact })
})

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})