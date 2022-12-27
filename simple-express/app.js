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
  const title = '首頁'
  res.render('index', { title })
})

app.get('/:page', (req, res) => {
  const page = req.params.page
  const title = page[0].toUpperCase() + page.slice(1)
  const active = { [page]: true }
  res.render('index', { title, active })
})

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})