// const {default: axios} = require('axios');

// const { DEFAULT_MIN_VERSION } = require("tls");

// expand
async function getUserPlaylistByName(
  getUserPlaylists_div,
  userInputBox,
  UsernameSubmitButton,
  userTable,
  func,
  funcDisplayAreaId,
) {
  let UsernameSubmitBtn = document.getElementById(UsernameSubmitButton)
  UsernameSubmitBtn.addEventListener('click', function () {
    searchUserByName(
      getUserPlaylists_div,
      document.getElementById(userInputBox).value,
      userTable,
      func,
      funcDisplayAreaId,
    )
  })
  console.log('hello')
}

async function searchUserByName(
  getUserPlaylists_div,
  username,
  userTable,
  func,
  funcDisplayAreaId,
  limit = 10,
) {
  // console.log(username);
  const res = await axios({
    method: 'post',
    timeout: 5000,
    url: `/search?keywords=${username}&type=1002&limit=${limit}&timerstamp=${Date.now()}`,
  })
  let data = res.data.result
  let oldTable = document.querySelector('#userlist')
  // console.log(oldTable);
  if (oldTable) {
    oldTable.remove()
  }

  let div = document.createElement('div')
  div.id = 'userlist'

  let table = document.createElement('table')
  let th = document.createElement('tr')
  let th_num = document.createElement('th')
  let th_avatar = document.createElement('th')
  let th_name = document.createElement('th')

  th_num.innerText = 'Num'
  th_num.style.width = '50px'
  th.appendChild(th_num)
  th_avatar.innerText = 'Avatar'
  th_avatar.style.width = '50px'
  th.appendChild(th_avatar)
  th_name.innerText = 'Username'
  th_name.style.width = '200px'
  th.appendChild(th_name)
  table.appendChild(th)

  for (let i = 0; i < Math.min(data.userprofileCount, limit); i++) {
    let row = document.createElement('tr')
    let num = document.createElement('td')
    let avatar = document.createElement('td')
    let nickname = document.createElement('td')

    num.innerText = i + 1
    num.style.width = '50px'

    let img = document.createElement('img')
    try {
      img.src = data.userprofiles[i].avatarUrl
    } catch (e) {
      console.log(e)
      console.log(`error location: user ${i + 1}`)
    }
    img.height = '40'
    img.width = '40'
    avatar.style.width = '50px'
    avatar.appendChild(img)

    let user = document.createElement('a')
    user.href =
      'https://music.163.com/#/user/home?id=' + data.userprofiles[i].userId
    user.target = '_blank'
    user.rel = 'noreferrer noopener'
    user.innerText = data.userprofiles[i].nickname
    nickname.appendChild(user)
    if (data.userprofiles[i].userId == 1286495521) {
      let evilPower = document.createElement('p')
      evilPower.style.fontSize = '10px'
      evilPower.innerText = '（注：牛和马之家的黑恶势力）'
      nickname.appendChild(evilPower)
    }

    row.appendChild(num)
    row.appendChild(avatar)
    row.appendChild(nickname)
    table.appendChild(row)
    // console.log(i);
  }
  div.appendChild(table)

  let findTargetUserPrompt = document.createElement('p')
  findTargetUserPrompt.innerText = '请输入搜寻用户的序号：'
  let targetNum = document.createElement('input')
  targetNum.type = 'text'
  targetNum.id = 'targetNum'
  let targetNumSubmitBtn = document.createElement('button')
  targetNumSubmitBtn.innerText = 'Submit'
  div.appendChild(findTargetUserPrompt)
  div.appendChild(targetNum)
  div.appendChild(targetNumSubmitBtn)
  let playlistData
  targetNumSubmitBtn.addEventListener('click', function () {
    let uid = data.userprofiles[targetNum.value - 1].userId
    getUserPlaylist(getUserPlaylists_div, uid, func, funcDisplayAreaId)
  })
  // console.log(retNum);

  document.getElementById(userTable).appendChild(div)
}

async function getUserPlaylist(
  getUserPlaylists_div,
  uid,
  func,
  funcDisplayAreaId,
  limit = 30,
) {
  // console.log(uid);
  const res = await axios({
    method: 'post',
    timeout: 5000,
    url: `/user/playlist?uid=${uid}&timerstamp=${Date.now()}`,
  })

  let data = res.data.playlist
  // console.log(res);

  let oldPlaylists = document.querySelector('#playlists')
  console.log(oldPlaylists)
  if (oldPlaylists) {
    oldPlaylists.remove()
  }

  let playlists = document.createElement('div')
  playlists.id = 'playlists'
  let playlistFoundPrompt = document.createElement('p')
  playlistFoundPrompt.innerText = `该用户歌单列表（前${limit}个）：`
  playlists.appendChild(playlistFoundPrompt)

  let table = document.createElement('table')
  table.classList = 'gridtable'
  let th = document.createElement('tr')
  let th_num = document.createElement('th')
  let th_name = document.createElement('th')
  let th_creator = document.createElement('th')

  th_num.innerText = 'Num'
  // th_num.style.width = '50px';
  th_name.innerText = 'Playlistname'
  th_creator.innerText = 'Creator'
  th.appendChild(th_num)
  th.appendChild(th_name)
  th.appendChild(th_creator)
  table.appendChild(th)

  let listCount = data.length
  for (let i = 0; i < listCount; i++) {
    let row = document.createElement('tr')
    let num = document.createElement('td')
    let playlistName = document.createElement('td')
    let creator = document.createElement('td')

    num.innerText = i + 1
    let playlistLink = document.createElement('a')
    playlistLink.href = 'https://music.163.com/#/playlist?id=' + data[i].id
    playlistLink.target = '_blank'
    playlistLink.rel = 'noreferrer noopener'
    playlistLink.innerText = data[i].name
    playlistName.appendChild(playlistLink)
    creator.innerText = data[i].creator.nickname

    row.appendChild(num)
    row.appendChild(playlistName)
    row.appendChild(creator)
    table.appendChild(row)
  }
  playlists.appendChild(table)

  document.getElementById(getUserPlaylists_div).appendChild(playlists)

  choosePlaylist(getUserPlaylists_div, data, func, funcDisplayAreaId)
}

async function choosePlaylist(
  getUserPlaylists_div,
  data,
  func,
  funcDisplayAreaId,
) {
  let div = document.getElementById(getUserPlaylists_div)
  let prompt = document.createElement('p')
  prompt.innerText = '请输入搜寻歌单的序号：'
  let targetNum = document.createElement('input')
  targetNum.type = 'text'
  targetNum.id = 'targetNum'
  let targetNumSubmitBtn = document.createElement('button')
  targetNumSubmitBtn.innerText = 'Submit'

  let oldDiv = document.querySelector('#choosePlaylist')
  if (oldDiv) {
    oldDiv.remove()
  }

  let newDiv = document.createElement('div')
  newDiv.id = 'choosePlaylist'
  newDiv.appendChild(prompt)
  newDiv.appendChild(targetNum)
  newDiv.appendChild(targetNumSubmitBtn)

  targetNumSubmitBtn.addEventListener('click', async function () {
    let playlist_id = data[targetNum.value - 1].id
    func(playlist_id, funcDisplayAreaId)
  })
  div.appendChild(newDiv)
}

// getUserPlaylistByName();
