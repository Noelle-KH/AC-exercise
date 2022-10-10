// 先將會使用到的網址(index & poster url)宣告成常數
const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = `${BASE_URL}/api/v1/movies`
const POSTER_URL = `${BASE_URL}/posters/`
const MOVIES_PER_PAGE = 12
// 宣告初始頁面常數
const INIT_PAGE = 1
const movies = []
const filteredMovies = []

const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector("#search-form")
const paginator = document.querySelector('#paginator')
// 取出變更電影清單模式的節點存成常數
const changeMode = document.querySelector("#change-mode")

// 取得串接電影資料
function getMovieData() {
  axios
    .get(INDEX_URL)
    .then(response => {
      movies.push(...response.data.results)
      renderPaginator(movies.length)
      renderMovieList(getMoviesByPage(INIT_PAGE))
    })
    .catch(error => console.log(error))
}

// 渲染分頁
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ""

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}

// 取得每個分頁的電影清單
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

// 渲染電影清單
function renderMovieList(data) {
  // 假如是卡片模式時的渲染內容
  if (dataPanel.dataset.mode === 'card') {
    let dataHTML = ""

    // 留意圖片網址
    data.forEach(item => {
      dataHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src=${POSTER_URL}/${item.image}
              class="card-img-top"
              alt="Movie Poster"
            />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button
                class="btn btn-primary btn-show-modal"
                data-bs-toggle="modal"
                data-bs-target="#movie-modal"
                data-id=${item.id}
              >
                More
              </button>
              <button class="btn btn-info btn-add-favorite" data-id=${item.id}>+</button>
            </div>
          </div>
        </div>
      </div>
      `
    })
    dataPanel.innerHTML = dataHTML
  } else if (dataPanel.dataset.mode === 'list') {
    // 假如是清單模式時的渲染內容
    dataHTML = '<ul class="list-group">'

    data.forEach(item => {
      dataHTML += `
      <li class="list-group-item d-flex align-items-center justify-content-between">
        <h5 class="card-title m-0">${item.title}</h5>
        <div class="list-btn">
          <button
            class="btn btn-primary btn-show-modal"
            data-bs-toggle="modal"
            data-bs-target="#movie-modal"
            data-id=${item.id}
          >
            More
          </button>
          <button class="btn btn-info btn-add-favorite" data-id=${item.id}>+</button>
        </div>
      </li>
      `
    })
    dataHTML += "</ul>"
    dataPanel.innerHTML = dataHTML
  }
  // 渲染完電影清單後判斷目前分頁位置(避免中間頁數轉換清單時頁面亂掉)
  checkPaginator()
}

// 確認目前分頁位置
function checkPaginator() {
  const activePage = document.querySelector('.page-item.active .page-link')
  // 假如是初始頁面狀態(即分頁沒有任何active存在)將第一頁傳入顯示分頁active的函式，其他狀況則將目前有active的分頁頁數傳入函式
  if(!activePage) {
    activePaginator(INIT_PAGE)
  } else {
    activePaginator(Number(activePage.dataset.page))
  }
}

// 目前顯示分頁之分頁器呈現active
function activePaginator(page) {
  // 先將現存有active狀態的分頁都移除，以確保點擊換頁時能夠成功呈現active
  const activePagination = document.querySelector('.page-item.active')
  if(activePagination) {
    activePagination.classList.remove('active')
  }

  // 取出所有分頁頁數並找出相符的頁面添加active
  const pageLinks = document.querySelectorAll('.page-link')
  pageLinks.forEach(link => {
    if (Number(link.dataset.page) === page) {
      link.parentElement.classList.add('active')
    }
  })
}

// 顯示特定電影的modal
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(`${INDEX_URL}/${id}`)
    .then(response => {
      const data = response.data.results
      modalTitle.textContent = data.title
      modalImage.src = `${POSTER_URL}/${data.image}`
      modalDescription.innerHTML = `
        <em>Release date: ${data.release_date}</em>
        <p class="mt-2">${data.description}</p>
      `
    })
    .catch(error => console.log(error))
}

// 加入收藏電影清單
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)

  if (list.some(movie => movie.id === id)) {
    return alert("此電影已在收藏清單中")
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// 搜尋電影
function searchMovie(event) {
  event.preventDefault()
  // 確保每次搜尋filteredMovies為空
  filteredMovies.splice(0, filteredMovies.length)
  const searchInput = document.querySelector('#search-input')
  // 優化搜尋關鍵字(去頭尾空格及轉成小寫)
  const keyword = searchInput.value.trim().toLowerCase()


  // 運用filter + includes，includes中傳入空字串所有項目都會通過篩選
  filteredMovies.push(...movies.filter(movie => movie.title.toLowerCase().includes(keyword)))
  // 找不到符合條件時跳出訊息
  if (filteredMovies.length === 0) {
    searchInput.value = ""
    return alert(`您輸入的關鍵字： ${keyword} 沒有符合條件的電影`)
  }
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(INIT_PAGE))
}

// 點擊分頁時更換並重新渲染頁面的電影清單
function switchPaginator(event) {
  if (event.target.tagName !== "A") return

  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
  activePaginator(page)
}

// 點擊更換電影清單顯示模式
function switchMovieMode(event) {
  // 選取出目前正呈現的頁面頁數
  const activePage = document.querySelector('.page-item.active .page-link').dataset.page
  // 當點擊卡片模式時，將電影清單內的data-mode設定為card並重新渲染該頁面
  if (event.target.matches('.show-card-mode')) {
    dataPanel.dataset.mode = 'card'
    renderMovieList(getMoviesByPage(activePage))
  } else if (event.target.matches('.show-list-mode')) {
  // 而當點擊清單模式時，將電影清單內的data-mode設定為list並重新渲染該頁面
    dataPanel.dataset.mode = 'list'
    renderMovieList(getMoviesByPage(activePage))
  }
}


// 監聽器
dataPanel.addEventListener('click', (event) => {
  if (event.target.matches('.btn-show-modal')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})
searchForm.addEventListener('submit', searchMovie)
paginator.addEventListener('click', switchPaginator)
// 監聽更換電影模式的點擊事件
changeMode.addEventListener('click', switchMovieMode)

getMovieData()