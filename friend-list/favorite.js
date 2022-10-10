const BASE_URL = "https://lighthouse-user-api.herokuapp.com/api/v1/users";

const favoriteUsers = !JSON.parse(localStorage.getItem('favoriteUsers')) ? [] : JSON.parse(localStorage.getItem('favoriteUsers'))

const dataPanel = document.querySelector("#data-panel");

// 將收藏使用者資料渲染至頁面
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

// 渲染收藏圖示
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

// 當使用者圖片被點擊時顯示對應的modal
function showUserModal(target) {
  const modalTitle = document.querySelector("#modal-title");
  const modalBody = document.querySelector("#modal-body");
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

// 當收藏圖示被點擊時取消收藏使用者
function removeFavorite(id) {
  const removeIndex = favoriteUsers.findIndex(user => user.id === id)

  favoriteUsers.splice(removeIndex, 1)
  console.log(favoriteUsers)
  localStorage.setItem('favoriteUsers', JSON.stringify(favoriteUsers))
  renderUsers(favoriteUsers)
  renderFavoriteIcon()
}

// 監聽事件
dataPanel.addEventListener("click", (event) => {
  const target = event.target

  if (target.matches('.show-modal')) {
    showUserModal(target)
  } else if (target.matches('.add-favorite')) {
    target.classList.remove('text-danger')
    removeFavorite(Number(target.dataset.id))
  }
});

renderUsers(favoriteUsers)