// const { default: axios } = require("axios");

// const getSongWiki = async (song_id) => {
//     await axios({
//         url: `/song/wiki/summary?id=${song_id}`
//     });
// };

// const getPlaylistTrack = async (playlist_id, limit=300, offset=0) => {
//     await axios({
//         url: `/playlist/track/all?id=${playlist_id}&limit=${limit}&offset=${offset}`
//     });
// };
const LIMIT = 10
async function getPlaylistSongInfo(playlist_id, limit = LIMIT, offset = 0) {
  // console.log(`playlist id: ${playlist_id}`);
  const playlist_res = await axios({
    url: `/playlist/track/all?id=${playlist_id}&limit=${limit}&offset=${offset}`,
  })
  // console.log(playlist_res);
  let playlist_info = playlist_res.data
  let songs = playlist_info.songs
  let song_id = []
  let song_styles = []
  let song_lang = []
  let song_bpm = []

  for (let i = 0; i < Math.min(songs.length, limit); i++) {
    song_id.push(songs[i].id)
    const song_res = await axios({
      url: `/song/wiki/summary?id=${songs[i].id}`,
    })
    // console.log(song_res);
    let song_info = song_res.data.data.blocks
    for (let j = 0; j < song_info.length; j++) {
      if (song_info[j].showType != 'SONG_PLAY_ABOUT_TAB_SONG_BASIC') continue
      let song_creatives = song_info[j].creatives
      for (let k = 0; k < song_creatives.length; k++) {
        if (song_creatives[k].creativeType == 'songTag') {
          // style
          let style = []
          let resources = song_creatives[k].resources
          for (rsc = 0; rsc < resources.length; rsc++) {
            style.push(resources[rsc].uiElement.mainTitle.title)
          }
          // console.log(style);
          song_styles.push(style)
        } else if (song_creatives[k].creativeType == 'language') {
          // language
          let lang = song_creatives[k].uiElement.textLinks[0].text
          if (lang == '国语') {
            lang = '华语'
          }
          song_lang.push(lang)
        } else if (song_creatives[k].creativeType == 'bpm') {
          // BPM
          song_bpm.push(song_creatives[k].uiElement.textLinks[0].text)
        }
      }
    }
  }

  return [song_id, song_styles, song_lang, song_bpm]
}

async function PlaylistAnalysis(
  playlist_id,
  displayAreaId,
  limit = LIMIT,
  offset = 0,
) {
  let song_info = await getPlaylistSongInfo(
    playlist_id,
    (limit = LIMIT),
    (offset = 0),
  )
  song_id = song_info[0]
  song_styles = song_info[1]
  song_lang = song_info[2]
  song_bpm = song_info[3]
  console.log(song_info)

  let style_stat = {}
  for (let styles of song_styles) {
    for (let style of styles) {
      style = String(style)
      // split the string
      let splitIdx = style.indexOf('-')
      let fatherStyle
      if (splitIdx != -1) {
        fatherStyle = style.substring(0, splitIdx)
      } else {
        fatherStyle = style
      }

      // stat
      if (fatherStyle.includes('流行')) {
        console.log(style)
        if (!style_stat['流行']) {
          style_stat['流行'] = 1
        } else {
          style_stat['流行']++
        }

        if (!style_stat[style] && style != '流行') {
          style_stat[style] = 1
        } else if (style != '流行') {
          style_stat[style]++
        }
      } else {
        if (!style_stat[fatherStyle]) {
          style_stat[fatherStyle] = 1
        } else {
          style_stat[fatherStyle]++
        }
      }
    }
  }

  let lang_stat = {}
  for (let lang of song_lang) {
    lang = String(lang)
    if (!lang_stat[lang]) {
      lang_stat[lang] = 1
    } else {
      lang_stat[lang]++
    }
  }

  let bpm_stat = {}
  let bpm_gap = 10
  for (let bpm of song_bpm) {
    bpm = Number(bpm)
    if (bpm == null || bpm == NaN) continue
    bpm = Math.floor(bpm / bpm_gap) * bpm_gap
    console.log(`bpm: ${bpm}`)
    bpm_interval = `${bpm}-${bpm + bpm_gap - 1}`
    if (!bpm_stat[bpm_interval]) {
      bpm_stat[bpm_interval] = 1
    } else {
      bpm_stat[bpm_interval]++
    }
  }
  console.log(style_stat)
  console.log(lang_stat)
  console.log(bpm_stat)
  // return [style_stat, lang_stat, bpm_stat];
  displayResult(style_stat, lang_stat, bpm_stat, displayAreaId)
}

async function displayResult(style_stat, lang_stat, bpm_stat, displayAreaId) {
  let style_table = document.createElement('table')
  let style_header = ['Style', 'Count']
  style_table = await displayStatAsTable(style_header, style_stat)

  let lang_table = document.createElement('table')
  let lang_header = ['Language', 'Count']
  lang_table = await displayStatAsTable(lang_header, lang_stat)

  let bpm_table = document.createElement('table')
  let bpm_header = ['bpm', 'Count']
  bpm_table = await displayStatAsTable(bpm_header, bpm_stat)

  let style_box = document.createElement('div')
  style_box.className = 'leftbox'
  style_box.appendChild(style_table)

  let lang_box = document.createElement('div')
  lang_box.className = 'middlebox'
  lang_box.appendChild(lang_table)

  let bpm_box = document.createElement('div')
  bpm_box.className = 'rightbox'
  bpm_box.appendChild(bpm_table)

  let oldDisplayBoxes = document.querySelector(`#displayBoxes`)
  if (oldDisplayBoxes) {
    oldDisplayBoxes.remove()
  }
  let displayBoxes = document.createElement('div')
  displayBoxes.id = 'displayBoxes'
  displayBoxes.appendChild(style_box)
  displayBoxes.appendChild(lang_box)
  displayBoxes.appendChild(bpm_box)
  console.log(displayBoxes)

  let displayArea = document.getElementById(displayAreaId)
  displayArea.appendChild(displayBoxes)
}

async function displayStatAsTable(header, items) {
  let table = document.createElement('table')
  table.classList = 'gridtable'
  let th = document.createElement('tr')
  for (let i = 0; i < header.length; i++) {
    let th_data = document.createElement('th')
    th_data.innerText = header[i]
    th.appendChild(th_data)
  }
  table.appendChild(th)
  for (let key in items) {
    let row = document.createElement('tr')
    let row_key = document.createElement('td')
    let row_value = document.createElement('td')

    row_key.innerText = key
    row_value.innerText = items[key]

    row.appendChild(row_key)
    row.appendChild(row_value)
    table.appendChild(row)
  }
  return table
}
