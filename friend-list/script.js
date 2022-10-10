const BASE_URL = "https://lighthouse-user-api.herokuapp.com/api/v1/users";
const USER_PER_PAGE = 20
const INIT_PAGE = 1

const users = []
const filterUsers = []
const favoriteUsers = !JSON.parse(localStorage.getItem('favoriteUsers')) ? [] : JSON.parse(localStorage.getItem('favoriteUsers'))

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector('#search-form')
const paginator = document.querySelector('#paginator')

// 取得使用者資料
function getUsersData() {
  axios
    .get(BASE_URL)
    .then((response) => {
      users.push(...response.data.results)
      renderPaginator(users.length)
      renderUsers(getUserByPages(INIT_PAGE))
      activePaginator(INIT_PAGE)
    })
    .catch((error) => {
      console.log(error);
    });
}

// 渲染出分頁資料
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / USER_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}

// 針對使用者資料呈現方式進行整理(設定20個使用者在一個分頁)
function getUserByPages(page) {
  const data = !filterUsers.length ? users : filterUsers
  const startIndex = (page - 1) * USER_PER_PAGE
  const endIndex = startIndex + USER_PER_PAGE

  return data.slice(startIndex, endIndex)
}

// 將使用者資料渲染至頁面
function renderUsers(data) {
  let userData = "";

  data.forEach((user) => {
    userData += `
      <div class="col-12 col-sm-6 col-md-3 mb-2">
        <div class="card position-relative pt-5">
          <img src=${user.avatar} class="card-img rounded-0 m-auto rounded-circle w-75  border border-2 ${user.gender === 'female' ? 'border-danger' : 'border-info'} hover-effect show-modal" alt="avatar" role="button" data-bs-toggle="modal" data-bs-target="#avatar-modal" data-id=${user.id}>
          <div class="card-body">
            <span class="border border-success position-absolute top-0 start-0 m-2 px-1 rounded text-success">${user.region}</span>
            <span><i class="fa-solid fa-heart position-absolute top-0 end-0 m-2 p-1 add-favorite" role="button" data-id=${user.id}></i></span>
            <h6 class="card-title m-0 p-1 bg-light rounded">${checkUserGender(user.gender)} ${user.name}</h6>
          </div>
        </div>
      </div>
    `;
  });
  dataPanel.innerHTML = userData;
  renderFavoriteIcon()
}

// 確認使用者性別並添加對應icon
function checkUserGender(gender) {
  if (gender === "female") {
    return '<i class="fa-solid fa-person-dress text-danger"></i>'
  } else {
    return '<i class="fa-sharp fa-solid fa-person text-info"></i>'
  }
}

// 確保local storage內的使用者於頁面重新整理時仍呈現收藏狀態
function renderFavoriteIcon() {
  const users = document.querySelectorAll('.add-favorite')

  users.forEach(user => {
    favoriteUsers.forEach(favoriteUser => {
      if (favoriteUser.id === Number(user.dataset.id)) {
        user.classList.add('text-danger')
      }
    })
  })
}

// 將目前頁面的分頁呈現active狀態
function activePaginator(page) {
  const activePagination = document.querySelector('.page-item.active')

  if(activePagination) {
    activePagination.classList.remove('active')
  }

  const pageLinks = document.querySelectorAll('.page-link')

  pageLinks.forEach(link => {
    if(Number(link.dataset.page) === page) {
      link.parentElement.classList.add('active')
    }
  })
}

// 當圖片被點擊事件發生時顯示對應的modal
function showUserModal(target) {
  const modalTitle = document.querySelector("#modal-title");
  const modalBody = document.querySelector("#modal-body");
  
  modalTitle.textContent = ""
  modalBody.innerHTML = ""

  if (target.tagName === "IMG") {
    axios
      .get(`${BASE_URL}/${target.dataset.id}`)
      .then((response) => {
        const data = response.data;

        modalTitle.textContent = `${data.name} ${data.surname}`;
        modalBody.innerHTML = `
        <div class="row">
          <div class="col-4">
            <img src=${data.avatar} class="img-thumbnail">
          </div>
          <div class="col-8">
            <p><i class="fa-solid fa-baby"></i> age: ${data.age}</p>
            <p><i class="fa-solid fa-cake-candles"></i> birthday: ${data.birthday}</p>
            <p><i class="fa-solid fa-envelope"></i> email: ${data.email}</p>
          </div>
        </div>
        `;
      })
      .catch((error) => console.log(error));
  }
}

// 當使用者已在收藏清單但收藏圖示被點擊時須取消該收藏資料
function removeFavorite(id) {
  const removeIndex = favoriteUsers.findIndex(user => user.id === id)
  
  favoriteUsers.splice(removeIndex, 1)
  localStorage.setItem('favoriteUsers', JSON.stringify(favoriteUsers))
}

// 當收藏圖示被點擊須收藏使用者資料
function addToFavorite(id) {
  const user = users.find(user => user.id === id)

  favoriteUsers.push(user)
  localStorage.setItem('favoriteUsers', JSON.stringify(favoriteUsers))
}

// 當搜尋按鈕被提交時運用關鍵字搜尋使用者
function searchUser(event) {
  event.preventDefault()
  filterUsers.splice(0, filterUsers.length)
  const searchInput = document.querySelector('#search-input')
  const keyword = searchInput.value.trim().toLowerCase()

  filterUsers.push(...users.filter(user => user.name.toLowerCase().includes(keyword)))

  if (filterUsers.length === 0) {
    searchInput.value = ""
    return alert(`查無符合 ${keyword}的使用者`)
  }

  renderPaginator(filterUsers.length)
  renderUsers(getUserByPages(INIT_PAGE))
  activePaginator(INIT_PAGE)
  renderFavoriteIcon()
}

// 當分頁被點擊時切換分頁資料
function switchPaginator(event) {
  if (event.target.tagName !== 'A') return
  
  const page = Number(event.target.dataset.page)

  renderUsers(getUserByPages(page))
  activePaginator(page)
  renderFavoriteIcon()
}

// 監聽事件
dataPanel.addEventListener("click", (event) => {
  const target = event.target

  if (target.matches('.show-modal')) {
    showUserModal(target)
  } else if (target.matches('.add-favorite')) {
    if (target.classList.contains('text-danger')) {
      target.classList.remove('text-danger')
      removeFavorite(Number(target.dataset.id))
    } else {
      target.classList.add('text-danger')
      addToFavorite(Number(target.dataset.id))
    }
  } 
});
searchForm.addEventListener('submit', searchUser)
paginator.addEventListener('click', switchPaginator)

getUsersData()