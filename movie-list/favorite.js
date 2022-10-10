// 先將會使用到的網址(index & poster url)宣告成常數
const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = `${BASE_URL}/api/v1/movies`
const POSTER_URL = `${BASE_URL}/posters/`

const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

const dataPanel = document.querySelector("#data-panel")

// 取得串接電影資料
// function getMovieData() {
//   axios
//     .get(INDEX_URL)
//     .then(response => {
//       movies.push(...response.data.results)
//       renderMovieList(movies)
//     })
//     .catch(error => console.log(error))
// }

// 渲染電影清單
function renderMovieList(data) {
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
            <button class="btn btn-danger btn-remove-favorite" data-id=${item.id}>X</button>
          </div>
        </div>
      </div>
    </div>
    `
  })
  dataPanel.innerHTML = dataHTML
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

// 移除收藏清單的電影
function removeFavoriteMovie(id) {
  // 當電影清單不存在或為空時離開函式
  if(!movies || !movies.length) return

  const movieIndex = movies.findIndex(movie => movie.id === id)

  // 假如沒有搜尋到符合的電影id離開函式
  if (movieIndex === -1) return

  movies.splice(movieIndex, 1)

  // 將移除完成的電影清單重新存回local storage
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))

  renderMovieList(movies)
}


dataPanel.addEventListener('click', (event) => {
  if (event.target.matches('.btn-show-modal')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFavoriteMovie(Number(event.target.dataset.id))
  }
})
// getMovieData()
renderMovieList(movies)
